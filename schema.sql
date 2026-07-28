CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    section TEXT NOT NULL CHECK (section IN ('dulces', 'tecnologia')),
    image_url TEXT,
    cost_price NUMERIC NOT NULL DEFAULT 0,
    sale_price NUMERIC NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 0,
    for_sale BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
