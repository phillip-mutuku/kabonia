"""
Script to train the carbon value prediction model

This script:
1. Loads training data
2. Preprocesses the data
3. Trains a Random Forest model
4. Evaluates the model
5. Saves the model for production use
"""

import pandas as pd
import numpy as np
import os
import sys
import joblib
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import matplotlib.pyplot as plt

# Determine the absolute path to the ai-service directory
current_dir = os.path.dirname(os.path.abspath(__file__))
ai_service_dir = os.path.dirname(current_dir)
sys.path.append(ai_service_dir)

# Create directories if they don't exist
models_dir = os.path.join(ai_service_dir, 'models')
training_data_dir = os.path.join(models_dir, 'training_data')

os.makedirs(models_dir, exist_ok=True)
os.makedirs(training_data_dir, exist_ok=True)

# Import prediction modules
from api.prediction import extract_features
from api.models import ProjectData

# Set random seed for reproducibility
np.random.seed(42)


def load_training_data():
    """
    Load training data from CSV or generate synthetic data if not available
    """
    training_data_path = os.path.join(training_data_dir, 'carbon_projects.csv')
    
    if os.path.exists(training_data_path):
        print(f"Loading training data from {training_data_path}")
        df = pd.read_csv(training_data_path)
        return df
    else:
        print("Training data not found. Generating synthetic data...")
        return generate_synthetic_data()


def generate_synthetic_data(samples=500):
    """
    Generate synthetic data for model training
    """
    # Project types
    project_types = ['reforestation', 'conservation', 'renewable_energy', 'methane_capture', 'soil_carbon']
    
    # Locations (some with rainforest keyword for location premium testing)
    locations = [
        'Amazon Rainforest, Brazil',
        'Borneo Rainforest, Indonesia',
        'Congo Rainforest, DRC',
        'Northern Forest, Canada',
        'Central Highlands, Kenya',
        'Great Plains, USA',
        'Savanna, Tanzania',
        'Pampas, Argentina',
        'Alpine Region, Switzerland',
        'Coastal Region, Australia'
    ]
    
    # Generate random data
    data = []
    
    for _ in range(samples):
        # Random project type
        project_type = np.random.choice(project_types)
        
        # Random location
        location = np.random.choice(locations)
        
        # Area (hectares) - log-normal distribution
        area = np.random.lognormal(mean=7, sigma=1)  # Centered around ~1100 hectares
        
        # Duration (years) - normal distribution
        duration_years = max(1, np.random.normal(loc=20, scale=8))
        
        # Carbon capture - correlated with area and project type
        base_capture_per_hectare = {
            'reforestation': 50,
            'conservation': 30,
            'renewable_energy': 20,
            'methane_capture': 40,
            'soil_carbon': 25
        }[project_type]
        
        # Add some noise to the capture rate
        capture_rate = base_capture_per_hectare * np.random.uniform(0.8, 1.2)
        carbon_capture = area * capture_rate
        
        # Actual carbon capture (for some projects)
        has_actual = np.random.random() < 0.3  # 30% have verified data
        actual_carbon_capture = carbon_capture * np.random.uniform(0.85, 1.15) if has_actual else None
        
        # Dates
        start_year = np.random.randint(2020, 2024)
        start_month = np.random.randint(1, 13)
        start_date = f"{start_year}-{start_month:02d}-01"
        end_date = f"{start_year + int(duration_years)}-{start_month:02d}-01"
        
        # Base credit value calculation (similar to our prediction function)
        base_value = 15
        type_multiplier = {
            'reforestation': 1.2,
            'conservation': 1.0,
            'renewable_energy': 0.9,
            'methane_capture': 1.1,
            'soil_carbon': 1.05
        }[project_type]
        
        location_premium = 1.3 if 'rainforest' in location.lower() else 1.0
        scale_factor = min(1.0, 0.7 + (0.3 * min(area / 1000, 1.0)))
        durability_factor = min(1.5, 0.8 + (0.7 * min(duration_years / 30, 1.0)))
        
        # Calculate credit value and add some noise
        credit_value = base_value * type_multiplier * location_premium * scale_factor * durability_factor
        credit_value *= np.random.uniform(0.9, 1.1)  # Add +/- 10% random noise
        
        # Create project data
        project = {
            'projectType': project_type,
            'area': area,
            'location': location,
            'estimatedCarbonCapture': carbon_capture,
            'actualCarbonCapture': actual_carbon_capture,
            'startDate': start_date,
            'endDate': end_date,
            'durationYears': duration_years,
            'creditValue': credit_value
        }
        
        data.append(project)
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    
    # Ensure training_data_dir exists
    os.makedirs(training_data_dir, exist_ok=True)
    
    # Save synthetic data
    csv_path = os.path.join(training_data_dir, 'carbon_projects.csv')
    df.to_csv(csv_path, index=False)
    print(f"Generated {samples} synthetic data points and saved to {csv_path}")
    
    return df


def preprocess_data(df):
    """
    Preprocess the data for training
    """
    # Create feature matrix X
    features = []
    for _, row in df.iterrows():
        # Convert row to ProjectData object
        project_data = ProjectData(
            projectType=row['projectType'],
            area=row['area'],
            location=row['location'],
            estimatedCarbonCapture=row['estimatedCarbonCapture'],
            actualCarbonCapture=row['actualCarbonCapture'],
            startDate=row['startDate'],
            endDate=row['endDate']
        )
        
        # Extract features
        feature_vector = extract_features(project_data)
        features.append(feature_vector)
    
    # Convert to numpy array
    X = np.array(features)
    y = df['creditValue'].values
    
    # Check for NaN values
    print("Checking for NaN values in features:")
    nan_columns = np.isnan(X).any(axis=0)
    print("Columns with NaN:", nan_columns)
    
    # Use SimpleImputer to handle NaN values
    imputer = SimpleImputer(strategy='mean')
    X_imputed = imputer.fit_transform(X)
    
    return X_imputed, y


def train_model(X, y):
    """
    Train the model on the given data
    """
    # Split data into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train Random Forest model
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate model
    train_predictions = model.predict(X_train)
    test_predictions = model.predict(X_test)
    
    train_mae = mean_absolute_error(y_train, train_predictions)
    test_mae = mean_absolute_error(y_test, test_predictions)
    
    train_r2 = r2_score(y_train, train_predictions)
    test_r2 = r2_score(y_test, test_predictions)
    
    print(f"Training MAE: {train_mae:.2f}, R²: {train_r2:.2f}")
    print(f"Testing MAE: {test_mae:.2f}, R²: {test_r2:.2f}")
    
    # Plot feature importance
    feature_names = [
        'Area (hectares)',
        'Carbon Capture (tons)',
        'Duration (years)',
        'Project Type Code',
        'Location Premium'
    ]
    
    importances = model.feature_importances_
    indices = np.argsort(importances)
    
    plt.figure(figsize=(10, 6))
    plt.title('Feature Importance for Carbon Credit Valuation')
    plt.barh(range(len(indices)), importances[indices], align='center')
    plt.yticks(range(len(indices)), [feature_names[i] for i in indices])
    plt.xlabel('Relative Importance')
    plt.tight_layout()
    
    # Ensure models directory exists
    os.makedirs(models_dir, exist_ok=True)
    
    # Save feature importance plot
    plt.savefig(os.path.join(models_dir, 'feature_importance.png'))
    plt.close()
    
    return model


def save_model(model):
    """
    Save the trained model to disk
    """
    model_path = os.path.join(models_dir, 'carbon_value_model.joblib')
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")


def main():
    print("Starting carbon value prediction model training...")
    
    # Load or generate data
    df = load_training_data()
    print(f"Loaded {len(df)} data points")
    
    # Preprocess data
    X, y = preprocess_data(df)
    print(f"Preprocessed data: X shape={X.shape}, y shape={y.shape}")
    
    # Train model
    model = train_model(X, y)
    
    # Save model
    save_model(model)
    
    print("Training complete!")


if __name__ == "__main__":
    main()