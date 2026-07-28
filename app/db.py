import os
from pathlib import Path

import libsql_client

_SCHEMA_PATH = Path(__file__).resolve().parent.parent / "schema.sql"


def _client():
    url = os.environ["TURSO_DATABASE_URL"]
    auth_token = os.environ.get("TURSO_AUTH_TOKEN")
    # libsql-client (sync) expects http(s) URLs, not libsql://
    if url.startswith("libsql://"):
        url = "https://" + url[len("libsql://"):]
    return libsql_client.create_client_sync(url=url, auth_token=auth_token)


def _rows_to_dicts(result):
    return [dict(zip(result.columns, row)) for row in result.rows]


def init_db():
    with _client() as client:
        client.execute(_SCHEMA_PATH.read_text())


def list_products(section=None):
    with _client() as client:
        if section:
            result = client.execute(
                "SELECT * FROM products WHERE section = ? ORDER BY created_at DESC",
                [section],
            )
        else:
            result = client.execute("SELECT * FROM products ORDER BY created_at DESC")
        return _rows_to_dicts(result)


def get_product(product_id):
    with _client() as client:
        result = client.execute("SELECT * FROM products WHERE id = ?", [product_id])
        rows = _rows_to_dicts(result)
        return rows[0] if rows else None


def create_product(name, section, image_url, cost_price, sale_price, quantity, for_sale):
    with _client() as client:
        client.execute(
            """
            INSERT INTO products (name, section, image_url, cost_price, sale_price, quantity, for_sale)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            [name, section, image_url, cost_price, sale_price, quantity, 1 if for_sale else 0],
        )


def update_product(product_id, name, section, image_url, cost_price, sale_price, quantity, for_sale):
    with _client() as client:
        client.execute(
            """
            UPDATE products
            SET name = ?, section = ?, image_url = ?, cost_price = ?, sale_price = ?, quantity = ?, for_sale = ?
            WHERE id = ?
            """,
            [name, section, image_url, cost_price, sale_price, quantity, 1 if for_sale else 0, product_id],
        )


def delete_product(product_id):
    with _client() as client:
        client.execute("DELETE FROM products WHERE id = ?", [product_id])


def set_for_sale(product_id, for_sale):
    with _client() as client:
        client.execute(
            "UPDATE products SET for_sale = ? WHERE id = ?",
            [1 if for_sale else 0, product_id],
        )
