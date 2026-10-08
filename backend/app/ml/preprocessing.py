from PIL import Image
import torch
from torchvision import transforms

def get_inference_transforms():
    """
    Returns image transformation pipeline for DenseNet121 inference:
    - RGB conversion
    - Resize to 224x224
    - ToTensor
    - ImageNet normalization (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    """
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

def preprocess_image(image: Image.Image) -> torch.Tensor:
    """
    Preprocesses PIL image for inference.
    """
    if image.mode != "RGB":
        image = image.convert("RGB")
    transform = get_inference_transforms()
    tensor = transform(image)
    return tensor.unsqueeze(0)  # Add batch dimension
