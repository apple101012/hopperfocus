"""
ChronoCharm - MongoDB Atlas Ledger System
Manages user Mana balances and quest state
"""

from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/chronocharm")

class Database:
    client: Optional[AsyncIOMotorClient] = None
    
    @classmethod
    async def connect(cls):
        """Initialize MongoDB connection"""
        cls.client = AsyncIOMotorClient(MONGO_URI)
        print(f"✓ Connected to MongoDB: {MONGO_URI}")
    
    @classmethod
    async def close(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            print("✓ MongoDB connection closed")
    
    @classmethod
    def get_db(cls):
        """Get database instance"""
        if not cls.client:
            raise RuntimeError("Database not connected. Call connect() first.")
        return cls.client.chronocharm


class ManaLedger:
    """Manages user Mana balances and wager transactions"""
    
    STARTING_MANA = 1000
    
    @staticmethod
    async def get_or_create_user(user_id: str = "default") -> dict:
        """Get user balance or initialize with starting Mana"""
        db = Database.get_db()
        users = db.users
        
        user = await users.find_one({"user_id": user_id})
        
        if not user:
            user = {
                "user_id": user_id,
                "balance": ManaLedger.STARTING_MANA,
                "total_earned": 0,
                "total_lost": 0,
                "quests_completed": 0
            }
            await users.insert_one(user)
            print(f"✓ Created new user '{user_id}' with {ManaLedger.STARTING_MANA} Mana")
        
        return user
    
    @staticmethod
    async def get_balance(user_id: str = "default") -> int:
        """Get current Mana balance"""
        user = await ManaLedger.get_or_create_user(user_id)
        return user["balance"]
    
    @staticmethod
    async def deduct_stake(user_id: str, stake: int) -> dict:
        """
        Deduct stake from user balance (called when accepting a wager)
        Returns updated user document
        """
        db = Database.get_db()
        users = db.users
        
        user = await ManaLedger.get_or_create_user(user_id)
        
        if user["balance"] < stake:
            raise ValueError(f"Insufficient Mana. Balance: {user['balance']}, Required: {stake}")
        
        result = await users.update_one(
            {"user_id": user_id},
            {"$inc": {"balance": -stake}}
        )
        
        updated_user = await users.find_one({"user_id": user_id})
        print(f"✓ Deducted {stake} Mana stake. New balance: {updated_user['balance']}")
        
        return updated_user
    
    @staticmethod
    async def award_bounty(user_id: str, bounty: int, stake: int) -> dict:
        """
        Award bounty to user (called when completing a task)
        Returns updated user document
        """
        db = Database.get_db()
        users = db.users
        
        total_win = bounty + stake  # Return stake + bounty
        
        result = await users.update_one(
            {"user_id": user_id},
            {
                "$inc": {
                    "balance": total_win,
                    "total_earned": bounty,
                    "quests_completed": 1
                }
            }
        )
        
        updated_user = await users.find_one({"user_id": user_id})
        print(f"✓ Awarded {bounty} Mana bounty + {stake} stake returned. New balance: {updated_user['balance']}")
        
        return updated_user
    
    @staticmethod
    async def lose_stake(user_id: str, stake: int) -> dict:
        """
        Record stake loss (stake was already deducted, just update stats)
        Returns updated user document
        """
        db = Database.get_db()
        users = db.users
        
        result = await users.update_one(
            {"user_id": user_id},
            {"$inc": {"total_lost": stake}}
        )
        
        updated_user = await users.find_one({"user_id": user_id})
        print(f"✓ Stake lost ({stake} Mana). Balance: {updated_user['balance']}")
        
        return updated_user
