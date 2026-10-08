# Model Specification

## Selected model
DenseNet121.

Benchmark:
- EfficientNet-B0: 90.28% accuracy, 90.25% weighted F1
- ResNet50: 98.10% accuracy, 98.10% weighted F1
- DenseNet121: 99.04% accuracy, 99.04% weighted F1

## Classes
```text
0 → NonDemented
1 → VeryMildDemented
2 → MildDemented
3 → ModerateDemented
```

## Preprocessing
```python
transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])
```

Production inference must not use random training augmentation.

## Inference
Load the trained DenseNet121 checkpoint once at application startup. Use `model.eval()` and `torch.no_grad()`. Return predicted class, confidence, all class probabilities, model name/version, and inference time.

## Research limitation
The benchmark used an image-level stratified split because reliable patient IDs were unavailable. Therefore 99.04% must not be described as patient-level or clinically validated performance. If patient IDs become available, perform patient-level evaluation.

## Future FL
Use the centralized DenseNet121 as the baseline, then use Flower + PyTorch + FedAvg for simulated/client federated training and compare the global model against the centralized baseline.
