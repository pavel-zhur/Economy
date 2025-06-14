from langchain_openai import ChatOpenAI
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_community.utilities import SQLDatabase
from langchain.agents import create_sql_agent
from langchain.agents.agent_types import AgentType
from langchain.memory import ConversationBufferMemory
from langfuse.callback import CallbackHandler
from typing import Dict, Any, Optional
import logging

from config import settings
from database import engine

logger = logging.getLogger(__name__)


class FinancialSQLAgent:
    """
    AI Agent specialized for financial database operations.
    Uses LangChain SQL Agent with custom prompts for financial planning.
    """
    
    def __init__(self):
        self.llm = self._init_llm()
        self.db = self._init_database()
        self.toolkit = self._init_toolkit()
        self.agent = self._init_agent()
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
    def _init_llm(self) -> ChatOpenAI:
        """Initialize the LLM with LangFuse tracing."""
        langfuse_handler = CallbackHandler(
            host=settings.langfuse_host,
            public_key=settings.langfuse_public_key,
            secret_key=settings.langfuse_secret_key
        )
        
        return ChatOpenAI(
            model=settings.openai_model,
            temperature=0.1,
            callbacks=[langfuse_handler],
            api_key=settings.openai_api_key
        )
    
    def _init_database(self) -> SQLDatabase:
        """Initialize SQL database connection for LangChain."""
        return SQLDatabase(engine=engine)
    
    def _init_toolkit(self) -> SQLDatabaseToolkit:
        """Initialize SQL toolkit with custom tools."""
        return SQLDatabaseToolkit(db=self.db, llm=self.llm)
    
    def _init_agent(self):
        """Initialize the SQL agent with financial planning context."""
        
        financial_prompt_prefix = """
        You are an AI assistant specialized in financial planning and database management.
        
        You are working with a financial planning system with the following main entities:
        
        PLANNING LAYER (Virtual):
        - plans: Financial plans (spending/accumulation/funds) with hierarchy support
        - planned_operations: Future income/expense operations (can be recurrent)  
        - goals: Financial goals with target amounts and dates
        - distribution_rules: Rules for automatic income distribution
        
        ACTUAL DATA LAYER:
        - wallets: Physical wallets/accounts
        - transactions: Real financial transactions linked to wallets and optionally to plans
        - wallet_inventories: Balance snapshots for reconciliation
        
        SYSTEM LAYER:
        - plan_balances: Calculated balances over time
        - system_logs: Operations log
        - assets: Non-monetary assets
        - debts: Loans given to others
        
        KEY PRINCIPLES:
        1. Plans represent "designations" of money - where money is allocated or intended to go
        2. Transactions represent actual money movements 
        3. The sum of plan balances should equal the sum of wallet balances (reconciliation)
        4. Plans can be hierarchical (parent-child relationships)
        5. Income distribution can be automated via distribution_rules
        
        When interpreting user requests:
        - For planning: work with plans, planned_operations, goals
        - For actual tracking: work with transactions, wallets, wallet_inventories  
        - For analysis: use plan_balances and create appropriate queries
        - Always consider both virtual (planned) and actual (factual) aspects
        
        Respond in the same language as the user's question.
        """
        
        return create_sql_agent(
            llm=self.llm,
            toolkit=self.toolkit,
            verbose=True,
            agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
            prefix=financial_prompt_prefix,
            memory=self.memory
        )
    
    async def process_message(self, message: str, user_context: Optional[Dict[str, Any]] = None) -> str:
        """
        Process user message and return AI response.
        
        Args:
            message: User's message/query
            user_context: Optional context about user preferences, current state, etc.
            
        Returns:
            AI agent's response
        """
        try:
            # Add context to the message if provided
            enhanced_message = message
            if user_context:
                context_str = self._format_context(user_context)
                enhanced_message = f"Context: {context_str}\n\nUser query: {message}"
            
            # Process through the agent
            response = await self.agent.arun(enhanced_message)
            
            logger.info(f"Processed message: {message[:100]}...")
            return response
            
        except Exception as e:
            error_msg = f"Error processing message: {str(e)}"
            logger.error(error_msg)
            return f"Извините, произошла ошибка при обработке вашего запроса: {error_msg}"
    
    def _format_context(self, context: Dict[str, Any]) -> str:
        """Format user context for the AI agent."""
        context_parts = []
        
        if context.get("current_date"):
            context_parts.append(f"Current date: {context['current_date']}")
        
        if context.get("user_preferences"):
            prefs = context["user_preferences"]
            context_parts.append(f"User preferences: {prefs}")
        
        if context.get("recent_transactions"):
            count = len(context["recent_transactions"])
            context_parts.append(f"User has {count} recent transactions")
        
        return "; ".join(context_parts)
    
    def reset_memory(self):
        """Reset conversation memory."""
        self.memory.clear()
        logger.info("Agent memory reset")
    
    def get_conversation_history(self) -> list:
        """Get current conversation history."""
        return self.memory.chat_memory.messages


class FinancialQueryProcessor:
    """
    Higher-level processor for financial queries.
    Handles query classification and routing to appropriate handlers.
    """
    
    def __init__(self):
        self.sql_agent = FinancialSQLAgent()
    
    async def process_query(self, query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Process a financial query and return structured response.
        
        Args:
            query: User's financial query
            context: Optional context information
            
        Returns:
            Structured response with answer, data, and metadata
        """
        try:
            # Classify query type
            query_type = self._classify_query(query)
            
            # Process through SQL agent
            response = await self.sql_agent.process_message(query, context)
            
            return {
                "answer": response,
                "query_type": query_type,
                "success": True,
                "metadata": {
                    "processing_time": None,  # TODO: add timing
                    "tokens_used": None,      # TODO: add token counting
                }
            }
            
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return {
                "answer": f"Произошла ошибка при обработке запроса: {str(e)}",
                "query_type": "error",
                "success": False,
                "error": str(e)
            }
    
    def _classify_query(self, query: str) -> str:
        """
        Classify the type of financial query.
        
        This is a simple implementation - could be enhanced with ML classification.
        """
        query_lower = query.lower()
        
        # Planning-related queries
        if any(word in query_lower for word in ["план", "планирую", "хочу накопить", "цель"]):
            return "planning"
        
        # Transaction-related queries  
        if any(word in query_lower for word in ["транзакция", "потратил", "получил", "доход", "расход"]):
            return "transaction"
        
        # Analysis-related queries
        if any(word in query_lower for word in ["анализ", "отчет", "статистика", "баланс", "сколько"]):
            return "analysis"
        
        # Schema/structure queries
        if any(word in query_lower for word in ["структура", "таблица", "схема", "модель"]):
            return "schema"
        
        return "general"