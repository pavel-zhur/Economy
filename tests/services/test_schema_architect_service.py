"""Integration tests for SchemaArchitectService."""

from economy_a5.services.schema_architect import SchemaArchitectService
from economy_a5.models.core import (
    Message,
    Schema,
    Cookbook,
    SchemaSystem,
    Interpretation,
)
from tests.utils.fixture_manager import FixtureManager
from tests.utils.openai_mock import OpenAIMock


class TestSchemaArchitectService:
    """Integration tests for SchemaArchitectService."""
    
    def test_migration_session_start(self, openai_mock: OpenAIMock, fixture_manager: FixtureManager) -> None:
        """Test starting a migration session with current data."""
        # Arrange
        current_schema_system = SchemaSystem(
            schema=Schema(
                schema_json={
                    "type": "object",
                    "properties": {
                        "amount": {"type": "number"},
                        "category": {"type": "string"}
                    }
                },
                version="1.0"
            ),
            cookbook=Cookbook(content="# Simple expense tracking\\nBasic categories only", version="1.0")
        )
        
        sample_messages = [
            Message(content="Coffee $4.50", message_id="MSG_0"),
            Message(content="Lunch at work $12.00", message_id="MSG_1"),
            Message(content="Gas for car $45", message_id="MSG_2"),
        ]
        
        current_interpretations = [
            Interpretation(
                message_id="MSG_0",
                structured_data={"amount": 4.50, "category": "food"},
                schema_version="1.0"
            ),
            Interpretation(
                message_id="MSG_1",
                structured_data={"amount": 12.00, "category": "food"},
                schema_version="1.0"
            ),
            Interpretation(
                message_id="MSG_2",
                structured_data={"amount": 45.00, "category": "transport"},
                schema_version="1.0"
            ),
        ]
        
        instructions = fixture_manager.load_text("instructions.md")
        
        service = SchemaArchitectService(openai_mock.config, instructions)
        service._client = openai_mock
        
        # Act
        user_message = "Hi! I'm looking at my current schema and thinking about making some improvements. Can you help me understand what might be enhanced?"
        response = service.start_migration_session(
            current_schema_system, sample_messages, current_interpretations, user_message
        )
        
        # Save the response for validation first (before assertions)
        result_data = {
            "initial_response": response,
            "conversation_history_length": len(service._conversation_history),
            "has_schema_context": bool(service._schema_context)
        }
        fixture_manager.validate_output("expected_output.json", result_data)
        
        # Assert
        assert isinstance(response, str)
        assert len(response) > 0  # Should provide some initial response
        
        # Verify session state
        assert service._conversation_history is not None
        assert len(service._conversation_history) == 1  # Initial assistant response
        assert service._schema_context != ""  # Should have schema context stored
    
    def test_continue_conversation_simple(self, openai_mock: OpenAIMock, fixture_manager: FixtureManager) -> None:
        """Test continuing conversation with real AI contextual awareness."""
        # Arrange - Set up realistic budget tracking scenario
        current_schema_system = SchemaSystem(
            schema=Schema(
                schema_json={
                    "type": "object", 
                    "properties": {
                        "amount": {"type": "number"},
                        "description": {"type": "string"}
                    },
                    "required": ["amount"]
                },
                version="1.0"
            ),
            cookbook=Cookbook(content="# Personal Budget Tracking\nTrack expenses with amounts and optional descriptions", version="1.0")
        )
        
        # Sample data with clear patterns for AI to recognize
        sample_messages = [
            Message(content="Coffee at Dunkin $4.50", message_id="MSG_0"),
            Message(content="Groceries at Target $87.23", message_id="MSG_1"),
            Message(content="Netflix subscription $15.99", message_id="MSG_2"),
        ]
        current_interpretations = [
            Interpretation(
                message_id="MSG_0",
                structured_data={"amount": 4.50, "description": "Coffee at Dunkin"},
                schema_version="1.0"
            ),
            Interpretation(
                message_id="MSG_1",
                structured_data={"amount": 87.23, "description": "Groceries at Target"},
                schema_version="1.0"
            ),
            Interpretation(
                message_id="MSG_2",
                structured_data={"amount": 15.99, "description": "Netflix subscription"},
                schema_version="1.0"
            ),
        ]
        
        instructions = """You are a Schema Architect AI specialized in personal finance tracking.
You analyze user data to understand their spending patterns and suggest meaningful improvements.
Always reference specific examples from their data when making suggestions."""
        
        service = SchemaArchitectService(openai_mock.config, instructions)
        service._client = openai_mock
        
        # Start session first - AI should analyze the current data
        initial_user_message = "Hi! I'm looking at my current schema and thinking about making some improvements. Can you help me understand what might be enhanced?"
        initial_response = service.start_migration_session(current_schema_system, sample_messages, current_interpretations, initial_user_message)
        initial_history_length = len(service._conversation_history)
        
        # Act - Continue conversation with contextual request
        user_input = ("I notice my expenses fall into different types - daily coffee, monthly subscriptions like Netflix, "
                      "and variable shopping like Target groceries. Can you suggest adding expense categories to help "
                      "me understand my spending patterns better?")
        response = service.continue_conversation(user_input)
        
        # Assert - Verify conversation mechanics AND contextual awareness
        assert isinstance(response, str)
        assert len(response) > 0
        
        # Verify conversation state
        assert len(service._conversation_history) == initial_history_length + 2  # User + Assistant
        assert service._conversation_history[-2]["role"] == "user"
        assert service._conversation_history[-2]["content"] == user_input
        assert service._conversation_history[-1]["role"] == "assistant"
        assert service._conversation_history[-1]["content"] == response
        
        # Check if schema context is preserved
        assert service._schema_context != ""
        
        # Test for AI contextual awareness indicators
        # AI should recognize and reference the user's specific examples
        response_lower = response.lower()
        initial_lower = initial_response.lower()
        combined_responses = (response_lower + " " + initial_lower)
        
        contextual_awareness = {
            "recognizes_coffee_pattern": any(term in combined_responses for term in ["coffee", "dunkin", "daily"]),
            "recognizes_subscription_pattern": any(term in combined_responses for term in ["netflix", "subscription", "monthly"]),
            "recognizes_shopping_pattern": any(term in combined_responses for term in ["target", "groceries", "shopping", "variable"]),
            "suggests_categories": any(term in combined_responses for term in ["categor", "type", "group"]),
            "references_spending_patterns": any(term in combined_responses for term in ["pattern", "spending", "understand"]),
            "provides_specific_suggestions": len(response) > 100  # Should be substantive, not just acknowledgment
        }
        
        # Verify AI understood the context by checking if it discussed relevant schema improvements
        schema_understanding = {
            "discusses_schema_changes": any(term in combined_responses for term in ["schema", "field", "property", "structure"]),
            "addresses_user_goals": any(term in combined_responses for term in ["track", "organize", "understand", "categoriz"])
        }
        
        # Validate output first (before assertions)
        result_data = {
            "initial_response": initial_response,
            "user_input": user_input,
            "assistant_response": response,
            "conversation_length": len(service._conversation_history),
            "schema_context_preserved": bool(service._schema_context),
            "contextual_awareness_indicators": contextual_awareness,
            "schema_understanding_indicators": schema_understanding,
            "response_length": len(response),
            "combined_response_analysis": {
                "mentions_coffee": "coffee" in combined_responses,
                "mentions_netflix": "netflix" in combined_responses,
                "mentions_target": "target" in combined_responses,
                "discusses_categories": "categor" in combined_responses
            }
        }
        fixture_manager.validate_output("expected_output.json", result_data)
    
    def test_schema_proposal_extraction(self, openai_mock: OpenAIMock, fixture_manager: FixtureManager) -> None:
        """Test extraction of proposed schema from AI response during conversation."""
        # Arrange
        current_schema_system = SchemaSystem(
            schema=Schema(
                schema_json={
                    "type": "object",
                    "properties": {
                        "amount": {"type": "number"},
                        "note": {"type": "string"}
                    }
                },
                version="1.0"
            ),
            cookbook=Cookbook(content="# Simple tracking", version="1.0")
        )
        
        sample_messages = [Message(content="Coffee $5", message_id="MSG_0")]
        current_interpretations = [
            Interpretation(
                message_id="MSG_0",
                structured_data={"amount": 5.0, "note": "Coffee"},
                schema_version="1.0"
            )
        ]
        
        instructions = fixture_manager.load_text("instructions.md")
        
        service = SchemaArchitectService(openai_mock.config, instructions)
        service._client = openai_mock
        
        # Act - Start session then ask for a schema proposal
        user_message = "Hi! I'm looking at my current schema and thinking about making some improvements. Can you help me understand what might be enhanced?"
        service.start_migration_session(current_schema_system, sample_messages, current_interpretations, user_message)
        
        # User specifically asks for a schema with JSON response
        response = service.continue_conversation(
            "Can you propose a better schema that includes categories and merchant tracking? Please propose."
        )
        
        # Assert - Check if schema proposal was created from function call
        current_proposal = service.get_current_proposal()

        # Validate output first (before assertions)
        result_data = {
            "user_request": "Can you propose a better schema that includes categories and merchant tracking?",
            "ai_response": response,
            "schema_extracted": current_proposal is not None and current_proposal.is_valid,
            "proposed_schema": current_proposal.schema_system.schema.schema_json if current_proposal else None,
            "proposed_cookbook": current_proposal.schema_system.cookbook.content if current_proposal else None,
            "schema_version": current_proposal.schema_system.schema.version if current_proposal else None,
            "conversation_turns": len(service._conversation_history)
        }
        fixture_manager.validate_output("expected_output.json", result_data)

        # Assert - Check if schema proposal was created from function call
        current_proposal = service.get_current_proposal()
        assert current_proposal is not None, "Expected schema proposal to be created"
        assert current_proposal.is_valid, "Schema proposal should be valid"
    
    def test_reset_session(self, openai_mock: OpenAIMock, fixture_manager: FixtureManager) -> None:
        """Test resetting the migration session."""
        # Arrange
        current_schema_system = SchemaSystem(
            schema=Schema(schema_json={"type": "object"}, version="1.0"),
            cookbook=Cookbook(content="# Test", version="1.0")
        )
        
        instructions = "Test instructions"
        
        service = SchemaArchitectService(openai_mock.config, instructions)
        service._client = openai_mock
        
        # Start session and add some state
        user_message = "Hi! I'm looking at my current schema and thinking about making some improvements. Can you help me understand what might be enhanced?"
        service.start_migration_session(current_schema_system, [], [], user_message)
        service.continue_conversation("Test input")
        
        # Verify we have state
        assert len(service._conversation_history) > 0
        assert service._schema_context != ""
        assert service.get_current_proposal() is None  # No schema yet
        
        # Act
        service.reset_session()
        
        # Validate output first (before assertions)
        result_data = {
            "session_reset": True,
            "conversation_history_empty": len(service._conversation_history) == 0,
            "schema_context_empty": service._schema_context == "",
            "proposed_schema_none": service.get_current_proposal() is None
        }
        fixture_manager.validate_output("expected_output.json", result_data)
        
        # Assert
        assert len(service._conversation_history) == 0
        assert service._schema_context == ""
        assert service.get_current_proposal() is None
    
    def test_multi_turn_conversation(self, openai_mock: OpenAIMock, fixture_manager: FixtureManager) -> None:
        """Test multiple conversation turns with actual AI coherence and context preservation."""
        # Arrange - Start with a realistic expense tracking scenario
        current_schema_system = SchemaSystem(
            schema=Schema(
                schema_json={
                    "type": "object", 
                    "properties": {
                        "item": {"type": "string"}, 
                        "cost": {"type": "number"},
                        "date": {"type": "string"}
                    },
                    "required": ["item", "cost"]
                },
                version="1.0"
            ),
            cookbook=Cookbook(content="# Basic expense tracking\nTrack purchases with item name, cost, and optional date", version="1.0")
        )
        
        # Realistic sample data that tells a story
        messages = [
            Message(content="Bought groceries at Safeway $67.50", message_id="MSG_0"),
            Message(content="Coffee at Starbucks $4.25", message_id="MSG_1"),
            Message(content="Gas at Shell station $42.00", message_id="MSG_2"),
            Message(content="Lunch at McDonalds $8.75", message_id="MSG_3"),
        ]
        interpretations = [
            Interpretation(
                message_id="MSG_0",
                structured_data={"item": "groceries", "cost": 67.50, "date": "2024-01-15"},
                schema_version="1.0"
            ),
            Interpretation(
                message_id="MSG_1",
                structured_data={"item": "coffee", "cost": 4.25, "date": "2024-01-15"},
                schema_version="1.0"
            ),
            Interpretation(
                message_id="MSG_2",
                structured_data={"item": "gas", "cost": 42.00, "date": "2024-01-16"},
                schema_version="1.0"
            ),
            Interpretation(
                message_id="MSG_3",
                structured_data={"item": "lunch", "cost": 8.75, "date": "2024-01-16"},
                schema_version="1.0"
            ),
        ]
        
        instructions = fixture_manager.load_text("instructions.md")
        
        service = SchemaArchitectService(openai_mock.config, instructions)
        service._client = openai_mock
        
        # Act - Structured conversation that tests AI contextual building
        user_message = "Hi! I'm looking at my current schema and thinking about making some improvements. Can you help me understand what might be enhanced?"
        initial_response = service.start_migration_session(current_schema_system, messages, interpretations, user_message)
        
        # Turn 1: User notices their data has natural categories
        response1 = service.continue_conversation(
            "Looking at my expenses, I see I have food items like coffee and lunch, then groceries and gas. "
            "I'd like to add categories to organize these better. What do you suggest?"
        )
        
        # Turn 2: User builds on the AI's category suggestion with merchant info
        response2 = service.continue_conversation(
            "That's great! I also noticed I'm tracking where I shop - Safeway, Starbucks, Shell, McDonalds. "
            "Can we add merchant/store tracking to the schema you suggested?"
        )
        
        # Turn 3: User asks AI to tie it all together and show the evolution
        response3 = service.continue_conversation(
            "Perfect! Can you show me how my current data would look with the new schema you've designed? "
            "I want to see the before and after."
        )
        
        # Assert - Verify conversation structure AND check for contextual coherence
        assert len(service._conversation_history) >= 6  # At least 3 user + 3 assistant turns
        
        # Verify conversation flow structure
        turns = service._conversation_history
        assert turns[0]["role"] == "assistant"  # Initial response
        assert turns[1]["role"] == "user"
        assert "categories" in turns[1]["content"].lower()
        assert "food items" in turns[1]["content"].lower()  # References data patterns
        assert turns[2]["role"] == "assistant" 
        assert turns[3]["role"] == "user"
        assert "merchant" in turns[3]["content"].lower()
        assert any(store in turns[3]["content"] for store in ["Safeway", "Starbucks", "Shell", "McDonalds"])  # References actual data
        assert turns[4]["role"] == "assistant"
        assert turns[5]["role"] == "user"
        assert "before and after" in turns[5]["content"].lower()
        
        # Verify schema context is preserved throughout
        assert service._schema_context != ""
        
        # Test for AI contextual coherence indicators in responses
        # Note: These will be verified against recorded AI responses
        all_responses = [initial_response, response1, response2, response3]
        response_text = " ".join(all_responses).lower()
        
        # AI should reference user's actual data in responses
        contextual_indicators = {
            "references_user_data": any(store in response_text for store in ["safeway", "starbucks", "shell", "mcdonalds"]),
            "discusses_categories": "categor" in response_text,
            "discusses_merchants": any(term in response_text for term in ["merchant", "store", "shop"]),
            "shows_progression": any(term in response_text for term in ["before", "after", "current", "new", "improve"])
        }
        
        # Validate output first (before assertions)
        result_data = {
            "initial_response": initial_response,
            "category_suggestion_response": response1,
            "merchant_addition_response": response2,
            "before_after_response": response3,
            "conversation_turns": len(service._conversation_history),
            "user_inputs": [
                "Looking at my expenses, I see I have food items like coffee and lunch, then groceries and gas. I'd like to add categories to organize these better. What do you suggest?",
                "That's great! I also noticed I'm tracking where I shop - Safeway, Starbucks, Shell, McDonalds. Can we add merchant/store tracking to the schema you suggested?",
                "Perfect! Can you show me how my current data would look with the new schema you've designed? I want to see the before and after."
            ],
            "contextual_coherence_indicators": contextual_indicators,
            "schema_context_preserved": bool(service._schema_context),
            "proposed_schema_extracted": service.get_current_proposal() is not None and service.get_current_proposal().is_valid
        }
        fixture_manager.validate_output("expected_output.json", result_data)
    
    def test_complete_schema_evolution_conversation(self, openai_mock: OpenAIMock, fixture_manager: FixtureManager) -> None:
        """Test complete schema evolution conversation with multiple turns."""
        # Arrange - Start with a simple schema
        current_schema_system = SchemaSystem(
            schema=Schema(
                schema_json={
                    "type": "object",
                    "properties": {
                        "amount": {"type": "number"},
                        "description": {"type": "string"}
                    },
                    "required": ["amount"]
                },
                version="1.0"
            ),
            cookbook=Cookbook(content="# Basic expense tracking\nTrack amount and optional description", version="1.0")
        )
        
        # Sample messages that will drive the conversation
        sample_messages = [
            Message(content="Coffee $4.50", message_id="MSG_0"),
            Message(content="Lunch at subway $12", message_id="MSG_1"),
            Message(content="Gas station $45", message_id="MSG_2"),
            Message(content="Groceries at Safeway $67.89", message_id="MSG_3"),
        ]
        
        current_interpretations = [
            Interpretation(
                message_id="MSG_0",
                structured_data={"amount": 4.50, "description": "Coffee"},
                schema_version="1.0"
            ),
            Interpretation(
                message_id="MSG_1", 
                structured_data={"amount": 12.0, "description": "Lunch at subway"},
                schema_version="1.0"
            ),
            Interpretation(
                message_id="MSG_2",
                structured_data={"amount": 45.0, "description": "Gas station"},
                schema_version="1.0"
            ),
            Interpretation(
                message_id="MSG_3",
                structured_data={"amount": 67.89, "description": "Groceries at Safeway"},
                schema_version="1.0"
            ),
        ]
        
        instructions = fixture_manager.load_text("instructions.md")
        
        service = SchemaArchitectService(openai_mock.config, instructions)
        service._client = openai_mock
        
        # Act - Multi-turn conversation with hardcoded user inputs
        user_message = "Hi! I'm looking at my current schema and thinking about making some improvements. Can you help me understand what might be enhanced?"
        initial_response = service.start_migration_session(current_schema_system, sample_messages, current_interpretations, user_message)
        
        # User wants to add categories
        response1 = service.continue_conversation(
            "I want to add categories to better organize my expenses. I see I have food, transport, and groceries. Can you help me design a better schema?"
        )
        
        # User wants merchant tracking too
        response2 = service.continue_conversation(
            "That's good, but I also want to track which merchant or store I spent money at. Can you add that to the schema?"
        )
        
        # User asks to see the final proposal
        response3 = service.continue_conversation(
            "Please submit the proposal?"
        )
        
        # Assert - Check conversation progression and state
        assert len(service._conversation_history) >= 8  # At least 3 user + 3 assistant turns + function call turns
        assert service._schema_context != ""
        
        # Verify conversation flow structure
        turns = service._conversation_history
        assert turns[0]["role"] == "assistant"  # Initial response
        assert turns[1]["role"] == "user"
        assert "categories" in turns[1]["content"].lower()
        assert turns[2]["role"] == "assistant" 
        assert turns[3]["role"] == "user"
        assert "merchant" in turns[3]["content"].lower()
        assert turns[4]["role"] == "assistant"
        assert turns[5]["role"] == "user"
        assert "submit the proposal" in turns[5]["content"].lower()
        # After this, expect function call sequence: assistant → function → assistant
        
        # Validate output first (before assertions)
        result_data = {
            "initial_response": initial_response,
            "category_discussion_response": response1,
            "merchant_addition_response": response2,
            "final_schema_response": response3,
            "conversation_turns": len(service._conversation_history),
            "user_inputs": [
                "I want to add categories to better organize my expenses. I see I have food, transport, and groceries. Can you help me design a better schema?",
                "That's good, but I also want to track which merchant or store I spent money at. Can you add that to the schema?",
                "Please submit the proposal?"
            ],
            "context_preserved": bool(service._schema_context),
            "schema_proposal_created": service.get_current_proposal() is not None and service.get_current_proposal().is_valid
        }
        fixture_manager.validate_output("expected_output.json", result_data)
        
        # Verify the core functionality: when user asks "submit the proposal", a schema proposal should be created
        current_proposal = service.get_current_proposal()
        assert current_proposal is not None, "Expected schema proposal to be created when user requested 'submit the proposal'"
        assert current_proposal.is_valid, f"Schema proposal should be valid, but got errors: {current_proposal.validation_errors}"
        
        # Verify conversation mechanics work
        assert len(service._conversation_history) >= 6  # Multi-turn conversation happened
        assert service._schema_context != ""  # Context preserved throughout
        assert len(response3) > 0  # AI provided a response to user's final request
    
    def test_end_to_end_schema_evolution(self, openai_mock: OpenAIMock, fixture_manager: FixtureManager) -> None:
        """Test complete end-to-end schema evolution workflow with real AI."""
        # Arrange - Start with very basic schema, simulate real user journey
        current_schema_system = SchemaSystem(
            schema=Schema(
                schema_json={
                    "type": "object",
                    "properties": {
                        "expense": {"type": "string"},
                        "cost": {"type": "number"}
                    },
                    "required": ["expense", "cost"]
                },
                version="1.0"
            ),
            cookbook=Cookbook(content="# Basic expense log\nJust track what you spent and how much", version="1.0")
        )
        
        # Real-world sample data showing patterns users naturally create
        sample_messages = [
            Message(content="Starbucks coffee $5.25", message_id="MSG_0"),
            Message(content="Whole Foods groceries $134.56", message_id="MSG_1"),
            Message(content="Shell gas $45.00", message_id="MSG_2"),
            Message(content="Amazon Prime $14.99", message_id="MSG_3"),
            Message(content="Local lunch place $12.50", message_id="MSG_4"),
            Message(content="CVS pharmacy $23.75", message_id="MSG_5"),
        ]
        
        current_interpretations = [
            Interpretation(
                message_id="MSG_0",
                structured_data={"expense": "Starbucks coffee", "cost": 5.25},
                schema_version="1.0"
            ),
            Interpretation(
                message_id="MSG_1",
                structured_data={"expense": "Whole Foods groceries", "cost": 134.56},
                schema_version="1.0"
            ),
            Interpretation(
                message_id="MSG_2",
                structured_data={"expense": "Shell gas", "cost": 45.00},
                schema_version="1.0"
            ),
            Interpretation(
                message_id="MSG_3",
                structured_data={"expense": "Amazon Prime", "cost": 14.99},
                schema_version="1.0"
            ),
            Interpretation(
                message_id="MSG_4",
                structured_data={"expense": "Local lunch place", "cost": 12.50},
                schema_version="1.0"
            ),
            Interpretation(
                message_id="MSG_5",
                structured_data={"expense": "CVS pharmacy", "cost": 23.75},
                schema_version="1.0"
            ),
        ]
        
        instructions = fixture_manager.load_text("instructions.md")
        
        service = SchemaArchitectService(openai_mock.config, instructions)
        service._client = openai_mock
        
        # Act - Complete workflow: Analysis → Discussion → Proposal → Refinement → Final Schema
        
        # Step 1: Initial analysis and introduction
        user_message = "Hi! I'm looking at my current schema and thinking about making some improvements. Can you help me understand what might be enhanced?"
        initial_response = service.start_migration_session(current_schema_system, sample_messages, current_interpretations, user_message)
        
        # Step 2: User recognizes patterns and asks for evolution
        discussion_response = service.continue_conversation(
            "Looking at my spending data, I see I have different types of expenses - food items like Starbucks and lunch, "
            "regular shopping at Whole Foods and CVS, transportation like gas, and subscriptions like Amazon Prime. "
            "My current schema is too simple. Can you help me design something better that captures these patterns?"
        )
        
        # Step 3: User asks for specific schema proposal
        proposal_response = service.continue_conversation(
            "That analysis makes sense. Can you propose a specific new schema structure that would work better? "
            "I want to see the actual JSON schema and understand how my existing data would map to it."
        )
        
        # Step 4: User wants to refine the proposal
        refinement_response = service.continue_conversation(
            "I like the direction, but I'm worried about complexity. Can we simplify it a bit while keeping the key improvements? "
            "Maybe focus on the most important categorization that would help me understand my spending habits."
        )
        
        # Step 5: User asks for final schema and migration preview
        final_response = service.continue_conversation(
            "Perfect! Can you submit the first proposal based on our discussion?"
        )
        
        # Step 6: User asks for refinement and second proposal  
        refinement2_response = service.continue_conversation(
            "That looks good, but can you create a more advanced version that also includes payment methods? Submit a second proposal."
        )
        
        # Assert - Verify complete workflow with real AI coherence
        assert len(service._conversation_history) >= 12  # Complex multi-turn conversation
        assert service._schema_context != ""  # Context preserved throughout
        
        # Check that user inputs are reflected in conversation history
        user_messages = [msg for msg in service._conversation_history if msg.get("role") == "user"]
        assert len(user_messages) >= 5  # Multiple user inputs were processed
        
        # Verify all responses are substantive
        all_responses = [initial_response, discussion_response, proposal_response, refinement_response, final_response]
        assert all(len(response) > 50 for response in all_responses)  # AI provided substantive responses
        
        # Test end-to-end coherence - AI should reference user's data throughout
        full_conversation = " ".join(all_responses).lower()
        
        workflow_coherence = {
            # AI should recognize user's spending patterns
            "recognizes_food_pattern": any(term in full_conversation for term in ["food", "starbucks", "lunch", "coffee"]),
            "recognizes_shopping_pattern": any(term in full_conversation for term in ["shopping", "whole foods", "cvs", "groceries"]),
            "recognizes_subscription_pattern": any(term in full_conversation for term in ["subscription", "amazon prime", "recurring"]),
            "recognizes_transport_pattern": any(term in full_conversation for term in ["gas", "shell", "transport", "fuel"]),
            
            # AI should discuss schema evolution concepts
            "discusses_categorization": any(term in full_conversation for term in ["categor", "group", "type"]),
            "discusses_schema_structure": any(term in full_conversation for term in ["schema", "structure", "field", "property"]),
            "provides_examples": any(term in full_conversation for term in ["example", "map", "transform", "before", "after"]),
            
            # AI should address user concerns
            "addresses_complexity": any(term in full_conversation for term in ["simplify", "complex", "simple", "focus"]),
            "provides_migration_preview": any(term in full_conversation for term in ["migration", "preview", "transform", "change"]),
            
            # Workflow completeness
            "covers_analysis": len(initial_response) > 100,
            "covers_discussion": len(discussion_response) > 100,
            "covers_proposal": len(proposal_response) > 100,
            "covers_refinement": len(refinement_response) > 100,
            "covers_final": len(final_response) > 100,
        }
        
        # Check if a schema was actually proposed
        current_proposal = service.get_current_proposal()
        
        # Validate output first (before assertions)
        result_data = {
            "workflow_responses": {
                "initial_analysis": initial_response,
                "pattern_discussion": discussion_response,
                "schema_proposal": proposal_response,
                "refinement_discussion": refinement_response,
                "final_presentation": final_response
            },
            "conversation_turns": len(service._conversation_history),
            "workflow_user_inputs": [
                "Looking at my spending data, I see I have different types of expenses...",
                "That analysis makes sense. Can you propose a specific new schema structure...",
                "I like the direction, but I'm worried about complexity...",
                "Perfect! Can you show me the final proposed schema..."
            ],
            "workflow_coherence_indicators": workflow_coherence,
            "schema_evolution_success": {
                "multiple_proposals_created": service.get_current_proposal() is not None and service.get_current_proposal().is_valid,
                "version_incremented": service.get_current_proposal().version != "1.0" if service.get_current_proposal() else False,
                "context_maintained": bool(service._schema_context),
                "multi_turn_coherence": len(all_responses) == 5 and all(len(r) > 50 for r in all_responses)
            },
            "data_analysis": {
                "sample_data_count": len(sample_messages),
                "spending_patterns_present": ["food", "shopping", "transport", "subscriptions"],
                "schema_complexity_evolution": "simple -> categorized"
            }
        }
        fixture_manager.validate_output("expected_output.json", result_data)
        
        # Verify the core functionality: when user asks for "first proposal" and "second proposal", they should be created
        current_proposal = service.get_current_proposal()
        assert current_proposal is not None, "Expected schema proposals to be created when user requested them"
        assert current_proposal.is_valid, f"Final schema proposal should be valid, but got errors: {current_proposal.validation_errors}"
        
        # Since user asked for "second proposal", we expect the version to be incremented
        assert current_proposal.version != "1.0", f"Expected proposal version to be incremented from 1.0, but got {current_proposal.version}"
        
        # Verify end-to-end workflow succeeded in providing good user experience  
        assert len(refinement2_response) > 0  # AI responded to final user request
        assert service._schema_context != ""  # Context maintained throughout complex workflow
    
    def test_conversation_recovery_after_error(self, openai_mock: OpenAIMock, fixture_manager: FixtureManager) -> None:
        """Test conversation recovery and context preservation after problematic user input."""
        # Arrange - Set up expense tracking scenario
        current_schema_system = SchemaSystem(
            schema=Schema(
                schema_json={
                    "type": "object",
                    "properties": {
                        "transaction": {"type": "string"},
                        "amount": {"type": "number"},
                        "category": {"type": "string"}
                    },
                    "required": ["transaction", "amount"]
                },
                version="1.0"
            ),
            cookbook=Cookbook(content="# Expense Tracking\nTrack transactions with amounts and categories", version="1.0")
        )
        
        sample_messages = [
            Message(content="Lunch at Chipotle $8.50", message_id="MSG_0"),
            Message(content="Target shopping $67.23", message_id="MSG_1"),
        ]
        current_interpretations = [
            Interpretation(
                message_id="MSG_0",
                structured_data={"transaction": "Lunch at Chipotle", "amount": 8.50, "category": "food"},
                schema_version="1.0"
            ),
            Interpretation(
                message_id="MSG_1",
                structured_data={"transaction": "Target shopping", "amount": 67.23, "category": "shopping"},
                schema_version="1.0"
            ),
        ]
        
        instructions = """You are a Schema Architect AI for expense tracking systems.
You help users evolve their schemas while maintaining helpful conversation even when users
provide unclear or problematic input. Always try to understand user intent and guide them back
to productive schema discussions."""
        
        service = SchemaArchitectService(openai_mock.config, instructions)
        service._client = openai_mock
        
        # Act - Test conversation with error recovery scenario
        
        # Step 1: Normal session start
        user_message = "Hi! I'm looking at my current schema and thinking about making some improvements. Can you help me understand what might be enhanced?"
        initial_response = service.start_migration_session(current_schema_system, sample_messages, current_interpretations, user_message)
        
        # Step 2: Clear, productive conversation
        good_response = service.continue_conversation(
            "I'd like to add more detailed categorization to my expense tracking. Can you suggest some improvements?"
        )
        
        # Step 3: Problematic/unclear user input that could derail conversation
        error_response = service.continue_conversation(
            "zzz this is confusing I don't understand schemas at all maybe I should just give up and use excel instead???"
        )
        
        # Step 4: User recovery - back to productive conversation
        recovery_response = service.continue_conversation(
            "Sorry about that confusion. Let me be clearer - I want to organize my Chipotle and Target expenses better. "
            "Can you help me design categories that make sense for these types of purchases?"
        )
        
        # Step 5: Continuation to verify context is maintained
        continuation_response = service.continue_conversation(
            "That sounds good. Can you show me what a food category and shopping category might look like in the schema?"
        )
        
        # Assert - Verify error recovery and context preservation
        assert len(service._conversation_history) >= 8  # At least 4 user + 4 assistant turns
        
        # Verify conversation flow structure
        turns = service._conversation_history
        assert turns[0]["role"] == "assistant"  # Initial
        assert turns[1]["role"] == "user"
        assert "categorization" in turns[1]["content"]
        assert turns[2]["role"] == "assistant"  # Good response
        assert turns[3]["role"] == "user"
        assert "zzz" in turns[3]["content"]  # Error input
        assert turns[4]["role"] == "assistant"  # Error handling
        assert turns[5]["role"] == "user"
        assert "chipotle and target" in turns[5]["content"].lower()  # Recovery
        assert turns[6]["role"] == "assistant"  # Recovery response
        assert turns[7]["role"] == "user"
        assert "food category" in turns[7]["content"].lower()  # Continuation
        
        # Test error recovery effectiveness
        all_responses = [initial_response, good_response, error_response, recovery_response, continuation_response]
        response_text = " ".join(all_responses).lower()
        
        recovery_indicators = {
            # AI should handle error gracefully
            "handles_confusion_gracefully": any(term in error_response.lower() for term in ["understand", "help", "clarify", "explain"]),
            "maintains_helpful_tone": not any(term in error_response.lower() for term in ["give up", "can't help", "impossible"]),
            "stays_on_topic": any(term in error_response.lower() for term in ["schema", "expense", "track", "categor"]),
            
            # AI should recover context after error
            "references_original_data": any(term in response_text for term in ["chipotle", "target", "lunch", "shopping"]),
            "maintains_schema_focus": any(term in response_text for term in ["schema", "categor", "structure", "field"]),
            "builds_on_recovery": any(term in continuation_response.lower() for term in ["food", "shopping", "category"]),
            
            # Conversation continuity
            "context_preserved_through_error": bool(service._schema_context),
            "productive_after_recovery": len(recovery_response) > 50 and len(continuation_response) > 50,
            "addresses_specific_examples": any(term in response_text for term in ["food category", "shopping category"]),
        }
        
        # Validate output first (before assertions)
        result_data = {
            "conversation_flow": {
                "initial_response": initial_response,
                "productive_response": good_response,
                "error_handling_response": error_response,
                "recovery_response": recovery_response,
                "continuation_response": continuation_response
            },
            "user_inputs": [
                "I'd like to add more detailed categorization...",
                "zzz this is confusing I don't understand schemas...",
                "Sorry about that confusion. Let me be clearer...",
                "That sounds good. Can you show me what a food category..."
            ],
            "conversation_turns": len(service._conversation_history),
            "error_recovery_indicators": recovery_indicators,
            "context_preservation": {
                "schema_context_maintained": bool(service._schema_context),
                "conversation_history_complete": len(service._conversation_history) >= 8,
                "productive_conversation_resumed": len(continuation_response) > 50
            },
            "error_scenario_testing": {
                "problematic_input": "zzz this is confusing I don't understand schemas at all maybe I should just give up and use excel instead???",
                "ai_handled_gracefully": len(error_response) > 30,  # AI should still provide substantive response
                "context_survived_error": "chipotle" in response_text or "target" in response_text,
                "conversation_recoverable": "food" in continuation_response.lower() and "category" in continuation_response.lower()
            }
        }
        fixture_manager.validate_output("expected_output.json", result_data)
        
        # Verify schema context survived the error scenario
        assert service._schema_context != ""
    
    def test_large_message_sample_limiting(self, openai_mock: OpenAIMock, fixture_manager: FixtureManager) -> None:
        """Test that large message samples are properly limited."""
        # Arrange - Create many messages to test the 10-message limit
        large_message_set = [
            Message(content=f"Message {i} with content", message_id=f"MSG_{i}")
            for i in range(15)  # More than the 10 message limit
        ]
        
        large_interpretation_set = [
            Interpretation(
                message_id=f"MSG_{i}",
                structured_data={"index": i, "content": f"data_{i}"},
                schema_version="1.0"
            )
            for i in range(15)
        ]
        
        current_schema_system = SchemaSystem(
            schema=Schema(schema_json={"type": "object"}, version="1.0"),
            cookbook=Cookbook(content="# Test", version="1.0")
        )
        
        instructions = "Handle large datasets"
        
        service = SchemaArchitectService(openai_mock.config, instructions)
        service._client = openai_mock
        
        # Act
        user_message = "Hi! I'm looking at my current schema and thinking about making some improvements. Can you help me understand what might be enhanced?"
        response = service.start_migration_session(
            current_schema_system, large_message_set, large_interpretation_set, user_message
        )
        
        # Assert - Should handle gracefully without errors
        assert isinstance(response, str)
        assert service._schema_context != ""
        
        # Verify that the schema context contains limited samples (check implementation detail)
        context_lines = service._schema_context.split('\\n')
        sample_message_lines = [line for line in context_lines if line.startswith('MSG_')]
        
        # Should have at most 10 sample messages and 10 sample interpretations  
        message_count = len([line for line in sample_message_lines if 'Message' in line])
        interpretation_count = len([line for line in sample_message_lines if 'data_' in line])
        
        # Validate output first (before assertions)
        result_data = {
            "response": response,
            "total_messages_provided": len(large_message_set),
            "total_interpretations_provided": len(large_interpretation_set),
            "sample_messages_in_context": message_count,
            "sample_interpretations_in_context": interpretation_count,
            "context_length": len(service._schema_context)
        }
        fixture_manager.validate_output("expected_output.json", result_data)
        
        assert message_count <= 10
        assert interpretation_count <= 10