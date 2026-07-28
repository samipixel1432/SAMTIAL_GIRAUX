# Mi Tienda

Tienda de ventas (dulces, tecnología y las secciones que quieras agregar) hecha en
Flask, con base de datos Turso (SQLite en la nube) y fotos en Cloudinary. Pensada
para que tu hermano la use desde el celular y para desplegarse gratis en Vercel.

## 1. Requisitos previos (cuentas gratuitas)

Crea estas 3 cuentas gratis (esto lo tienes que hacer tú, con tu propio correo):

1. **Turso** (base de datos): https://turso.tech
   - Instala su CLI o usa el dashboard web para crear una base de datos.
   - Copia la `Database URL` y crea un `Auth Token`.
2. **Cloudinary** (fotos): https://cloudinary.com
   - En el Dashboard copia: `Cloud name`, `API Key`, `API Secret`.
3. **Vercel** (hosting): https://vercel.com
   - Puedes entrar con tu cuenta de GitHub.

## 2. Configura las variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

Variables necesarias:

| Variable | De dónde sale |
|---|---|
| `TURSO_DATABASE_URL` | Dashboard de Turso |
| `TURSO_AUTH_TOKEN` | Dashboard de Turso |
| `CLOUDINARY_CLOUD_NAME` | Dashboard de Cloudinary |
| `CLOUDINARY_API_KEY` | Dashboard de Cloudinary |
| `CLOUDINARY_API_SECRET` | Dashboard de Cloudinary |
| `ADMIN_PASSWORD` | La inventas tú (clave para administrar productos) |
| `FLASK_SECRET_KEY` | Cualquier texto aleatorio largo |

## 3. Probarlo en tu computadora (opcional pero recomendado)

```bash
python -m venv .venv
.venv/Scripts/activate
pip install -r requirements.txt
python run.py
```

Abre http://localhost:5000 en el navegador.

## 4. Subir el código a GitHub

```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git commit -m "Tienda inicial"
git push -u origin master
```

(Crea antes el repositorio vacío en https://github.com/new)

## 5. Desplegar en Vercel

1. Entra a https://vercel.com/new e importa el repositorio de GitHub.
2. En "Environment Variables" pega las mismas variables del paso 2
   (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `CLOUDINARY_CLOUD_NAME`,
   `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `ADMIN_PASSWORD`, `FLASK_SECRET_KEY`).
3. Presiona **Deploy**. En 1-2 minutos tendrás un link público (ej.
   `https://mi-tienda.vercel.app`) que funciona perfecto desde el celular.

## Cómo se usa

- Cualquiera con el link ve el catálogo (solo los productos marcados "para la venta").
- Tocando **Administrar** (arriba a la derecha) y con la `ADMIN_PASSWORD`, tu hermano
  puede agregar productos, subir foto desde la cámara del celular, poner el costo
  y ver la recomendación de precio de venta (margen configurable en
  `app/sections.py`: Dulces 45%, Tecnología 20%), editar, ocultar o eliminar.

## Agregar más secciones

Edita `app/sections.py` y agrega una clave nueva al diccionario `SECTIONS` con su
`label`, `emoji` y `margin`. Luego agrega su color en `app/static/css/style.css`
(busca `.card-dulces` / `.card-tecnologia` como ejemplo) y en la constraint
`CHECK (section IN (...))` de `schema.sql`.
