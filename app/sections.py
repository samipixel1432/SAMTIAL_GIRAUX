SECTIONS = {
    "dulces": {
        "label": "Dulces",
        "emoji": "\U0001F36D",
        "margin": 0.45,
    },
    "tecnologia": {
        "label": "Tecnologia",
        "emoji": "\U0001F4F1",
        "margin": 0.20,
    },
}


def recommended_price(section, cost_price):
    margin = SECTIONS.get(section, {}).get("margin", 0.30)
    return round(cost_price * (1 + margin), 2)
