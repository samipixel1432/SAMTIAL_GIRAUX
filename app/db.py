import os
from pathlib import Path

import psycopg2
import psycopg2.extras

_SCHEMA_PATH = Path(__file__).resolve().parent.parent / "schema.sql"


def _connect():
    url = os.environ["DATABASE_URL"]
    if "sslmode=" not in url:
        url += ("&" if "?" in url else "?") + "sslmode=require"
    return psycopg2.connect(url)


def init_db():
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute(_SCHEMA_PATH.read_text())
        conn.commit()


def list_products(section=None):
    with _connect() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            if section:
                cur.execute(
                    "SELECT * FROM products WHERE section = %s ORDER BY created_at DESC",
                    [section],
                )
            else:
                cur.execute("SELECT * FROM products ORDER BY created_at DESC")
            return [dict(row) for row in cur.fetchall()]


def get_product(product_id):
    with _connect() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM products WHERE id = %s", [product_id])
            row = cur.fetchone()
            return dict(row) if row else None


def create_product(name, section, image_url, cost_price, sale_price, quantity, for_sale):
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO products (name, section, image_url, cost_price, sale_price, quantity, for_sale)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                [name, section, image_url, cost_price, sale_price, quantity, bool(for_sale)],
            )
        conn.commit()


def update_product(product_id, name, section, image_url, cost_price, sale_price, quantity, for_sale):
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE products
                SET name = %s, section = %s, image_url = %s, cost_price = %s, sale_price = %s, quantity = %s, for_sale = %s
                WHERE id = %s
                """,
                [name, section, image_url, cost_price, sale_price, quantity, bool(for_sale), product_id],
            )
        conn.commit()


def delete_product(product_id):
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM products WHERE id = %s", [product_id])
        conn.commit()


def set_for_sale(product_id, for_sale):
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE products SET for_sale = %s WHERE id = %s",
                [bool(for_sale), product_id],
            )
        conn.commit()
