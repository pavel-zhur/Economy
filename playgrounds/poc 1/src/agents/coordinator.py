"""Agent Coordinator using LangGraph for orchestrating multi-agent workflows."""

import asyncio
import json
from typing import Dict, List, Any, Optional, TypedDict, Annotated
from datetime import datetime
import structlog

from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI

from .database_agent import DatabaseAgent
from .schema_agent import SchemaAgent
from ..config import get_settings


logger = structlog.get_logger()


class AgentState(TypedDict):
    """State for the agent coordination workflow."""
    user_request: str
    messages: List[Any]
    current_step: str
    context: Dict[str, Any]
    schema_analysis: Optional[Dict[str, Any]]
    database_result: Optional[Dict[str, Any]]
    final_response: Optional[str]
    error: Optional[str]
    needs_schema_change: bool
    dry_run: bool


class AgentCoordinator:
    """LangGraph-based coordinator for orchestrating AI agents."""
    
    def __init__(self):
        self.settings = get_settings()
        self.logger = logger.bind(component="coordinator")
        
        # Initialize agents
        self.database_agent = DatabaseAgent()
        self.schema_agent = SchemaAgent()
        
        # Initialize LLM for coordination
        self.llm = ChatOpenAI(
            model=self.settings.openai_model,
            temperature=0.1,
            openai_api_key=self.settings.openai_api_key,
        )
        
        # Build the workflow graph
        self.workflow = self._build_workflow()
        
    def _build_workflow(self) -> StateGraph:
        """Build the LangGraph workflow for agent coordination."""
        
        # Create the graph
        graph = StateGraph(AgentState)
        
        # Add nodes
        graph.add_node("analyze_request", self._analyze_request)
        graph.add_node("check_schema", self._check_schema)
        graph.add_node("apply_schema_changes", self._apply_schema_changes)
        graph.add_node("execute_database_operation", self._execute_database_operation)
        graph.add_node("generate_response", self._generate_response)
        graph.add_node("handle_error", self._handle_error)
        
        # Set the entry point
        graph.set_entry_point("analyze_request")
        
        # Add conditional edges
        graph.add_conditional_edges(
            "analyze_request",
            self._should_check_schema,
            {
                "check_schema": "check_schema",
                "execute_db": "execute_database_operation",
                "error": "handle_error"
            }
        )
        
        graph.add_conditional_edges(
            "check_schema",
            self._should_apply_schema_changes,
            {
                "apply_changes": "apply_schema_changes",
                "execute_db": "execute_database_operation",
                "error": "handle_error"
            }
        )
        
        graph.add_conditional_edges(
            "apply_schema_changes",
            self._schema_changes_applied,
            {
                "execute_db": "execute_database_operation",
                "error": "handle_error"
            }
        )
        
        graph.add_edge("execute_database_operation", "generate_response")
        graph.add_edge("generate_response", END)
        graph.add_edge("handle_error", END)
        
        return graph.compile()
    
    async def process_request(
        self,
        user_request: str,
        context: Optional[Dict[str, Any]] = None,
        dry_run: bool = False
    ) -> Dict[str, Any]:
        """Process a user request through the agent workflow."""
        
        self.logger.info("Processing user request", request=user_request, dry_run=dry_run)
        
        # Initialize state
        initial_state: AgentState = {
            "user_request": user_request,
            "messages": [HumanMessage(content=user_request)],
            "current_step": "start",
            "context": context or {},
            "schema_analysis": None,
            "database_result": None,
            "final_response": None,
            "error": None,
            "needs_schema_change": False,
            "dry_run": dry_run
        }
        
        try:
            # Run the workflow
            result = await self.workflow.ainvoke(initial_state)
            
            # Extract the final result
            if result.get("error"):
                return {
                    "success": False,
                    "error": result["error"],
                    "timestamp": datetime.utcnow().isoformat()
                }
            
            return {
                "success": True,
                "response": result.get("final_response", "Request processed successfully"),
                "schema_analysis": result.get("schema_analysis"),
                "database_result": result.get("database_result"),
                "steps_executed": self._extract_steps_from_messages(result.get("messages", [])),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            error_msg = str(e)
            self.logger.error("Workflow execution failed", error=error_msg)
            
            return {
                "success": False,
                "error": error_msg,
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def _analyze_request(self, state: AgentState) -> AgentState:
        """Analyze the user request to determine next steps."""
        
        self.logger.info("Analyzing user request", step="analyze_request")
        
        try:
            analysis_prompt = f"""
            Analyze this user request for a personal finance management system:
            
            Request: {state['user_request']}
            Context: {json.dumps(state['context'], indent=2)}
            
            Determine:
            1. Does this request require database schema changes?
            2. What type of operation is needed (query, insert, update, analysis)?
            3. What domain concepts are involved (transactions, plans, goals, etc.)?
            
            Respond with JSON:
            {{
                "needs_schema_change": true/false,
                "operation_type": "query|insert|update|analysis|schema",
                "domain_concepts": ["concept1", "concept2"],
                "complexity": "simple|medium|complex",
                "reasoning": "explanation of the analysis"
            }}
            """
            
            messages = [
                SystemMessage(content="You are a financial system analyst."),
                HumanMessage(content=analysis_prompt)
            ]
            
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.llm.invoke(messages)
            )
            
            # Parse the analysis
            try:
                analysis = json.loads(response.content)
                state["needs_schema_change"] = analysis.get("needs_schema_change", False)
                state["context"]["analysis"] = analysis
                state["current_step"] = "analyze_request_complete"
                
            except json.JSONDecodeError:
                # Fallback analysis
                request_lower = state["user_request"].lower()
                state["needs_schema_change"] = any(keyword in request_lower for keyword in [
                    "create table", "add column", "new field", "track", "store", "record"
                ])
                state["context"]["analysis"] = {"reasoning": "Fallback analysis used"}
            
            state["messages"].append(AIMessage(content=f"Analysis completed: {state['context']['analysis']}"))
            
        except Exception as e:
            state["error"] = f"Request analysis failed: {str(e)}"
            self.logger.error("Request analysis failed", error=str(e))
        
        return state
    
    async def _check_schema(self, state: AgentState) -> AgentState:
        """Check if schema changes are needed."""
        
        self.logger.info("Checking schema requirements", step="check_schema")
        
        try:
            schema_analysis = await self.schema_agent.analyze_schema_needs(
                user_request=state["user_request"],
                context=state["context"]
            )
            
            state["schema_analysis"] = schema_analysis
            state["current_step"] = "schema_check_complete"
            
            if schema_analysis.get("success") and schema_analysis.get("changes_needed"):
                state["needs_schema_change"] = True
            else:
                state["needs_schema_change"] = False
            
            state["messages"].append(AIMessage(
                content=f"Schema analysis: {schema_analysis.get('analysis', 'No changes needed')}"
            ))
            
        except Exception as e:
            state["error"] = f"Schema analysis failed: {str(e)}"
            self.logger.error("Schema check failed", error=str(e))
        
        return state
    
    async def _apply_schema_changes(self, state: AgentState) -> AgentState:
        """Apply schema changes if needed."""
        
        self.logger.info("Applying schema changes", step="apply_schema_changes")
        
        try:
            if not state["schema_analysis"]:
                state["error"] = "No schema analysis available for applying changes"
                return state
            
            result = await self.schema_agent.apply_schema_changes(
                schema_analysis=state["schema_analysis"],
                user_request=state["user_request"],
                dry_run=state["dry_run"]
            )
            
            state["context"]["schema_changes_result"] = result
            state["current_step"] = "schema_changes_applied"
            
            if not result.get("success"):
                state["error"] = f"Schema changes failed: {result.get('error')}"
            
            state["messages"].append(AIMessage(
                content=f"Schema changes result: {result.get('message', 'Changes applied')}"
            ))
            
        except Exception as e:
            state["error"] = f"Schema changes application failed: {str(e)}"
            self.logger.error("Schema changes failed", error=str(e))
        
        return state
    
    async def _execute_database_operation(self, state: AgentState) -> AgentState:
        """Execute the database operation."""
        
        self.logger.info("Executing database operation", step="execute_database_operation")
        
        try:
            result = await self.database_agent.execute_query(
                user_request=state["user_request"],
                context=state["context"]
            )
            
            state["database_result"] = result
            state["current_step"] = "database_operation_complete"
            
            if not result.get("success"):
                state["error"] = f"Database operation failed: {result.get('error')}"
            
            state["messages"].append(AIMessage(
                content=f"Database operation result: {result.get('result', 'Operation completed')}"
            ))
            
        except Exception as e:
            state["error"] = f"Database operation failed: {str(e)}"
            self.logger.error("Database operation failed", error=str(e))
        
        return state
    
    async def _generate_response(self, state: AgentState) -> AgentState:
        """Generate the final response to the user."""
        
        self.logger.info("Generating final response", step="generate_response")
        
        try:
            response_prompt = f"""
            Generate a user-friendly response based on the following workflow execution:
            
            Original Request: {state['user_request']}
            
            Schema Analysis: {json.dumps(state.get('schema_analysis', {}), indent=2)}
            Database Result: {json.dumps(state.get('database_result', {}), indent=2)}
            Context: {json.dumps(state['context'], indent=2)}
            
            Provide a clear, helpful response that:
            1. Confirms what was accomplished
            2. Shows any relevant data or results
            3. Explains any schema changes that were made
            4. Suggests next steps if appropriate
            
            Keep the response conversational and focused on the user's original intent.
            """
            
            messages = [
                SystemMessage(content="You are a helpful financial assistant."),
                HumanMessage(content=response_prompt)
            ]
            
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.llm.invoke(messages)
            )
            
            state["final_response"] = response.content
            state["current_step"] = "complete"
            
        except Exception as e:
            state["error"] = f"Response generation failed: {str(e)}"
            self.logger.error("Response generation failed", error=str(e))
        
        return state
    
    async def _handle_error(self, state: AgentState) -> AgentState:
        """Handle errors in the workflow."""
        
        self.logger.error("Handling workflow error", error=state.get("error"))
        
        state["final_response"] = f"""
        I apologize, but I encountered an error while processing your request: {state.get('error')}
        
        Here's what I was trying to do:
        - Current step: {state.get('current_step', 'unknown')}
        - Request: {state['user_request']}
        
        Please try rephrasing your request or contact support if the issue persists.
        """
        
        return state
    
    def _should_check_schema(self, state: AgentState) -> str:
        """Determine if schema checking is needed."""
        if state.get("error"):
            return "error"
        elif state.get("needs_schema_change"):
            return "check_schema"
        else:
            return "execute_db"
    
    def _should_apply_schema_changes(self, state: AgentState) -> str:
        """Determine if schema changes should be applied."""
        if state.get("error"):
            return "error"
        elif state.get("schema_analysis", {}).get("changes_needed"):
            return "apply_changes"
        else:
            return "execute_db"
    
    def _schema_changes_applied(self, state: AgentState) -> str:
        """Check if schema changes were applied successfully."""
        if state.get("error"):
            return "error"
        else:
            return "execute_db"
    
    def _extract_steps_from_messages(self, messages: List[Any]) -> List[str]:
        """Extract execution steps from messages."""
        steps = []
        for message in messages:
            if hasattr(message, 'content') and isinstance(message.content, str):
                steps.append(message.content)
        return steps
    
    async def get_workflow_status(self) -> Dict[str, Any]:
        """Get the current status of the workflow system."""
        
        try:
            db_metrics = await self.database_agent.get_metrics()
            schema_history = await self.schema_agent.get_schema_change_history(limit=10)
            
            return {
                "status": "operational",
                "database_agent": db_metrics,
                "schema_agent": {
                    "recent_changes": len(schema_history.get("changes", [])),
                    "last_change": schema_history.get("changes", [{}])[0].get("created_at") if schema_history.get("changes") else None
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }