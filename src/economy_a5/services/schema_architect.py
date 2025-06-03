"""Schema architect service implementation."""

import json
from typing import Any, Optional

from openai import OpenAI

from ..config.settings import OpenAIConfig
from ..models.core import (
    Message,
    Schema,
    Cookbook,
    SchemaSystem,
    SchemaProposal,
    Interpretation,
)


class SchemaArchitectService:
    """AI-powered schema architect service."""
    
    def __init__(self, openai_config: OpenAIConfig, architect_instructions: str) -> None:
        self._client = OpenAI(api_key=openai_config.api_key)
        self._model = openai_config.model
        self._temperature = openai_config.temperature
        self._max_tokens = openai_config.max_tokens
        self._instructions = architect_instructions
        self._conversation_history: list[dict[str, str]] = []
        self._current_proposal: Optional[SchemaProposal] = None
        self._schema_context: str = ""
        self._base_version: str = "1.0"
        self._proposal_counter: int = 0
    
    def start_migration_session(
        self,
        current_schema_system: SchemaSystem,
        sample_messages: list[Message],
        current_interpretations: list[Interpretation],
        user_message: str,
    ) -> str:
        """Start a migration session and return initial response."""
        
        self._conversation_history = []
        self._current_proposal = None
        self._base_version = current_schema_system.schema.version
        self._proposal_counter = 0
        
        sample_messages_text = "\n".join([
            f"{msg.message_id}: {msg.content}" 
            for msg in sample_messages[:10]  # Limit to first 10 for context
        ])
        
        sample_interpretations_text = "\n".join([
            f"{interp.message_id}: {json.dumps(interp.structured_data)}"
            for interp in current_interpretations[:10]  # Limit to first 10
        ])
        
        # Store schema context for all conversation turns
        self._schema_context = f"""
CURRENT SCHEMA:
{json.dumps(current_schema_system.schema.schema_json, indent=2)}

CURRENT COOKBOOK:
{current_schema_system.cookbook.content}

SAMPLE MESSAGES:
{sample_messages_text}

SAMPLE CURRENT INTERPRETATIONS:
{sample_interpretations_text}
"""
        
        # Build system prompt with schema context
        system_prompt = f"{self._instructions}\n\n{self._schema_context}"
        
        response = self._call_openai_conversation_with_tools([
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ])
        
        self._conversation_history.append({"role": "assistant", "content": response})
        
        return response
    
    def continue_conversation(self, user_input: str) -> str:
        """Continue the migration conversation."""
        
        self._conversation_history.append({"role": "user", "content": user_input})
        
        # Build full conversation context with schema information
        system_prompt = f"{self._instructions}\n\n{self._schema_context}"
        messages = [{"role": "system", "content": system_prompt}] + self._conversation_history
        
        response = self._call_openai_conversation_with_tools(messages)
        self._conversation_history.append({"role": "assistant", "content": response})
        
        return response
    
    def get_current_proposal(self) -> Optional[SchemaProposal]:
        """Get the current schema proposal, if any."""
        return self._current_proposal
    
    def reset_session(self) -> None:
        """Reset the current migration session."""
        self._conversation_history = []
        self._current_proposal = None
        self._schema_context = ""
        self._proposal_counter = 0
    
    
    def _call_openai_conversation_with_tools(self, messages: list[dict[str, str]]) -> str:
        """Call OpenAI API with conversation messages and function tools."""
        
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "propose_schema",
                    "description": "Submit a concrete schema proposal with both JSON schema object and cookbook content. BOTH parameters are required.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "schema_json": {
                                "type": "object",
                                "description": "The complete JSON schema definition as an object (not string). Must include 'type', 'properties', etc."
                            },
                            "cookbook_content": {
                                "type": "string",
                                "description": "The interpretation cookbook content in markdown format with examples"
                            }
                        },
                        "required": ["schema_json", "cookbook_content"]
                    }
                }
            }
        ]
        
        response = self._client.chat.completions.create(
            model=self._model,
            messages=messages,
            tools=tools,
            temperature=self._temperature,
            max_tokens=self._max_tokens,
        )
        
        if not response.choices:
            raise RuntimeError("No response from OpenAI")
        
        choice = response.choices[0]
        
        # Handle function calls
        if choice.message.tool_calls:
            for tool_call in choice.message.tool_calls:
                if tool_call.function.name == "propose_schema":
                    try:
                        args = json.loads(tool_call.function.arguments)
                        if "schema_json" not in args:
                            result = "Error: Missing 'schema_json' parameter. You must provide both schema_json (the JSON schema object) and cookbook_content (markdown text) in the same function call."
                        elif "cookbook_content" not in args:
                            result = "Error: Missing 'cookbook_content' parameter. You must provide both schema_json (the JSON schema object) and cookbook_content (markdown text) in the same function call."
                        else:
                            result = self._handle_propose_schema(args["schema_json"], args["cookbook_content"])
                    except json.JSONDecodeError as e:
                        result = f"JSON parsing error: {e}. Please ensure function arguments are valid JSON."
                    
                    # Add function call and result to conversation history
                    self._conversation_history.append({
                        "role": "assistant", 
                        "content": f"[Function call: propose_schema]"
                    })
                    self._conversation_history.append({
                        "role": "function",
                        "name": "propose_schema",
                        "content": result
                    })
                    
                    return f"I've proposed a new schema (version {self._current_proposal.version if self._current_proposal else 'unknown'}). {result}"
        
        if not choice.message.content:
            raise RuntimeError("No content in OpenAI response")
        
        return choice.message.content
    
    def _handle_propose_schema(self, schema_json: dict[str, Any], cookbook_content: str) -> str:
        """Handle the propose_schema function call."""
        
        # Validate inputs
        validation_errors = []
        
        if not isinstance(schema_json, dict):
            validation_errors.append("Schema must be a valid JSON object")
        elif not schema_json.get("type") and not schema_json.get("properties"):
            validation_errors.append("Schema must have 'type' or 'properties' field")
        
        if not cookbook_content or not cookbook_content.strip():
            validation_errors.append("Cookbook content cannot be empty")
        elif len(cookbook_content.strip()) < 10:
            validation_errors.append("Cookbook content is too short")
        
        # Generate new version
        self._proposal_counter += 1
        new_version = f"{int(float(self._base_version)) + self._proposal_counter}.0"
        
        # Create proposal
        schema = Schema(schema_json=schema_json, version=new_version)
        cookbook = Cookbook(content=cookbook_content, version=new_version)
        schema_system = SchemaSystem(schema=schema, cookbook=cookbook)
        
        self._current_proposal = SchemaProposal(
            schema_system=schema_system,
            version=new_version,
            validation_errors=validation_errors,
            is_valid=len(validation_errors) == 0
        )
        
        if validation_errors:
            return f"Schema proposal validation failed: {'; '.join(validation_errors)}"
        else:
            return f"Schema proposal version {new_version} created successfully and is ready for preview."
    
