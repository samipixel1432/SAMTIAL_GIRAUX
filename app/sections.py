# NOTE: this file is scanned by Tailwind (see tailwind.config.js content array) so the
# literal utility class strings below are picked up by the JIT compiler even though
# Jinja assembles them dynamically at render time.
SECTIONS = {
    "dulces": {
        "label": "Dulces",
        "icon": "gift",
        "margin": 0.45,
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
        "label": "Tecnologia",
        "icon": "cpu-chip",
        "margin": 0.20,
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
}


def recommended_price(section, cost_price):
    margin = SECTIONS.get(section, {}).get("margin", 0.30)
    return round(cost_price * (1 + margin), 2)
