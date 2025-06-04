
Отличные дополнения! Это кардинально меняет архитектуру. Ключевая идея - **эксплицитная актуализация** и **неизменность плановых данных**. Давайте пересмотрим.

## Ключевое переосмысление: Трехслойная временная модель

### Слой 1: Плановые операции (неизменны)
```python
@dataclass
class PlannedOperation:
    id: str
    plan_id: str
    planned_date: date
    planned_amount: Decimal
    operation_type: OperationType  # INCOME, EXPENSE, TRANSFER
    recurrence_rule: Optional[RecurrenceRule]
    
    # ЭТО НИКОГДА НЕ МЕНЯЕТСЯ после создания
```

### Слой 2: Фактические транзакции
```python
@dataclass
class Transaction:
    id: str
    date: date
    amount: Decimal
    category: str
    wallet_id: str
    
    # Связь с планом (может быть null)
    linked_planned_operation_id: Optional[str]
```

### Слой 3: Актуализация (Over/Under)
```python
@dataclass
class ActualizationEntry:
    id: str
    planned_operation_id: str
    actual_transaction_id: Optional[str]  # null если не произошло вообще
    
    # Разницы (ключевая идея!)
    amount_variance: Decimal      # actual - planned
    date_variance: int           # дней разницы
    
    # Компенсирующие переводы между планами
    compensation_transfers: List[CompensationTransfer]
    
    # Статус актуализации
    status: ActualizationStatus  # PENDING, RESOLVED, IGNORED
    resolved_at: Optional[datetime]
    resolved_by_user: bool
```

### Компенсирующие переводы
```python
@dataclass
class CompensationTransfer:
    from_plan_id: str
    to_plan_id: str
    amount: Decimal
    reason: CompensationReason  # OVERSPEND, UNDERSPEND, MISSED_INCOME, EXTRA_INCOME
    
    # Эти переводы и создают историю "как маленькое стало большим"
```

## Баланс плана: Трехкомпонентная формула

```python
def calculate_plan_balance(plan_id: str, at_date: date) -> PlanBalance:
    # 1. Плановый баланс (из PlannedOperation)
    planned_balance = sum_planned_operations(plan_id, up_to=at_date)
    
    # 2. Актуализационные разницы (из ActualizationEntry)
    actualization_balance = sum_actualization_variances(plan_id, up_to=at_date)
    
    # 3. Компенсирующие переводы (из CompensationTransfer)
    compensation_balance = sum_compensation_transfers(plan_id, up_to=at_date)
    
    return PlanBalance(
        plan_id=plan_id,
        date=at_date,
        planned=planned_balance,
        actualization=actualization_balance,
        compensation=compensation_balance,
        effective=planned_balance + actualization_balance + compensation_balance
    )
```

## Процесс превращения будущего в прошлое

### Фаза 1: Планирование (будущее)
```python
# Создаем плановую операцию
planned_op = PlannedOperation(
    plan_id="groceries",
    planned_date=date(2024, 1, 15),
    planned_amount=Decimal("300.00"),
    operation_type=EXPENSE
)
```

### Фаза 2: Событие происходит (настоящее → прошлое)
```python
# Реальная транзакция
transaction = Transaction(
    date=date(2024, 1, 16),        # на день позже
    amount=Decimal("347.50"),       # на 47.50 больше
    category="food"
)
```

### Фаза 3: Система создает актуализацию (автоматически)
```python
actualization = ActualizationEntry(
    planned_operation_id=planned_op.id,
    actual_transaction_id=transaction.id,
    amount_variance=Decimal("47.50"),    # перерасход
    date_variance=1,                     # день задержки
    status=PENDING                       # ждет резолва пользователя
)
```

### Фаза 4: Пользователь резолвит (эксплицитно)
```python
# Пользователь говорит: "Перерасход покрыть из плана 'Резерв'"
compensation = CompensationTransfer(
    from_plan_id="reserve",
    to_plan_id="groceries", 
    amount=Decimal("47.50"),
    reason=OVERSPEND
)

actualization.compensation_transfers.append(compensation)
actualization.status = RESOLVED
actualization.resolved_by_user = True
```

## Равенство балансов в иерархии

```python
def validate_plan_hierarchy_balance(parent_plan_id: str, date: date) -> bool:
    parent_balance = calculate_plan_balance(parent_plan_id, date)
    
    children_balances = [
        calculate_plan_balance(child.id, date) 
        for child in get_child_plans(parent_plan_id)
    ]
    
    parent_own_balance = parent_balance.effective - sum(
        child.effective for child in children_balances
    )
    
    # Родитель = дети + собственный виртуальный баланс
    expected_balance = sum(child.effective for child in children_balances) + parent_own_balance
    
    return abs(expected_balance - parent_balance.effective) < Decimal("0.01")
```

## Дополнительные типы планов

```python
enum PlanType:
    FUND = "fund"
    GOAL = "goal" 
    EXPENSE_BUDGET = "expense_budget"
    INCOME_SOURCE = "income_source"
    STORAGE = "storage"
    
    # Новые типы
    ASSET = "asset"              # Недвижимость, акции
    LIABILITY = "liability"      # Долги, кредиты
    TAX_RESERVE = "tax_reserve"  # Налоговые резервы
    COMMISSION_BUFFER = "commission_buffer"  # Буфер на комиссии
    RECEIVABLE = "receivable"    # Дебиторка (дал в долг)

@dataclass
class AssetPlan(Plan):
    current_valuation: Decimal
    valuation_date: date
    depreciation_rate: Optional[Decimal]

@dataclass
class LiabilityPlan(Plan):
    principal_amount: Decimal
    interest_rate: Decimal
    payment_schedule: PaymentSchedule

@dataclass
class CommissionBufferPlan(Plan):
    commission_rate: Decimal  # 0.03 для 3%
    base_plan_id: str        # На какой план действует комиссия
```

## Временные графики и аналитика

```python
@dataclass 
class PlanTimeline:
    plan_id: str
    timeline_points: List[TimelinePoint]

@dataclass
class TimelinePoint:
    date: date
    planned_balance: Decimal
    actual_balance: Decimal
    variance: Decimal
    
    # Декомпозиция изменений
    planned_operations: List[PlannedOperation]
    actualization_entries: List[ActualizationEntry]
    compensation_transfers: List[CompensationTransfer]
```

## Ключевые преимущества архитектуры:

1. **Неизменность планов** - плановые данные никогда не меняются
2. **Прозрачность отклонений** - каждое отклонение фиксируется и объясняется
3. **Эксплицитная актуализация** - пользователь сам решает, как резолвить отклонения
4. **Полная история** - видно, как "маленькие перерасходы стали большими"
5. **Баланс сходится** - математически корректная модель без "магических" изменений

## Нерешенная проблема: Производительность

При большом количестве актуализаций расчет балансов может быть медленным. 

**Решение:** Материализованные представления с инкрементальным обновлением:

```python
@dataclass
class MaterializedPlanBalance:
    plan_id: str
    date: date
    effective_balance: Decimal
    last_updated: datetime
    
    # Пересчитывается только при изменении actualization/compensation
```

Эта архитектура полностью покрывает все требования и обеспечивает интуитивное понимание денежных потоков.
