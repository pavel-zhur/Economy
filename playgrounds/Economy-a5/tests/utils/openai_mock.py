"""OpenAI client mock for dual-mode testing."""

from typing import Any, Dict, Optional
from unittest.mock import MagicMock

from openai import OpenAI
from openai.types.chat import ChatCompletion, ChatCompletionMessage
from openai.types.chat.chat_completion import Choice
from openai.types.chat.chat_completion_message_tool_call import ChatCompletionMessageToolCall
from openai.types.chat.chat_completion_message_tool_call import Function as ToolCallFunction

from economy_a5.config.settings import OpenAIConfig
from tests.utils.test_config import test_config
from tests.utils.fixture_manager import FixtureManager


class OpenAIMock:
    """Drop-in replacement for OpenAI client with recording/playback capabilities."""
    
    def __init__(self, service_name: str, test_name: str) -> None:
        self.service_name = service_name
        self.test_name = test_name
        self.fixture_manager = FixtureManager(service_name, test_name)
        
        # Real OpenAI client for recording mode
        self._real_client: Optional[OpenAI] = None
        if test_config.should_record_openai():
            # Only create real client if we have a real API key
            api_key = test_config.openai_api_key
            if api_key != "test-key-not-real":
                self._real_client = OpenAI(api_key=api_key)
        
        # Track call count for multiple requests in same test
        self._call_count = 0
    
    @property
    def config(self) -> OpenAIConfig:
        """Get OpenAI config for service initialization."""
        return OpenAIConfig(
            api_key=test_config.openai_api_key,
            model=test_config.interpreter_model,
            temperature=0.7,
            max_tokens=2000
        )
    
    @property
    def chat(self) -> "ChatMock":
        """Chat completions endpoint mock."""
        return ChatMock(self)


class ChatMock:
    """Chat completions mock."""
    
    def __init__(self, openai_mock: OpenAIMock) -> None:
        self.openai_mock = openai_mock
    
    @property
    def completions(self) -> "CompletionsMock":
        """Chat completions create endpoint."""
        return CompletionsMock(self.openai_mock)


class CompletionsMock:
    """Chat completions create mock."""
    
    def __init__(self, openai_mock: OpenAIMock) -> None:
        self.openai_mock = openai_mock
    
    def create(self, **kwargs) -> ChatCompletion:
        """Create chat completion with recording/playback."""
        self.openai_mock._call_count += 1
        call_suffix = f"_{self.openai_mock._call_count}" if self.openai_mock._call_count > 1 else ""
        
        request_filename = f"openai_request{call_suffix}.json"
        response_filename = f"openai_response{call_suffix}.json"
        
        # Prepare request data for recording/validation
        request_data = self._prepare_request_data(kwargs)
        
        if test_config.should_record_openai():
            return self._record_interaction(request_data, request_filename, response_filename, kwargs)
        else:
            return self._replay_interaction(request_data, request_filename, response_filename)
    
    def _prepare_request_data(self, kwargs: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare request data for comparison/storage."""
        # Remove non-deterministic fields or normalize them
        request_data = kwargs.copy()
        
        # Convert messages to serializable format
        if "messages" in request_data:
            messages = []
            for msg in request_data["messages"]:
                if hasattr(msg, "model_dump"):
                    messages.append(msg.model_dump())
                else:
                    messages.append(dict(msg))
            request_data["messages"] = messages
        
        return request_data
    
    def _record_interaction(
        self, 
        request_data: Dict[str, Any], 
        request_filename: str, 
        response_filename: str,
        original_kwargs: Dict[str, Any]
    ) -> ChatCompletion:
        """Record real API interaction."""
        # Save request data
        self.openai_mock.fixture_manager.save_json(request_filename, request_data)
        
        if self.openai_mock._real_client is None:
            # No real API key - create mock response for recording
            mock_response = self._create_mock_response("Mock response for recording mode")
            response_data = self._serialize_response(mock_response)
            self.openai_mock.fixture_manager.save_json(response_filename, response_data)
            return mock_response
        
        # Make real API call
        try:
            response = self.openai_mock._real_client.chat.completions.create(**original_kwargs)
            
            # Save response data
            response_data = self._serialize_response(response)
            self.openai_mock.fixture_manager.save_json(response_filename, response_data)
            
            return response
            
        except Exception as e:
            # Create error response for testing error scenarios
            error_response = self._create_mock_response(f"Error: {str(e)}")
            response_data = self._serialize_response(error_response)
            self.openai_mock.fixture_manager.save_json(response_filename, response_data)
            raise
    
    def _replay_interaction(
        self, 
        request_data: Dict[str, Any], 
        request_filename: str, 
        response_filename: str
    ) -> ChatCompletion:
        """Replay interaction from fixtures."""
        # Validate request matches recorded request
        try:
            recorded_request = self.openai_mock.fixture_manager.load_json(request_filename)
            self._validate_request_match(request_data, recorded_request)
        except FileNotFoundError:
            raise AssertionError(f"Request fixture {request_filename} not found. Run in record mode first.")
        
        # Load and return recorded response
        try:
            response_data = self.openai_mock.fixture_manager.load_json(response_filename)
            return self._deserialize_response(response_data)
        except FileNotFoundError:
            raise AssertionError(f"Response fixture {response_filename} not found. Run in record mode first.")
    
    def _validate_request_match(self, current: Dict[str, Any], recorded: Dict[str, Any]) -> None:
        """Validate current request matches recorded request."""
        # Compare key fields
        key_fields = ["model", "temperature", "max_tokens"]
        for field in key_fields:
            if current.get(field) != recorded.get(field):
                raise AssertionError(
                    f"Request mismatch in {field}: "
                    f"current={current.get(field)}, recorded={recorded.get(field)}"
                )
        
        # Compare tools presence (function calling)
        current_has_tools = "tools" in current and current["tools"] is not None
        recorded_has_tools = "tools" in recorded and recorded["tools"] is not None
        if current_has_tools != recorded_has_tools:
            raise AssertionError(
                f"Tools usage mismatch: current has tools={current_has_tools}, recorded has tools={recorded_has_tools}"
            )
        
        # Compare message count
        current_msgs = current.get("messages", [])
        recorded_msgs = recorded.get("messages", [])
        if len(current_msgs) != len(recorded_msgs):
            raise AssertionError(
                f"Message count mismatch: current={len(current_msgs)}, recorded={len(recorded_msgs)}"
            )
        
        # Compare message roles (content can vary but roles should match)
        for i, (curr_msg, rec_msg) in enumerate(zip(current_msgs, recorded_msgs)):
            if curr_msg.get("role") != rec_msg.get("role"):
                raise AssertionError(
                    f"Message {i} role mismatch: "
                    f"current={curr_msg.get('role')}, recorded={rec_msg.get('role')}"
                )
    
    def _create_mock_response(self, content: str) -> ChatCompletion:
        """Create mock ChatCompletion response."""
        # Create mock objects that behave like OpenAI response objects
        message = ChatCompletionMessage(
            role="assistant",
            content=content
        )
        
        choice = Choice(
            index=0,
            message=message,
            finish_reason="stop"
        )
        
        # Create a minimal ChatCompletion mock
        mock_response = MagicMock(spec=ChatCompletion)
        mock_response.choices = [choice]
        mock_response.id = "mock-completion-id"
        mock_response.model = test_config.interpreter_model
        mock_response.usage = MagicMock()
        mock_response.usage.total_tokens = 100
        
        return mock_response
    
    def _serialize_response(self, response: ChatCompletion) -> Dict[str, Any]:
        """Serialize ChatCompletion to JSON-serializable dict."""
        choices_data = []
        for choice in response.choices:
            choice_data = {
                "index": choice.index,
                "message": {
                    "role": choice.message.role,
                    "content": choice.message.content
                },
                "finish_reason": choice.finish_reason
            }
            
            # Handle tool calls if present
            if hasattr(choice.message, 'tool_calls') and choice.message.tool_calls:
                choice_data["message"]["tool_calls"] = [
                    {
                        "id": tool_call.id,
                        "type": tool_call.type,
                        "function": {
                            "name": tool_call.function.name,
                            "arguments": tool_call.function.arguments
                        }
                    }
                    for tool_call in choice.message.tool_calls
                ]
            
            choices_data.append(choice_data)
        
        return {
            "id": response.id,
            "model": response.model,
            "choices": choices_data,
            "usage": {
                "total_tokens": getattr(response.usage, "total_tokens", 0) if response.usage else 0
            }
        }
    
    def _deserialize_response(self, data: Dict[str, Any]) -> ChatCompletion:
        """Deserialize dict back to ChatCompletion."""
        choices = []
        for choice_data in data["choices"]:
            message_data = choice_data["message"]
            
            # Handle tool calls if present
            tool_calls = None
            if "tool_calls" in message_data:
                tool_calls = []
                for tc_data in message_data["tool_calls"]:
                    function = ToolCallFunction(
                        name=tc_data["function"]["name"],
                        arguments=tc_data["function"]["arguments"]
                    )
                    tool_call = ChatCompletionMessageToolCall(
                        id=tc_data["id"],
                        type=tc_data["type"],
                        function=function
                    )
                    tool_calls.append(tool_call)
            
            message = ChatCompletionMessage(
                role=message_data["role"],
                content=message_data["content"],
                tool_calls=tool_calls
            )
            
            choice = Choice(
                index=choice_data["index"],
                message=message,
                finish_reason=choice_data["finish_reason"]
            )
            choices.append(choice)
        
        mock_response = MagicMock(spec=ChatCompletion)
        mock_response.id = data["id"]
        mock_response.model = data["model"]
        mock_response.choices = choices
        mock_response.usage = MagicMock()
        mock_response.usage.total_tokens = data.get("usage", {}).get("total_tokens", 0)
        
        return mock_response