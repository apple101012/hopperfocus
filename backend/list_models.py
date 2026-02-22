"""
List available Gemini models for this API key
"""

import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

print("=" * 70)
print("AVAILABLE GEMINI MODELS")
print("=" * 70)

try:
    models = genai.list_models()
    
    print("\nModels that support 'generateContent':")
    count = 0
    for model in models:
        if 'generateContent' in model.supported_generation_methods:
            print(f"\n  ✓ {model.name}")
            print(f"    Display name: {model.display_name}")
            print(f"    Description: {model.description[:100]}...")
            count += 1
    
    print(f"\n\nTotal models available: {count}")
    print("=" * 70)
    
except Exception as e:
    print(f"\n❌ Error listing models: {e}")
    import traceback
    traceback.print_exc()
