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
        "soft_text": "text-dulces-700",
        "soft_border": "border-dulces-100",
        "icon_bg": "bg-dulces-100",
        "icon_text": "text-dulces-600",
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
        "soft_text": "text-tecnologia-700",
        "soft_border": "border-tecnologia-100",
        "icon_bg": "bg-tecnologia-100",
        "icon_text": "text-tecnologia-600",
    },
}


def recommended_price(section, cost_price):
    margin = SECTIONS.get(section, {}).get("margin", 0.30)
    return round(cost_price * (1 + margin), 2)
