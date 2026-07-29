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


def list_products(section=None, subcategory=None):
    with _connect() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            query = "SELECT * FROM products WHERE 1=1"
            params = []
            if section:
                query += " AND section = %s"
                params.append(section)
            if subcategory:
                query += " AND subcategory = %s"
                params.append(subcategory)
            query += " ORDER BY created_at DESC"
            cur.execute(query, params)
            return [dict(row) for row in cur.fetchall()]


def list_subcategories(section):
    with _connect() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM subcategories WHERE section = %s ORDER BY name",
                [section],
            )
            return [dict(row) for row in cur.fetchall()]


def create_subcategory(section, name):
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO subcategories (section, name) VALUES (%s, %s)
                ON CONFLICT (section, name) DO NOTHING
                """,
                [section, name],
            )
        conn.commit()


def delete_subcategory(subcategory_id):
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT section, name FROM subcategories WHERE id = %s", [subcategory_id])
            row = cur.fetchone()
            if row:
                section, name = row
                cur.execute(
                    "UPDATE products SET subcategory = NULL WHERE section = %s AND subcategory = %s",
                    [section, name],
                )
                cur.execute("DELETE FROM subcategories WHERE id = %s", [subcategory_id])
        conn.commit()


def get_product(product_id):
    with _connect() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM products WHERE id = %s", [product_id])
            row = cur.fetchone()
            return dict(row) if row else None


def create_product(name, section, subcategory, image_url, cost_price, sale_price, quantity, for_sale):
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO products (name, section, subcategory, image_url, cost_price, sale_price, quantity, for_sale)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                [name, section, subcategory or None, image_url, cost_price, sale_price, quantity, bool(for_sale)],
            )
        conn.commit()


def update_product(product_id, name, section, subcategory, image_url, cost_price, sale_price, quantity, for_sale):
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE products
                SET name = %s, section = %s, subcategory = %s, image_url = %s, cost_price = %s,
                    sale_price = %s, quantity = %s, for_sale = %s
                WHERE id = %s
                """,
                [name, section, subcategory or None, image_url, cost_price, sale_price, quantity, bool(for_sale), product_id],
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
