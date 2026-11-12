import torch
import torch.nn as nn
from torchvision import models

# Exact explicit class mapping from centralized DenseNet121 training & evaluation
# 0 = Mild Dementia
# 1 = Moderate Dementia
# 2 = Non Demented
# 3 = Very mild Dementia
CLASS_MAPPING = {
    "Mild Dementia": 0,
    "Moderate Dementia": 1,
    "Non Demented": 2,
    "Very mild Dementia": 3
}

# Inverted mapping for prediction display
IDX_TO_CLASS = {v: k for k, v in CLASS_MAPPING.items()}
CLASS_NAMES = [IDX_TO_CLASS[i] for i in range(len(CLASS_MAPPING))]
NUM_CLASSES = len(CLASS_MAPPING)

def build_federated_densenet121(pretrained: bool = False) -> nn.Module:
    """
    Creates the DenseNet121 architecture strictly compatible with the 4-class checkpoint:
    Single Linear layer: Linear(1024, 4)
    """
    if pretrained:
        weights = models.DenseNet121_Weights.DEFAULT
        model = models.densenet121(weights=weights)
    else:
        model = models.densenet121(weights=None)
        
    model.classifier = nn.Linear(1024, NUM_CLASSES)
    return model

def build_densenet121_model(num_classes: int = 4, pretrained: bool = False) -> nn.Module:
    """
    Alias for build_federated_densenet121 ensuring full backward compatibility.
    """
    assert num_classes == NUM_CLASSES, f"Expected {NUM_CLASSES} classes, got {num_classes}"
    return build_federated_densenet121(pretrained=pretrained)
