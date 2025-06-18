from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from contextlib import contextmanager
from typing import Generator
import logging

from config import settings
from models import Base

logger = logging.getLogger(__name__)

# Create database engine
engine = create_engine(
    settings.database_url,
    poolclass=StaticPool,
    pool_pre_ping=True,
    echo=settings.debug,
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_tables():
    """Create all database tables."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise


def drop_tables():
    """Drop all database tables."""
    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("Database tables dropped successfully")
    except Exception as e:
        logger.error(f"Error dropping database tables: {e}")
        raise


@contextmanager
def get_db_session() -> Generator[Session, None, None]:
    """
    Context manager for database sessions.
    Ensures proper session cleanup and transaction management.
    """
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        logger.error(f"Database session error: {e}")
        raise
    finally:
        session.close()


def get_db() -> Session:
    """
    Dependency for getting database session.
    Used with FastAPI dependency injection.
    """
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()


class DatabaseManager:
    """Database management utilities."""
    
    @staticmethod
    def init_database():
        """Initialize database with tables and basic data."""
        try:
            create_tables()
            DatabaseManager._create_initial_data()
            logger.info("Database initialized successfully")
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
            raise
    
    @staticmethod
    def _create_initial_data():
        """Create initial data for the system."""
        with get_db_session() as db:
            from models import Wallet, Plan, PlanType
            
            # Check if we already have initial data
            existing_wallets = db.query(Wallet).count()
            if existing_wallets > 0:
                logger.info("Initial data already exists, skipping creation")
                return
            
            # Create default wallet
            default_wallet = Wallet(
                name="Main Wallet",
                description="Default wallet for transactions",
                currency="USD"
            )
            db.add(default_wallet)
            
            # Create default root plans
            income_plan = Plan(
                name="Income",
                description="All income sources",
                plan_type=PlanType.ACCUMULATION
            )
            expenses_plan = Plan(
                name="Expenses",
                description="General expenses",
                plan_type=PlanType.SPENDING
            )
            savings_plan = Plan(
                name="Savings",
                description="Long-term savings",
                plan_type=PlanType.FUND
            )
            
            db.add_all([income_plan, expenses_plan, savings_plan])
            
            logger.info("Initial data created successfully")
    
    @staticmethod
    def reset_database():
        """Reset database by dropping and recreating all tables."""
        try:
            drop_tables()
            create_tables()
            DatabaseManager._create_initial_data()
            logger.info("Database reset successfully")
        except Exception as e:
            logger.error(f"Database reset failed: {e}")
            raise


# Initialize database on module import
if __name__ == "__main__":
    DatabaseManager.init_database()