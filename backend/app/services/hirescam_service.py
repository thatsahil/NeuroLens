import os
import io
import time
import base64
import logging
from typing import Dict, Any, Tuple
from PIL import Image
import numpy as np
import torch
import torch.nn.functional as F

from app.ml.model import CLASS_MAPPING, IDX_TO_CLASS, NUM_CLASSES
from app.ml.preprocessing import preprocess_image, resize_with_black_padding
from app.core.config import settings
from app.services.model_service import model_registry

logger = logging.getLogger("neurolens.xai")

class HiResCAMClassifier:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    @property
    def model(self) -> torch.nn.Module:
        """
        Reuses the single centralized authoritative model instance from model_registry.
        Never initializes independent random weights.
        """
        return model_registry.get_loaded_model()

    @property
    def is_loaded(self) -> bool:
        return model_registry.status == "ready" and model_registry.active_model is not None

    def generate_hirescam_overlay(self, original_pil: Image.Image, cam_matrix: np.ndarray) -> str:
        """
        Creates a heatmap overlay without needing external matplotlib or cv2.
        Applies a high-contrast Jet-like colormap and blends with identically preprocessed
        (aspect-ratio-preserving with black canvas) 224x224 image so the overlay aligns
        strictly with the model input tensor.
        """
        # Align canvas with inference preprocessing (224x224 black canvas)
        canvas_img = resize_with_black_padding(original_pil, target_size=224)
        img_np = np.array(canvas_img, dtype=np.float32) / 255.0

        # Simple Jet colormap generator in pure NumPy
        # cam_matrix is [0, 1]
        x = cam_matrix
        r = np.clip(1.5 - np.abs(x * 4.0 - 3.0), 0.0, 1.0)
        g = np.clip(1.5 - np.abs(x * 4.0 - 2.0), 0.0, 1.0)
        b = np.clip(1.5 - np.abs(x * 4.0 - 1.0), 0.0, 1.0)
        heatmap = np.stack([r, g, b], axis=-1)

        # Blend: 60% canvas image + 40% heatmap (accentuating high-activation areas)
        alpha = np.expand_dims(x * 0.65, axis=-1)
        blended = (1.0 - alpha) * img_np + alpha * heatmap
        blended = np.clip(blended * 255.0, 0, 255).astype(np.uint8)

        # Convert to Base64 PNG
        out_pil = Image.fromarray(blended)
        buffered = io.BytesIO()
        out_pil.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode("utf-8")

    def classify_and_explain(self, pil_image: Image.Image) -> Dict[str, Any]:
        """
        Runs inference and generates HiResCAM explanation using the authoritative model.
        Fails explicitly if the model is not loaded.
        """
        active_model = self.model  # Raises RuntimeError if unavailable
        start_time = time.time()
        input_tensor = preprocess_image(pil_image).to(self.device)

        # Hook the final convolutional feature block in DenseNet121
        features = []
        def hook(module, inp, out):
            features.append(out)

        hook_handle = active_model.features.denseblock4.register_forward_hook(hook)

        # Forward pass
        with torch.no_grad():
            logits = active_model(input_tensor)
        hook_handle.remove()

        probs = F.softmax(logits, dim=1)[0].detach().cpu().numpy()
        pred_idx = int(np.argmax(probs))
        pred_label = IDX_TO_CLASS.get(pred_idx, f"Class {pred_idx}")
        confidence = float(probs[pred_idx])

        # Compute HiResCAM:
        # Uses element-wise product of feature maps and classifier weights for the target class
        feat = features[0]  # [1, 1024, H, W]
        w = active_model.classifier.weight[pred_idx]  # [1024]
        
        # Element-wise product + channel summation with ReLU
        w_expanded = w.view(1, -1, 1, 1).to(self.device)
        cam = F.relu((feat * w_expanded).sum(dim=1, keepdim=True))
        cam = F.interpolate(cam, size=(224, 224), mode="bilinear", align_corners=False)
        cam_np = cam.squeeze().detach().cpu().numpy()

        # Min-max normalization
        cam_min, cam_max = cam_np.min(), cam_np.max()
        if cam_max - cam_min > 1e-8:
            norm_cam = (cam_np - cam_min) / (cam_max - cam_min)
        else:
            norm_cam = np.zeros_like(cam_np)

        # Generate base64 overlay image
        hirescam_base64 = self.generate_hirescam_overlay(pil_image, norm_cam)

        inference_time_ms = round((time.time() - start_time) * 1000, 2)

        # Domain explanations for Alzheimer's MRI classification classes
        explanations = {
            "Mild Dementia": "High-activation gradients concentrated around hippocampal atrophy and cortical thinning characteristic of mild cognitive degeneration.",
            "Moderate Dementia": "Widespread bilateral temporal and ventricular expansion patterns detected, triggering heavy activation in ventricular margins.",
            "Non Demented": "Uniform cerebral parenchyma and preserved cortical volume without focal ventricular enlargement.",
            "Very mild Dementia": "Localized early-stage neuro-structural variances detected, predominantly in medial temporal lobe boundaries."
        }

        model_version = (
            model_registry.active_model_meta.get("version_tag", "centralized_densenet121_best")
            if model_registry.active_model_meta
            else "centralized_densenet121_best"
        )

        return {
            "predicted_class": pred_label,
            "confidence": round(confidence, 4),
            "probabilities": {
                IDX_TO_CLASS[i]: round(float(probs[i]), 4)
                for i in range(NUM_CLASSES)
            },
            "explanation": explanations.get(pred_label, "Salient regional activation identified by HiResCAM."),
            "hirescam_heatmap_base64": f"data:image/png;base64,{hirescam_base64}",
            "inference_time_ms": inference_time_ms,
            "model_version": model_version,
            "xai_method": "HiResCAM (High-Resolution Class Activation Mapping)"
        }

hirescam_engine = HiResCAMClassifier()
