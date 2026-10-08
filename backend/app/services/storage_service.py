import io
import os
import base64
import logging
from PIL import Image
from app.core.config import settings

logger = logging.getLogger("neurolens.storage")

class StorageService:
    def __init__(self):
        self.cloudinary_configured = False
        if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
            try:
                import cloudinary
                import cloudinary.uploader
                cloudinary.config(
                    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                    api_key=settings.CLOUDINARY_API_KEY,
                    api_secret=settings.CLOUDINARY_API_SECRET,
                    secure=True
                )
                self.cloudinary_configured = True
                logger.info("Cloudinary storage service configured successfully.")
            except Exception as e:
                logger.warning(f"Could not initialize Cloudinary: {e}")

    async def upload_image(self, file_bytes: bytes, filename: str) -> str:
        if self.cloudinary_configured:
            try:
                import cloudinary.uploader
                upload_result = cloudinary.uploader.upload(
                    file_bytes,
                    folder="neurolens/mri_scans",
                    resource_type="image"
                )
                return upload_result.get("secure_url")
            except Exception as e:
                logger.error(f"Cloudinary upload failed: {e}. Falling back to Data URL encoding.")

        # Local / Base64 Data URL fallback for standalone development
        try:
            image = Image.open(io.BytesIO(file_bytes))
            buffered = io.BytesIO()
            fmt = image.format if image.format else "PNG"
            image.save(buffered, format=fmt)
            img_str = base64.b64encode(buffered.getvalue()).decode()
            mime_type = f"image/{fmt.lower()}"
            return f"data:{mime_type};base64,{img_str}"
        except Exception as e:
            logger.error(f"Image base64 conversion failed: {e}")
            raise Exception("Failed to process uploaded image file.")

storage_service = StorageService()
