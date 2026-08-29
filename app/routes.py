import os
from functools import wraps

from flask import Blueprint, flash, redirect, render_template, request, session, url_for

from app import db
from app.images import upload_product_image
from app.sections import CATEGORY_ICONS, CATEGORY_STYLES, build_sections, recommended_price

bp = Blueprint("main", __name__)
BRAND_NAME = "LUZURY STORE"
BRAND_LOGO = "img/luzury-store-logo.jpeg"


def current_sections():
    return build_sections(db.list_categories())


def admin_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("is_admin"):
            return redirect(url_for("main.login", next=request.path))
        return view(*args, **kwargs)

    return wrapped


@bp.context_processor
def inject_globals():
    return {
        "sections": current_sections(),
        "is_admin": session.get("is_admin", False),
        "brand_name": BRAND_NAME,
        "brand_logo": BRAND_LOGO,
    }


@bp.route("/")
def home():
    sections = current_sections()
    counts = {key: len(db.list_products(section=key)) for key in sections}
    return render_template("home.html", sections=sections, counts=counts)


@bp.route("/seccion/<section>")
def section_view(section):
    sections = current_sections()
    if section not in sections:
        return redirect(url_for("main.home"))
    is_admin = session.get("is_admin", False)
    active_sub = request.args.get("sub") or None
    products = db.list_products(section=section, subcategory=active_sub)
    if not is_admin:
        products = [p for p in products if p["for_sale"]]
    subcategories = db.list_subcategories(section)
    return render_template(
        "section.html",
        sections=sections,
        section=section,
        products=products,
        subcategories=subcategories,
        active_sub=active_sub,
    )


@bp.route("/producto/<int:product_id>")
def product_detail(product_id):
    product = db.get_product(product_id)
    if not product:
        return redirect(url_for("main.home"))
    is_admin = session.get("is_admin", False)
    if not product["for_sale"] and not is_admin:
        return redirect(url_for("main.section_view", section=product["section"]))
    return render_template("product_detail.html", product=product, section=product["section"])


@bp.route("/admin/finanzas")
@admin_required
def finances():
    sections = current_sections()
    products = db.list_products()

    total_cost_value = sum(p["cost_price"] * p["quantity"] for p in products)
    total_sale_value = sum(p["sale_price"] * p["quantity"] for p in products)
    potential_profit = total_sale_value - total_cost_value
    avg_margin = (potential_profit / total_cost_value * 100) if total_cost_value else 0

    by_section = {}
    for key in sections:
        section_products = [p for p in products if p["section"] == key]
        cost_value = sum(p["cost_price"] * p["quantity"] for p in section_products)
        sale_value = sum(p["sale_price"] * p["quantity"] for p in section_products)
        by_section[key] = {
            "count": len(section_products),
            "cost_value": cost_value,
            "sale_value": sale_value,
            "profit": sale_value - cost_value,
        }

    low_stock = sorted((p for p in products if p["quantity"] <= 5), key=lambda p: p["quantity"])[:8]
    top_profit = sorted(
        products,
        key=lambda p: (p["sale_price"] - p["cost_price"]) * p["quantity"],
        reverse=True,
    )[:5]

    return render_template(
        "finances.html",
        sections=sections,
        total_products=len(products),
        total_cost_value=total_cost_value,
        total_sale_value=total_sale_value,
        potential_profit=potential_profit,
        avg_margin=avg_margin,
        by_section=by_section,
        low_stock=low_stock,
        top_profit=top_profit,
    )


@bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        password = request.form.get("password", "")
        if password and password == os.environ.get("ADMIN_PASSWORD"):
            session["is_admin"] = True
            next_url = request.form.get("next") or url_for("main.home")
            return redirect(next_url)
        flash("Clave incorrecta.")
    return render_template("login.html", next=request.args.get("next", ""))


@bp.route("/logout", methods=["POST"])
def logout():
    session.pop("is_admin", None)
    return redirect(url_for("main.home"))


@bp.route("/admin/agregar", methods=["GET", "POST"])
@admin_required
def add_product():
    sections = current_sections()
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        section = request.form.get("section")
        subcategory = request.form.get("subcategory", "").strip()
        cost_price = float(request.form.get("cost_price") or 0)
        sale_price = float(request.form.get("sale_price") or 0)
        quantity = int(request.form.get("quantity") or 0)
        for_sale = bool(request.form.get("for_sale"))
        image = request.files.get("image")

        if not name or section not in sections:
            flash("Completa el nombre y la seccion.")
            return render_template("product_form.html", sections=sections, mode="add", product=request.form, existing_subcategories=[])

        image_url = None
        if image and image.filename:
            image_url = upload_product_image(image)

        db.create_product(name, section, subcategory, image_url, cost_price, sale_price, quantity, for_sale)
        flash(f'"{name}" fue agregado.')
        return redirect(url_for("main.section_view", section=section))

    return render_template("product_form.html", sections=sections, mode="add", product=None, existing_subcategories=[])


@bp.route("/admin/precio-sugerido")
@admin_required
def suggested_price():
    sections = current_sections()
    section = request.args.get("section")
    cost_price = float(request.args.get("cost_price") or 0)
    return {"recommended": recommended_price(sections.get(section), cost_price)}


@bp.route("/admin/subcategorias/api")
@admin_required
def subcategories_api():
    sections = current_sections()
    section = request.args.get("section")
    if section not in sections:
        return {"subcategories": []}
    return {"subcategories": [s["name"] for s in db.list_subcategories(section)]}


@bp.route("/admin/categorias", methods=["GET", "POST"])
@admin_required
def manage_categories():
    if request.method == "POST":
        label = request.form.get("label", "").strip()
        icon = request.form.get("icon") or "shopping-bag"
        style = request.form.get("style") or "dulces"
        try:
            margin = max(float(request.form.get("margin_percent") or 30) / 100, 0)
        except ValueError:
            margin = 0.30

        valid_icons = {key for key, _label in CATEGORY_ICONS}
        if not label:
            flash("Escribe el nombre de la categoria.")
        elif icon not in valid_icons:
            flash("Elige un icono valido.")
        elif style not in CATEGORY_STYLES:
            flash("Elige un estilo valido.")
        else:
            key = db.create_category(label, icon, margin, style)
            flash(f'Categoria "{label}" creada.')
            return redirect(url_for("main.section_view", section=key))

        return redirect(url_for("main.manage_categories"))

    return render_template(
        "categories.html",
        category_icons=CATEGORY_ICONS,
        category_styles=CATEGORY_STYLES,
    )


@bp.route("/admin/subcategorias", methods=["GET", "POST"])
@admin_required
def manage_subcategories():
    sections = current_sections()
    if request.method == "POST":
        section = request.form.get("section")
        name = request.form.get("name", "").strip()
        if section in sections and name:
            db.create_subcategory(section, name)
            flash(f'Subcategoria "{name}" creada en {sections[section]["label"]}.')
        else:
            flash("Escribe un nombre y elige una coleccion.")
        return redirect(url_for("main.manage_subcategories"))

    by_section = {key: db.list_subcategories(key) for key in sections}
    return render_template("subcategories.html", sections=sections, by_section=by_section)


@bp.route("/admin/subcategorias/<int:subcategory_id>/eliminar", methods=["POST"])
@admin_required
def delete_subcategory(subcategory_id):
    db.delete_subcategory(subcategory_id)
    flash("Subcategoria eliminada.")
    return redirect(url_for("main.manage_subcategories"))


@bp.route("/admin/editar/<int:product_id>", methods=["GET", "POST"])
@admin_required
def edit_product(product_id):
    sections = current_sections()
    product = db.get_product(product_id)
    if not product:
        return redirect(url_for("main.home"))

    if request.method == "POST":
        name = request.form.get("name", "").strip()
        section = request.form.get("section")
        subcategory = request.form.get("subcategory", "").strip()
        cost_price = float(request.form.get("cost_price") or 0)
        sale_price = float(request.form.get("sale_price") or 0)
        quantity = int(request.form.get("quantity") or 0)
        for_sale = bool(request.form.get("for_sale"))
        image = request.files.get("image")

        image_url = product["image_url"]
        if image and image.filename:
            image_url = upload_product_image(image)

        if not name or section not in sections:
            flash("Completa el nombre y la seccion.")
            existing = db.list_subcategories(product["section"])
            return render_template("product_form.html", sections=sections, mode="edit", product=product, existing_subcategories=existing)

        db.update_product(product_id, name, section, subcategory, image_url, cost_price, sale_price, quantity, for_sale)
        flash(f'"{name}" fue actualizado.')
        return redirect(url_for("main.section_view", section=section))

    existing = db.list_subcategories(product["section"])
    return render_template("product_form.html", sections=sections, mode="edit", product=product, existing_subcategories=existing)


@bp.route("/admin/eliminar/<int:product_id>", methods=["POST"])
@admin_required
def delete_product(product_id):
    product = db.get_product(product_id)
    section = product["section"] if product else None
    db.delete_product(product_id)
    flash("Producto eliminado.")
    return redirect(url_for("main.section_view", section=section) if section else url_for("main.home"))


@bp.route("/admin/toggle/<int:product_id>", methods=["POST"])
@admin_required
def toggle_product(product_id):
    product = db.get_product(product_id)
    if product:
        db.set_for_sale(product_id, not product["for_sale"])
    return redirect(url_for("main.section_view", section=product["section"]))
