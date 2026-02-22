"""
ChronoCharm - FastAPI Backend
High-stakes productivity app for ADHD executive function
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

from database import Database, ManaLedger
from ai_service import OddsMaker, QuestLog

load_dotenv()

app = FastAPI(
    title="ChronoCharm API",
    description="AI-powered high-stakes productivity for ADHD brains",
    version="1.0.0"
)

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Initialize AI service
odds_maker = OddsMaker()


# === Startup & Shutdown ===

@app.on_event("startup")
async def startup():
    """Connect to MongoDB on startup"""
    await Database.connect()
    print("✓ ChronoCharm backend ready")


@app.on_event("shutdown")
async def shutdown():
    """Close MongoDB connection on shutdown"""
    await Database.close()


# === Request/Response Models ===

class BreakdownRequest(BaseModel):
    assignment: str
    taskCount: int = 10
    isWizardMode: bool = False
    user_id: str = "default"


class WagerStartRequest(BaseModel):
    task_id: str
    stake: int
    user_id: str = "default"


class WagerCompleteRequest(BaseModel):
    task_id: str
    bounty: int
    stake: int
    won: bool  # True = claimed bounty, False = time ran out
    user_id: str = "default"


class BalanceResponse(BaseModel):
    user_id: str
    balance: int
    total_earned: int
    total_lost: int
    quests_completed: int


class RPGStats(BaseModel):
    endurance: int = 10
    focus: int = 10
    magic: int = 10
    level: int = 1
    xp: int = 0
    xpToNextLevel: int = 100
    title: str = "First Year"
    badges: list[str] = []


# === Endpoints ===

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "chronocharm"}


@app.get("/api/balance", response_model=BalanceResponse)
async def get_balance(user_id: str = "default"):
    """Get user's current Mana balance and stats"""
    try:
        user = await ManaLedger.get_or_create_user(user_id)
        return BalanceResponse(
            user_id=user["user_id"],
            balance=user["balance"],
            total_earned=user["total_earned"],
            total_lost=user["total_lost"],
            quests_completed=user["quests_completed"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/breakdown")
async def breakdown_assignment(request: BreakdownRequest):
    """
    Break down a large assignment into micro-tasks with AI
    Returns tasks, quote, and estimated time
    """
    try:
        # Ensure user exists and has balance
        user = await ManaLedger.get_or_create_user(request.user_id)
        
        # Use AI to break down the assignment
        # Format the request to include task count and wizard mode
        prompt_suffix = f"\n\nGenerate exactly {request.taskCount} tasks."
        if request.isWizardMode:
            prompt_suffix += " Use magical, wizard-themed language with emojis to make tasks more engaging and fun!"
        
        quest_log = odds_maker.breakdown_assignment(request.assignment + prompt_suffix)
        
        # Transform quest_log to new format
        tasks = []
        for i, task in enumerate(quest_log.tasks[:request.taskCount], 1):
            tasks.append({
                "id": f"task-{i}",
                "title": task.title,
                "description": task.encouragement_quote,  # Use quote as description
                "estimatedTime": f"{task.duration_minutes} min",
                "completed": False
            })
        
        # Generate motivational quote
        quotes = [
            "The journey of a thousand miles begins with a single step. You've got this!",
            "Magic is believing in yourself. If you can do that, you can make anything happen.",
            "It does not do to dwell on dreams and forget to live. Time to take action!",
            "Happiness can be found even in the darkest of times, if one only remembers to turn on the light.",
            "We must all face the choice between what is right and what is easy. Choose action today!",
        ]
        import random
        quote = random.choice(quotes)
        
        return {
            "tasks": tasks,
            "quote": quote,
            "totalEstimatedTime": f"{sum(t.duration_minutes for t in quest_log.tasks[:request.taskCount])} minutes"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI breakdown failed: {str(e)}")


@app.post("/api/wager/start")
async def start_wager(request: WagerStartRequest):
    """
    Accept a wager - deduct stake from user balance
    """
    try:
        updated_user = await ManaLedger.deduct_stake(request.user_id, request.stake)
        
        return {
            "success": True,
            "task_id": request.task_id,
            "stake_deducted": request.stake,
            "new_balance": updated_user["balance"]
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/wager/complete")
async def complete_wager(request: WagerCompleteRequest):
    """
    Complete a wager - award bounty if won, record loss if time ran out
    """
    try:
        if request.won:
            # User completed the task - award bounty + return stake
            updated_user = await ManaLedger.award_bounty(
                request.user_id,
                request.bounty,
                request.stake
            )
            result = {
                "success": True,
                "outcome": "won",
                "bounty_awarded": request.bounty,
                "stake_returned": request.stake,
                "total_gain": request.bounty + request.stake,
                "new_balance": updated_user["balance"]
            }
        else:
            # User failed - stake is lost (already deducted)
            updated_user = await ManaLedger.lose_stake(request.user_id, request.stake)
            result = {
                "success": True,
                "outcome": "lost",
                "stake_lost": request.stake,
                "new_balance": updated_user["balance"]
            }
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stats")
async def get_stats(user_id: str = "default"):
    """Get user's RPG stats"""
    try:
        db = Database.get_db()
        stats = await db.stats.find_one({"user_id": user_id})
        
        if not stats:
            # Create default stats
            default_stats = RPGStats().model_dump()
            default_stats["user_id"] = user_id
            await db.stats.insert_one(default_stats)
            return RPGStats()
        
        return RPGStats(**{k: v for k, v in stats.items() if k != "_id" and k != "user_id"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/stats")
async def update_stats(stats: RPGStats, user_id: str = "default"):
    """Update user's RPG stats"""
    try:
        db = Database.get_db()
        stats_dict = stats.model_dump()
        stats_dict["user_id"] = user_id
        
        await db.stats.update_one(
            {"user_id": user_id},
            {"$set": stats_dict},
            upsert=True
        )
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/reset")
async def reset_user(user_id: str = "default"):
    """
    Reset user balance to starting value (for testing)
    """
    try:
        db = Database.get_db()
        await db.users.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "balance": ManaLedger.STARTING_MANA,
                    "total_earned": 0,
                    "total_lost": 0,
                    "quests_completed": 0
                }
            }
        )
        return {"success": True, "balance": ManaLedger.STARTING_MANA}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ScheduleRequest(BaseModel):
    tasks: list
    available_hours: list


@app.post("/api/schedule")
async def schedule_tasks(request: ScheduleRequest):
    """
    Use AI to intelligently schedule tasks into available time slots
    """
    try:
        result = odds_maker.schedule_tasks(request.tasks, request.available_hours)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8004))
    uvicorn.run(app, host="0.0.0.0", port=port)
