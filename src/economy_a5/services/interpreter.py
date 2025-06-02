"""AI interpreter service implementation."""

import json
from typing import Any

from openai import OpenAI

from ..config.settings import OpenAIConfig
from ..models.core import (
    Message,
    SchemaSystem,
    Interpretation,
    Feedback,
    InterpreterResult,
)


class InterpreterService:
    """AI-powered interpreter service."""
    
    def __init__(self, openai_config: OpenAIConfig, interpreter_instructions: str) -> None:
        self._client = OpenAI(api_key=openai_config.api_key)
        self._model = openai_config.model
        self._temperature = openai_config.temperature
        self._max_tokens = openai_config.max_tokens
        self._instructions = interpreter_instructions
    
    def process_feed_mode(
        self, 
        messages: list[Message], 
        schema_system: SchemaSystem,
    ) -> InterpreterResult:
        """Process new messages in feed mode."""
        
        prompt = self._build_feed_mode_prompt(messages, schema_system)
        response = self._call_openai(prompt)
        
        return self._parse_interpreter_response(response, messages, schema_system.schema.version)
    
    def process_reprocessing_mode(
        self,
        messages: list[Message],
        new_schema_system: SchemaSystem,
        old_schema_system: SchemaSystem,
        old_interpretations: list[Interpretation],
    ) -> InterpreterResult:
        """Reprocess messages with new schema for migration preview."""
        
        prompt = self._build_reprocessing_mode_prompt(
            messages, new_schema_system, old_schema_system, old_interpretations
        )
        response = self._call_openai(prompt)
        
        return self._parse_interpreter_response(response, messages, new_schema_system.schema.version)
    
    def _build_feed_mode_prompt(self, messages: list[Message], schema_system: SchemaSystem) -> str:
        """Build prompt for feed mode processing."""
        
        messages_text = "\n".join([f"MSG_{msg.message_id}: {msg.content}" for msg in messages])
        
        return f"""
{self._instructions}

CURRENT SCHEMA:
{json.dumps(schema_system.schema.schema_json, indent=2)}

INTERPRETATION COOKBOOK:
{schema_system.cookbook.content}

MESSAGES TO PROCESS:
{messages_text}

Please process these messages and return your response in the following JSON format:
{{
    "interpretations": [
        {{
            "message_id": "string",
            "structured_data": {{ /* data conforming to schema */ }}
        }}
    ],
    "feedback": [
        {{
            "message_id": "string", 
            "confidence_level": "high|medium|low",
            "warnings": ["warning1", "warning2"],
            "notes": "specific notes about this message"
        }}
    ],
    "overall_feedback": "overall thoughts and concerns"
}}
"""
    
    def _build_reprocessing_mode_prompt(
        self,
        messages: list[Message],
        new_schema_system: SchemaSystem,
        old_schema_system: SchemaSystem,
        old_interpretations: list[Interpretation],
    ) -> str:
        """Build prompt for reprocessing mode."""
        
        messages_text = "\n".join([f"MSG_{msg.message_id}: {msg.content}" for msg in messages])
        old_interpretations_text = "\n".join([
            f"MSG_{interp.message_id}: {json.dumps(interp.structured_data)}"
            for interp in old_interpretations
        ])
        
        return f"""
{self._instructions}

MIGRATION CONTEXT:
You are reprocessing existing messages with a new schema. Maintain contextual continuity 
where possible (entity names, consistent decisions) to keep the user oriented.

OLD SCHEMA:
{json.dumps(old_schema_system.schema.schema_json, indent=2)}

OLD COOKBOOK:
{old_schema_system.cookbook.content}

OLD INTERPRETATIONS:
{old_interpretations_text}

NEW SCHEMA:
{json.dumps(new_schema_system.schema.schema_json, indent=2)}

NEW COOKBOOK:
{new_schema_system.cookbook.content}

MESSAGES TO REPROCESS:
{messages_text}

Please reprocess these messages with the new schema while maintaining continuity with 
the old interpretations. Return response in JSON format:
{{
    "interpretations": [
        {{
            "message_id": "string",
            "structured_data": {{ /* data conforming to NEW schema */ }}
        }}
    ],
    "feedback": [
        {{
            "message_id": "string",
            "confidence_level": "high|medium|low", 
            "warnings": ["warning1", "warning2"],
            "notes": "migration-specific notes"
        }}
    ],
    "overall_feedback": "thoughts on the migration and any issues"
}}
"""
    
    def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API with the given prompt."""
        
        response = self._client.chat.completions.create(
            model=self._model,
            messages=[{"role": "user", "content": prompt}],
            temperature=self._temperature,
            max_tokens=self._max_tokens,
        )
        
        if not response.choices or not response.choices[0].message.content:
            raise RuntimeError("No response from OpenAI")
        
        return response.choices[0].message.content
    
    def _parse_interpreter_response(
        self, 
        response: str, 
        messages: list[Message], 
        schema_version: str,
    ) -> InterpreterResult:
        """Parse the JSON response from the interpreter."""
        
        try:
            data = json.loads(response)
        except json.JSONDecodeError as e:
            # Fallback: create empty result with error feedback
            return InterpreterResult(
                interpretations=[],
                feedback=[
                    Feedback(
                        message_id=msg.message_id,
                        confidence_level="low",
                        warnings=[f"Failed to parse AI response: {e}"],
                        overall_notes="JSON parsing error",
                    )
                    for msg in messages
                ],
                overall_feedback=f"Failed to parse interpreter response: {e}",
            )
        
        interpretations = [
            Interpretation(
                message_id=item["message_id"],
                structured_data=item["structured_data"],
                schema_version=schema_version,
            )
            for item in data.get("interpretations", [])
        ]
        
        feedback = [
            Feedback(
                message_id=item["message_id"],
                confidence_level=item["confidence_level"],
                warnings=item.get("warnings", []),
                overall_notes=item.get("notes", ""),
            )
            for item in data.get("feedback", [])
        ]
        
        return InterpreterResult(
            interpretations=interpretations,
            feedback=feedback,
            overall_feedback=data.get("overall_feedback", ""),
        )