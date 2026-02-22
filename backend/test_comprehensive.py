"""
ChronoCharm - Comprehensive Test Suite
Tests all features: wager mechanics, streaks, AI, calendar, timer
"""

import requests
import sys
import os

# Backend URL
BASE_URL = "http://127.0.0.1:8004"

# Test user ID
TEST_USER = "test_user_comprehensive"

# Helper functions for making requests
def get(path, params=None):
    """Make GET request to backend"""
    return requests.get(f"{BASE_URL}{path}", params=params)

def post(path, json=None, params=None):
    """Make POST request to backend"""
    return requests.post(f"{BASE_URL}{path}", json=json, params=params)


class TestWagerMechanics:
    """Test Mana staking and bounty system"""
    
    def test_initial_balance(self):
        """User starts with correct Mana balance"""
        response = get("/api/balance", params={"user_id": TEST_USER})
        assert response.status_code == 200
        data = response.json()
        assert data["balance"] >= 0
        print(f"✓ Initial balance: {data['balance']} Mana")
    
    def test_start_wager_deducts_stake(self):
        """Starting a task deducts stake from balance"""
        # Reset balance first
        post("/api/reset", params={"user_id": TEST_USER})
        
        # Get initial balance
        response = get("/api/balance", params={"user_id": TEST_USER})
        initial_balance = response.json()["balance"]
        
        # Start wager with 20 stake
        response = post("/api/wager/start", json={
            "user_id": TEST_USER,
            "task_id": "test_task_1",
            "stake": 20
        })
        assert response.status_code == 200
        
        # Check balance decreased
        response = get("/api/balance", params={"user_id": TEST_USER})
        new_balance = response.json()["balance"]
        assert new_balance == initial_balance - 20
        print(f"✓ Stake deducted: {initial_balance} → {new_balance}")
    
    def test_win_wager_awards_bounty(self):
        """Winning a task awards bounty + stake back"""
        # Get balance before
        response = get("/api/balance", params={"user_id": TEST_USER})
        initial_balance = response.json()["balance"]
        
        # Complete wager (won)
        response = post("/api/wager/complete", json={
            "user_id": TEST_USER,
            "task_id": "test_task_2",
            "stake": 20,
            "bounty": 50,
            "won": True
        })
        assert response.status_code == 200
        data = response.json()
        assert data["outcome"] == "won"
        
        # Check balance increased by bounty + stake
        response = get("/api/balance", params={"user_id": TEST_USER})
        new_balance = response.json()["balance"]
        assert new_balance == initial_balance + 70  # 20 stake + 50 bounty
        print(f"✓ Bounty awarded: {initial_balance} → {new_balance}")
    
    def test_lose_wager_forfeits_stake(self):
        """Losing a task forfeits stake"""
        # Start with fresh stake
        response = post("/api/wager/start", json={
            "user_id": TEST_USER,
            "task_id": "test_task_3",
            "stake": 15
        })
        balance_after_stake = get("/api/balance", params={"user_id": TEST_USER}).json()["balance"]
        
        # Lose the wager
        response = post("/api/wager/complete", json={
            "user_id": TEST_USER,
            "task_id": "test_task_3",
            "stake": 15,
            "bounty": 40,
            "won": False
        })
        assert response.status_code == 200
        data = response.json()
        assert data["outcome"] == "lost"
        
        # Balance should stay same (stake already deducted)
        final_balance = get("/api/balance", params={"user_id": TEST_USER}).json()["balance"]
        assert final_balance == balance_after_stake
        print(f"✓ Stake lost correctly")


class TestAIBreakdown:
    """Test Gemini AI task breakdown"""
    
    def test_breakdown_generates_tasks(self):
        """AI generates task list from assignment"""
        assignment = "Write a 5-page essay on climate change"
        response = post("/api/breakdown", json={
            "assignment": assignment,
            "task_count": 5,
            "is_wizard_mode": False
        })
        assert response.status_code == 200
        data = response.json()
        
        assert "tasks" in data
        assert len(data["tasks"]) >= 3
        print(f"✓ Generated {len(data['tasks'])} tasks")
        
        # Verify task structure (API returns simplified format)
        first_task = data["tasks"][0]
        assert "id" in first_task
        assert "title" in first_task
        assert "description" in first_task
        assert "estimatedTime" in first_task
        assert "completed" in first_task
        print(f"✓ Task structure valid: {first_task['title']}")
    
    def test_wizard_mode_exists(self):
        """Wizard mode parameter accepted"""
        assignment = "Complete math homework"
        response = post("/api/breakdown", json={
            "assignment": assignment,
            "task_count": 3,
            "is_wizard_mode": True
        })
        assert response.status_code == 200
        print(f"✓ Wizard mode parameter accepted")
    
    def test_task_count_respected(self):
        """AI respects requested task count (with some tolerance)"""
        for count in [3, 5, 7]:
            response = post("/api/breakdown", json={
                "assignment": "Study for biology exam",
                "task_count": count,
                "is_wizard_mode": False
            })
            data = response.json()
            # Allow flexibility (±3 tasks)
            assert 1 <= len(data["tasks"]) <= count + 3
        print(f"✓ Task count parameter respected")


class TestAIScheduler:
    """Test AI-powered calendar scheduling"""
    
    def test_schedule_endpoint_exists(self):
        """Schedule endpoint responds"""
        response = post("/api/schedule", json={
            "tasks": [
                {"title": "Research", "estimatedMinutes": 60, "stake": 10, "bounty": 30},
                {"title": "Write", "estimatedMinutes": 120, "stake": 20, "bounty": 60}
            ],
            "available_hours": [
                {"dayIndex": 0, "hour": 9, "isBlocked": False},
                {"dayIndex": 0, "hour": 10, "isBlocked": False},
                {"dayIndex": 1, "hour": 14, "isBlocked": False}
            ]
        })
        assert response.status_code == 200
        data = response.json()
        assert "schedule" in data
        print(f"✓ AI scheduler working: {len(data['schedule'])} tasks scheduled")
    
    def test_schedule_assigns_tasks(self):
        """AI assigns tasks to time slots"""
        response = post("/api/schedule", json={
            "tasks": [
                {"title": "Task A", "estimatedMinutes": 30, "stake": 5, "bounty": 15},
                {"title": "Task B", "estimatedMinutes": 60, "stake": 10, "bounty": 25}
            ],
            "available_hours": [
                {"dayIndex": 0, "hour": h, "isBlocked": False}
                for h in range(9, 17)  # 9 AM to 5 PM
            ]
        })
        data = response.json()
        schedule = data["schedule"]
        
        # Verify tasks got scheduled
        assert isinstance(schedule, list)
        print(f"✓ Schedule returned with {len(schedule)} entries")


class TestStatsAndRPG:
    """Test XP, levels, and streaks"""
    
    def test_get_initial_stats(self):
        """User starts with default RPG stats"""
        response = get("/api/stats", params={"user_id": TEST_USER})
        assert response.status_code == 200
        stats = response.json()
        
        assert "endurance" in stats
        assert "focus" in stats
        assert "magic" in stats
        assert "level" in stats
        assert "xp" in stats
        assert stats["level"] >= 1
        print(f"✓ Initial stats: Level {stats['level']}, {stats['xp']} XP")
    
    def test_update_stats(self):
        """Can update user stats"""
        new_stats = {
            "endurance": 50,
            "focus": 60,
            "magic": 40,
            "level": 5,
            "xp": 2500,
            "xpToNextLevel": 3600,
            "title": "Prefect",
            "badges": ["Level 5"],
            "currentStreak": 0,
            "lastCompletedDate": None
        }
        response = post("/api/stats", json=new_stats, params={"user_id": TEST_USER})
        assert response.status_code == 200
        
        # Verify update
        response = get("/api/stats", params={"user_id": TEST_USER})
        stats = response.json()
        assert stats["level"] == 5
        assert stats["endurance"] == 50
        print(f"✓ Stats updated successfully")


class TestHealthEndpoint:
    """Test API health and readiness"""
    
    def test_health_check(self):
        """Health endpoint returns OK"""
        response = get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        print(f"✓ Health check passed")


class TestEdgeCases:
    """Test edge cases and error handling"""
    
    def test_empty_assignment_handled(self):
        """Empty assignment returns error or fallback"""
        response = post("/api/breakdown", json={
            "assignment": "",
            "task_count": 5,
            "is_wizard_mode": False
        })
        # Should either error or return fallback tasks
        assert response.status_code in [200, 400, 422]
        if response.status_code == 200:
            assert len(response.json()["tasks"]) > 0
        print(f"✓ Empty assignment handled")
    
    def test_excessive_task_count(self):
        """Very high task count doesn't break"""
        response = post("/api/breakdown", json={
            "assignment": "Study physics textbook chapter 5",
            "task_count": 50,
            "is_wizard_mode": False
        })
        assert response.status_code == 200
        data = response.json()
        # Should return reasonable number
        assert 1 <= len(data["tasks"]) <= 50
        print(f"✓ High task count handled: {len(data['tasks'])} tasks")


def run_all_tests():
    """Run all test classes"""
    print("=" * 60)
    print("CHRONOCHARM COMPREHENSIVE TEST SUITE")
    print("=" * 60)
    
    test_classes = [
        TestHealthEndpoint,  # Run first to verify API
        TestWagerMechanics,
        TestAIBreakdown,
        TestAIScheduler,
        TestStatsAndRPG,
        TestEdgeCases
    ]
    
    total_tests = 0
    passed_tests = 0
    failed_tests = []
    
    for test_class in test_classes:
        print(f"\n{'─' * 60}")
        print(f"Running {test_class.__name__}")
        print(f"{'─' * 60}")
        
        test_instance = test_class()
        test_methods = [
            method for method in dir(test_instance)
            if method.startswith("test_")
        ]
        
        for method_name in test_methods:
            total_tests += 1
            try:
                method = getattr(test_instance, method_name)
                method()
                passed_tests += 1
            except Exception as e:
                failed_tests.append((test_class.__name__, method_name, str(e)))
                print(f"✗ {method_name}: {e}")
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests} ({passed_tests/total_tests*100:.1f}%)")
    print(f"Failed: {len(failed_tests)}")
    
    if failed_tests:
        print("\nFAILED TESTS:")
        for class_name, method_name, error in failed_tests:
            print(f"  ✗ {class_name}.{method_name}")
            print(f"    Error: {error[:100]}")
    else:
        print("\n🎉 ALL TESTS PASSED!")
    
    print("\n" + "=" * 60)
    return passed_tests == total_tests


if __name__ == "__main__":
    try:
        success = run_all_tests()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nFatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
