from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolExecutor, ToolInvocation
from typing import TypedDict, List, Dict, Any, Optional
from datetime import datetime
import json
import logging

from .sql_agent import FinancialQueryProcessor

logger = logging.getLogger(__name__)


class AgentState(TypedDict):
    """State shared between agents in the workflow."""
    user_message: str
    processed_response: str
    query_type: str
    execution_steps: List[Dict[str, Any]]
    error: Optional[str]
    metadata: Dict[str, Any]
    current_agent: str
    iteration_count: int


class FinancialOrchestrator:
    """
    LangGraph-based orchestrator for financial AI workflows.
    Manages complex multi-step financial operations and agent coordination.
    """
    
    def __init__(self):
        self.query_processor = FinancialQueryProcessor()
        self.graph = self._build_graph()
        
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow."""
        
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("message_classifier", self._classify_message)
        workflow.add_node("sql_agent", self._process_sql_query)
        workflow.add_node("planning_agent", self._process_planning_query)
        workflow.add_node("analysis_agent", self._process_analysis_query)
        workflow.add_node("schema_agent", self._process_schema_query)
        workflow.add_node("finalizer", self._finalize_response)
        
        # Define entry point
        workflow.set_entry_point("message_classifier")
        
        # Add conditional edges based on query type
        workflow.add_conditional_edges(
            "message_classifier",
            self._route_to_agent,
            {
                "sql": "sql_agent",
                "planning": "planning_agent", 
                "analysis": "analysis_agent",
                "schema": "schema_agent",
                "general": "sql_agent"  # Default to SQL agent
            }
        )
        
        # All specialized agents flow to finalizer
        for agent in ["sql_agent", "planning_agent", "analysis_agent", "schema_agent"]:
            workflow.add_edge(agent, "finalizer")
        
        # Finalizer ends the workflow
        workflow.add_edge("finalizer", END)
        
        return workflow.compile()
    
    def _classify_message(self, state: AgentState) -> AgentState:
        """Classify the user message to determine routing."""
        message = state["user_message"]
        
        # Enhanced classification logic
        message_lower = message.lower()
        
        # Schema/structure queries
        if any(word in message_lower for word in [
            "структура", "таблица", "схема", "модель", "создай таблицу", "добавь поле"
        ]):
            query_type = "schema"
        
        # Planning-specific queries
        elif any(word in message_lower for word in [
            "план", "планирую", "хочу накопить", "цель", "бюджет", "распределение"
        ]):
            query_type = "planning"
        
        # Analysis-specific queries  
        elif any(word in message_lower for word in [
            "анализ", "отчет", "статистика", "график", "тренд", "сравни"
        ]):
            query_type = "analysis"
        
        # Default to general SQL processing
        else:
            query_type = "sql"
        
        state["query_type"] = query_type
        state["current_agent"] = "classifier"
        state["execution_steps"].append({
            "agent": "classifier",
            "action": "classify_message",
            "result": f"Classified as: {query_type}",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        logger.info(f"Message classified as: {query_type}")
        return state
    
    def _route_to_agent(self, state: AgentState) -> str:
        """Route to appropriate agent based on classification."""
        query_type = state["query_type"]
        
        # Map query types to agent routes
        routing_map = {
            "schema": "schema",
            "planning": "planning", 
            "analysis": "analysis",
            "sql": "sql",
            "general": "sql"
        }
        
        return routing_map.get(query_type, "sql")
    
    async def _process_sql_query(self, state: AgentState) -> AgentState:
        """Process query through SQL agent."""
        try:
            response = await self.query_processor.process_query(
                state["user_message"],
                context=state.get("metadata", {})
            )
            
            state["processed_response"] = response["answer"]
            state["current_agent"] = "sql_agent"
            state["execution_steps"].append({
                "agent": "sql_agent",
                "action": "process_query",
                "result": "Query processed successfully",
                "timestamp": datetime.utcnow().isoformat()
            })
            
        except Exception as e:
            error_msg = f"SQL Agent error: {str(e)}"
            state["error"] = error_msg
            state["processed_response"] = f"Произошла ошибка: {error_msg}"
            logger.error(error_msg)
        
        return state
    
    async def _process_planning_query(self, state: AgentState) -> AgentState:
        """Process planning-specific queries."""
        try:
            # Enhanced context for planning queries
            planning_context = {
                "focus": "planning",
                "suggest_actions": True,
                "include_future_projections": True
            }
            
            enhanced_message = f"""
            Planning Context: This is a financial planning query. Focus on plans, goals, and future projections.
            
            User Query: {state['user_message']}
            
            Please provide planning-focused insights and actionable recommendations.
            """
            
            response = await self.query_processor.process_query(
                enhanced_message,
                context=planning_context
            )
            
            state["processed_response"] = response["answer"]
            state["current_agent"] = "planning_agent"
            state["execution_steps"].append({
                "agent": "planning_agent", 
                "action": "process_planning_query",
                "result": "Planning query processed",
                "timestamp": datetime.utcnow().isoformat()
            })
            
        except Exception as e:
            error_msg = f"Planning Agent error: {str(e)}"
            state["error"] = error_msg
            state["processed_response"] = f"Ошибка в планировании: {error_msg}"
            logger.error(error_msg)
        
        return state
    
    async def _process_analysis_query(self, state: AgentState) -> AgentState:
        """Process analysis-specific queries."""
        try:
            analysis_context = {
                "focus": "analysis",
                "include_charts": True,
                "provide_insights": True,
                "suggest_improvements": True
            }
            
            enhanced_message = f"""
            Analysis Context: This is a financial analysis query. Focus on data insights, trends, and recommendations.
            
            User Query: {state['user_message']}
            
            Please provide detailed analysis with actionable insights and visualizable data where appropriate.
            """
            
            response = await self.query_processor.process_query(
                enhanced_message,
                context=analysis_context  
            )
            
            state["processed_response"] = response["answer"]
            state["current_agent"] = "analysis_agent"
            state["execution_steps"].append({
                "agent": "analysis_agent",
                "action": "process_analysis_query", 
                "result": "Analysis query processed",
                "timestamp": datetime.utcnow().isoformat()
            })
            
        except Exception as e:
            error_msg = f"Analysis Agent error: {str(e)}"
            state["error"] = error_msg
            state["processed_response"] = f"Ошибка анализа: {error_msg}"
            logger.error(error_msg)
        
        return state
    
    async def _process_schema_query(self, state: AgentState) -> AgentState:
        """Process schema modification queries."""
        try:
            schema_context = {
                "focus": "schema",
                "allow_modifications": True,
                "require_confirmation": True,
                "backup_before_changes": True
            }
            
            enhanced_message = f"""
            Schema Context: This is a database schema modification query. 
            Be careful with structural changes and always explain what will be modified.
            
            User Query: {state['user_message']}
            
            If this involves schema changes, explain the impact and ask for confirmation.
            """
            
            response = await self.query_processor.process_query(
                enhanced_message,
                context=schema_context
            )
            
            state["processed_response"] = response["answer"]
            state["current_agent"] = "schema_agent"
            state["execution_steps"].append({
                "agent": "schema_agent",
                "action": "process_schema_query",
                "result": "Schema query processed", 
                "timestamp": datetime.utcnow().isoformat()
            })
            
        except Exception as e:
            error_msg = f"Schema Agent error: {str(e)}"
            state["error"] = error_msg
            state["processed_response"] = f"Ошибка схемы: {error_msg}"
            logger.error(error_msg)
        
        return state
    
    def _finalize_response(self, state: AgentState) -> AgentState:
        """Finalize the response and add metadata."""
        state["iteration_count"] = state.get("iteration_count", 0) + 1
        
        # Add execution summary to metadata
        state["metadata"]["execution_summary"] = {
            "total_steps": len(state["execution_steps"]),
            "final_agent": state["current_agent"],
            "success": state.get("error") is None,
            "processing_time": datetime.utcnow().isoformat()
        }
        
        state["execution_steps"].append({
            "agent": "finalizer",
            "action": "finalize_response",
            "result": "Response finalized",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        logger.info(f"Workflow completed successfully. Agent: {state['current_agent']}")
        return state
    
    async def process_message(self, message: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Process a user message through the multi-agent workflow.
        
        Args:
            message: User's message
            context: Optional context information
            
        Returns:
            Structured response with answer and execution details
        """
        # Initialize state
        initial_state = AgentState(
            user_message=message,
            processed_response="",
            query_type="",
            execution_steps=[],
            error=None,
            metadata=context or {},
            current_agent="",
            iteration_count=0
        )
        
        try:
            # Execute the workflow
            final_state = await self.graph.ainvoke(initial_state)
            
            return {
                "answer": final_state["processed_response"],
                "query_type": final_state["query_type"],
                "success": final_state.get("error") is None,
                "execution_steps": final_state["execution_steps"],
                "metadata": final_state["metadata"],
                "error": final_state.get("error")
            }
            
        except Exception as e:
            error_msg = f"Workflow execution error: {str(e)}"
            logger.error(error_msg)
            return {
                "answer": f"Произошла ошибка при выполнении запроса: {error_msg}",
                "query_type": "error",
                "success": False,
                "error": error_msg,
                "execution_steps": [],
                "metadata": {}
            }