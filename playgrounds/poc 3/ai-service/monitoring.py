import time
import structlog
from typing import Dict, Any, Optional
from functools import wraps
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import threading

try:
    from opentelemetry import trace
    from opentelemetry.exporter.jaeger.thrift import JaegerExporter
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor
    from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
    from opentelemetry.instrumentation.requests import RequestsInstrumentor
    TRACING_AVAILABLE = True
except ImportError:
    TRACING_AVAILABLE = False
    trace = None


logger = structlog.get_logger()

# Prometheus Metrics
REQUESTS_TOTAL = Counter(
    'poc3_requests_total',
    'Total number of requests',
    ['endpoint', 'method', 'status']
)

REQUEST_DURATION = Histogram(
    'poc3_request_duration_seconds',
    'Request duration in seconds',
    ['endpoint', 'method']
)

AI_REQUESTS_TOTAL = Counter(
    'poc3_ai_requests_total',
    'Total number of AI requests',
    ['session_id', 'intent', 'success']
)

AI_REQUEST_DURATION = Histogram(
    'poc3_ai_request_duration_seconds',
    'AI request processing duration',
    ['intent']
)

SQL_QUERIES_TOTAL = Counter(
    'poc3_sql_queries_total',
    'Total number of SQL queries executed',
    ['query_type', 'success']
)

SQL_QUERY_DURATION = Histogram(
    'poc3_sql_query_duration_seconds',
    'SQL query execution duration',
    ['query_type']
)

WORKFLOW_EXECUTIONS_TOTAL = Counter(
    'poc3_workflow_executions_total',
    'Total number of workflow executions',
    ['workflow_type', 'status']
)

WORKFLOW_EXECUTION_DURATION = Histogram(
    'poc3_workflow_execution_duration_seconds',
    'Workflow execution duration',
    ['workflow_type']
)

DATABASE_CONNECTIONS = Gauge(
    'poc3_database_connections_active',
    'Number of active database connections'
)

AI_AGENT_STATUS = Gauge(
    'poc3_ai_agent_status',
    'AI agent health status (1=healthy, 0=unhealthy)'
)


class MonitoringManager:
    """Manages monitoring, metrics, and tracing."""
    
    def __init__(self):
        self._tracer = None
        self._metrics_server_started = False
    
    def setup_tracing(self, jaeger_endpoint: str = "http://localhost:14268/api/traces") -> None:
        """Setup distributed tracing with Jaeger."""
        if not TRACING_AVAILABLE:
            logger.warning("OpenTelemetry not available, tracing disabled")
            return
        
        try:
            # Configure tracer
            trace.set_tracer_provider(TracerProvider())
            tracer = trace.get_tracer(__name__)
            self._tracer = tracer
            
            # Configure Jaeger exporter
            jaeger_exporter = JaegerExporter(
                agent_host_name="localhost",
                agent_port=6831,
            )
            
            span_processor = BatchSpanProcessor(jaeger_exporter)
            trace.get_tracer_provider().add_span_processor(span_processor)
            
            # Auto-instrument libraries
            SQLAlchemyInstrumentor().instrument()
            RequestsInstrumentor().instrument()
            
            logger.info("Distributed tracing configured successfully")
            
        except Exception as e:
            logger.error("Failed to setup tracing", error=str(e))
    
    def start_metrics_server(self, port: int = 9091) -> None:
        """Start Prometheus metrics server."""
        if self._metrics_server_started:
            return
        
        try:
            def start_server():
                start_http_server(port)
                logger.info(f"Prometheus metrics server started on port {port}")
            
            # Start in background thread
            thread = threading.Thread(target=start_server, daemon=True)
            thread.start()
            self._metrics_server_started = True
            
        except Exception as e:
            logger.error("Failed to start metrics server", error=str(e))
    
    def get_tracer(self):
        """Get the configured tracer."""
        return self._tracer


# Global monitoring manager
monitoring = MonitoringManager()


def setup_monitoring() -> None:
    """Setup monitoring components."""
    monitoring.setup_tracing()
    monitoring.start_metrics_server()


def track_request(endpoint: str, method: str = "POST"):
    """Decorator to track HTTP requests."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            status = "success"
            
            try:
                result = await func(*args, **kwargs)
                
                # Determine status from result
                if isinstance(result, dict) and result.get("success") is False:
                    status = "error"
                
                return result
                
            except Exception as e:
                status = "error"
                raise
            finally:
                duration = time.time() - start_time
                
                REQUESTS_TOTAL.labels(
                    endpoint=endpoint,
                    method=method,
                    status=status
                ).inc()
                
                REQUEST_DURATION.labels(
                    endpoint=endpoint,
                    method=method
                ).observe(duration)
        
        return wrapper
    return decorator


def track_ai_request(intent: str = "unknown"):
    """Decorator to track AI requests."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            session_id = kwargs.get("session_id", "unknown")
            success = "success"
            
            try:
                result = await func(*args, **kwargs)
                
                if isinstance(result, dict) and result.get("success") is False:
                    success = "error"
                
                return result
                
            except Exception as e:
                success = "error"
                raise
            finally:
                duration = time.time() - start_time
                
                AI_REQUESTS_TOTAL.labels(
                    session_id=session_id,
                    intent=intent,
                    success=success
                ).inc()
                
                AI_REQUEST_DURATION.labels(intent=intent).observe(duration)
        
        return wrapper
    return decorator


def track_sql_query(query_type: str = "unknown"):
    """Decorator to track SQL queries."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            success = "success"
            
            try:
                result = await func(*args, **kwargs)
                
                if isinstance(result, dict) and result.get("success") is False:
                    success = "error"
                
                return result
                
            except Exception as e:
                success = "error"
                raise
            finally:
                duration = time.time() - start_time
                
                SQL_QUERIES_TOTAL.labels(
                    query_type=query_type,
                    success=success
                ).inc()
                
                SQL_QUERY_DURATION.labels(query_type=query_type).observe(duration)
        
        return wrapper
    return decorator


def track_workflow(workflow_type: str):
    """Decorator to track workflow executions."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            status = "success"
            
            try:
                result = await func(*args, **kwargs)
                
                if isinstance(result, dict) and result.get("success") is False:
                    status = "error"
                elif hasattr(result, "success") and not result.success:
                    status = "error"
                
                return result
                
            except Exception as e:
                status = "error"
                raise
            finally:
                duration = time.time() - start_time
                
                WORKFLOW_EXECUTIONS_TOTAL.labels(
                    workflow_type=workflow_type,
                    status=status
                ).inc()
                
                WORKFLOW_EXECUTION_DURATION.labels(
                    workflow_type=workflow_type
                ).observe(duration)
        
        return wrapper
    return decorator


def update_database_connections(count: int) -> None:
    """Update database connections gauge."""
    DATABASE_CONNECTIONS.set(count)


def update_ai_agent_status(healthy: bool) -> None:
    """Update AI agent status gauge."""
    AI_AGENT_STATUS.set(1 if healthy else 0)


class TracingContext:
    """Context manager for distributed tracing."""
    
    def __init__(self, operation_name: str, **attributes):
        self.operation_name = operation_name
        self.attributes = attributes
        self.span = None
    
    def __enter__(self):
        if monitoring._tracer:
            self.span = monitoring._tracer.start_span(self.operation_name)
            for key, value in self.attributes.items():
                self.span.set_attribute(key, value)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.span:
            if exc_type:
                self.span.record_exception(exc_val)
                self.span.set_status(trace.Status(trace.StatusCode.ERROR, str(exc_val)))
            self.span.end()
    
    def add_event(self, name: str, **attributes):
        """Add an event to the current span."""
        if self.span:
            self.span.add_event(name, attributes)
    
    def set_attribute(self, key: str, value: Any):
        """Set an attribute on the current span."""
        if self.span:
            self.span.set_attribute(key, value)