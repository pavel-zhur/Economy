Ниже приведён анализ того, какие сущности (таблицы/объекты) могут потребоваться для поддержки описанных вьюшек, какие у них ключевые смысловые атрибуты и как они между собой связаны. Я предлагаю два различных подхода к моделированию: «полиморфный Plan» и «раздельные Plan-типы»; оба варианта достаточно просты, но по-своему удобны и развиваемы.

---

## Вариант 1. Единая сущность `Plan` с полем `type`

### Идея

Вместо того чтобы заводить отдельные таблицы для «фондов», «накоплений», «планируемых расходов» и т. п., мы храним всё в одной табличке `Plan`, а различаем поведение по полю `type`. Схема данных сводится к минимальному набору сущностей: `User` (или `Account`), `Plan`, `Transaction`, `Allocation` (для привязки транзакций к планам), `Category`, `InventorySnapshot`. Благодаря полю `type` в `Plan` можно очень гибко определять логику: что считается накоплением, что фондом, что расходом и т. д.

#### Сущности и ключевые поля

1. **User** (или «кошелёк», «учётная запись»)

   * Здесь могут храниться базовые данные пользователя: идентификатор, настройки валюты/валют, текущий остаток «вне планов» (cash-pool) и пр.
   * **Смысл**: владельцы всех планов и транзакций. В большинстве представлений берётся суммарный баланс именно этого аккаунта.

2. **Plan**

   * `user_id` — владелец плана.
   * `type` — «fund» (фонд), «savings» (накопление), «planned\_expense» (планируемый расход), «planned\_income» (планируемый доход) и т. д.
   * `name` — название (например, «Отпуск», «Нерезервные расходы»).
   * `parent_plan_id` (опционально) — связь «родитель → дочерний план», если нужно строить иерархию (например, фонд «Покупка дома» может включать «Начальный взнос» и «Ремонт»).
   * `goal_amount` — для накоплений/фондов: целевая сумма.
   * `goal_date` — дедлайн (для накоплений/фондов).
   * `auto_spend_all` — булевый флаг «тратить все поступления» (важно, чтобы автоматически «исчерпывать» бюджет и не показывать в некоторых вьюхах).
   * `current_balance` — актуальный остаток в рамках этого плана. Этот баланс обновляется либо при каждой транзакции, либо по расписанию (см. комментарии ниже).
   * `min_pessimistic_target` — «минимальная пессимистичная цель» (откуда берётся пунктирная линия на прогнозах).
   * `target_point_dates` — (список или связанная сущность) отмеченные на графике «точки» — когда и какая сумма должна быть достигнута (например, промежуточные цели).
   * `created_at`, `updated_at` — таймстемпы для аудита.

   **Смысл и нюансы**

   * Поле `type` даёт гибкость: если `type = 'planned_expense'`, значит это именно планируемая тратя, и в вьюхах мы будем фильтровать такие записи, показывать их по датам (аналогично и с `'planned_income'`, но они в некоторых представлениях не отображаются).
   * Если `type = 'fund'` или `type = 'savings'`, это «накопительный план»; для них важны поля `goal_amount`, `goal_date`, `min_pessimistic_target`, а баланс растёт по поступлениям.
   * Флаг `auto_spend_all` используется, чтобы не отображать «ультра-консолидации» (в тех вьюхах, где нужно скрыть фонды, которые сразу всё «выкачивают»).
   * `parent_plan_id` даёт возможность группировать планы (например, можно строить дерево фондов/накоплений). В ряде вьюх может быть необходимость агрегировать «корневые» фонды отдельно от дочерних.

3. **Transaction**

   * `plan_id` (опционально) — прямая привязка транзакции к какому-либо плану (если трата/доход фиксируется «в рамках» заранее созданного плана).
   * `user_id` — владелец транзакции (тот же, что в Plan).
   * `date` — дата совершения (или учёта) транзакции.
   * `amount` — положительное число: сумма.
   * `direction` — «income» или «expense».
   * `category_id` (опционально) — ссылка на справочник категорий (чтобы в вьюхах по категориям сгруппировать).
   * `source_account_id` и/или `destination_account_id` — (если у пользователя несколько кошельков/счётов, с которых или на которые списали/зачислили деньги). Можно свести к `account_id` + булев флаг («из»/«в»), но иногда удобнее хранить две колонки.
   * `is_planned` — булево: была ли это запланированная транзакция (приход/расход)?
   * `planned_date` — если `is_planned = true`, то когда ожидалось.
   * `actual_date` — если план перешёл в факт, фактическая дата исполнения.
   * `status` — enum «planned», «executed», «cancelled»; помогает фильтровать «просроченные, но ещё не выполненные» планы (в Вьюхе 1).
   * `notes` — свободный текст (например, описание покупки).
   * `created_at`, `updated_at`.

   **Смысл и нюансы**

   * Поле `is_planned` + `planned_date` позволяют хранить и будущие, и уже перенесённые в факт транзакции в одном месте.
   * Если, скажем, запланирован расход, но ещё не случился (уровень «planned\_date < today && status = planned»), а «деньги на него уже зарезервированы» (смотрите далее Allocation), то он должен попасть в Вьюху 1 (ближайшие запланированные расходы с прошедшей датой + реальные средства).
   * При исполнении транзакции мы должны обновить `status → executed` и установить `actual_date`, а также списать средства из того же плана/фонда (через Allocation) и понизить его `current_balance`.
   * Если транзакция не связана ни с одним планом (`plan_id = NULL`), она становится «некомпанованной» (для Вьюхи 7).

4. **Allocation**

   * `transaction_id` — связанная транзакция (доход или расход).
   * `plan_id` — план, по которому распределяются средства.
   * `amount` — сколько из суммы этой транзакции «отошло» на данный план.
   * `is_predicted` — булево: «фактическое распределение» или «прогноз» (для будущих транзакций/доходов мы создаём записи Allocation с `is_predicted = true`).
   * `created_at` — время, когда сделана связь.

   **Смысл и нюансы**

   * Классическая «many-to-many» между транзакциями и планами, только с указанием суммы. Именно из неё мы будем строить Вьюхи 2 и 4, чтобы показать, сколько процентов/суммы реально ушло на каждый план.
   * Плюс можно отдельно хранить «правила автораспределения» (например, при `transaction.type = income` сперва `X%` идёт в Fund A, `Y%` — в Savings B и т. д.), но если мы хотим «правила» хранить явно, то нужно завести ещё сущность `AllocationRule`. В простейшем варианте правило можно кодировать прямо внутри бекенда, а в базе хранить только результат в Allocation.
   * За счёт флага `is_predicted` мы отличаем «прогнозное распределение» (для будущих доходов/расходов) от «реального», что важно в Вьюхе 4: сравниваем прогноз и факт.

5. **Category**

   * `user_id` — владелец набора категорий (у каждого могут свои).
   * `name` — название категории («Продукты», «Развлечения» и т. д.).
   * `parent_category_id` (опционально) — для вложенности (например, «Дом» → «Коммуналка»).
   * `type` — «expense», «income» или «both».
   * `created_at`, `updated_at`.

   **Смысл и нюансы**

   * Служит для Вьюхи 4 (распределение по категориям), а также для маркировки «нерегулярных» транзакций (можно пометить одноразовые расходы специальной категорией или флагом).
   * При анализе «нерегулярных доходов и расходов» (Вьюха 14) можно отбирать транзакции с определёнными категориями либо с признаком «recurring = false».

6. **InventorySnapshot**

   * `user_id`.
   * `date` — дата инвентаризации.
   * `actual_wallet_balance` — фактическая сумма, зафиксированная «на руках» или в банковских приложениях (можно хранить в JSON-поле разбивку по кошелькам/счетам).
   * `calculated_transaction_balance` — сумма, которую «должны» показывать транзакции (агрегатно).
   * `difference` — разница (`actual_wallet_balance – calculated_transaction_balance`), сразу считается и сохраняется.
   * `notes`.

   **Смысл и нюансы**

   * Нужна для Вьюхи 5: сравнение «баланс по кошелькам» и «баланс по транзакциям».
   * Храним эти данные, чтобы потом строить график отклонений (две линии).
   * Одновременно можем сохранять детализацию по каждому «Account» (счёту); тогда в JSON/отдельной связанной табличке можно хранить `{ account_id: balance }` для каждого.

7. **Account** (опционально, если у пользователя несколько «кошельков»/счетов)

   * `user_id`.
   * `name` («Наличные», «Карта Х», «Сберегательная»).
   * `type` — «cash», «bank\_account», «credit\_card» и т. д.
   * `current_balance` — чтобы сразу знать, сколько денег «там».
   * `created_at`, `updated_at`.

   **Смысл и нюансы**

   * Позволяет привязать транзакцию к конкретному кошельку.
   * В некоторых вьюхах (6, 5) нужно считать «сколько времени деньги лежали в кошельке» до трат; то есть, для каждой транзакции важно знать, в каком счёте она была получена.
   * Если упростить и разрешить у пользователя только 1 счёт, то `Account` можно опустить, а все балансы хранить внутри `Plan` и `InventorySnapshot`.

---

### Связи и механика

1. **Планируемые расходы (Вьюха 1).**

   * Ищем все `Plan` с `type = 'planned_expense'` и `current_balance > 0` (т. е. «на них уже есть деньги»).
   * Учитываем транзакции, где `transaction.is_planned = true && transaction.status = 'planned' && transaction.planned_date <= today`. Эти планы уже прошли по дате, но ещё не закрылись.
   * Сортировка по `planned_date` (с «устаревших» к ближайшим будущим).

2. **Распределение фактических денег по планам (Вьюха 2).**

   * Берём все `Plan` без `auto_spend_all` и с `current_balance > 0`. Группируем по их `type` (`fund`, `savings`, `planned_expense`) и для каждого считаем долю: `plan.current_balance / user_total_balance`.
   * `user_total_balance` можно хранить либо в `User.current_balance` (агрегатно), либо вычислять на лету: сумма `current_balance` всех «корневых» планов + «свободные» деньги.

3. **Будущее распределение по фондам и накоплениям (Вьюха 3).**

   * Интересуют `Plan.type in ('fund', 'savings')` **и** `!auto_spend_all`.
   * Для прогнозов: строим временную шкалу (например, по месяцам).

     1. Берём текущее `current_balance` в каждом таком плане.
     2. «Накатываем» на каждый период все будущие запланированные транзакции: те `Transaction` с `is_planned = true && planned_date > today && direction = income && allocation.is_predicted = true && allocation.plan_id = соответствующий`.
     3. Получаем «прогнозируемый баланс» на конец каждого периода: `balance_{n+1} = balance_n + sum(future_allocations) − sum(future_auto_expenses/расходы)`.
   * Для «минимальных пессимистичных целей» используем `Plan.min_pessimistic_target` и строим на графике пунктирную линию до `goal_date`.
   * «Точки цели» (маркеры) берутся из списка `Plan.target_point_dates`: каждое такое значение (дата+сумма) отмечается как точка.
   * Для сравнения «реального и прогнозного» из прошлого (с начала) до сегодня нужно:

     1. Исторические изменения `Plan.current_balance` (либо хранить их в `PlanBalanceHistory`, либо вычислять через все `Allocation` с `is_predicted=false` + «фактические расходы»).
     2. График рисуется: ось X — время; ось Y — сумма в фондах/накоплениях; две линии: фактическая (с учётом всех выполненных транзакций) и прогнозная (с учётом future allocations).

4. **Распределение доходов по планам, расходам и категориям (Вьюха 4).**

   * **Режим «по планам»:**

     * Берём все реальные транзакции `direction = income && status = executed`.
     * Для каждой из них смотрим связанные `Allocation` c `is_predicted=false` (сколько реально ушло в каждый план).
     * Аналогично, для будущих доходов (запланированных) берём `Transaction` с `is_planned = true && direction = income` + связанные `Allocation` с `is_predicted=true`.
     * Суммируем по планам: `sum(real_amount)` и `sum(predicted_amount)`.
   * **Режим «по расходам»:**

     * Берём реальные расходы `direction = expense && status = executed`, группируем по `category_id` и показываем, куда действительно ушли деньги.
   * **Режим «по категориям»:**

     * В прошлом: просто аггрегируем реальные `Transaction` с `direction = expense` по `category_id`.
     * В будущем: если в правилах есть пред-распределение «из доходов в категории», то тоже можно хранить их в `Allocation` с `plan_id = NULL` и `category_id != NULL` + `is_predicted = true`.

5. **Инвентаризация и соответствие баланса кошельков (Вьюха 5).**

   * Берём все `InventorySnapshot` для `user` с их `date`, `actual_wallet_balance` и `calculated_transaction_balance`.
   * Выводим таблицу: `date | actual | calculated | difference`.
   * Для графика: две линии (`actual_wallet_balance` и `calculated_transaction_balance`) по датам.

6. **Время задержки средств (Вьюха 6).**

   * Извлекаем все реальные доходы (`Transaction` с `direction = income && status = executed`).
   * Для каждого ищем первую «расходную» транзакцию, в которой хоть часть этих денег была «использована». Здесь может быть нюанс: связи «Income → Expense» обычно не очевидна.

     * **Вариант решения № 1 (проще):** считать, что «каждая расходная транзакция» забирает деньги из самых «старых непотраченных» поступлений (минимум FIFO). Тогда можно расчитать:

       1. Проходим по всем доходам и считаем их даты и суммы.
       2. По мере появления расходов «списываем» «ранее» приходы и вычисляем разницу дат: когда приходил рубль → когда он списался.
       3. Из этого строим распределение «приход — расход» и замеряем дельту дат (`expense.date − income.date`).
     * **Вариант решения № 2 (гранулированный):** заводим сущность `FundsLag` с `income_transaction_id`, `expense_transaction_id`, `used_amount` и `days_diff`. Тогда одно-к-один или one-to-many между доходом и расходами (если приход «разрезается» на несколько трат).
   * После этого получается «ось X = дата прихода», «ось Y = дни до использования», и строим scatter-plot или histogram.

7. **Планы с отрицательным балансом и неподкреплённые транзакции (Вьюха 7).**

   * **Первая таблица («отрицательные планы»)**

     * Достаём все `Plan` с `parent_plan_id = NULL && current_balance < 0`.
     * Считаем общий негативный остаток: `sum(abs(current_balance))`.
   * **Вторая таблица («непривязанные транзакции»)**

     * Вытягиваем все `Transaction` с `plan_id = NULL && status = executed` (и, возможно, `direction = expense`, чтобы показать «недокументированные» расходы).
     * Считаем их сумму.

8. **Баланс планов во времени (Вьюха 8).**

   * Для каждого плана (чаще всего `Plan.type in ('fund','savings','planned_expense')`) строим time-series:

     1. Берём момент «начала» (дата создания плана или начало периода) и текущее значение `Plan.current_balance`.
     2. Накатываем на каждый день/месяц все транзакции (через `Allocation`), которые влияют на этот план (и реальные, и запланированные).
     3. По итогу получаем таблицу `(plan_id, date, balance)`.
   * Можно хранить это где-то в `PlanBalanceHistory (plan_id, date, balance)` (обновляя ежедневно/ежемесячно), либо считать «on the fly» при запросе: просто пробегая все транзакции/alloсations до нужной даты.

---

## Вариант 2. Разделение сущностей по типам планов

Если хочется более жёстко «раскласть» разные виды планов, чтобы в коде сразу не проверять `type = 'planned_expense'` и не хранить «лишние» колонки, можно завести отдельные таблицы:

* `Fund` (справочник фондов),
* `Saving` (справочник накоплений),
* `PlannedExpense` (справочник планируемых трат),
* `PlannedIncome` (справочник планируемых доходов).

Они все наследуются от базовой `BasePlan` (можно через single-table inheritance или concrete-table inheritance, в зависимости от СУБД).

### 2.1. Сущность `BasePlan` (общие поля)

* `id`, `user_id`, `name`, `parent_plan_id`, `current_balance`, `auto_spend_all`, `created_at`, `updated_at`.

### 2.2. Сущность `Fund`

* В плюс к `BasePlan`: `goal_amount`, `goal_date`, `min_pessimistic_target`, `target_point_dates` (как в первом варианте).
* Поле `status` (активен/архивирован и т. д.).

### 2.3. Сущность `Saving`

* Похожие поля, но с `type = 'saving'`.
* Может быть поле `recurring_contribution` (сколько ежемесячно/еженедельно должно добавляться), чтобы при прогнозе автоматически «накатывать» деньги.

### 2.4. Сущность `PlannedExpense`

* Унаследована от `BasePlan`.
* Дополнительные поля: `planned_date`, `amount_expected` (сколько предполагается потратить), `actual_transaction_id` (связь после исполнения).
* Флаг `is_reserved` (если уже зарезервированы средства).

### 2.5. Сущность `PlannedIncome`

* Унаследована от `BasePlan`.
* Поля: `planned_date`, `amount_expected`, `from_source` (например, зарплата, фриланс и т. д.), `recurrence_rule` (если периодический).

### 2.6. Transaction и Allocation

* В целом, те же самые, только при привязке мы оперируем конкретными таблицами:

  * У транзакции есть либо `planned_expense_id` (для списания запланированных трат),
  * либо `planned_income_id` (для фиксирования входа денег),
  * либо прямой `fund_id`/`saving_id` (если списывается со счёта самого фонда/накопления),
  * либо `null` (если «неподкреплённый»).

* Таблица `Allocation` может ссылаться на конкретную таблицу плана (через `plan_type + plan_id`), или же сразу использовать generic FK, если СУБД позволяет (например, PostgreSQL с inheritance).

### 2.7. Остальные сущности

* `Category`, `Account`, `InventorySnapshot`, `FundsLag` (для расчёта задержек) остаются теми же, что и в первом варианте.

---

## Обоснование выбора и основные различия

1. **Полиморфный `Plan`** (Вариант 1)

   * **Плюсы:**

     * Никакой дубликации схемы: одна таблица – одно место поддержания.
     * Легко добавлять новый тип плана: просто новое значение в `type` + бизнес-логику.
     * Проще строить агрегации по всем «планам» сразу (нет UNION между таблицами).
   * **Минусы:**

     * В «Plan» будет набор полей, которые не у всех типов актуальны (например, у «planned\_expense» поле `goal_amount` бессмысленно).
     * В коде придётся часто проверять «если `type = …`».
   * **Когда подходит:**

     * Если хочется максимально упростить схему, быстро добавить новые виды планов.
     * Когда разные план-типы во многом пересекаются по атрибутам и поведению.

2. **Раздельные таблицы по типам Plan** (Вариант 2)

   * **Плюсы:**

     * У каждой сущности «только свои» поля — нет лишнего.
     * Чёткая разделённость бизнес-логики: «всё, что про фонд – в Fund», «всё, что про траты – в PlannedExpense».
     * Иногда это упрощает написание SQL-запросов без условий `WHERE type = …`.
   * **Минусы:**

     * При необходимости собрать «все планы сразу» нужны UNION’ы или дополнительная сущность-«вид» (view), которая объединяет таблицы.
     * Сложнее добавлять новый «тип» плана: придётся создавать новую таблицу, проставлять связи, миграции.
   * **Когда подходит:**

     * Если бизнес-логика сильно расходится между «фондом» и «планируемым расходом» и хочется, чтобы в базе это было максимально разграничено.
     * Когда в будущем может быть очень много разных типов, и они будут иметь уникальные наборы полей.

---

## Тонкие моменты и подсказки по реализации

1. **Хранение балансов vs вычисление на лету**

   * Мы можем либо **поддерживать `Plan.current_balance` актуальным** при каждой транзакции (снимать/добавлять сумму из плана), либо **рассчитывать его при каждом запросе** как `sum(allocations_for_plan)`.
   * Первый вариант даёт мгновенный быстрый доступ к «теку́щему балансу» (нужно лишь читать `current_balance`), но требует точно следить за атомарными транзакциями (если Allocation + Transaction + update Plan не в одной транзакции, возможны рассинхроны).
   * Второй вариант (агрегация) надёжнее «с точки зрения консистентности», но медленнее при большом объёме данных. Обычно выбирают гибрид: хранят `current_balance`, но периодически (или на старте приложения) пересчитывают его целиком через сводные Allocation, чтобы избежать «утекших» рассинхронов.

2. **Прогнозирование (Forecast)**

   * В обоих вариантах прогнозы «на будущее» можно генерировать динамически при запросе, основываясь на запланированных транзакциях и правилах распределения.
   * Если ожидается большое число пользователей и сложная логика прогноза, можно создавать **отдельную таблицу `Forecast (plan_id, date, predicted_balance, pessimistic_target, optimistic_target)`** и наполнять её всё время заново (cron-job). Это позволяет очень быстро выдавать вьюхи 3, 8 и другие, не вычисляя прогноз «на лету».

3. **Запланированные транзакции и автоматические переводы**

   * При реализации нужно чётко различать «запланированную транзакцию» и «распределение средств»:

     * Пользователь создаёт PlannedExpense/PlannedIncome.
     * Система автоматически резервирует нужную сумму (либо сразу, либо когда доход поступит).
     * Allocation привязывает деньги из конкретной транзакции (income) к нужному плану.
   * Для сценария «автоматическое расходование всего поступления» (`auto_spend_all`), когда из любого прихода сразу уходит «все деньги» (например, пользователь не хочет хранить остаток, а тратит весь приход в виде какого-то фонда), нужно в AllocationRule прописать «вся сумма поступления должна уйти в Plan X», и создать Allocation с `amount = transaction.amount` при поступлении.

4. **Связь между доходами и расходами (FIFO) для расчёта задержек (Вьюха 6)**

   * Чтобы корректно построить «сколько дней деньги лежали до использования», можно:

     * В момент прихода создавать запись `AvailableFund (income_txn_id, available_amount, date_received)`.
     * Когда появляется расход, «списывать» нужную сумму из самой «старой» записи AvailableFund (FIFO) и создавать `FundsLag (income_txn_id, expense_txn_id, used_amount, days_diff)`.
   * Это позволяет в разрезе каждого куска денег понять, сколько он пролежал, и строить гистограммы/диаграммы по задержкам.

5. **Распределение «неподкреплённых» транзакций (Вьюха 7)**

   * Если у транзакции `plan_id = NULL` (или Allocation вообще отсутствует), она считается «непривязанной».
   * В вьюхе лучше выводить «transaction.id, date, amount, category, описание».

6. **Иерархия планов**

   * `parent_plan_id` даёт возможность строить «дерево» планов (например, «Дом → Ремонт → Электрика»).
   * По нему удобно строить агрегированное отображение «баланса родительского плана = сумма балансов дочек + собственные резервы».
   * При рассчётах прогнозов и аналитике нередко нужно смотреть, уйдёт ли на дочерний план или «центр затрат» (родительское значение).

7. **Календарь финансовых событий (Вьюха 15)**

   * Можно хранить каждый «событийный момент» как запись в отдельной таблице `Event` (`user_id`, `date`, `type`, `related_plan_id`, `description`).
   * «Типы» в календаре: запланированный доход, запланированный расход, инвентаризация, достижение цели, годовщина, напоминание.
   * Тогда в календаре берём все события из `Event` ИЛИ храним View, объединяющий `PlannedIncome.plan_date → Event`, `PlannedExpense.planned_date → Event`, `InventorySnapshot.date → Event` и т. д.

8. **История отклонений от плана (Вьюха 11)**

   * Нужна таблица `PlanDeviation (plan_id, period_start, period_end, planned_amount, actual_amount, deviation_percentage)` — её можно заполнять регулярно.
   * Либо в вьюхе вычислять «`sum(Transaction.amount where Transaction.is_planned=true && plan_id = X && planned_date between месяцы)`” и сравнивать с тем, что реально ушло “`sum(Transaction.amount where status = executed && related to X && actual_date between месяцы)`».
   * Вычисление «on the fly» даёт свежие данные, но может быть медленнее; если база масштабная, стоит кэшировать в `PlanDeviationHistory`.

---

## Итоговые диаграммы (упрощённо в текстовом виде)

### Вариант 1 (полиморфный Plan)

```
User
 ├── id
 ├── name, currency, settings…
 └── current_balance

Plan
 ├── id
 ├── user_id → User.id
 ├── type (‘fund’, ‘savings’, ‘planned_expense’, ‘planned_income’)
 ├── name
 ├── parent_plan_id → Plan.id (nullable)
 ├── goal_amount (nullable; только для ‘fund’/‘savings’)
 ├── goal_date (nullable)
 ├── min_pessimistic_target (nullable)
 ├── target_point_dates (json или отдельная таблица)
 ├── auto_spend_all (bool)
 ├── current_balance
 ├── created_at, updated_at

Transaction
 ├── id
 ├── user_id → User.id
 ├── plan_id → Plan.id (nullable)
 ├── direction (‘income’/‘expense’)
 ├── amount
 ├── date (если is_planned = false, то фактическая дата; иначе фактическая)
 ├── planned_date (nullable; если is_planned=true)
 ├── actual_date (nullable; после исполнения)
 ├── status (‘planned’, ‘executed’, ‘cancelled’)
 ├── category_id → Category.id (nullable)
 ├── source_account_id → Account.id (nullable)
 ├── destination_account_id → Account.id (nullable)
 ├── is_planned (bool)
 ├── notes
 ├── created_at, updated_at

Allocation
 ├── id
 ├── transaction_id → Transaction.id
 ├── plan_id → Plan.id
 ├── amount
 ├── is_predicted (bool)
 ├── created_at

Category
 ├── id
 ├── user_id → User.id
 ├── name
 ├── parent_category_id → Category.id (nullable)
 ├── type (‘expense’/‘income’/‘both’)
 ├── created_at, updated_at

Account
 ├── id
 ├── user_id → User.id
 ├── name
 ├── type (‘cash’, ‘bank’, ‘credit_card’…)
 ├── current_balance
 └── created_at, updated_at

InventorySnapshot
 ├── id
 ├── user_id → User.id
 ├── date
 ├── actual_wallet_balance (decimal/JSON по разным счётам)
 ├── calculated_transaction_balance (decimal)
 ├── difference
 ├── notes
 └── created_at, updated_at

FundsLag (опционально для Вьюхи 6)
 ├── id
 ├── income_transaction_id → Transaction.id (direction = income)
 ├── expense_transaction_id → Transaction.id (direction = expense)
 ├── used_amount
 ├── days_diff (или вычисляется на лету из дат)
 └── created_at
```

### Вариант 2 (раздельные Plan-типы)

```
User
 ├── id
 ├── name, currency, settings…
 └── current_balance

Fund (наследует BasePlan)
 ├── id
 ├── user_id → User.id
 ├── name
 ├── parent_fund_id → Fund.id (nullable)
 ├── goal_amount
 ├── goal_date
 ├── min_pessimistic_target
 ├── auto_spend_all
 ├── current_balance
 └── created_at, updated_at

Saving ( ⊂ BasePlan )
 ├── id
 ├── user_id → User.id
 ├── name
 ├── parent_saving_id → Saving.id (nullable)
 ├── goal_amount
 ├── goal_date
 ├── recurring_contribution (decimal; например, 1000 ₽/месяц)
 ├── auto_spend_all
 ├── current_balance
 └── created_at, updated_at

PlannedExpense ( ⊂ BasePlan )
 ├── id
 ├── user_id → User.id
 ├── name
 ├── parent_expense_plan_id → PlannedExpense.id (nullable)
 ├── planned_date
 ├── amount_expected
 ├── is_reserved (bool)
 ├── actual_transaction_id → Transaction.id (nullable)
 ├── current_balance (зарезервировано)
 └── created_at, updated_at

PlannedIncome ( ⊂ BasePlan )
 ├── id
 ├── user_id → User.id
 ├── name
 ├── parent_income_plan_id → PlannedIncome.id (nullable)
 ├── planned_date
 ├── amount_expected
 ├── recurrence_rule (cron-like или реляционный)
 └── created_at, updated_at

Transaction
 ├── id
 ├── user_id → User.id
 ├── amount
 ├── date
 ├── direction (‘income’/‘expense’)
 ├── status (‘planned’, ‘executed’, ‘cancelled’)
 ├── fund_id → Fund.id (nullable)
 ├── saving_id → Saving.id (nullable)
 ├── planned_expense_id → PlannedExpense.id (nullable)
 ├── planned_income_id → PlannedIncome.id (nullable)
 ├── category_id → Category.id (nullable)
 ├── source_account_id → Account.id (nullable)
 ├── destination_account_id → Account.id (nullable)
 ├── is_planned (bool)
 ├── notes
 ├── created_at, updated_at

Allocation
 ├── id
 ├── transaction_id → Transaction.id
 ├── target_type (‘fund’, ‘saving’, ‘planned_expense’, ‘planned_income’)
 ├── target_id (FK на соответствующую таблицу)
 ├── amount
 ├── is_predicted (bool)
 └── created_at

Category
 ├── id
 ├── user_id → User.id
 ├── name
 ├── parent_category_id → Category.id (nullable)
 ├── type (‘expense’/‘income’/‘both’)
 └── created_at, updated_at

Account
 ├── id
 ├── user_id → User.id
 ├── name
 ├── type
 ├── current_balance
 └── created_at, updated_at

InventorySnapshot
 ├── id
 ├── user_id → User.id
 ├── date
 ├── actual_wallet_balance
 ├── calculated_transaction_balance
 ├── difference
 └── created_at, updated_at

FundsLag
 ├── id
 ├── income_transaction_id → Transaction.id
 ├── expense_transaction_id → Transaction.id
 ├── used_amount
 ├── days_diff
 └── created_at
```

---

## Примеры конкретных сценариев и «тонкие моменты»

1. **«Ближайшие запланированные расходы, на которые есть деньги» (Вьюха 1).**

   * В Варианте 1:

     ```sql
     SELECT p.name, p.planned_date, p.current_balance
       FROM Plan p
      WHERE p.type = 'planned_expense'
        AND p.current_balance > 0
        AND p.planned_date IS NOT NULL
        AND p.status = 'planned'
      ORDER BY p.planned_date ASC;
     ```
   * В Варианте 2 (конкретно из `PlannedExpense`):

     ```sql
     SELECT pe.name, pe.planned_date, pe.current_balance
       FROM PlannedExpense pe
      WHERE pe.current_balance > 0
        AND pe.status = 'planned'
      ORDER BY pe.planned_date ASC;
     ```

2. **«Распределение фактических средств» (Вьюха 2).**

   * В Варианте 1 для каждого плана типа `fund`, `savings`, `planned_expense`, где `!auto_spend_all`, делаем долю:

     ```sql
     WITH total AS (
       SELECT SUM(p.current_balance) AS sum_balance
         FROM Plan p
        WHERE p.auto_spend_all = false
     )
     SELECT p.id, p.name, p.type,
            p.current_balance,
            p.current_balance / t.sum_balance AS pct_from_total
       FROM Plan p
       CROSS JOIN total t
      WHERE p.auto_spend_all = false
        AND p.current_balance > 0
      ORDER BY p.type, pct_from_total DESC;
     ```
   * В Варианте 2 получают аналогичную логику, только придётся разбивать по таблицам `Fund`, `Saving`, `PlannedExpense` и потом агрегировать, либо сделать UNION.

3. **«Прогноз по фондам и накоплениям» (Вьюха 3).**

   * При полиморфном `Plan` достаточно отфильтровать `Plan.type IN ('fund','savings') AND auto_spend_all = false`.
   * Рядом идёт сборка будущих транзакций:

     ```sql
     SELECT alloc.plan_id, t.planned_date::date AS period, SUM(alloc.amount) AS predicted_inflow
       FROM Transaction t
       JOIN Allocation alloc ON alloc.transaction_id = t.id
      WHERE t.is_planned = true
        AND t.direction = 'income'
        AND alloc.is_predicted = true
        AND alloc.plan_id IN (
            SELECT id FROM Plan
             WHERE type IN ('fund','savings') AND auto_spend_all = false
        )
      GROUP BY alloc.plan_id, period;
     ```
   * Аналогично выгружаем «пессимистичные цели» (`Plan.min_pessimistic_target`) и точки достижения (`Plan.target_point_dates`). График строится клиентом, база отдаёт временные ряды (или их кэш в `PlanBalanceHistory`).

4. **«Время задержки средств» (Вьюха 6) и «FundsLag».**

   * Алгоритм FIFO можно делать на уровне приложения, но если хотят хранить в виде сущности `FundsLag`, то:

     1. Проходим по всем транзакциям с `direction = income && status = executed`, заводим `AvailableFund(income_id, amount_remaining, date_received)`.
     2. Проходим по расходам по дате (ASC), снимаем нужные суммы из самого старого `AvailableFund`.
     3. Создаём `FundsLag(income_id, expense_id, used_amount, days_diff = expense.date – income.date)`.
   * В базе останутся готовые записи `FundsLag`, которые легко агрегировать в нужные вьюхи (scatter plot или histogram).
   * Если такой сущности нет, то «on the fly» придётся:

     ```sql
     SELECT inf.id AS income_id,
            exp.id AS expense_id,
            exp.date - inf.date AS days_diff,
            LEAST(inf.amount_remaining, exp.amount) AS used_amount
       FROM AvailableFund inf
       JOIN Expense exp ON (some FIFO logic)
     ```

     но реляционно FIFO тяжело выразить без кеширующего слоя — проще хранить `FundsLag`.

5. **«Календарь финансовых событий» (Вьюха 15).**

   * Вместо отдельного `Event` можно делать UNION:

     ```sql
     SELECT planned_date AS date, 'income' AS event_type, name AS description
       FROM PlannedIncome
      UNION ALL
     SELECT planned_date AS date, 'expense' AS event_type, name AS description
       FROM PlannedExpense
      UNION ALL
     SELECT date AS date, 'inventory' AS event_type, 'Инвентаризация' AS description
       FROM InventorySnapshot
      ORDER BY date;
     ```
   * Либо хранить унифицированно: `Event(id, user_id, date, type, related_plan_type, related_plan_id, notes)`.

---

## Итоговый вывод и рекомендации

1. **Если вам нужно максимально просто «охватить» весь функционал без множества отдельных таблиц** — выбирайте **Вариант 1** (полиморфный `Plan`). Он легко расширяется: когда появляется новая категория «планируемых расходов» с уникальными полями, можно добавить пару колонок и новую переменную `type`.
2. **Если же для вас важно, чтобы у «фонда», «накопления» и «планируемого расхода» были собственные строго определённые схемы, без «мусора»** (т. е. чтобы ноль «лишних» nullable-полей) — берите **Вариант 2** (раздельные Plan-типы). Он чуть более громоздкий в миграциях, но код и SQL-запросы получаются чище в каждой конкретной задаче.
3. **Во всех вариантах** потребуется:

   * Таблица «транзакций» с привязкой к планам (или generic FK, или отдельной колонкой `plan_id`).
   * Таблица «распределения (Allocation)», чтобы отслеживать, куда и в каком объёме ушли деньги из каждого прихода (для факта и прогноза).
   * Таблица «инвентаризация» для примыкания к реальным балансам на момент ревизии (Вьюха 5).
   * Опционально: таблица «FundsLag» для FIFO-связи доход-расход (Вьюха 6).

Таким образом, предложенная простая, но гибкая модель покрывает все заявленные вьюхи, при этом остаётся достаточно «лёгкой» в сопровождении. Уверен, что на её базе легко построить любые из описанных диаграмм, таблиц и прогнозов.
