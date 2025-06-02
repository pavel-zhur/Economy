"""Main console application entry point."""

import os
import sys
from pathlib import Path
from typing import Optional

import typer
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich.text import Text

from ..config.settings import AppConfig
from ..models.core import FileConfig
from ..services.file_repository import FileRepository
from ..services.interpreter import InterpreterService
from ..services.schema_architect import SchemaArchitectService

app = typer.Typer(name="economy-poc", help="Economy A5 POC Console Application")
console = Console()


def _get_file_config(data_dir: Path) -> FileConfig:
    """Create file configuration for the given data directory."""
    return FileConfig(
        messages_file=data_dir / "messages.txt",
        schema_file=data_dir / "current_schema.json",
        cookbook_file=data_dir / "cookbook.md",
        interpretations_file=data_dir / "current_interpretations.json",
        architect_instructions_file=data_dir / "architect_instructions.md",
        interpreter_instructions_file=data_dir / "interpreter_instructions.md",
        migration_session_file=data_dir / "migration_session.md",
    )


@app.command()
def feed_mode(
    data_dir: str = typer.Option("./data", help="Data directory path"),
    openai_api_key: Optional[str] = typer.Option(None, envvar="OPENAI_API_KEY", help="OpenAI API key"),
    interpreter_model: str = typer.Option("gpt-4o-mini", envvar="INTERPRETER_MODEL", help="Model for interpreter"),
    architect_model: str = typer.Option("gpt-4o-mini", envvar="ARCHITECT_MODEL", help="Model for architect"),
) -> None:
    """Process new messages in feed mode."""
    
    if not openai_api_key:
        console.print("[red]Error: OpenAI API key required. Set OPENAI_API_KEY environment variable or use --openai-api-key option.[/red]")
        raise typer.Exit(1)
    
    data_path = Path(data_dir)
    config = AppConfig.create_default(openai_api_key, interpreter_model, architect_model, data_path)
    file_config = _get_file_config(data_path)
    
    # Initialize services
    repository = FileRepository(file_config)
    
    try:
        interpreter_instructions = repository.load_interpreter_instructions()
        if not interpreter_instructions:
            console.print("[red]Error: interpreter_instructions.md not found or empty.[/red]")
            raise typer.Exit(1)
        
        interpreter = InterpreterService(config.get_interpreter_openai_config(), interpreter_instructions)
        
        # Load data
        messages = repository.load_messages()
        if not messages:
            console.print("[yellow]No messages found in messages.txt[/yellow]")
            return
        
        schema_system = repository.load_schema_system()
        if not schema_system.schema.schema_json:
            console.print("[red]Error: current_schema.json not found or empty.[/red]")
            raise typer.Exit(1)
        
        console.print(f"[green]Processing {len(messages)} messages in feed mode...[/green]")
        
        # Process messages
        result = interpreter.process_feed_mode(messages, schema_system)
        
        # Save interpretations
        repository.save_interpretations(result.interpretations)
        
        # Display results
        console.print(Panel(
            f"Processed {len(result.interpretations)} interpretations\n"
            f"Generated {len(result.feedback)} feedback items\n\n"
            f"Overall feedback: {result.overall_feedback}",
            title="Feed Mode Results",
            border_style="green",
        ))
        
        # Show any warnings
        for feedback in result.feedback:
            if feedback.warnings:
                console.print(f"[yellow]MSG_{feedback.message_id}: {', '.join(feedback.warnings)}[/yellow]")
        
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@app.command()
def migration_session(
    data_dir: str = typer.Option("./data", help="Data directory path"),
    openai_api_key: Optional[str] = typer.Option(None, envvar="OPENAI_API_KEY", help="OpenAI API key"),
    interpreter_model: str = typer.Option("gpt-4o-mini", envvar="INTERPRETER_MODEL", help="Model for interpreter"),
    architect_model: str = typer.Option("gpt-4o-mini", envvar="ARCHITECT_MODEL", help="Model for architect"),
) -> None:
    """Start a schema migration session."""
    
    if not openai_api_key:
        console.print("[red]Error: OpenAI API key required. Set OPENAI_API_KEY environment variable or use --openai-api-key option.[/red]")
        raise typer.Exit(1)
    
    data_path = Path(data_dir)
    config = AppConfig.create_default(openai_api_key, interpreter_model, architect_model, data_path)
    file_config = _get_file_config(data_path)
    
    # Initialize services
    repository = FileRepository(file_config)
    
    try:
        architect_instructions = repository.load_architect_instructions()
        interpreter_instructions = repository.load_interpreter_instructions()
        
        if not architect_instructions:
            console.print("[red]Error: architect_instructions.md not found or empty.[/red]")
            raise typer.Exit(1)
        
        if not interpreter_instructions:
            console.print("[red]Error: interpreter_instructions.md not found or empty.[/red]")
            raise typer.Exit(1)
        
        architect = SchemaArchitectService(config.get_architect_openai_config(), architect_instructions)
        interpreter = InterpreterService(config.get_interpreter_openai_config(), interpreter_instructions)
        
        # Load current data
        messages = repository.load_messages()
        schema_system = repository.load_schema_system()
        interpretations = repository.load_interpretations()
        
        if not schema_system.schema.schema_json:
            console.print("[red]Error: current_schema.json not found or empty.[/red]")
            raise typer.Exit(1)
        
        console.print(Panel(
            "Starting schema migration session...\n"
            f"Current schema version: {schema_system.schema.version}\n"
            f"Available messages: {len(messages)}\n"
            f"Current interpretations: {len(interpretations)}",
            title="Migration Session",
            border_style="blue",
        ))
        
        # Start migration session
        session_log = "# Migration Session Log\n\n"
        initial_response = architect.start_migration_session(schema_system, messages, interpretations)
        
        console.print(Panel(initial_response, title="Schema Architect", border_style="cyan"))
        session_log += f"**Schema Architect:** {initial_response}\n\n"
        
        # Interactive conversation loop
        while True:
            user_input = Prompt.ask("\n[bold]Your response[/bold] (or 'quit' to exit, 'preview' to test current proposal)")
            
            if user_input.lower() == "quit":
                break
            elif user_input.lower() == "preview":
                proposed_schema = architect.get_proposed_schema_system()
                if not proposed_schema:
                    console.print("[yellow]No schema proposal available yet.[/yellow]")
                    continue
                
                console.print("[green]Running preview with proposed schema...[/green]")
                
                # Run reprocessing mode
                preview_result = interpreter.process_reprocessing_mode(
                    messages, proposed_schema, schema_system, interpretations
                )
                
                console.print(Panel(
                    f"Preview Results:\n"
                    f"- Processed {len(preview_result.interpretations)} interpretations\n"
                    f"- Generated {len(preview_result.feedback)} feedback items\n\n"
                    f"Overall feedback: {preview_result.overall_feedback}",
                    title="Migration Preview",
                    border_style="yellow",
                ))
                
                # Show warnings if any
                warning_count = sum(len(fb.warnings) for fb in preview_result.feedback)
                if warning_count > 0:
                    console.print(f"[yellow]Total warnings: {warning_count}[/yellow]")
                    show_warnings = Confirm.ask("Show detailed warnings?")
                    if show_warnings:
                        for feedback in preview_result.feedback:
                            if feedback.warnings:
                                console.print(f"MSG_{feedback.message_id}: {', '.join(feedback.warnings)}")
                
                # Ask if user wants to commit
                commit = Confirm.ask("Commit this schema change?")
                if commit:
                    repository.save_schema_system(proposed_schema)
                    repository.save_interpretations(preview_result.interpretations)
                    console.print("[green]Schema migration committed successfully![/green]")
                    break
                else:
                    continue
            else:
                session_log += f"**User:** {user_input}\n\n"
                
                response = architect.continue_conversation(user_input)
                console.print(Panel(response, title="Schema Architect", border_style="cyan"))
                session_log += f"**Schema Architect:** {response}\n\n"
        
        # Save session log
        repository.save_migration_session(session_log)
        console.print("[green]Migration session ended. Session log saved.[/green]")
        
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@app.command()
def status(
    data_dir: str = typer.Option("./data", help="Data directory path"),
) -> None:
    """Show current system status."""
    
    data_path = Path(data_dir)
    file_config = _get_file_config(data_path)
    repository = FileRepository(file_config)
    
    try:
        messages = repository.load_messages()
        schema_system = repository.load_schema_system()
        interpretations = repository.load_interpretations()
        
        console.print(Panel(
            f"Messages: {len(messages)}\n"
            f"Schema version: {schema_system.schema.version}\n"
            f"Interpretations: {len(interpretations)}\n"
            f"Schema file: {'✓' if file_config.schema_file.exists() else '✗'}\n"
            f"Cookbook file: {'✓' if file_config.cookbook_file.exists() else '✗'}\n"
            f"Architect instructions: {'✓' if file_config.architect_instructions_file.exists() else '✗'}\n"
            f"Interpreter instructions: {'✓' if file_config.interpreter_instructions_file.exists() else '✗'}",
            title="System Status",
            border_style="blue",
        ))
        
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


def main() -> None:
    """Main entry point."""
    app()


if __name__ == "__main__":
    main()