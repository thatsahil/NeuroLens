from PIL import Image
import torch
from torchvision import transforms

# Standard ImageNet normalization parameters
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

def resize_with_black_padding(image: Image.Image, target_size: int = 224) -> Image.Image:
    """
    Preserves the original aspect ratio, resizes image so that it fits within
    target_size x target_size using LANCZOS, and places the resized image at the
    center of a target_size x target_size black canvas.
    """
    if image.mode != "RGB":
        image = image.convert("RGB")
    
    # Create a copy so original image object is not mutated
    img_copy = image.copy()
    img_copy.thumbnail((target_size, target_size), Image.Resampling.LANCZOS)
    
    # Create black canvas
    canvas = Image.new("RGB", (target_size, target_size), (0, 0, 0))
    paste_x = (target_size - img_copy.width) // 2
    paste_y = (target_size - img_copy.height) // 2
    canvas.paste(img_copy, (paste_x, paste_y))
    return canvas

def get_inference_transforms():
    """
    Returns tensor conversion & ImageNet normalization transforms.
    """
    return transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(
            mean=IMAGENET_MEAN,
            std=IMAGENET_STD
        )
    ])

def preprocess_image(image: Image.Image) -> torch.Tensor:
    """
    Preprocesses PIL image for inference matching centralized model training:
    1. Convert to RGB
    2. Preserve aspect ratio, thumbnail within 224x224 (LANCZOS)
    3. Center-pad onto a 224x224 black canvas
    4. Convert to Tensor
    5. Normalize with ImageNet mean and std
    6. Return batch tensor [1, 3, 224, 224]
    """
    padded_image = resize_with_black_padding(image, target_size=224)
    transform = get_inference_transforms()
    tensor = transform(padded_image)
    return tensor.unsqueeze(0)  # Shape: [1, 3, 224, 224]
