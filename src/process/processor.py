import json
import base64
import torch
import torchvision.transforms as transforms
import torchvision.models as models
from PIL import Image
import io

# Load the buffers.json file
with open('buffers.json', 'r') as f:
    data = json.load(f)

# Load the pre-trained ResNet-50 model
model = models.resnet50(pretrained=True)
model.eval()

# Define preprocessing transforms for images
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Define a function to compute embeddings from buffer
def compute_embedding(buffer):
    # Convert base64 string back to bytes
    buffer_bytes = base64.b64decode(buffer)
    # Convert bytes to PIL Image
    image = Image.open(io.BytesIO(buffer_bytes)).convert('RGB')
    # Apply preprocessing transforms
    input_tensor = preprocess(image)
    input_batch = input_tensor.unsqueeze(0)  # Add a batch dimension
    # Pass input through the model to compute embeddings
    with torch.no_grad():
        embedding = model(input_batch)
    return embedding.squeeze().numpy().tolist()

# Process each item in data and compute embeddings
for item in data:
    item['embedding'] = compute_embedding(item['buffer'])
    del item['buffer']

# Save the updated data to a new JSON file
with open('embeddings.json', 'w') as f:
    json.dump(data, f)

# Close the script
print("Embeddings computed and saved. Script complete.")