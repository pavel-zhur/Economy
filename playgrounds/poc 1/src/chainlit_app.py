"""Chainlit chat interface for the Economy POC AI Financial Assistant."""

import asyncio
import json
from typing import Dict, Any, Optional

import chainlit as cl
import structlog

from .agents import AgentCoordinator
from .config import get_settings
from .database import init_db


logger = structlog.get_logger()


class FinancialAssistant:
    """Financial assistant using AI agents."""
    
    def __init__(self):
        self.coordinator: Optional[AgentCoordinator] = None
        self.settings = get_settings()
        
    async def initialize(self):
        """Initialize the assistant."""
        try:
            await init_db()
            self.coordinator = AgentCoordinator()
            logger.info("Financial assistant initialized")
        except Exception as e:
            logger.error("Failed to initialize assistant", error=str(e))
            raise
    
    async def process_message(self, message: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process a user message."""
        if not self.coordinator:
            await self.initialize()
        
        return await self.coordinator.process_request(
            user_request=message,
            context=context or {},
            dry_run=False
        )


# Global assistant instance
assistant = FinancialAssistant()


@cl.on_chat_start
async def start():
    """Initialize the chat session."""
    
    await cl.Message(
        content="""
# 🏦 Economy POC - AI Financial Assistant

Welcome to your AI-powered financial management system! I can help you with:

- 📊 **Financial Data Management**: Store and organize your financial information
- 🗃️ **Dynamic Database**: I'll create and modify database schemas as needed
- 📈 **Financial Analysis**: Analyze your spending patterns and financial health
- 🎯 **Goal Planning**: Set and track financial goals
- 💰 **Budget Management**: Create and manage budgets
- 📋 **Transaction Tracking**: Record and categorize transactions

## Getting Started

You can ask me things like:
- "I want to track my monthly expenses"
- "Create a budget for my vacation fund"
- "Show me my spending patterns for last month"
- "I need to save $5000 for a car by next year"

## Features

- **Natural Language**: Just tell me what you want in plain English
- **Smart Schema**: I'll automatically create database structures as needed
- **Real-time Analysis**: Get instant insights into your financial data
- **Goal Tracking**: Monitor progress toward your financial objectives

What would you like to do first?
        """,
        author="Assistant"
    ).send()
    
    # Initialize the assistant
    try:
        await assistant.initialize()
        await cl.Message(
            content="✅ System initialized successfully! I'm ready to help you manage your finances.",
            author="System"
        ).send()
    except Exception as e:
        await cl.Message(
            content=f"❌ System initialization failed: {str(e)}",
            author="System"
        ).send()


@cl.on_message
async def main(message: cl.Message):
    """Handle incoming messages."""
    
    user_message = message.content.strip()
    
    if not user_message:
        await cl.Message(
            content="Please provide a message for me to process.",
            author="Assistant"
        ).send()
        return
    
    # Show thinking indicator
    thinking_msg = cl.Message(
        content="🤔 Analyzing your request...",
        author="Assistant"
    )
    await thinking_msg.send()
    
    try:
        # Process the message through the AI agents
        result = await assistant.process_message(user_message)
        
        # Update thinking message
        thinking_msg.content = "🧠 Processing with AI agents..."
        await thinking_msg.update()
        
        if result.get("success"):
            # Generate response content
            response_content = result.get("response", "Request processed successfully.")
            
            # Add technical details if available
            technical_details = []
            
            if result.get("schema_analysis"):
                schema_info = result["schema_analysis"]
                if schema_info.get("changes_needed"):
                    technical_details.append("🔧 **Schema Changes**: Applied database modifications")
                else:
                    technical_details.append("📋 **Schema**: No changes needed")
            
            if result.get("database_result"):
                db_result = result["database_result"]
                if db_result.get("success"):
                    technical_details.append("✅ **Database**: Operation completed successfully")
                else:
                    technical_details.append("❌ **Database**: Operation failed")
            
            if result.get("steps_executed"):
                steps = result["steps_executed"]
                technical_details.append(f"📝 **Steps**: {len(steps)} operations executed")
            
            # Combine response with technical details
            full_response = response_content
            if technical_details:
                full_response += "\n\n---\n**Technical Details:**\n" + "\n".join(technical_details)
            
            # Remove the thinking message
            thinking_msg.content = full_response
            thinking_msg.author = "Assistant"
            await thinking_msg.update()
            
        else:
            # Handle error
            error_message = result.get("error", "Unknown error occurred")
            thinking_msg.content = f"❌ **Error**: {error_message}\n\nPlease try rephrasing your request or contact support if this issue persists."
            thinking_msg.author = "Assistant"
            await thinking_msg.update()
    
    except Exception as e:
        logger.error("Message processing failed", error=str(e))
        thinking_msg.content = f"❌ **System Error**: {str(e)}\n\nI apologize for the inconvenience. Please try again or contact support."
        thinking_msg.author = "Assistant"
        await thinking_msg.update()


@cl.on_settings_update
async def setup_agent(settings):
    """Handle settings updates."""
    await cl.Message(
        content="Settings updated. The configuration will take effect on the next message.",
        author="System"
    ).send()


# Define chat settings
@cl.set_chat_profiles
async def chat_profile():
    return [
        cl.ChatProfile(
            name="financial_assistant",
            markdown_description="AI Financial Assistant - Full featured financial management",
            icon="💰",
        ),
        cl.ChatProfile(
            name="query_mode",
            markdown_description="Query Mode - Direct database queries and analysis",
            icon="🔍",
        ),
        cl.ChatProfile(
            name="planning_mode", 
            markdown_description="Planning Mode - Focus on budgets and financial planning",
            icon="📋",
        ),
    ]


@cl.oauth_callback
def on_oauth_callback(
    provider_id: str,
    token: str,
    raw_user_data: Dict[str, Any],
    default_user: cl.User,
) -> Optional[cl.User]:
    """Handle OAuth callback (placeholder)."""
    return default_user


if __name__ == "__main__":
    # Configuration for running Chainlit
    import os
    os.environ["CHAINLIT_HOST"] = "0.0.0.0"
    os.environ["CHAINLIT_PORT"] = "8001"
    
    # Run the Chainlit app
    cl.run()