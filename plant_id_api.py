import requests
import base64
import os
from datetime import datetime
import json

class PlantIdAPI:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.plant.id/v2"
        
    def identify_plant(self, image_path, organs=['leaf', 'flower', 'fruit', 'bark']):
        """
        Identify plant using Plant.id API
        """
        try:
            # Encode image to base64
            with open(image_path, "rb") as image_file:
                encoded_image = base64.b64encode(image_file.read()).decode('utf-8')
            
            # Prepare request data
            data = {
                "images": [encoded_image],
                "modifiers": ["crops_fast", "similar_images"],
                "plant_language": "en",
                "plant_details": [
                    "common_names",
                    "url",
                    "name_authority",
                    "wiki_description",
                    "taxonomy",
                    "synonyms"
                ],
                "organs": organs
            }
            
            headers = {
                "Content-Type": "application/json",
                "Api-Key": self.api_key
            }
            
            # Make API request
            response = requests.post(
                f"{self.base_url}/identify",
                json=data,
                headers=headers
            )
            
            if response.status_code == 200:
                return {
                    'success': True,
                    'data': response.json(),
                    'error': None
                }
            else:
                return {
                    'success': False,
                    'data': None,
                    'error': f"API Error: {response.status_code} - {response.text}"
                }
                
        except Exception as e:
            return {
                'success': False,
                'data': None,
                'error': f"Request failed: {str(e)}"
            }
    
    def get_health_assessment(self, image_path):
        """
        Get plant health assessment (requires different endpoint)
        """
        try:
            with open(image_path, "rb") as image_file:
                encoded_image = base64.b64encode(image_file.read()).decode('utf-8')
            
            data = {
                "images": [encoded_image],
                "modifiers": ["crops_fast"],
                "disease_details": ["cause", "common_names", "classification", "description", "treatment"]
            }
            
            headers = {
                "Content-Type": "application/json",
                "Api-Key": self.api_key
            }
            
            response = requests.post(
                f"{self.base_url}/health_assessment",
                json=data,
                headers=headers
            )
            
            if response.status_code == 200:
                return {
                    'success': True,
                    'data': response.json(),
                    'error': None
                }
            else:
                return {
                    'success': False,
                    'data': None,
                    'error': f"API Error: {response.status_code} - {response.text}"
                }
                
        except Exception as e:
            return {
                'success': False,
                'data': None,
                'error': f"Request failed: {str(e)}"
            }
    
    def parse_identification_results(self, api_response):
        """
        Parse Plant.id API response into structured data
        """
        if not api_response or 'suggestions' not in api_response:
            return None
        
        suggestions = api_response['suggestions']
        if not suggestions:
            return None
        
        best_match = suggestions[0]
        
        parsed_data = {
            'scientific_name': best_match.get('plant_name', 'Unknown'),
            'common_names': best_match.get('plant_details', {}).get('common_names', []),
            'probability': best_match.get('probability', 0),
            'confirmed': best_match.get('confirmed', False),
            'similar_images': best_match.get('similar_images', []),
            'plant_details': best_match.get('plant_details', {}),
            'all_suggestions': suggestions
        }
        
        return parsed_data

# Example usage
if __name__ == "__main__":
    # You'll need to get an API key from https://plant.id/
    api_key = "your_plant_id_api_key_here"
    plant_id = PlantIdAPI(api_key)
    
    # Example identification
    result = plant_id.identify_plant("path_to_plant_image.jpg")
    if result['success']:
        parsed = plant_id.parse_identification_results(result['data'])
        print(f"Identified as: {parsed['scientific_name']}")
        print(f"Confidence: {parsed['probability']:.2%}")
        print(f"Common names: {', '.join(parsed['common_names'])}")