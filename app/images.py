import os

import cloudinary
import cloudinary.uploader

_configured = False


def _configure():
    global _configured
    if _configured:
        return
    cloudinary.config(
        cloud_name=os.environ["CLOUDINARY_CLOUD_NAME"],
        api_key=os.environ["CLOUDINARY_API_KEY"],
        api_secret=os.environ["CLOUDINARY_API_SECRET"],
        secure=True,
    )
    _configured = True


def upload_product_image(file_storage):
    """Uploads a Flask FileStorage and returns the optimized secure URL."""
    _configure()
    result = cloudinary.uploader.upload(
        file_storage,
        folder="tienda_productos",
        overwrite=False,
        resource_type="image",
    )
    public_id = result["public_id"]
    # f_auto/q_auto: Cloudinary picks the best format/quality for a fast phone load
    return cloudinary.CloudinaryImage(public_id).build_url(
        secure=True, fetch_format="auto", quality="auto", width=800, crop="limit"
    )
