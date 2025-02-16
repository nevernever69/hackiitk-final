import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.cluster import DBSCAN
import xgboost as xgb
import json
import sys
from datetime import datetime, timedelta
import pickle
import warnings
warnings.filterwarnings('ignore')

class InsiderThreatDetector:
    def __init__(self):
        # Initialize models
        self.isolation_forest = IsolationForest(contamination=0.1, random_state=42)
        self.xgb_model = xgb.XGBClassifier(
            objective='binary:logistic',
            eval_metric='logloss',
            use_label_encoder=False,
            random_state=42
        )
        self.dbscan = DBSCAN(eps=0.5, min_samples=5)
        self.scaler = StandardScaler()
        
        # Store historical data for behavioral analysis
        self.historical_data = {
            'activity_patterns': {},
            'user_profiles': {},
            'known_anomalies': set()
        }
        
        # Define risk factors and weights
        self.risk_weights = {
            'time_risk': 0.2,
            'frequency_risk': 0.15,
            'activity_risk': 0.25,
            'anomaly_score': 0.4
        }

    def preprocess_activity(self, activity_data):
        """Preprocess a single activity for prediction"""
        # Extract time-based features
        timestamp = datetime.fromisoformat(activity_data['timestamp'].replace('Z', '+00:00'))
        hour = timestamp.hour
        is_weekend = timestamp.weekday() >= 5
        is_after_hours = hour < 6 or hour > 18

        # Activity type encoding
        activity_type_risk = {
            'login': 0.3,
            'file_access': 0.6,
            'network_access': 0.4,
            'admin_action': 0.8
        }
        
        # Create feature vector
        features = {
            'hour': hour,
            'is_weekend': int(is_weekend),
            'is_after_hours': int(is_after_hours),
            'activity_type_risk': activity_type_risk.get(activity_data['type'], 0.5),
            'frequency': activity_data.get('frequency', 0),
            'is_sensitive': 1 if activity_data.get('details', {}).get('sensitivity') == 'high' else 0,
            'is_external': 1 if activity_data.get('details', {}).get('location') == 'external' else 0
        }
        
        return features

    def update_user_profile(self, user_id, activity_data, features):
        """Update user behavioral profile"""
        if user_id not in self.historical_data['user_profiles']:
            self.historical_data['user_profiles'][user_id] = {
                'activity_count': 0,
                'avg_hour': 0,
                'sensitive_access_count': 0,
                'external_access_count': 0,
                'risk_scores': []
            }
        
        profile = self.historical_data['user_profiles'][user_id]
        profile['activity_count'] += 1
        profile['avg_hour'] = (profile['avg_hour'] * (profile['activity_count'] - 1) + 
                             features['hour']) / profile['activity_count']
        profile['sensitive_access_count'] += features['is_sensitive']
        profile['external_access_count'] += features['is_external']

    def calculate_behavioral_score(self, user_id, features):
        """Calculate behavioral anomaly score based on user profile"""
        if user_id not in self.historical_data['user_profiles']:
            return 0.5
        
        profile = self.historical_data['user_profiles'][user_id]
        
        # Calculate deviations from normal behavior
        hour_deviation = abs(features['hour'] - profile['avg_hour']) / 12
        sensitive_ratio = profile['sensitive_access_count'] / max(profile['activity_count'], 1)
        external_ratio = profile['external_access_count'] / max(profile['activity_count'], 1)
        
        # Combine scores
        behavioral_score = (hour_deviation * 0.3 + 
                          sensitive_ratio * 0.4 + 
                          external_ratio * 0.3)
        
        return min(behavioral_score, 1.0)

    def analyze_activity_pattern(self, activity_data):
        """Analyze activity patterns for anomalies"""
        user_id = activity_data['user']
        timestamp = datetime.fromisoformat(activity_data['timestamp'].replace('Z', '+00:00'))
        
        if user_id not in self.historical_data['activity_patterns']:
            self.historical_data['activity_patterns'][user_id] = []
        
        patterns = self.historical_data['activity_patterns'][user_id]
        patterns.append({
            'timestamp': timestamp,
            'type': activity_data['type'],
            'details': activity_data.get('details', {})
        })
        
        # Keep only last 24 hours of activities
        cutoff = timestamp - timedelta(hours=24)
        patterns = [p for p in patterns if p['timestamp'] > cutoff]
        
        # Analyze patterns
        activity_count = len(patterns)
        unique_types = len(set(p['type'] for p in patterns))
        sensitive_access = sum(1 for p in patterns 
                             if p.get('details', {}).get('sensitivity') == 'high')
        
        pattern_score = (activity_count / 100 * 0.4 + 
                        unique_types / 4 * 0.3 + 
                        sensitive_access / max(activity_count, 1) * 0.3)
        
        return min(pattern_score, 1.0)

    def predict_anomaly(self, activity_data):
        """Predict anomaly score for a single activity"""
        try:
            # Preprocess activity
            features = self.preprocess_activity(activity_data)
            
            # Update user profile
            user_id = activity_data['user']
            self.update_user_profile(user_id, activity_data, features)
            
            # Calculate behavioral score
            behavioral_score = self.calculate_behavioral_score(user_id, features)
            
            # Analyze activity patterns
            pattern_score = self.analyze_activity_pattern(activity_data)
            
            # Calculate base risk score
            time_risk = features['is_after_hours'] * 0.7 + features['is_weekend'] * 0.3
            activity_risk = features['activity_type_risk']
            frequency_risk = min(features['frequency'] / 100, 1.0)
            
            # Combine all risk factors
            final_risk_score = (
                time_risk * self.risk_weights['time_risk'] +
                frequency_risk * self.risk_weights['frequency_risk'] +
                activity_risk * self.risk_weights['activity_risk'] +
                ((behavioral_score + pattern_score) / 2) * self.risk_weights['anomaly_score']
            )
            
            # Determine severity
            severity = 'low'
            if final_risk_score > 0.8:
                severity = 'high'
            elif final_risk_score > 0.5:
                severity = 'medium'
            
            # Prepare response
            response = {
                'anomalyScore': float(final_risk_score),
                'severity': severity,
                'insights': {
                    'behavioralScore': float(behavioral_score),
                    'patternScore': float(pattern_score),
                    'timeRisk': float(time_risk),
                    'activityRisk': float(activity_risk),
                    'frequencyRisk': float(frequency_risk)
                }
            }
            
            return response
            
        except Exception as e:
            print(f"Error in prediction: {str(e)}", file=sys.stderr)
            return {'anomalyScore': 0.5, 'severity': 'medium', 'error': str(e)}

def main():
    try:
        # Read input from stdin
        input_data = json.loads(sys.argv[1])
        
        # Initialize detector
        detector = InsiderThreatDetector()
        
        # Make prediction
        result = detector.predict_anomaly(input_data)
        
        # Print result
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
