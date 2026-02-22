"""
Comprehensive ChronoCharm Test Suite
Tests all endpoints, AI functionality, and wager mechanics
"""

import requests
import json
import time
from typing import Dict, Any

BASE_URL = "http://127.0.0.1:8004"

class TestResults:
    def __init__(self):
        self.passed = []
        self.failed = []
        self.warnings = []
    
    def add_pass(self, test_name: str, details: str = ""):
        self.passed.append((test_name, details))
        print(f"✓ PASS: {test_name}")
        if details:
            print(f"  → {details}")
    
    def add_fail(self, test_name: str, error: str):
        self.failed.append((test_name, error))
        print(f"✗ FAIL: {test_name}")
        print(f"  → {error}")
    
    def add_warning(self, test_name: str, warning: str):
        self.warnings.append((test_name, warning))
        print(f"⚠ WARNING: {test_name}")
        print(f"  → {warning}")
    
    def summary(self):
        print("\n" + "=" * 70)
        print("TEST SUMMARY")
        print("=" * 70)
        print(f"Passed:   {len(self.passed)}")
        print(f"Failed:   {len(self.failed)}")
        print(f"Warnings: {len(self.warnings)}")
        print("=" * 70)
        
        if self.failed:
            print("\nFAILED TESTS:")
            for name, error in self.failed:
                print(f"  ✗ {name}: {error}")
        
        if len(self.passed) > 0 and len(self.failed) == 0:
            print("\n🎉 ALL TESTS PASSED! 🎉")
            return True
        else:
            print("\n❌ SOME TESTS FAILED")
            return False

results = TestResults()

def test_health():
    """Test 1: Health endpoint"""
    print("\n--- TEST 1: Health Check ---")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "ok" and data.get("service") == "chronocharm":
                results.add_pass("Health Check", f"Status: {data}")
                return True
            else:
                results.add_fail("Health Check", f"Unexpected response: {data}")
                return False
        else:
            results.add_fail("Health Check", f"Status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        results.add_fail("Health Check", "Cannot connect to backend. Is it running?")
        return False
    except Exception as e:
        results.add_fail("Health Check", str(e))
        return False

def test_initial_balance():
    """Test 2: Get initial balance"""
    print("\n--- TEST 2: Initial Balance ---")
    try:
        response = requests.get(f"{BASE_URL}/api/balance", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data["balance"] == 1000:
                results.add_pass("Initial Balance", f"User has 1000 Mana: {data}")
                return data
            else:
                results.add_warning("Initial Balance", f"Balance is {data['balance']}, not 1000. User may have played before.")
                return data
        else:
            results.add_fail("Initial Balance", f"Status code: {response.status_code}")
            return None
    except Exception as e:
        results.add_fail("Initial Balance", str(e))
        return None

def test_ai_breakdown_simple():
    """Test 3: AI breakdown with simple assignment"""
    print("\n--- TEST 3: AI Breakdown (Simple) ---")
    try:
        assignment = "Write a 3-paragraph essay on climate change."
        response = requests.post(
            f"{BASE_URL}/api/breakdown",
            json={"assignment_text": assignment, "user_id": "test_user_1"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            tasks = data["quest_log"]["tasks"]
            
            if len(tasks) == 0:
                results.add_fail("AI Breakdown (Simple)", "No tasks generated")
                return None
            
            # Validate task structure
            valid = True
            for i, task in enumerate(tasks):
                required_fields = ["id", "title", "duration_minutes", "required_stake", "reward_bounty", "encouragement_quote"]
                for field in required_fields:
                    if field not in task:
                        results.add_fail("AI Breakdown (Simple)", f"Task {i+1} missing field: {field}")
                        valid = False
                
                # Validate bounty > stake
                if task.get("reward_bounty", 0) <= task.get("required_stake", 0):
                    results.add_fail("AI Breakdown (Simple)", f"Task {i+1}: Bounty must exceed stake")
                    valid = False
            
            if valid:
                results.add_pass("AI Breakdown (Simple)", f"Generated {len(tasks)} valid tasks")
                print(f"  Sample task: '{tasks[0]['title']}'")
                print(f"    Stake: {tasks[0]['required_stake']}, Bounty: {tasks[0]['reward_bounty']}")
                return data["quest_log"]
            else:
                return None
        else:
            results.add_fail("AI Breakdown (Simple)", f"Status code: {response.status_code}, Body: {response.text}")
            return None
    except Exception as e:
        results.add_fail("AI Breakdown (Simple)", str(e))
        return None

def test_ai_breakdown_complex():
    """Test 4: AI breakdown with complex assignment"""
    print("\n--- TEST 4: AI Breakdown (Complex) ---")
    try:
        assignment = """
        Complete the following programming assignment:
        1. Build a REST API with FastAPI
        2. Implement user authentication with JWT
        3. Create CRUD endpoints for a blog system
        4. Add database migrations with Alembic
        5. Write unit tests with pytest
        6. Deploy to AWS with Docker
        """
        
        response = requests.post(
            f"{BASE_URL}/api/breakdown",
            json={"assignment_text": assignment, "user_id": "test_user_2"},
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            tasks = data["quest_log"]["tasks"]
            
            if len(tasks) >= 5:
                results.add_pass("AI Breakdown (Complex)", f"Generated {len(tasks)} tasks for complex assignment")
                
                # Check if hard tasks have higher stakes
                stakes = [t["required_stake"] for t in tasks]
                if max(stakes) > min(stakes):
                    print(f"  ✓ Stake range: {min(stakes)}-{max(stakes)} (difficulty-based pricing)")
                
                return data["quest_log"]
            else:
                results.add_warning("AI Breakdown (Complex)", f"Only {len(tasks)} tasks for complex assignment")
                return data["quest_log"]
        else:
            results.add_fail("AI Breakdown (Complex)", f"Status code: {response.status_code}")
            return None
    except Exception as e:
        results.add_fail("AI Breakdown (Complex)", str(e))
        return None

def test_wager_start():
    """Test 5: Start a wager"""
    print("\n--- TEST 5: Start Wager ---")
    try:
        # First get balance
        balance_response = requests.get(f"{BASE_URL}/api/balance?user_id=test_wager_user")
        initial_balance = balance_response.json()["balance"]
        
        # Start a wager
        stake = 10
        response = requests.post(
            f"{BASE_URL}/api/wager/start",
            json={"task_id": "test_task_1", "stake": stake, "user_id": "test_wager_user"},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            new_balance = data["new_balance"]
            
            if new_balance == initial_balance - stake:
                results.add_pass("Start Wager", f"Stake deducted: {initial_balance} → {new_balance}")
                return True
            else:
                results.add_fail("Start Wager", f"Balance math wrong: {initial_balance} - {stake} ≠ {new_balance}")
                return False
        else:
            results.add_fail("Start Wager", f"Status code: {response.status_code}, Body: {response.text}")
            return False
    except Exception as e:
        results.add_fail("Start Wager", str(e))
        return False

def test_wager_win():
    """Test 6: Win a wager"""
    print("\n--- TEST 6: Win Wager ---")
    try:
        # Get balance before win
        balance_response = requests.get(f"{BASE_URL}/api/balance?user_id=test_win_user")
        initial_balance = balance_response.json()["balance"]
        
        # Complete wager (win)
        stake = 10
        bounty = 25
        response = requests.post(
            f"{BASE_URL}/api/wager/complete",
            json={
                "task_id": "test_task_2",
                "bounty": bounty,
                "stake": stake,
                "won": True,
                "user_id": "test_win_user"
            },
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            new_balance = data["new_balance"]
            expected_gain = bounty + stake
            
            if new_balance == initial_balance + expected_gain:
                results.add_pass("Win Wager", f"Bounty + stake awarded: {initial_balance} + {expected_gain} = {new_balance}")
                return True
            else:
                results.add_fail("Win Wager", f"Balance math wrong: {initial_balance} + {expected_gain} ≠ {new_balance}")
                return False
        else:
            results.add_fail("Win Wager", f"Status code: {response.status_code}")
            return False
    except Exception as e:
        results.add_fail("Win Wager", str(e))
        return False

def test_wager_lose():
    """Test 7: Lose a wager"""
    print("\n--- TEST 7: Lose Wager ---")
    try:
        # Start a wager first
        user_id = "test_lose_user"
        stake = 15
        
        # Get initial balance
        balance_response = requests.get(f"{BASE_URL}/api/balance?user_id={user_id}")
        initial_balance = balance_response.json()["balance"]
        
        # Start wager (deducts stake)
        start_response = requests.post(
            f"{BASE_URL}/api/wager/start",
            json={"task_id": "test_task_3", "stake": stake, "user_id": user_id}
        )
        balance_after_start = start_response.json()["new_balance"]
        
        # Lose wager (stake already deducted, just records loss)
        response = requests.post(
            f"{BASE_URL}/api/wager/complete",
            json={
                "task_id": "test_task_3",
                "bounty": 30,
                "stake": stake,
                "won": False,
                "user_id": user_id
            },
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            final_balance = data["new_balance"]
            
            # Balance should remain at (initial - stake) since stake was already deducted
            if final_balance == balance_after_start:
                results.add_pass("Lose Wager", f"Stake lost: {initial_balance} → {final_balance} (lost {stake} Mana)")
                return True
            else:
                results.add_fail("Lose Wager", f"Balance unexpected: {balance_after_start} → {final_balance}")
                return False
        else:
            results.add_fail("Lose Wager", f"Status code: {response.status_code}")
            return False
    except Exception as e:
        results.add_fail("Lose Wager", str(e))
        return False

def test_insufficient_mana():
    """Test 8: Insufficient Mana error"""
    print("\n--- TEST 8: Insufficient Mana ---")
    try:
        # Try to stake more than balance
        response = requests.post(
            f"{BASE_URL}/api/wager/start",
            json={"task_id": "test_task_4", "stake": 99999, "user_id": "poor_user"},
            timeout=5
        )
        
        if response.status_code == 400:
            results.add_pass("Insufficient Mana", "Correctly rejected excessive stake")
            return True
        else:
            results.add_fail("Insufficient Mana", f"Should return 400, got {response.status_code}")
            return False
    except Exception as e:
        results.add_fail("Insufficient Mana", str(e))
        return False

def test_reset():
    """Test 9: Reset balance"""
    print("\n--- TEST 9: Reset Balance ---")
    try:
        user_id = "reset_test_user"
        
        # Get initial balance
        balance_response = requests.get(f"{BASE_URL}/api/balance?user_id={user_id}")
        initial_balance = balance_response.json()["balance"]
        
        # Reset
        response = requests.post(f"{BASE_URL}/api/reset?user_id={user_id}", timeout=5)
        
        if response.status_code == 200:
            # Check new balance
            new_balance_response = requests.get(f"{BASE_URL}/api/balance?user_id={user_id}")
            new_balance = new_balance_response.json()["balance"]
            
            if new_balance == 1000:
                results.add_pass("Reset Balance", f"Balance reset to 1000 (was {initial_balance})")
                return True
            else:
                results.add_fail("Reset Balance", f"Balance is {new_balance}, expected 1000")
                return False
        else:
            results.add_fail("Reset Balance", f"Status code: {response.status_code}")
            return False
    except Exception as e:
        results.add_fail("Reset Balance", str(e))
        return False

def test_cors_headers():
    """Test 10: CORS headers for frontend"""
    print("\n--- TEST 10: CORS Headers ---")
    try:
        response = requests.options(f"{BASE_URL}/api/balance", timeout=5)
        headers = response.headers
        
        if "access-control-allow-origin" in headers:
            results.add_pass("CORS Headers", "CORS properly configured")
            return True
        else:
            results.add_warning("CORS Headers", "CORS headers not found (might cause frontend issues)")
            return False
    except Exception as e:
        results.add_warning("CORS Headers", f"Could not test CORS: {e}")
        return False

def run_all_tests():
    print("=" * 70)
    print("CHRONOCHARM COMPREHENSIVE TEST SUITE")
    print("=" * 70)
    print(f"Backend: {BASE_URL}")
    print(f"Starting tests at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run all tests
    if not test_health():
        print("\n❌ Backend not responding. Cannot continue tests.")
        results.summary()
        return False
    
    test_initial_balance()
    test_ai_breakdown_simple()
    test_ai_breakdown_complex()
    test_wager_start()
    test_wager_win()
    test_wager_lose()
    test_insufficient_mana()
    test_reset()
    test_cors_headers()
    
    # Print summary
    return results.summary()

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
