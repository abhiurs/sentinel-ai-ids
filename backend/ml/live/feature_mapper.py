import pickle
import numpy as np


class FeatureMapper:

    def __init__(self, feature_file):

        with open(feature_file, "rb") as f:
            self.feature_names = pickle.load(f)

    def build_vector(self, extracted_features):

        vector = []

        for feature in self.feature_names:

            vector.append(extracted_features.get(feature, 0))

        return np.array(vector).reshape(1, -1)
