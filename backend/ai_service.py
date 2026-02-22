"""
ChronoCharm - Gemini AI "Odds Maker" Engine
Breaks down assignments into micro-tasks with stakes and bounties
"""

import google.generativeai as genai
from pydantic import BaseModel, Field
from typing import List
import os
from dotenv import load_dotenv
import json

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment")

genai.configure(api_key=GEMINI_API_KEY)


class MicroTask(BaseModel):
    """A single micro-task with stakes and bounty"""
    id: str = Field(..., description="Unique ID for this task (e.g., 'task_1')")
    title: str = Field(..., description="Clear, actionable task description (5 minutes max)")
    duration_minutes: int = Field(..., description="Estimated time to complete (1-10 minutes)")
    required_stake: int = Field(..., description="Mana required to accept this wager (higher for harder tasks)")
    reward_bounty: int = Field(..., description="Mana earned upon completion (always > stake)")
    encouragement_quote: str = Field(..., description="A motivational quote from a fantasy mentor")


class QuestLog(BaseModel):
    """Collection of micro-tasks for a large assignment"""
    tasks: List[MicroTask]


class OddsMaker:
    """AI-powered task breakdown and valuation engine"""
    
    SYSTEM_PROMPT = """You are the ChronoCharm Odds Maker — a wise, compassionate executive function coach for students with ADHD.

Your mission: Transform overwhelming assignments into tiny, winnable micro-tasks (5minutes each).

For EACH task, you must:
1. **Assess Cognitive Load** (difficulty: easy/medium/hard)
2. **Set the Stake** (Mana they risk to start — higher for harder tasks)
   - Easy: 5-15 Mana
   - Medium: 15-30 Mana
   - Hard: 30-50 Mana
3. **Set the Bounty** (Mana they earn for winning — always 2-3x the stake)
4. **Add encouragement** (A short fantasy-mentor quote like "The scroll awaits your first mark...")

**Critical Rules:**
- Break tasks into 5-minute chunks maximum
- Make the first task EXTREMELY easy (5 Mana stake) to build momentum
- Bounty must ALWAYS exceed stake (dopamine reward)
- Use clear, specific action verbs ("Read page 1-3", not "Start reading")
- For math/coding: break by problem, not by concept
- For essays: break by paragraph or outline step

Output ONLY valid JSON in this EXACT format:
{
  "tasks": [
    {
      "id": "task_1",
      "title": "Clear, specific task description",
      "duration_minutes": 5,
      "required_stake": 5,
      "reward_bounty": 15,
      "encouragement_quote": "The journey begins with a single step..."
    }
  ]
}

IMPORTANT: Return ONLY the JSON, no other text or markdown."""

    def __init__(self):
        """Initialize Gemini model"""
        self.model = genai.GenerativeModel("gemini-2.5-flash")
        print("✓ Gemini Odds Maker initialized (gemini-2.5-flash)")
    
    def breakdown_assignment(self, assignment_text: str) -> QuestLog:
        """
        Break down a large assignment into micro-tasks with stakes and bounties
        
        Args:
            assignment_text: The full assignment description (syllabus, essay prompt, etc.)
        
        Returns:
            QuestLog with structured micro-tasks
        """
        try:
            # Construct the full prompt
            full_prompt = f"{self.SYSTEM_PROMPT}\n\n**Assignment to break down:**\n{assignment_text}"
            
            print(f"📝 Sending assignment to Gemini AI...")
            
            # Generate response
            response = self.model.generate_content(full_prompt)
            
            # Get text response
            response_text = response.text.strip()
            
            print(f"📥 Received response from Gemini ({len(response_text)} chars)")
            
            # Clean up response (remove markdown code blocks if present)
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            # Parse JSON
            try:
                quest_log = QuestLog.model_validate_json(response_text)
            except json.JSONDecodeError as e:
                print(f"❌ JSON Parse Error: {e}")
                print(f"Response preview: {response_text[:200]}...")
                raise
            
            print(f"✓ Generated {len(quest_log.tasks)} micro-tasks from assignment")
            
            # Validate task count
            if len(quest_log.tasks) < 3:
                print(f"⚠️ Warning: Only {len(quest_log.tasks)} tasks generated. Assignment might be too simple.")
            
            return quest_log
            
        except Exception as e:
            print(f"❌ Error in AI breakdown: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            
            # Return a MORE detailed fallback with multiple tasks
            print("⚠️ Using fallback task list")
            return QuestLog(tasks=[
                MicroTask(
                    id="task_1",
                    title="Read the assignment prompt carefully",
                    duration_minutes=5,
                    required_stake=5,
                    reward_bounty=15,
                    encouragement_quote="Every quest begins with a single step, young wizard."
                ),
                MicroTask(
                    id="task_2",
                    title="Create an outline or plan for your work",
                    duration_minutes=5,
                    required_stake=10,
                    reward_bounty=25,
                    encouragement_quote="A map guides even the lost traveler home."
                ),
                MicroTask(
                    id="task_3",
                    title="Complete the first small portion of the assignment",
                    duration_minutes=5,
                    required_stake=15,
                    reward_bounty=35,
                    encouragement_quote="The first strike sparks the forge."
                )
            ])
    
    def schedule_tasks(self, tasks: List[dict], available_hours: List[dict]) -> dict:
        """
        Use AI to intelligently schedule tasks into available time slots
        
        Args:
            tasks: List of tasks with {title, description, estimatedMinutes, stake, bounty}
            available_hours: List of {dayIndex, hour, isBlocked} representing free slots
        
        Returns:
            dict with scheduled tasks and reasoning
        """
        try:
            # Build prompt for AI scheduler
            tasks_description = "\n".join([
                f"- {task['title']}: {task.get('estimatedMinutes', 60)} minutes, "
                f"Complexity: {'simple' if task.get('stake', 10) < 15 else 'moderate' if task.get('stake', 10) < 25 else 'complex'}"
                for task in tasks
            ])
            
            # Count available slots per day
            slots_by_day = {}
            for slot in available_hours:
                day = slot['dayIndex']
                if day not in slots_by_day:
                    slots_by_day[day] = []
                if not slot.get('isBlocked', False):
                    slots_by_day[day].append(slot['hour'])
            
            available_description = "\n".join([
                f"Day {day}: {len(hours)} free hours ({min(hours)}-{max(hours)} available)"
                for day, hours in sorted(slots_by_day.items()) if hours
            ])
            
            prompt = f"""You are a productivity AI scheduling assistant. Schedule these tasks optimally:

TASKS TO SCHEDULE:
{tasks_description}

AVAILABLE TIME:
{available_description}

SCHEDULING RULES:
1. Place complex/difficult tasks during peak energy (9AM-12PM, 2PM-5PM)
2. Place simple tasks during low energy (early morning, after 6PM)
3. Group similar tasks together when possible
4. Leave buffer time between intense tasks
5. Spread work across multiple days for sustainability

Return ONLY valid JSON in this format:
{{
  "schedule": [
    {{
      "taskIndex": 0,
      "dayIndex": 0,
      "startHour": 9,
      "reasoning": "Complex task scheduled during morning peak energy"
    }}
  ]
}}"""
            
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean up response
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            result = json.loads(response_text)
            print(f"✓ AI scheduled {len(result.get('schedule', []))} tasks")
            return result
            
        except Exception as e:
            print(f"❌ Error in AI scheduling: {e}")
            # Fallback: simple sequential scheduling
            schedule = []
            task_idx = 0
            for day, hours in sorted(slots_by_day.items()):
                if task_idx >= len(tasks):
                    break
                if hours:
                    schedule.append({
                        "taskIndex": task_idx,
                        "dayIndex": day,
                        "startHour": min(hours),
                        "reasoning": "Auto-scheduled to next available slot"
                    })
                    task_idx += 1
            
            return {"schedule": schedule}
