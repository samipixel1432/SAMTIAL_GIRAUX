CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    section TEXT NOT NULL,
    subcategory TEXT,
    image_url TEXT,
    cost_price NUMERIC NOT NULL DEFAULT 0,
    sale_price NUMERIC NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 0,
    for_sale BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_section_check;
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory TEXT;

CREATE TABLE IF NOT EXISTS subcategories (
    id SERIAL PRIMARY KEY,
    section TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (section, name)
);

ALTER TABLE subcategories DROP CONSTRAINT IF EXISTS subcategories_section_check;

CREATE TABLE IF NOT EXISTS categories (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'shopping-bag',
    margin NUMERIC NOT NULL DEFAULT 0.30,
    style TEXT NOT NULL DEFAULT 'dulces',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT NOT NULL DEFAULT 'shopping-bag';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS margin NUMERIC NOT NULL DEFAULT 0.30;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS style TEXT NOT NULL DEFAULT 'dulces';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

INSERT INTO categories (key, label, icon, margin, style)
VALUES
    ('dulces', 'Dulces', 'gift', 0.45, 'dulces'),
    ('tecnologia', 'Tecnologia', 'cpu-chip', 0.20, 'tecnologia')
ON CONFLICT (key) DO NOTHING;
