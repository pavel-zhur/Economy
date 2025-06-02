"""Schema architect service implementation."""

import json
from typing import Optional

from openai import OpenAI

from ..config.settings import OpenAIConfig
from ..models.core import (
    Message,
    Schema,
    Cookbook,
    SchemaSystem,
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
        self._proposed_schema_system: Optional[SchemaSystem] = None
    
    def start_migration_session(
        self,
        current_schema_system: SchemaSystem,
        sample_messages: list[Message],
        current_interpretations: list[Interpretation],
    ) -> str:
        """Start a migration session and return initial response."""
        
        self._conversation_history = []
        self._proposed_schema_system = None
        
        sample_messages_text = "\n".join([
            f"MSG_{msg.message_id}: {msg.content}" 
            for msg in sample_messages[:10]  # Limit to first 10 for context
        ])
        
        sample_interpretations_text = "\n".join([
            f"MSG_{interp.message_id}: {json.dumps(interp.structured_data)}"
            for interp in current_interpretations[:10]  # Limit to first 10
        ])
        
        initial_prompt = f"""
{self._instructions}

CURRENT SCHEMA:
{json.dumps(current_schema_system.schema.schema_json, indent=2)}

CURRENT COOKBOOK:
{current_schema_system.cookbook.content}

SAMPLE MESSAGES:
{sample_messages_text}

SAMPLE CURRENT INTERPRETATIONS:
{sample_interpretations_text}

I'm ready to help you evolve your schema. What changes would you like to make?
"""
        
        response = self._call_openai_conversation([{"role": "user", "content": initial_prompt}])
        self._conversation_history.append({"role": "assistant", "content": response})
        
        return response
    
    def continue_conversation(self, user_input: str) -> str:
        """Continue the migration conversation."""
        
        self._conversation_history.append({"role": "user", "content": user_input})
        
        # Build full conversation context
        messages = [{"role": "system", "content": self._instructions}] + self._conversation_history
        
        response = self._call_openai_conversation(messages)
        self._conversation_history.append({"role": "assistant", "content": response})
        
        # Try to extract proposed schema from response if present
        self._try_extract_proposed_schema(response)
        
        return response
    
    def get_proposed_schema_system(self) -> Optional[SchemaSystem]:
        """Get the currently proposed schema system, if any."""
        return self._proposed_schema_system
    
    def reset_session(self) -> None:
        """Reset the current migration session."""
        self._conversation_history = []
        self._proposed_schema_system = None
    
    def _call_openai_conversation(self, messages: list[dict[str, str]]) -> str:
        """Call OpenAI API with conversation messages."""
        
        response = self._client.chat.completions.create(
            model=self._model,
            messages=messages,
            temperature=self._temperature,
            max_tokens=self._max_tokens,
        )
        
        if not response.choices or not response.choices[0].message.content:
            raise RuntimeError("No response from OpenAI")
        
        return response.choices[0].message.content
    
    def _try_extract_proposed_schema(self, response: str) -> None:
        """Try to extract a proposed schema from the response."""
        
        # Look for JSON blocks in the response that might contain schema
        lines = response.split("\n")
        json_lines: list[str] = []
        in_json_block = False
        
        for line in lines:
            if line.strip().startswith("```json") or line.strip().startswith("```"):
                in_json_block = True
                continue
            elif line.strip() == "```" and in_json_block:
                in_json_block = False
                # Try to parse accumulated JSON
                if json_lines:
                    try:
                        json_text = "\n".join(json_lines)
                        data = json.loads(json_text)
                        
                        # Check if this looks like a schema
                        if isinstance(data, dict) and ("type" in data or "properties" in data):
                            # Assume we need to extract cookbook from the response text
                            cookbook_content = self._extract_cookbook_from_response(response)
                            
                            schema = Schema(schema_json=data, version="2.0")
                            cookbook = Cookbook(content=cookbook_content, version="2.0") 
                            self._proposed_schema_system = SchemaSystem(schema=schema, cookbook=cookbook)
                            return
                    except json.JSONDecodeError:
                        pass
                    finally:
                        json_lines = []
            elif in_json_block:
                json_lines.append(line)
    
    def _extract_cookbook_from_response(self, response: str) -> str:
        """Extract cookbook content from response."""
        
        # Simple heuristic: look for markdown sections that might be cookbook content
        lines = response.split("\n")
        cookbook_lines: list[str] = []
        
        # Look for sections with interpretation guidance
        for i, line in enumerate(lines):
            if any(keyword in line.lower() for keyword in ["cookbook", "interpretation", "guide", "instructions"]):
                # Take the next several lines as potential cookbook content
                for j in range(i + 1, min(i + 20, len(lines))):
                    if lines[j].strip() and not lines[j].startswith("```"):
                        cookbook_lines.append(lines[j])
                    elif lines[j].startswith("```") or not lines[j].strip():
                        break
                break
        
        return "\n".join(cookbook_lines) if cookbook_lines else "# Interpretation Guide\n\nGenerated from conversation."