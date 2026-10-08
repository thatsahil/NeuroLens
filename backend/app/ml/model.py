import torch
import torch.nn as nn
from torchvision import models

CLASS_NAMES = ["NonDemented", "VeryMildDemented", "MildDemented", "ModerateDemented"]
NUM_CLASSES = len(CLASS_NAMES)

def build_densenet121_model(num_classes: int = NUM_CLASSES, pretrained: bool = True) -> nn.Module:
    """
    Builds DenseNet121 model architecture adapted for Alzheimer's MRI 4-class classification.
    """
    if hasattr(models, 'densenet121'):
        try:
            weights = models.DenseNet121_Weights.DEFAULT if pretrained else None
            model = models.densenet121(weights=weights)
        except Exception:
            model = models.densenet121(pretrained=pretrained)
    else:
        model = models.densenet121(pretrained=pretrained)
        
    in_features = model.classifier.in_features
    model.classifier = nn.Sequential(
        nn.Linear(in_features, 512),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(512, num_classes)
    )
    return model
