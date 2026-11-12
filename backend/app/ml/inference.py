import os
import time
import logging
from typing import Dict, Any
from PIL import Image
import torch
import torch.nn.functional as F

from app.ml.model import CLASS_MAPPING, IDX_TO_CLASS, NUM_CLASSES
from app.ml.preprocessing import preprocess_image
from app.core.config import settings
from app.services.model_service import model_registry

logger = logging.getLogger("neurolens.ml")

class DenseNetInferenceEngine:
    """
    Authoritative inference engine for DenseNet121.
    Reuses the single verified model loaded by model_registry.
    """
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    @property
    def model(self) -> torch.nn.Module:
        return model_registry.get_loaded_model()

    @property
    def is_loaded(self) -> bool:
        return model_registry.status == "ready" and model_registry.active_model is not None

    def load_model(self):
        model_registry.initialize()

    def predict(self, image: Image.Image) -> Dict[str, Any]:
        active_model = self.model  # Strictly fails if not loaded
        start_time = time.time()
        input_tensor = preprocess_image(image).to(self.device)

        with torch.no_grad():
            outputs = active_model(input_tensor)
            probabilities = F.softmax(outputs, dim=1)[0].cpu().tolist()

        inference_time_ms = round((time.time() - start_time) * 1000, 2)
        
        prob_dict = {
            IDX_TO_CLASS[i]: round(float(probabilities[i]), 4)
            for i in range(NUM_CLASSES)
        }

        top_class_idx = int(torch.argmax(outputs, dim=1).item())
        predicted_class = IDX_TO_CLASS[top_class_idx]
        confidence = prob_dict[predicted_class]

        model_version = (
            model_registry.active_model_meta.get("version_tag", "centralized_densenet121_best")
            if model_registry.active_model_meta
            else "centralized_densenet121_best"
        )

        return {
            "predicted_class": predicted_class,
            "confidence": confidence,
            "probabilities": prob_dict,
            "model": "DenseNet121",
            "model_version": model_version,
            "inference_time_ms": inference_time_ms
        }

# Global singleton instance
inference_engine = DenseNetInferenceEngine()
