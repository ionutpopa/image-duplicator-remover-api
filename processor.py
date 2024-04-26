import os
import tensorflow as tf
import json

# Load your TensorFlow model, in this case ResNet50
model = tf.keras.applications.ResNet50(
    include_top=False, weights='imagenet', pooling='avg')

# Function to process image buffer
def process_image_buffer(image_buffer):
    try:
        # Convert image buffer to TensorFlow tensor
        image = tf.image.decode_image(image_buffer, channels=3)
        # Resize to match the input size of the model
        image = tf.image.resize(image, (224, 224))
        image = tf.expand_dims(image, axis=0)  # Add batch dimension
        # Preprocess image for the ResNet model
        image = tf.keras.applications.resnet50.preprocess_input(image)
        print(model)
        # Get embeddings from the model
        embeddings = model.predict(image)

        # Convert to list for JSON serialization
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
        if image_buffer is not None:
            print("Processing image:", filename)
        embeddings = process_image_buffer(image_buffer)
        if embeddings is not None:
            embeddings_data.append(
                {'filename': filename, 'embedding': embeddings})

    # Save embeddings to embeddings.json
    with open('embeddings.json', 'w') as file:
        json.dump(embeddings_data, file)

    # Delete buffers.json file
    # os.remove('buffers.json')
