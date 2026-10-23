import torch
import torch.nn as nn
from torchvision import models

# Exact explicit class mapping from verified Global Round 1 federated experiment
CLASS_MAPPING = {
    "Mild Dementia": 0,
    "Moderate Dementia": 1,
    "Non Demented": 2,
    "Very mild Dementia": 3
}

# Inverted mapping for prediction display
IDX_TO_CLASS = {v: k for k, v in CLASS_MAPPING.items()}
NUM_CLASSES = len(CLASS_MAPPING)

def build_federated_densenet121(pretrained: bool = False) -> nn.Module:
    """
    Creates the DenseNet121 architecture strictly compatible with the federated checkpoint:
    Single Linear layer: Linear(1024, 4)
    """
    if pretrained:
        weights = models.DenseNet121_Weights.DEFAULT
        model = models.densenet121(weights=weights)
    else:
        model = models.densenet121(weights=None)
        
    model.classifier = nn.Linear(1024, NUM_CLASSES)
    return model
