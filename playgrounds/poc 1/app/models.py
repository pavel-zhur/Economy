from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Enum, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Optional
import enum


Base = declarative_base()


class PlanType(enum.Enum):
    """Types of financial plans."""
    SPENDING = "spending"  # Plans for spending (balance tends to zero)
    ACCUMULATION = "accumulation"  # Plans for accumulation (balance grows)
    FUND = "fund"  # Long-term accumulation funds


class TransactionType(enum.Enum):
    """Types of transactions."""
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"


class RecurrenceType(enum.Enum):
    """Types of recurrence for planned operations."""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"


# === Planning Layer (Virtual) ===

class Plan(Base):
    """
    Main entity for financial planning.
    Represents both spending plans and accumulation funds.
    """
    __tablename__ = "plans"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    plan_type = Column(Enum(PlanType), nullable=False)
    
    # Hierarchy support
    parent_id = Column(Integer, ForeignKey("plans.id"), nullable=True)
    parent = relationship("Plan", remote_side=[id], back_populates="children")
    children = relationship("Plan", back_populates="parent")
    
    # Plan status
    is_active = Column(Boolean, default=True)
    is_auto_distribute = Column(Boolean, default=False)  # Auto-spend all incoming funds
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    planned_operations = relationship("PlannedOperation", back_populates="plan")
    goals = relationship("Goal", back_populates="plan")
    distribution_rules = relationship("DistributionRule", 
                                    foreign_keys="DistributionRule.target_plan_id",
                                    back_populates="target_plan")


class PlannedOperation(Base):
    """
    Planned income/expense operations for plans.
    Can be one-time or recurrent.
    """
    __tablename__ = "planned_operations"
    
    id = Column(Integer, primary_key=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False)
    
    name = Column(String(255), nullable=False)
    description = Column(Text)
    amount = Column(Numeric(15, 2), nullable=False)
    operation_type = Column(Enum(TransactionType), nullable=False)
    
    # Scheduling
    planned_date = Column(DateTime, nullable=False)
    is_recurrent = Column(Boolean, default=False)
    recurrence_type = Column(Enum(RecurrenceType), nullable=True)
    recurrence_interval = Column(Integer, default=1)  # Every N periods
    recurrence_end_date = Column(DateTime, nullable=True)
    
    # Status
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    plan = relationship("Plan", back_populates="planned_operations")


class Goal(Base):
    """
    Financial goals associated with plans.
    """
    __tablename__ = "goals"
    
    id = Column(Integer, primary_key=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False)
    
    name = Column(String(255), nullable=False)
    description = Column(Text)
    target_amount = Column(Numeric(15, 2), nullable=False)
    target_date = Column(DateTime, nullable=False)
    
    # Goal status
    is_achieved = Column(Boolean, default=False)
    achieved_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    plan = relationship("Plan", back_populates="goals")


class DistributionRule(Base):
    """
    Rules for automatic distribution of income across plans.
    """
    __tablename__ = "distribution_rules"
    
    id = Column(Integer, primary_key=True)
    source_type = Column(String(50), nullable=False)  # 'income', 'plan'
    source_plan_id = Column(Integer, ForeignKey("plans.id"), nullable=True)
    target_plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False)
    
    # Distribution parameters
    percentage = Column(Numeric(5, 2), nullable=True)  # Percentage of source
    fixed_amount = Column(Numeric(15, 2), nullable=True)  # Fixed amount
    priority = Column(Integer, default=0)  # Execution order
    
    # Conditions
    is_active = Column(Boolean, default=True)
    min_source_amount = Column(Numeric(15, 2), nullable=True)
    max_distribution_amount = Column(Numeric(15, 2), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    source_plan = relationship("Plan", foreign_keys=[source_plan_id])
    target_plan = relationship("Plan", foreign_keys=[target_plan_id], back_populates="distribution_rules")


# === Actual Data Layer ===

class Wallet(Base):
    """
    Physical wallets/accounts where money is stored.
    """
    __tablename__ = "wallets"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Wallet properties
    currency = Column(String(3), default="USD")
    is_active = Column(Boolean, default=True)
    withdrawal_coefficient = Column(Numeric(5, 4), default=1.0000)  # For fees/commissions
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    transactions = relationship("Transaction", back_populates="wallet")
    inventories = relationship("WalletInventory", back_populates="wallet")


class Transaction(Base):
    """
    Actual financial transactions.
    """
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=True)  # Optional linking
    
    # Transaction details
    amount = Column(Numeric(15, 2), nullable=False)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    description = Column(Text)
    category = Column(String(255), nullable=True)
    
    # Timing
    transaction_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    wallet = relationship("Wallet", back_populates="transactions")
    plan = relationship("Plan")


class WalletInventory(Base):
    """
    Wallet balance inventories - snapshots of actual balances.
    """
    __tablename__ = "wallet_inventories"
    
    id = Column(Integer, primary_key=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False)
    
    # Inventory details
    balance = Column(Numeric(15, 2), nullable=False)
    inventory_date = Column(DateTime, nullable=False)
    notes = Column(Text)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    wallet = relationship("Wallet", back_populates="inventories")


# === System/Tracking Entities ===

class PlanBalance(Base):
    """
    Calculated plan balances over time.
    This table stores computed balances for efficient querying.
    """
    __tablename__ = "plan_balances"
    
    id = Column(Integer, primary_key=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False)
    
    # Balance data
    balance = Column(Numeric(15, 2), nullable=False)
    calculation_date = Column(DateTime, nullable=False)
    
    # Balance breakdown
    income_total = Column(Numeric(15, 2), default=0)
    expense_total = Column(Numeric(15, 2), default=0)
    transfer_in_total = Column(Numeric(15, 2), default=0)
    transfer_out_total = Column(Numeric(15, 2), default=0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    plan = relationship("Plan")


class SystemLog(Base):
    """
    System operations log for AI actions and migrations.
    """
    __tablename__ = "system_logs"
    
    id = Column(Integer, primary_key=True)
    operation_type = Column(String(50), nullable=False)  # 'schema_change', 'data_migration', 'ai_action'
    operation_description = Column(Text, nullable=False)
    
    # Operation details
    user_message = Column(Text, nullable=True)  # Original user message
    ai_interpretation = Column(Text, nullable=True)  # AI's interpretation
    sql_executed = Column(Text, nullable=True)  # SQL commands executed
    operation_result = Column(Text, nullable=True)  # Result/status
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    execution_time_ms = Column(Integer, nullable=True)


# === Assets and Debts (Additional entities) ===

class Asset(Base):
    """
    Non-monetary assets (real estate, etc.)
    """
    __tablename__ = "assets"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    asset_type = Column(String(100), nullable=False)  # 'real_estate', 'vehicle', etc.
    
    # Valuation
    current_value = Column(Numeric(15, 2), nullable=False)
    currency = Column(String(3), default="USD")
    last_valuation_date = Column(DateTime, nullable=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Debt(Base):
    """
    Debts given to others (loans given out)
    """
    __tablename__ = "debts"
    
    id = Column(Integer, primary_key=True)
    debtor_name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Debt details
    principal_amount = Column(Numeric(15, 2), nullable=False)
    current_balance = Column(Numeric(15, 2), nullable=False)
    currency = Column(String(3), default="USD")
    
    # Dates
    loan_date = Column(DateTime, nullable=False)
    expected_return_date = Column(DateTime, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)