import json
import numpy as np

def cosine_similarity(embedding1, embedding2):
    """
    Calculate cosine similarity between two embeddings.
    """
    dot_product = np.dot(embedding1, embedding2)
    norm_product = np.linalg.norm(embedding1) * np.linalg.norm(embedding2)
    similarity = dot_product / norm_product
    return similarity

def sort_embeddings(embeddings):
    """
    Sort embeddings based on similarity.
    """
    sorted_embeddings = []
    for i, emb_i in enumerate(embeddings):
        left = []
        right = []
        for j, emb_j in enumerate(embeddings):
            if i == j:
                continue
            similarity = cosine_similarity(emb_i['embedding'], emb_j['embedding'])
            if similarity >= 0.9:
                left.append(emb_j)
            else:
                right.append(emb_j)
        sorted_embeddings.append(emb_i)
        sorted_embeddings.extend(left)
        sorted_embeddings.extend(right)
    return sorted_embeddings

def main():
    # Load embeddings from the file
    with open('embeddings.json', 'r') as f:
        embeddings = json.load(f)
    
    # Sort embeddings
    sorted_embeddings = sort_embeddings(embeddings)
    
    # Write sorted embeddings back to the file
    with open('embeddings.json', 'w') as f:
        json.dump(sorted_embeddings, f, indent=4)

if __name__ == "__main__":
    main()