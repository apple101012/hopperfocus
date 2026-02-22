"""
Quick test script for ChronoCharm backend
Run this to verify the backend is working
"""

import requests
import json

BASE_URL = "http://localhost:8004"

def test_health():
    """Test health endpoint"""
    print("Testing /health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✓ Health check: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_balance():
    """Test balance endpoint"""
    print("\nTesting /api/balance endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/balance")
        data = response.json()
        print(f"✓ Balance: {data['balance']} Mana")
        return True
    except Exception as e:
        print(f"❌ Balance check failed: {e}")
        return False

def test_breakdown():
    """Test AI breakdown endpoint"""
    print("\nTesting /api/breakdown endpoint (AI)...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/breakdown",
            json={
                "assignment_text": "Write a 3-paragraph essay on climate change. Include an introduction, body paragraph with evidence, and conclusion.",
                "user_id": "test_user"
            }
        )
        data = response.json()
        print(f"✓ AI generated {len(data['quest_log']['tasks'])} tasks")
        for i, task in enumerate(data['quest_log']['tasks'][:2], 1):
            print(f"  Task {i}: {task['title']} (Stake: {task['required_stake']}, Bounty: {task['reward_bounty']})")
        return True
    except Exception as e:
        print(f"❌ AI breakdown failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("ChronoCharm Backend Test Suite")
    print("=" * 60)
    
    results = []
    results.append(("Health", test_health()))
    results.append(("Balance", test_balance()))
    results.append(("AI Breakdown", test_breakdown()))
    
    print("\n" + "=" * 60)
    print("Test Results:")
    for name, passed in results:
        status = "✓ PASS" if passed else "❌ FAIL"
        print(f"  {status}: {name}")
    print("=" * 60)
