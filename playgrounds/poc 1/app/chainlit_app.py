import chainlit as cl
import asyncio
import logging
from datetime import datetime
from typing import Dict, Any, Optional

from ai_agents.graph_orchestrator import FinancialOrchestrator
from database import DatabaseManager
from config import settings

# Setup logging
logging.basicConfig(level=getattr(logging, settings.log_level))
logger = logging.getLogger(__name__)

# Global orchestrator instance
orchestrator = None


@cl.on_chat_start
async def start():
    """Initialize the chat session."""
    global orchestrator
    
    try:
        # Initialize orchestrator if not already done
        if orchestrator is None:
            orchestrator = FinancialOrchestrator()
        
        # Send welcome message
        welcome_message = """
        # 🏦 AI Financial Planning System
        
        Добро пожаловать в систему AI-управляемого финансового планирования!
        
        ## Что я умею:
        
        ### 📊 **Планирование**
        - Создавать и управлять финансовыми планами
        - Ставить цели накоплений
        - Настраивать автоматическое распределение доходов
        
        ### 💰 **Учет транзакций**
        - Записывать доходы и расходы
        - Связывать транзакции с планами
        - Управлять кошельками и счетами
        
        ### 📈 **Анализ**
        - Строить отчеты и аналитику
        - Показывать прогресс по целям
        - Анализировать финансовые тренды
        
        ### 🔧 **Управление данными**
        - Изменять структуру базы данных
        - Создавать новые таблицы и поля
        - Выполнять миграции данных
        
        ## Примеры запросов:
        
        - "Покажи мою текущую финансовую ситуацию"
        - "Создай план накоплений на отпуск на 5000 долларов"
        - "Добавь транзакцию: потратил 50 долларов на продукты"
        - "Какой у меня прогресс по целям?"
        - "Создай отчет по расходам за последний месяц"
        
        Задавайте любые вопросы или просто опишите, что хотите сделать!
        """
        
        await cl.Message(content=welcome_message).send()
        
        # Initialize database if needed
        try:
            DatabaseManager.init_database()
            await cl.Message(
                content="✅ База данных готова к работе!",
                elements=[]
            ).send()
        except Exception as e:
            await cl.Message(
                content=f"⚠️ Предупреждение при инициализации БД: {str(e)}",
                elements=[]
            ).send()
        
        logger.info("Chat session started successfully")
        
    except Exception as e:
        error_msg = f"Ошибка при запуске: {str(e)}"
        logger.error(error_msg)
        await cl.Message(content=f"❌ {error_msg}").send()


@cl.on_message
async def main(message: cl.Message):
    """Handle incoming messages."""
    global orchestrator
    
    try:
        # Show typing indicator
        async with cl.Step(name="processing", type="tool") as step:
            step.output = "Обрабатываю ваш запрос..."
            
            # Get user context
            user_context = _get_user_context()
            
            # Process message through orchestrator
            response = await orchestrator.process_message(
                message.content,
                context=user_context
            )
            
            # Format and send response
            await _send_response(response)
            
    except Exception as e:
        error_msg = f"Ошибка при обработке сообщения: {str(e)}"
        logger.error(error_msg)
        await cl.Message(content=f"❌ {error_msg}").send()


def _get_user_context() -> Dict[str, Any]:
    """Get current user context for the AI agent."""
    return {
        "current_date": datetime.now().isoformat(),
        "user_id": cl.user_session.get("user_id", "default_user"),
        "session_id": cl.user_session.get("id", "unknown"),
        "language": "ru"  # Russian language preference
    }


async def _send_response(response: Dict[str, Any]):
    """Format and send AI response to the user."""
    
    # Main response message
    answer = response.get("answer", "Нет ответа")
    
    # Create elements for additional information
    elements = []
    
    # Add execution details if available
    if response.get("execution_steps"):
        execution_details = _format_execution_steps(response["execution_steps"])
        elements.append(
            cl.Text(
                name="execution_details",
                content=execution_details,
                display="side"
            )
        )
    
    # Add metadata if available
    if response.get("metadata"):
        metadata_text = _format_metadata(response["metadata"])
        elements.append(
            cl.Text(
                name="metadata",
                content=metadata_text,
                display="side"
            )
        )
    
    # Determine message type based on success
    if response.get("success", True):
        # Success message
        await cl.Message(
            content=answer,
            elements=elements
        ).send()
    else:
        # Error message
        error_msg = response.get("error", "Неизвестная ошибка")
        await cl.Message(
            content=f"❌ {answer}\n\nДетали ошибки: {error_msg}",
            elements=elements
        ).send()


def _format_execution_steps(steps: list) -> str:
    """Format execution steps for display."""
    if not steps:
        return "Нет данных о выполнении"
    
    formatted_steps = ["## 🔍 Детали выполнения\n"]
    
    for i, step in enumerate(steps, 1):
        agent = step.get("agent", "unknown")
        action = step.get("action", "unknown")
        result = step.get("result", "no result")
        timestamp = step.get("timestamp", "")
        
        formatted_steps.append(
            f"**{i}. {agent}**\n"
            f"   - Действие: {action}\n"
            f"   - Результат: {result}\n"
            f"   - Время: {timestamp}\n"
        )
    
    return "\n".join(formatted_steps)


def _format_metadata(metadata: Dict[str, Any]) -> str:
    """Format metadata for display."""
    if not metadata:
        return "Нет метаданных"
    
    formatted_metadata = ["## 📊 Метаданные\n"]
    
    for key, value in metadata.items():
        if isinstance(value, dict):
            formatted_metadata.append(f"**{key}:**")
            for sub_key, sub_value in value.items():
                formatted_metadata.append(f"   - {sub_key}: {sub_value}")
        else:
            formatted_metadata.append(f"**{key}:** {value}")
    
    return "\n".join(formatted_metadata)


@cl.on_settings_update
async def setup_agent(settings_dict):
    """Handle settings updates."""
    logger.info(f"Settings updated: {settings_dict}")


@cl.password_auth_callback
def auth_callback(username: str, password: str) -> Optional[cl.User]:
    """Simple authentication callback."""
    # For POC, accept any username/password
    # In production, implement proper authentication
    return cl.User(identifier=username, metadata={"role": "user"})


@cl.on_chat_end
async def end():
    """Handle chat session end."""
    logger.info("Chat session ended")


# Add action buttons for common operations
@cl.action_callback("reset_database")
async def reset_database():
    """Reset database action."""
    try:
        DatabaseManager.reset_database()
        await cl.Message(content="✅ База данных сброшена и реинициализирована!").send()
    except Exception as e:
        await cl.Message(content=f"❌ Ошибка при сбросе БД: {str(e)}").send()


@cl.action_callback("show_schema")
async def show_schema():
    """Show database schema action."""
    global orchestrator
    try:
        response = await orchestrator.process_message(
            "Покажи структуру всех таблиц в базе данных"
        )
        await _send_response(response)
    except Exception as e:
        await cl.Message(content=f"❌ Ошибка при показе схемы: {str(e)}").send()


# Configure Chainlit
if __name__ == "__main__":
    # Add action buttons to the chat interface
    cl.actions = [
        cl.Action(name="reset_database", value="reset", description="🔄 Сбросить БД"),
        cl.Action(name="show_schema", value="schema", description="🏗️ Показать схему"),
    ]