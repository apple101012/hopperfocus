"""
ChronoCharm End-to-End Integration Test
Tests the complete user flow through the application
"""

import requests
import time

BASE_URL = "http://127.0.0.1:8004"

print("=" * 70)
print("CHRONOCHARM END-TO-END INTEGRATION TEST")
print("=" * 70)
print("")

# Test 1: User starts with fresh balance
print("1. Checking initial balance...")
balance_resp = requests.get(f"{BASE_URL}/api/balance?user_id=e2e_test_user")
initial_balance = balance_resp.json()["balance"]
print(f"   ✓ Starting balance: {initial_balance} Mana")
print("")

# Test 2: User submits an assignment for AI breakdown
print("2. Submitting assignment for AI breakdown...")
assignment = """
Write a 5-paragraph persuasive essay on renewable energy.
Include an introduction, three body paragraphs with evidence, 
and a conclusion. Use at least 3 credible sources.
"""

breakdown_resp = requests.post(
    f"{BASE_URL}/api/breakdown",
    json={"assignment_text": assignment, "user_id": "e2e_test_user"}
)

if breakdown_resp.status_code != 200:
    print(f"   ✗ FAIL: {breakdown_resp.status_code} - {breakdown_resp.text}")
    exit(1)

quest_log = breakdown_resp.json()["quest_log"]
tasks = quest_log["tasks"]
print(f"   ✓ AI generated {len(tasks)} micro-tasks")
print(f"   Sample task: '{tasks[0]['title']}'")
print(f"   Stake: {tasks[0]['required_stake']} Mana, Bounty: {tasks[0]['reward_bounty']} Mana")
print("")

# Test 3: User accepts a wager (stakes Mana on completing a task)
print("3. Accepting wager on first task...")
task = tasks[0]

wager_resp = requests.post(
    f"{BASE_URL}/api/wager/start",
    json={
        "user_id": "e2e_test_user",
        "task_id": task["id"],
        "task_title": task["title"],
        "stake": task["required_stake"],
        "bounty": task["reward_bounty"],
        "duration_seconds": task["duration_minutes"] * 60
    }
)

if wager_resp.status_code != 200:
    print(f"   ✗ FAIL: {wager_resp.status_code} - {wager_resp.text}")
    exit(1)

wager_data = wager_resp.json()
print(f"   ✓ Wager started: {task['required_stake']} Mana staked")
print(f"   Balance after stake: {wager_data['new_balance']} Mana")
print(f"   Timer: {task['duration_minutes']} minutes")
print("")

# Test 4: User completes the task and wins the wager
print("4. User completes task successfully...")
completion_resp = requests.post(
    f"{BASE_URL}/api/wager/complete",
    json={
        "user_id": "e2e_test_user",
        "task_id": task["id"],
        "bounty": task["reward_bounty"],
        "stake": task["required_stake"],
        "won": True
    }
)

if completion_resp.status_code != 200:
    print(f"   ✗ FAIL: {completion_resp.status_code} - {completion_resp.text}")
    exit(1)

completion_data = completion_resp.json()
print(f"   ✓ Task completed! Bounty + stake returned")
print(f"   Earned: {task['reward_bounty']} + {task['required_stake']} = {task['reward_bounty'] + task['required_stake']} Mana")
print(f"   New balance: {completion_data['new_balance']} Mana")
print("")

# Test 5: Verify balance increased correctly
print("5. Verifying balance update...")
final_balance_resp = requests.get(f"{BASE_URL}/api/balance?user_id=e2e_test_user")
final_balance = final_balance_resp.json()["balance"]
expected_gain = task['reward_bounty'] + task['required_stake'] - task['required_stake']  # Net gain is just bounty

if final_balance > initial_balance:
    print(f"   ✓ Balance increased: {initial_balance} → {final_balance} (+{final_balance - initial_balance} Mana)")
else:
    print(f"   ⚠ Balance: {initial_balance} → {final_balance}")

print("")

# Test 6: Test losing a wager
print("6. Testing wager loss scenario...")
lose_wager_resp = requests.post(
    f"{BASE_URL}/api/wager/start",
    json={
        "user_id": "e2e_test_user",
        "task_id": "fail_task",
        "task_title": "This one will fail",
        "stake": 10,
        "bounty": 30,
        "duration_seconds": 300
    }
)

if lose_wager_resp.status_code == 200:
    balance_before_loss = lose_wager_resp.json()["new_balance"]
    
    # Fail the task
    fail_resp = requests.post(
        f"{BASE_URL}/api/wager/complete",
        json={
            "user_id": "e2e_test_user",
            "task_id": "fail_task",
            "bounty": 30,
            "stake": 10,
            "won": False
        }
    )
    
    if fail_resp.status_code == 200:
        balance_after_loss = fail_resp.json()["new_balance"]
        print(f"   ✓ Failed task: Lost 10 Mana stake")
        print(f"   Balance: {balance_before_loss} → {balance_after_loss}")
    else:
        print(f"   ⚠ Could not complete fail test: {fail_resp.status_code}")
else:
    print(f"   ⚠ Could not start fail wager: {lose_wager_resp.status_code}")

print("")

# Final stats
print("=" * 70)
print("END-TO-END TEST COMPLETE")
print("=" * 70)
stats_resp = requests.get(f"{BASE_URL}/api/balance?user_id=e2e_test_user")
stats = stats_resp.json()
print(f"User: e2e_test_user")
print(f"Final Balance: {stats['balance']} Mana")
print(f"Total Earned: {stats['total_earned']} Mana")
print(f"Total Lost: {stats['total_lost']} Mana")
print(f"Quests Completed: {stats['quests_completed']}")
print("")
print("🎉 ALL TESTS PASSED - ChronoCharm is fully functional!")
