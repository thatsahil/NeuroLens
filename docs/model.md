# DenseNet121 Model Architecture & Benchmark

## Selected Architecture
DenseNet121 is chosen as the production deep learning backbone due to its superior feature reuse and dense connection pattern across convolutional layers.

### Comparative Benchmark
- **EfficientNet-B0**: 90.28% test accuracy, 90.25% weighted F1
- **ResNet50**: 98.10% test accuracy, 98.10% weighted F1
- **DenseNet121**: **99.04% test accuracy, 99.04% weighted F1** (Selected Production Model)

## Target Classes
0 = `NonDemented`
1 = `VeryMildDemented`
2 = `MildDemented`
3 = `ModerateDemented`

## Preprocessing Pipeline
1. Color Space: RGB
2. Dimensions: Resize to `(224, 224)`
3. Conversion: `transforms.ToTensor()`
4. Normalization: ImageNet standard
   - `mean = [0.485, 0.456, 0.406]`
   - `std = [0.229, 0.224, 0.225]`

## Research Limitation Notice
The benchmark evaluation utilized an image-level stratified split due to the absence of reliable patient IDs in the initial research dataset. Therefore, the 99.04% test accuracy result represents image-level performance and is not clinically validated at the patient level.
