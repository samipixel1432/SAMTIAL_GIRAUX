# NOTE: this file is scanned by Tailwind (see tailwind.config.js content array) so the
# literal utility class strings below are picked up by the JIT compiler even though
# Jinja assembles them dynamically at render time.

CATEGORY_ICONS = [
    ("shopping-bag", "Tienda"),
    ("gift", "Regalos"),
    ("cpu-chip", "Tecnologia"),
    ("tag", "Ofertas"),
    ("cube", "Productos"),
    ("watch", "Relojes"),
    ("home", "Hogar"),
    ("phone", "Celulares"),
]

CATEGORY_STYLES = {
    "dulces": {
        "name": "Coral",
        "accent_bg": "bg-dulces-600",
        "accent_bg_hover": "hover:bg-dulces-700",
        "accent_text": "text-dulces-600",
        "accent_ring": "focus-visible:ring-dulces-600",
        "soft_bg": "bg-dulces-50",
        "gradient_from": "from-dulces-50",
        "soft_text": "text-dulces-700",
        "soft_border": "border-dulces-100",
        "icon_bg": "bg-dulces-100",
        "icon_text": "text-dulces-600",
        "accent_shadow": "shadow-dulces-600/25 hover:shadow-dulces-600/35",
        "stripe_bg": "bg-[repeating-linear-gradient(135deg,#FFE7DF_0px,#FFE7DF_10px,#ffffff_10px,#ffffff_20px)]",
    },
    "tecnologia": {
        "name": "Turquesa",
        "accent_bg": "bg-tecnologia-600",
        "accent_bg_hover": "hover:bg-tecnologia-700",
        "accent_text": "text-tecnologia-600",
        "accent_ring": "focus-visible:ring-tecnologia-600",
        "soft_bg": "bg-tecnologia-50",
        "gradient_from": "from-tecnologia-50",
        "soft_text": "text-tecnologia-700",
        "soft_border": "border-tecnologia-100",
        "icon_bg": "bg-tecnologia-100",
        "icon_text": "text-tecnologia-600",
        "accent_shadow": "shadow-tecnologia-600/25 hover:shadow-tecnologia-600/35",
        "stripe_bg": "bg-[repeating-linear-gradient(135deg,#DFF3F3_0px,#DFF3F3_10px,#ffffff_10px,#ffffff_20px)]",
    },
    "premium": {
        "name": "Dorado",
        "accent_bg": "bg-amber-500",
        "accent_bg_hover": "hover:bg-amber-600",
        "accent_text": "text-amber-600",
        "accent_ring": "focus-visible:ring-amber-500",
        "soft_bg": "bg-amber-50",
        "gradient_from": "from-amber-50",
        "soft_text": "text-amber-800",
        "soft_border": "border-amber-200",
        "icon_bg": "bg-amber-50",
        "icon_text": "text-amber-600",
        "accent_shadow": "shadow-amber-500/25 hover:shadow-amber-500/35",
        "stripe_bg": "bg-[repeating-linear-gradient(135deg,#FEF3C7_0px,#FEF3C7_10px,#ffffff_10px,#ffffff_20px)]",
    },
    "neutro": {
        "name": "Neutro",
        "accent_bg": "bg-slate-900",
        "accent_bg_hover": "hover:bg-slate-700",
        "accent_text": "text-slate-900",
        "accent_ring": "focus-visible:ring-slate-900",
        "soft_bg": "bg-slate-50",
        "gradient_from": "from-slate-50",
        "soft_text": "text-slate-700",
        "soft_border": "border-slate-200",
        "icon_bg": "bg-slate-100",
        "icon_text": "text-slate-700",
        "accent_shadow": "shadow-slate-900/20 hover:shadow-slate-900/30",
        "stripe_bg": "bg-[repeating-linear-gradient(135deg,#F8F0EA_0px,#F8F0EA_10px,#ffffff_10px,#ffffff_20px)]",
    },
}

DEFAULT_STYLE = "dulces"
DEFAULT_ICON = "shopping-bag"


def build_sections(categories):
    sections = {}
    for category in categories:
        style_key = category.get("style") or DEFAULT_STYLE
        style = CATEGORY_STYLES.get(style_key, CATEGORY_STYLES[DEFAULT_STYLE])
        sections[category["key"]] = {
            **style,
            "label": category["label"],
            "icon": category.get("icon") or DEFAULT_ICON,
            "margin": float(category.get("margin") or 0.30),
            "style": style_key if style_key in CATEGORY_STYLES else DEFAULT_STYLE,
        }
    return sections


def recommended_price(section_info, cost_price):
    margin = section_info.get("margin", 0.30) if section_info else 0.30
    return round(cost_price * (1 + margin), 2)
