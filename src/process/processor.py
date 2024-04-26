import os
import tensorflow as tf
import numpy as np
import json
import base64

# Load your TensorFlow model
model = tf.keras.applications.ResNet50(include_top=False, weights='imagenet', pooling='avg')

def process_image_buffer(image_buffer):
    try:
        # Decode base64 string to bytes
        image_bytes = base64.b64decode(image_buffer)
        # Convert bytes to TensorFlow tensor
        image = tf.image.decode_image(image_bytes, channels=3)
        image = tf.image.resize(image, (224, 224))  # Resize to match the input size of the model
        image = tf.expand_dims(image, axis=0)  # Add batch dimension
        # Preprocess image for the ResNet model
        image = tf.keras.applications.resnet50.preprocess_input(image)
        # Get embeddings from the model
        embeddings = model.predict(image)
        return embeddings.tolist()
    except Exception as e:
        print("Error processing image:", e)
        return None

if __name__ == '__main__':
    # Load image buffers from buffers.json
    with open('buffers.json', 'r') as file:
        buffers_data = json.load(file)
    
    embeddings_data = []
    for item in buffers_data:
        filename = item['filename']
        image_buffer = item['buffer']
        embeddings = process_image_buffer(image_buffer)
        if embeddings is not None:
            embeddings_data.append({'filename': filename, 'embedding': embeddings[0]})
    
    # Save embeddings to embeddings.json
    with open('embeddings.json', 'w') as file:
        json.dump(embeddings_data, file)
        exit(0)
 
    # Delete buffers.json file
    # os.remove('buffers.json')
