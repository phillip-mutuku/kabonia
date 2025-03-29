"""
Script to preprocess data for the carbon value prediction model

This script:
1. Loads raw data from various sources
2. Cleans and formats the data
3. Saves processed data for model training
"""

import pandas as pd
import numpy as np
import os
import sys
import json
from datetime import datetime

# Determine the absolute path to the ai-service directory
current_dir = os.path.dirname(os.path.abspath(__file__))
ai_service_dir = os.path.dirname(current_dir)
sys.path.append(ai_service_dir)

# Create directories if they don't exist
models_dir = os.path.join(ai_service_dir, 'models')
training_data_dir = os.path.join(models_dir, 'training_data')
raw_data_dir = os.path.join(training_data_dir, 'raw')

os.makedirs(models_dir, exist_ok=True)
os.makedirs(training_data_dir, exist_ok=True)
os.makedirs(raw_data_dir, exist_ok=True)

# Import the generate_synthetic_data function from train.py
from scripts.train import generate_synthetic_data


def load_raw_data():
    """
    Load raw data from various sources
    """
    if not os.path.exists(raw_data_dir):
        print(f"Raw data directory not found: {raw_data_dir}")
        return None
    
    datasets = []
    
    # Check for CSV files
    csv_files = [f for f in os.listdir(raw_data_dir) if f.endswith('.csv')]
    for csv_file in csv_files:
        file_path = os.path.join(raw_data_dir, csv_file)
        print(f"Loading CSV data from {file_path}")
        df = pd.read_csv(file_path)
        datasets.append(df)
    
    # Check for JSON files
    json_files = [f for f in os.listdir(raw_data_dir) if f.endswith('.json')]
    for json_file in json_files:
        file_path = os.path.join(raw_data_dir, json_file)
        print(f"Loading JSON data from {file_path}")
        with open(file_path, 'r') as f:
            data = json.load(f)
        df = pd.json_normalize(data)
        datasets.append(df)
    
    if not datasets:
        print("No data files found in the raw data directory.")
        return None
    
    # Combine datasets if multiple
    if len(datasets) > 1:
        combined_df = pd.concat(datasets, ignore_index=True)
    else:
        combined_df = datasets[0]
    
    return combined_df


def clean_data(df):
    """
    Clean and prepare the raw data
    """
    if df is None:
        return None
    
    print("Cleaning and preprocessing data...")
    
    # Make a copy to avoid modifying the original
    clean_df = df.copy()
    
    # Handle missing values
    if 'estimatedCarbonCapture' in clean_df.columns and clean_df['estimatedCarbonCapture'].isnull().any():
        # Impute missing estimated carbon capture based on area and project type
        avg_capture_per_hectare = clean_df.dropna(subset=['estimatedCarbonCapture', 'area']) \
            .groupby('projectType')['estimatedCarbonCapture'].sum() / clean_df.dropna(subset=['estimatedCarbonCapture', 'area']) \
            .groupby('projectType')['area'].sum()
        
        for idx, row in clean_df[clean_df['estimatedCarbonCapture'].isnull()].iterrows():
            project_type = row['projectType']
            area = row['area']
            if project_type in avg_capture_per_hectare:
                clean_df.at[idx, 'estimatedCarbonCapture'] = area * avg_capture_per_hectare[project_type]
            else:
                # Default to overall average if project type not found
                clean_df.at[idx, 'estimatedCarbonCapture'] = area * avg_capture_per_hectare.mean()
    
    # Format dates if needed
    date_columns = ['startDate', 'endDate']
    for col in date_columns:
        if col in clean_df.columns:
            # Convert to datetime if not already
            if not pd.api.types.is_datetime64_dtype(clean_df[col]):
                clean_df[col] = pd.to_datetime(clean_df[col], errors='coerce')
            
            # Fill missing dates with defaults
            if clean_df[col].isnull().any():
                if col == 'startDate':
                    clean_df[col] = clean_df[col].fillna(pd.Timestamp.now())
                elif col == 'endDate':
                    # Default to 20 years from start date
                    for idx, row in clean_df[clean_df[col].isnull()].iterrows():
                        if pd.notna(row['startDate']):
                            clean_df.at[idx, col] = row['startDate'] + pd.DateOffset(years=20)
                        else:
                            clean_df.at[idx, col] = pd.Timestamp.now() + pd.DateOffset(years=20)
    
    # Calculate duration in years if not already present
    if 'durationYears' not in clean_df.columns and 'startDate' in clean_df.columns and 'endDate' in clean_df.columns:
        clean_df['durationYears'] = (clean_df['endDate'] - clean_df['startDate']).dt.days / 365.25
    
    # Standardize project types
    if 'projectType' in clean_df.columns:
        # Mapping similar project types to standard categories
        project_type_mapping = {
            'reforestation': 'reforestation',
            'afforestation': 'reforestation',
            'forest': 'reforestation',
            'tree planting': 'reforestation',
            'conservation': 'conservation',
            'avoided deforestation': 'conservation',
            'forest conservation': 'conservation',
            'protection': 'conservation',
            'renewable': 'renewable_energy',
            'renewable energy': 'renewable_energy',
            'solar': 'renewable_energy',
            'wind': 'renewable_energy',
            'hydro': 'renewable_energy',
            'methane': 'methane_capture',
            'methane capture': 'methane_capture',
            'landfill gas': 'methane_capture',
            'soil': 'soil_carbon',
            'soil carbon': 'soil_carbon',
            'agricultural': 'soil_carbon',
            'regenerative agriculture': 'soil_carbon'
        }
        
        # Convert project types to lowercase for matching
        clean_df['projectType'] = clean_df['projectType'].str.lower()
        
        # Apply mapping for exact matches
        clean_df['projectType'] = clean_df['projectType'].map(lambda x: project_type_mapping.get(x, x))
        
        # Apply mapping for partial matches
        for idx, row in clean_df.iterrows():
            project_type = row['projectType']
            # Skip if already mapped
            if project_type in project_type_mapping.values():
                continue
            
            # Check for partial matches
            for key, value in project_type_mapping.items():
                if key in project_type:
                    clean_df.at[idx, 'projectType'] = value
                    break
        
        # Set default for any remaining unknown types
        unknown_mask = ~clean_df['projectType'].isin(project_type_mapping.values())
        if unknown_mask.any():
            print(f"Warning: {unknown_mask.sum()} project types couldn't be mapped to standard categories.")
            print("Unknown types:", clean_df.loc[unknown_mask, 'projectType'].unique())
            clean_df.loc[unknown_mask, 'projectType'] = 'other'
    
    # Convert dates back to string format for saving
    for col in date_columns:
        if col in clean_df.columns and pd.api.types.is_datetime64_dtype(clean_df[col]):
            clean_df[col] = clean_df[col].dt.strftime('%Y-%m-%d')
    
    return clean_df


def calculate_credit_values(df):
    """
    Calculate credit values if not already present in the data
    """
    if df is None:
        return None
    
    # Make a copy to avoid modifying the original
    value_df = df.copy()
    
    # Skip if credit value is already in the data
    if 'creditValue' in value_df.columns and not value_df['creditValue'].isnull().all():
        print("Credit values already present in data.")
        return value_df
    
    print("Calculating credit values...")
    
    # Initialize credit value column if it doesn't exist
    if 'creditValue' not in value_df.columns:
        value_df['creditValue'] = np.nan
    
    # Base value factors
    base_value_per_ton = 15  # Base value per ton of carbon
    
    # Project type multipliers
    project_type_multipliers = {
        'reforestation': 1.2,
        'conservation': 1.0,
        'renewable_energy': 0.9,
        'methane_capture': 1.1,
        'soil_carbon': 1.05,
        'other': 0.95
    }
    
    # Calculate credit value for each project
    for idx, row in value_df.iterrows():
        # Get project type multiplier (default to 1.0 if not found)
        project_type = row['projectType'].lower() if isinstance(row['projectType'], str) else 'other'
        type_multiplier = project_type_multipliers.get(project_type, 1.0)
        
        # Location premium (simplified)
        location = row['location'].lower() if isinstance(row['location'], str) else ''
        location_premium = 1.3 if 'rainforest' in location else 1.0
        
        # Scale factor based on project size
        area = float(row['area']) if pd.notna(row['area']) else 1000
        scale_factor = min(1.0, 0.7 + (0.3 * min(area / 1000, 1.0)))
        
        # Durability factor based on project duration
        duration_years = float(row['durationYears']) if pd.notna(row.get('durationYears')) else 20
        durability_factor = min(1.5, 0.8 + (0.7 * min(duration_years / 30, 1.0)))
        
        # Calculate credit value
        credit_value = base_value_per_ton * type_multiplier * location_premium * scale_factor * durability_factor
        
        # Add some randomness to simulate real-world variations
        credit_value *= np.random.uniform(0.9, 1.1)
        
        # Save the calculated value
        value_df.at[idx, 'creditValue'] = round(credit_value, 2)
    
    return value_df


def export_processed_data(df):
    """
    Export the processed data to CSV
    """
    if df is None:
        print("No data to export.")
        return
    
    output_path = os.path.join(training_data_dir, 'carbon_projects.csv')
    df.to_csv(output_path, index=False)
    print(f"Processed data exported to {output_path}")


def main():
    print("Starting data preprocessing...")
    
    # First check if there are any files in the raw data directory
    raw_files = [f for f in os.listdir(raw_data_dir) if os.path.isfile(os.path.join(raw_data_dir, f))]
    
    if raw_files:
        # Load and process raw data
        raw_df = load_raw_data()
        if raw_df is not None and not raw_df.empty:
            # Clean and process data
            clean_df = clean_data(raw_df)
            processed_df = calculate_credit_values(clean_df)
        else:
            # Fallback to synthetic data
            processed_df = generate_synthetic_data(samples=500)
    else:
        # Generate synthetic data if no raw data
        print("No raw data files found. Generating synthetic data...")
        processed_df = generate_synthetic_data(samples=500)
    
    # Export processed data
    export_processed_data(processed_df)
    
    print("Data preprocessing complete!")


if __name__ == "__main__":
    main()