"""
Direct Gemini AI test - debug why AI breakdown isn't working
"""

import asyncio
import sys
sys.path.append('.')

from ai_service import OddsMaker

async def test_gemini():
    print("=" * 70)
    print("GEMINI AI DIRECT TEST")
    print("=" * 70)
    
    try:
        print("\n1. Initializing Gemini Odds Maker...")
        odds_maker = OddsMaker()
        print("✓ Initialization successful")
        
        print("\n2. Testing with simple assignment...")
        assignment = "Write a 3-paragraph essay on climate change."
        
        print(f"Assignment: {assignment}")
        print("\nCalling Gemini API...")
        
        result = await odds_maker.breakdown_assignment(assignment)
        
        print(f"\n✓ SUCCESS! Generated {len(result.tasks)} tasks:")
        for i, task in enumerate(result.tasks, 1):
            print(f"\n  Task {i}: {task.title}")
            print(f"    Duration: {task.duration_minutes} min")
            print(f"    Stake: {task.required_stake} Mana")
            print(f"    Bounty: {task.reward_bounty} Mana")
            print(f"    Quote: \"{task.encouragement_quote}\"")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_gemini())
    print("\n" + "=" * 70)
    if success:
        print("✓ Gemini AI is working correctly!")
    else:
        print("✗ Gemini AI test failed - check error above")
    print("=" * 70)
