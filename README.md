# LUZURY STORE

Tienda de ventas (dulces, tecnología y las secciones que quieras agregar) hecha en
Flask, con base de datos Neon (Postgres en la nube) y fotos en Cloudinary. Pensada
para que tu hermano la use desde el celular y para desplegarse gratis en Vercel.

## 1. Requisitos previos (cuentas gratuitas)

Crea estas 3 cuentas gratis (esto lo tienes que hacer tú, con tu propio correo):

1. **Neon** (base de datos): https://neon.tech
   - Entra, crea un proyecto (te crea una base de datos Postgres al instante, sin
     instalar nada).
   - En el dashboard del proyecto copia el **Connection string** (botón "Connect").
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
| `DATABASE_URL` | Connection string de Neon (botón "Connect" en el dashboard) |
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
git push -u origin main
```

(Crea antes el repositorio vacío en https://github.com/new)

## 5. Desplegar en Vercel

1. Entra a https://vercel.com/new e importa el repositorio de GitHub.
2. En "Environment Variables" pega las mismas variables del paso 2
   (`DATABASE_URL`, `CLOUDINARY_CLOUD_NAME`,
   `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `ADMIN_PASSWORD`, `FLASK_SECRET_KEY`).
3. Presiona **Deploy**. En 1-2 minutos tendrás un link público (ej.
   `https://luzury-store.vercel.app`) que funciona perfecto desde el celular.

## Cómo se usa

- Cualquiera con el link ve el catálogo (solo los productos marcados "para la venta").
- Tocando **Administrar** (arriba a la derecha) y con la `ADMIN_PASSWORD`, tu hermano
  puede agregar productos, subir foto desde la cámara del celular, poner el costo
  y ver la recomendación de precio de venta (margen configurable en
  `app/sections.py`: Dulces 45%, Tecnología 20%), editar, ocultar o eliminar.

## Agregar más categorias

Entra como administrador y abre **Categorias**. Desde ahi puedes crear nuevas
categorias con nombre, icono, estilo visual y margen sugerido para calcular el
precio de venta.
