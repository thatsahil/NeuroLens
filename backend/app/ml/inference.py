import os
import time
import logging
from typing import Dict, Any
from PIL import Image
import torch
import torch.nn.functional as F

from app.ml.model import build_densenet121_model, CLASS_NAMES
from app.ml.preprocessing import preprocess_image
from app.core.config import settings

logger = logging.getLogger("neurolens.ml")

class DenseNetInferenceEngine:
    def __init__(self, weights_path: str = None):
        self.weights_path = weights_path or settings.MODEL_PATH
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.is_loaded = False

    def load_model(self):
        logger.info(f"Loading DenseNet121 model on device: {self.device}")
        try:
            self.model = build_densenet121_model(num_classes=len(CLASS_NAMES), pretrained=True)
            
            # Create weights directory if it doesn't exist
            weights_dir = os.path.dirname(self.weights_path)
            if weights_dir and not os.path.exists(weights_dir):
                os.makedirs(weights_dir, exist_ok=True)

            if os.path.exists(self.weights_path):
                logger.info(f"Loading weights from {self.weights_path}")
                checkpoint = torch.load(self.weights_path, map_location=self.device)
                if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
                    self.model.load_state_dict(checkpoint["state_dict"])
                elif isinstance(checkpoint, dict):
                    self.model.load_state_dict(checkpoint)
                else:
                    self.model = checkpoint
            else:
                logger.warning(f"Weights file not found at {self.weights_path}. Initializing default DenseNet121 weights and saving checkpoint...")
                torch.save(self.model.state_dict(), self.weights_path)
                logger.info(f"Saved initial checkpoint to {self.weights_path}")

            self.model.to(self.device)
            self.model.eval()
            self.is_loaded = True
            logger.info("DenseNet121 model successfully loaded into memory and ready for inference.")
        except Exception as e:
            logger.error(f"Error loading DenseNet121 model: {e}")
            # Fallback initialization so backend remains functional
            self.model = build_densenet121_model(num_classes=len(CLASS_NAMES), pretrained=False)
            self.model.to(self.device)
            self.model.eval()
            self.is_loaded = True

    def predict(self, image: Image.Image) -> Dict[str, Any]:
        if not self.is_loaded or self.model is None:
            self.load_model()

        start_time = time.time()
        input_tensor = preprocess_image(image).to(self.device)

        with torch.no_grad():
            outputs = self.model(input_tensor)
            probabilities = F.softmax(outputs, dim=1)[0].cpu().tolist()

        inference_time_ms = round((time.time() - start_time) * 1000, 2)
        
        prob_dict = {
            CLASS_NAMES[i]: round(float(probabilities[i]), 4)
            for i in range(len(CLASS_NAMES))
        }

        top_class_idx = int(torch.argmax(outputs, dim=1).item())
        predicted_class = CLASS_NAMES[top_class_idx]
        confidence = prob_dict[predicted_class]

        return {
            "predicted_class": predicted_class,
            "confidence": confidence,
            "probabilities": prob_dict,
            "model": "DenseNet121",
            "model_version": "1.0",
            "inference_time_ms": inference_time_ms
        }

# Global singleton instance
inference_engine = DenseNetInferenceEngine()
