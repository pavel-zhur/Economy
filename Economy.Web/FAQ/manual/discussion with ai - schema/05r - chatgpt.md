Ниже приведён скорректированный и расширенный взгляд именно на сущность **Plan** (План), её внутренние поля и поведение «во времени» с учётом всех ваших доозаписанных требований. В частности:

1. ```
   **Явная разница между плановыми и фактическими транзакциями** и возможность вручную «актуализировать» перерасходы/недодачи, чтобы плановый баланс не изменялся сам собой.  
   ```
2. ```
   Строгий принцип **равенства сумм балансов**: ни рубль не берётся ниоткуда и не улетает никуда, а любое «расхождение» между планом и фактом остаётся в истории, пока вы его не «закроете».  
   ```
3. ```
   Описание **потока времени**, то есть как «будущее» (виртуальные события) переходит в «прошлое» (фактические), и какие нюансы возникают.  
   ```
4. ```
   Упоминание про **активы**, **налоговые счёта**, **кошельки с комиссией**, **долги** и т. д. — и как всё это «вписывается» в Plan (либо потребует лёгкого расширения).  
   ```

Цель — чтобы после прочтения этой части у вас была полностью реализуемая, без «магии», но при этом гибкая модель Plan, которая покрывает любой сценарий и не «спрыгивает» с балансов по своему усмотрению.

---

## 1. Обновлённая структура сущности Plan

```txt
Plan
 ├─ id                        — PK (уникальный идентификатор)
 ├─ user_id                   — FK → владельцу (пользователь или счёт)
 ├─ name                      — varchar: название (например, «Накопления на отпуск», «Карманные», «Недвижимость»)
 ├─ type                      — enum { 
 │                                "virtual_pool",    // «буфер» – свободные/нераспределённые деньги
 │                                "bucket_in",       // накопительный контейнер («фонд»)
 │                                "bucket_out",      // расходный контейнер («тратный план»)
 │                                "one_time_plan",   // одноразовая точка (разовый приход/расход)
 │                                "asset",           // актив (недвижимость, акции) – особый случай
 │                                "liability"        // долг – тоже особый случай
 │                             }
 ├─ parent_plan_id            — FK → Plan.id (nullable). Если задано, значит «дочерний» план от «родительского».
 ├─ priority                  — integer. Приоритет распределения денег (чем меньше, тем план «первым» получает доходы).
 ├─ actual_balance            — decimal. Фактический баланс (сколько уже пришло/потрачено) **на текущий момент**.
 ├─ reserved_balance          — decimal. Забронированная под **будущие** транзакции сумма (сумма “pending” ExpectedTransaction, пока они не закрыты в факт).
 ├─ goal_amount               — decimal (nullable). Если нужно **накопить** до этой суммы (для bucket_in/asset/ liability также служит «лимитом»).
 ├─ goal_date                 — date (nullable). Крайний срок достижения goal_amount или исполнения one-time события.
 ├─ min_pessimistic_target    — decimal (nullable). «Нижняя линия» в пессимистичном прогнозе (для bucket_in).  
 ├─ target_milestones         — JSON (nullable). Список объектов `{ "date": ДД.ММ.ГГГГ, "amount": X }` — промежуточные точки, которые важно достичь.  
 ├─ expected_weekly_amount    — decimal (nullable). Для bucket_out: «примерно столько _в неделю_ уходит».  
 ├─ expected_monthly_amount   — decimal (nullable). Для bucket_out или bucket_in: «примерно столько _в месяц_ уходит/приходит».  
 ├─ recurrence_type           — enum { "none", "weekly", "monthly", "annually" } (nullable). Определяет, **какие виртуальные события** (“будущие”) создаются.  
 ├─ recurrence_detail         — JSON (nullable). Детали для recurrence_type:  
 │                                — если `weekly`: `{ "days_of_week": ["Mon","Thu"] }`  
 │                                — если `monthly`: `{ "day_of_month": 5 }` или `{ "last_day": true }`  
 │                                — если `annually`: `{ "month":12, "day":31 }`  
 ├─ next_expected_date        — date (nullable). Дата, с которой ещё не создавались ExpectedTransaction; чтобы “лениво” генерировать будущие события.  
 ├─ auto_spend_all            — boolean. Если `true`, значит «все приходы пользователя» должны (по AllocationRule) уходить в этот план без остатка.  
 ├─ is_archived               — boolean. Если `true`, план считается закрытым (дальше не участвует в распределении, но остаётся в истории).  
 ├─ created_at                — datetime.  
 └─ updated_at                — datetime.
```

### 1.1. Два отдельных «баланса» у Plan

1. **`actual_balance`**

   * Хранит **фактически «подошедшие» или «списанные»** (из этого плана) деньги **до текущего момента**.
   * После каждой операции `Allocation` (приход или расход) мы изменяем `actual_balance`. Никогда не изменяется автоматически сама по себе, только при:

     * `Allocation` из реально «закрытых» транзакций (через `ExpectedTransaction → Transaction` или «непривязанный» real Transaction),
     * или при **ручной корректировке** (`ManualOverride` с `transaction_effective = true`).

2. **`reserved_balance`**

   * Показывает сумму, **зарезервированную под будущие события** (ExpectedTransaction) из этого плана, которые ещё не «перешли» в факт.
   * Когда создаётся `ExpectedTransaction` для будущей даты D (тип “будущий расход” или “будущий приход”), мы добавляем его в `reserved_balance` данного Plan. Это даёт вам точную картину «сколько уже «отложено» под грядущие траты (или «где осталось зарезервировано» для будущих накоплений)».
   * **Если событие никогда не происходит** (например, плановый расход в прошлое так и не перешёл в Fact), `reserved_balance` остаётся, пока вы не сделаете **ручную актуализацию** (о чём ниже).

Тогда **суммарный «баланс» Plan на любой момент** (чтобы сравнивать с родителем/детьми) можно формально определить как:

```
calculated_plan_balance = actual_balance + reserved_balance
```

(если `reserved_balance` мы хотим считать частью "total", хотя технически это уже будущие события).

> **Важно:** `actual_balance` и `reserved_balance` никогда не смешиваются автоматически. Плановый расход/приход не уменьшает/не увеличивает `actual_balance` до тех пор, пока вы не свяжете виртуальную запись (ExpectedTransaction) с фактом (`Transaction`) или **не выполните ручную актуализацию** (ManualOverride).

---

## 2. ExpectedTransaction и актуализация (over/under)

### 2.1. Что такое ExpectedTransaction

```txt
ExpectedTransaction
 ├─ id
 ├─ plan_id                — FK → Plan.id (куда этот virtual-логически «падает»)
 ├─ date                   — date (когда должно произойти)
 ├─ amount                 — decimal (сколько будет списано/зачислено)
 ├─ direction              — enum { "income", "expense" }
 ├─ scenario               — enum { "optimistic", "base", "pessimistic" }
 ├─ is_consumed            — boolean (false по умолчанию; станет true, когда факт подвяжется)
 ├─ created_at             — datetime
 └─ updated_at             — datetime
```

* **Создаётся двумя путями**:

  1. **Ручной `Plan` типа `"one_time_plan"`**: сразу при создании Plan-в-раз-дата=Пользователь ставит `date = D, amount = A, direction = expense/income`. Тогда Instant создаётся ровно один ExpectedTransaction.
  2. **Автоматически из `Plan` с `recurrence_type ≠ "none"`**:

     * У Plan есть `recurrence_type` + `recurrence_detail` + `{ "optimistic":X, "base":Y, "pessimistic":Z }` (часто спрятаны в JSON поля `expected_weekly_amount`/`expected_monthly_amount`, где это — объект вида `{ "optimistic":10000, "base":8000, "pessimistic":6000 }`).
     * Фоновая задача либо «по расписанию» (cron) или «лениво по запросу» (когда пользователь смотрит «Прогноз») вызывает генерацию ExpectedTransaction с датами от `Plan.next_expected_date` до нужного горизонта (скажем, «до конца квартала»).

> **Ни в коем случае** сама по себе генерация ExpectedTransaction **не меняет** ни `actual_balance`, ни `reserved_balance`.
> Мы лишь регистрируем факт, что “в понедельник 14-го у нас должен быть расход 2000”. Реальный отбор денег (`reserved_balance += 2000`) происходит только после того, как мы явно «забронировали» эти средства или дали команду «зарезервировать» (например, пользователь хочет увидеть «я хочу, чтобы эти 2000 ₽ просто стояли в резерве»).

### 2.2. Когда и как мы увеличиваем `reserved_balance`

* **Автоматически при генерации** ExpectedTransaction можно:

  * Либо **внутри** создающей процедуры сразу прибавлять `Plan.reserved_balance += amount` (чтобы “резерв” уже отображался),
  * Либо откладывать увеличение `reserved_balance` на **момент первой ручной актуализации** (но это риск — пользователь не увидит «сколько зарезервировано» до того, как он зайдёт в детали).

**Рекомендованный вариант** (чтобы интерфейс нёс меньше «сюрпризов»):

1. При создании новой записи ExpectedTransaction для Plan (любого типа) **сразу** делаем

   ```sql
   UPDATE Plan
     SET reserved_balance = reserved_balance + ExpectedTransaction.amount
   WHERE id = ExpectedTransaction.plan_id;
   ```

   (проще — сразу зарезервировали).
2. Таким образом, всегда видно «сколько уже под это потрачено» даже в будущем:

   ```
   Plan.total_balance = actual_balance + reserved_balance
   ```
3. В консоли «План» покажется: «У тебя зарезервировано 10 000 ₽ под будущие траты 01.07 — это видно в reserved\_balance. Как только 01.07 наступит, plan будет показан как «долг 10 000 ₽» в списке нерешённых ExpectedTransaction; дальше ты либо подтвердишь факт – и эти 10 000 уйдут в actual\_balance, либо ты их скорректируешь вручную».

### 2.3. Факт наступил, но real Transaction отсутствует

#### 2.3.1. Ситуация «budgeted 100 ₽, но на самом деле купили за 120 ₽»

* **В ExpectedTransaction** стоит `date = 15.06.2025, amount = 100₽, direction = "expense"`.
* **В Plan.reserved\_balance** уже +100₽.
* **Однако** когда наступает 15.06/16.06, вы проверяете список «предстоящие расходы» и видите, что именно 15.06 расходов нет, зато 15.06 (или 16.06) **реально** списали 120₽ через банковский импорт/вручную.
* Стандартный автоматический механизм:

  1. Пытается найти real `Transaction(id=T)` с `related_expected_id = ET.id` (ET — обозначим номер виртуального). Если не находит, **ExpectedTransaction** остаётся в статусе `is_consumed=false`.
  2. Пользователь получает уведомление:

     > «У плана «Хобби» вчера (15.06) должен был быть расход 100₽, но система не нашла связанной транзакции. Видишь, у тебя в банке списалось 120₽. Что делать?»
  3. Пользователь в интерфейсе нажимает «Закрыть расхождение»:

     * Может выбрать «Использовать существующую транзакцию: 120₽ от 15.06» → тогда real `Transaction(120₽)` связывается с ET. В таком случае:

       * Ставим `ET.is_consumed = true`.
       * Создаём `Allocation { transaction_id = T, plan_id = ET.plan_id, amount = 100₽ }`.
       * План снимает 100₽ из `reserved_balance` и добавляет в `actual_balance`:

         ```
         Plan.reserved_balance -= 100
         Plan.actual_balance   += 100
         ```
       * Оставшиеся 20₽ (120 – 100) мы распределяем как **«неожиданный перерасход»**:

         * В зависимости от `AllocationRule` или ручного выбора, 20₽ уйдут из VirtualPool или будут перенаправлены в «общий расход» (Plan с типом bucket\_out “Мелкие незапланированные траты”).
       * Итог: Plan уже «на балансе» 100₽ перерасхода переведён в факт, а 20₽ учтены отдельно.

     * Либо пользователь может нажать «Я потратил только 80₽ (было скидка)» → тогда:

       * Связывает 80₽ real Transaction с ET (или выбирает «Закрыть ET вручную»).
       * `ET.is_consumed = true`
       * `Plan.reserved_balance -= 100` (убираем из резерва)
       * `Plan.actual_balance += 80`
       * **Оставшиеся 20₽** «вернулись в свободный резерв» (VirtualPool или прямо в этот же Plan как «лишнее»):

         ```
         delta = 100 – 80 = 20
         if Plan.type = bucket_out: 
             // из-за перерасхода «вернули» 20₽ в общий pool:
             VirtualPool.reserved_balance  += 0  (nothing changed there)
             VirtualPool.actual_balance    += 20
         else if Plan.type = one_time_plan (income):
             // аналогично...
         ```

     * Либо пользователь может решить «я просто отменяю этот расход» (скажет «этот план не нужен, удаляю»). Тогда:

       * `ET.is_consumed = true`
       * `Plan.reserved_balance -= 100`
       * `ET` можно пометить “canceled” (optionally).

**Важное замечание.**

* Именно здесь вы **ручной «актуализацией»** контролируете, когда резерв пойдёт в фактические балансы (`actual_balance`) или «спишется в минус» в пер ©ерасход, либо «вернётся» в VirtualPool как сэкономленное (`actual_balance += delta`).
* Плановый баланс (`reserved_balance`) **никогда** не меняется автоматически «по дате» — только в результате явных действий пользователя, привязки транзакции или отмены.

#### 2.3.2. Ситуация «budgeted 200 ₽, но real Transaction вообще не появится»

* После даты D вы видите, что `ET.is_consumed = false`. Система вам говорит:

  > «План «Телефон» на 200₽ 20.06 не закрыт. Возможно, ты забыл отметить покупку. Если ты не хочешь тратить эти 200₽, нажми “Отменить резерв”».
* Если вы нажимаете «Отменить резерв»:

  * `Plan.reserved_balance -= 200`
  * `ET.is_consumed = true` (или `ET` просто удаляется).
  * Эти 200₽ «остаются в virtual\_pool» (или в другом plan, если хотите вручную).

Таким образом, **запланированное никогда не превращается в факт без участи юзера**.

---

## 3. Равенство сумм балансов и иерархия parent–child

### 3.1. Внутренний «баланс» в дереве Plan

У каждого Plan есть два компонента баланса:

1. **`actual_balance`** (текущее «сколько реально уже зайшло/вышло»),
2. **`reserved_balance`** (сколько «брошено в резервы» под будущие события).

Если у Plan есть дети (child plans), то **агрегированный баланс** этого Plan (на какой-либо день, до актуализации, **включая все резервы**) считается так:

```txt
aggregated_actual_balance(plan) = plan.actual_balance + Σ [ aggregated_actual_balance(child) ] 
aggregated_reserved_balance(plan) = plan.reserved_balance + Σ [ aggregated_reserved_balance(child) ]

aggregated_total_balance(plan) = aggregated_actual_balance(plan) + aggregated_reserved_balance(plan)
```

**Именно в этих формулах кроется «равенство балансов»**:

* Если `plan` — родитель, а он **равен** сумме «всех children.actual + children.reserved + собственный actual + собственный reserved».
* Если это не выполняется, значит где-то «кто-то забыл что-то зарезервировать/увеличить» и нужно пойти, проверить детализированное представление.

> На практике это легко реализуется двумя способами:
>
> 1. **Рекурсивный SQL CTE** (PostgreSQL, MySQL 8+): в один запрос вытягиваете все descendants и складываете balances.
> 2. **Closure Table** (два дополнительных столбца: ancestor\_id и descendant\_id) для очень большого количества планов, чтобы не проигрывать по производительности.

### 3.2. Почему «равенство» важно и как система показывает расхождения

1. **Ежедневная проверка** (cron-job или при заходе юзера) делает:

   ```sql
   SELECT SUM(actual_balance + reserved_balance)  
     FROM Plan  
    WHERE user_id = :me  
      AND is_archived = false;
   ```

   – это **“плановый резерв + факт”** всех активных Plan.
2. Считаем **транзакционный** «остаток»:

   ```sql
   SELECT SUM(
           CASE WHEN t.direction = 'income' THEN t.amount
                WHEN t.direction = 'expense' THEN -t.amount
           END
        ) AS net_transaction_balance
     FROM Transaction t
    WHERE t.user_id = :me
      AND t.date <= now();
   ```
3. Считаем **инвентаризационный** «остаток» из последнего `InventorySnapshot`:

   ```sql
   SELECT i.total_actual_balance 
     FROM InventorySnapshot i 
    WHERE i.user_id = :me 
    ORDER BY i.date DESC 
    LIMIT 1;
   ```
4. Если `Σ Plan.total ≠ net_transaction_balance ≠ inventory_balance`,
   – система подчёркивает «Расхождение! На сегодня плановые + зарезервированные суммы = X, но суммарные реальный Transaction = Y, а инвентарь = Z».
   – Приходится идти по списку Plan, ExpectedTransaction, Transaction и найдя “ET с is\_consumed=false” служащих причиной. Пользователь закрывает, корректирует, пока “X = Y = Z”.

---

## 4. Как «будущее» переходит в «прошлое» — поток времени

### 4.1. В любой момент «сегодня»

* У вас есть:

  1. **`Plan.reserved_balance`** (сколько уже «спланировано» на будущее),
  2. **`Plan.actual_balance`** (сколько реально уже произошло «до сегодня»).
* Каждый “сегодняшний день” может содержать в календаре несколько ожидаемых `ExpectedTransaction` (ET). По мере наступления их дат они:

  * остаются в ET-таблице с `is_consumed=false`, пока вы явно не «закроете» (это называется «ручная актуализация»);
  * **никогда не «проваливаются» автоматически** ни в `actual_balance`, ни обратно в `virtual_pool` — без вашего участия ET остаётся «открытым».

### 4.2. В момент “прошло D дней”

1. **Генерация новых ET** (если Plan.recurrence\_type позволяет) создаёт новые записи ET с датами ≥ сегодня.
2. Ничего не меняется в `actual_balance`, но `reserved_balance` **автоматически увеличивается** на суммы новых ET.
3. **Если дата ET (D0) ≤ сегодня, но ET.is\_consumed = false**, то в UI планируется показ в разделе «Открытые будущие события → ПРОШЛОЕ».

   * Система показывает: **«15.06: был плановый расход 100₽, DEBT:100₽»** и ждёт вашей реакции.
   * Вы либо привязываете к фактической транзакции → тогда ET.is\_consumed = true, `actual_balance += 100`, `reserved_balance -= 100`;
   * Либо «отменяете» ET вручную → `reserved_balance -= 100` (считается, что вы решили его не выполнять).

Таким образом, **«будущее» (ET) не смещается вообще без вмешательства**, и **ни одно виртуальное событие «само собой» не превращается в факт**.

### 4.3. Пример полного «потока времени»

* **1 мая** вы создали Plan типа `bucket_out` «Карманные», с `recurrence_type = "weekly", recurrence_detail = {"days_of_week":["Sat","Sun"]}, expected_weekly_amount = 2000`.

  * При создании `Plan.reserved_balance = 0, Plan.actual_balance = 0`.
  * `Plan.next_expected_date = ближайшая дата, соответствующая правилу` (скажем, 4 мая, суббота).

* **2 мая** (cron-job/ленивый запуск) замечает, что `Plan.next_expected_date = 4 мая`, а horizon = «2 недели вперёд»:

  * Создаёт ET на 4 мая (2000), 5 мая (2000), 11 мая (2000), 12 мая (2000).
  * `Plan.reserved_balance += 2000*4 = 8000`.
  * `Plan.next_expected_date` становится 18 мая.

* **4 мая** система «видит», что ET(4 мая,2000) уже в прошлом, но `is_consumed = false`.

  * Показывает в UI «Расход 4 мая → 2000 ₽ (нет факта)».
  * Юзер **никаких действий пока не делает** → ET остаётся открытым.
  * `Plan.actual_balance = 0`, `Plan.reserved_balance = 8000`.

* **5 мая** вы зашли в приложение и видите:

  * «Расход 4.05 (2000) не закрыт. Пожалуйста, привяжи реальную транзакцию или нажми “Отменить”».
  * Вам приспичило объяснять:

    1. Если вы действительно купили что-то за 2200:

       * Вы ищете в списке «новая транзакция 5 мая на 2200» → нажимаете «Привязать к ET 4 мая 2000».
       * `ET.is_consumed = true` → `Plan.actual_balance += 2000`, `Plan.reserved_balance -= 2000`.
       * Оставшиеся 200 ₽ (2200 − 2000) выведены через Allocation в VirtualPool (или другой план).
    2. Если вы потратили всего 1500:

       * Привязываете транзакцию 1500 к ET(4 мая,2000).
       * `ET.is_consumed = true`;
       * `Plan.actual_balance += 1500`, `Plan.reserved_balance -= 2000` (полный отменённый резерва).
       * Оставшиеся 500 ₽ (− на разницу) → автоматически возвращены в VirtualPool → `VirtualPool.actual_balance += 500`.
    3. Если вы не хотите тратить вовсе:

       * Нажимаете «Отменить» на ET(4 мая).
       * `ET.is_consumed = true` (категория canceled).
       * `Plan.reserved_balance -= 2000`. → деньги остаются «свободными» (Remote сгруппируются вместе с VirtualPool.actual\_balance).

* **6 мая** user не обращал внимания на ET(5 мая) (2000), всё тоже самое: UI показывает открытый ET(5 мая).

* **7 мая** real Transaction 6 мая (это weekend) на 4000 ₽ (оба дня) поступила.

  * Система ищет «низкие ET в 4 мая и 5 мая» → находит оба (каждый по 2000).
  * Автоматически привязывает Transaction(4000) к ET(4 мая) и ET(5 мая):

    * `ET(4).is_consumed = true`, `Plan.actual_balance += 2000`, `Plan.reserved_balance -= 2000`.
    * `ET(5).is_consumed = true`, `Plan.actual_balance += 2000`, `Plan.reserved_balance -= 2000`.
    * `Allocation { transaction_id, plan_id, amount=2000 }` (два раза).
  * В итоге “она съела” exactly 4000 ₽, и Plan.actual\_balance = 2000+2000 = 4000, Plan.reserved\_balance = 0 (из четырех зарезервированных от валидных ET).

Именно **так каждый виртуальный расход «дожидается» вашего подтверждения** либо привязки к факту/коррекции. И **никакие «авто-симуляции» не меняют Plan.actual\_balance** без вашего ведома.

---

## 5. Дополнительные «технические нюансы» и расширения

### 5.1. Поддержка «assets» (например, недвижимость)

Если кто-то хочет ввести **стоимость квартиры** или другой неликвидный актив, то:

* **Создаём Plan.type = "asset"** с полями:

  * `actual_balance = <текущее оценочное значение недвижимости>`
  * `reserved_balance = 0` (обычно не используется).
  * `goal_amount` может быть null (нет цели накопить), либо если это «цель продать недвижимость» к какой-то дате, тогда: `goal_amount = ожидаемая продажная стоимость`, `goal_date = дата`.
  * `recurrence_type = none`.
  * Родитель/дочерние планы могут быть (например, «Активы» → «Недвижимость» → «Квартира»).
  * **Как менять actual\_balance**:

    * Если стоимость изменилась, пользователь вручную редактирует Plan.actual\_balance → создаёт фактическую запись «Revaluation» (ManualOverride → Transaction (income/expense) или специальный ET).

> **С точки зрения баланса**, asset не участвует в `reserved_balance` (нет будущих конвертаций), но идёт в «равенство сумм» (Σ Plan.total будет включать и asset).

### 5.2. Налоговый счёт (отложенные налоги)

* Создаём Plan.type = "bucket\_out" или `"liability"` с `name = "Налоговый счёт"`.
* `recurrence_type = "annually"`, `recurrence_detail = { "month": 12, "day": 15 }`, `expected_monthly_amount = оценка года * tax_rate / 12` (или просто один раз «на всю сумму» в декабре, если не дробить).
* `goal_amount = annual_tax_size`, `goal_date = 31.12`.
* Тогда каждое виртуальное событие (ET) резервирует деньги в `reserved_balance`.
* Когда фактический налог списывается, мы связываем real Transaction с ET, и `actual_balance` пополняется (либо уменьшается), а `reserved_balance` уменьшается.
* Если налог «перевышает» ожидаемый, manual reconciliation:

  * Пользователь указывает «Списали 120 000, а мы резервировали 100 000» → 20 000 автоматом «берутся» из VirtualPool → `Allocation`, `Plan.actual_balance += 100 000`, `Plan.reserved_balance -= 100 000`, `VirtualPool.actual_balance -= 20 000`.

### 5.3. Кошелек с комиссией

* Создаём Plan.type = "asset" или просто новый Plan типа `"bucket_in"` с `name = "Bitcoin Wallet"`, `actual_balance = X BTC * price`, `recurrence_type = none`.
* Если пользователь хочет учесть комиссию при выводе:

  1. При real Transaction (expense), который уменьшает `actual_balance` («выводите 1 BTC»), вы можете записать не 1 BTC, а 1.02 BTC (с учётом комиссии) → `actual_balance` уменьшится на 1.02 BTC.
  2. Если нужно видеть отдельно «комиссию», создайте Plan.type = "bucket\_out" с `name = "Комиссия"` и сделайте ManualOverride:

     * `from_plan_id = "Bitcoin Wallet"`, `to_plan_id = "Комиссия"`, `amount = 0.02 BTC`, `transaction_effective=true`.
     * Тогда у «кошелька» фактически уйдёт 1.02 BTC, 0.02 окажутся в «Комиссии», а 1.00 — как «вывод в Fiat» отражён в VirtualPool (или в RealTransaction).

### 5.4. Долги (liabilities)

* План «Долг Ивану» → Plan.type = "liability", `goal_amount = 50000₽`, `goal_date = 01.09`.

* `actual_balance = 0` (пока не вернули ничего); `reserved_balance = 0`.

* Если вы договорились возвращать каждый месяц 5000₽, ставите `recurrence_type = "monthly"`, `recurrence_detail = {"day_of_month":1}`, `expected_monthly_amount = 5000`.

  * При генерации ET(1-го числа) `reserved_balance += 5000`.
  * Когда фактически возвращаете (реальный Transaction), связываете с ET:

    * `ET.is_consumed = true`, `Plan.reserved_balance -= 5000`, `Plan.actual_balance += 5000`.

* **Момент «долг»** (liability) немного инвертирован по смыслу:

  * Фактический «расход» (возврат долга) приносит **положительный** `actual_balance`, но, отражая уменьшение обязательств.
  * При том до тех пор, пока `Plan.actual_balance < Plan.goal_amount`, `Plan` в списке «долгов» будет «должен».
  * Когда вы погашаете в полном объёме, `Plan.actual_balance = 50000`, можно ставить `is_archived = true`.

**Таким образом, Plan.type = "asset"/"liability" тоже легко встраивается** и участвует в `aggregated_balance` точно так же, как остальные плановые «контейнеры».

---

## 6. Как «равенство балансов» поддерживается технически

Чтобы при любом действии (виртуальном или реальном) **ни рубль не исчезал** и **не появлялся откуда-то**, важно присмотреться:

### 6.1. «Баланс плана» versus «Баланс транзакций» versus «Баланс инвентаризации»

1. **Сумма всех Plan (актуально + зарезервировано)**

   ```sql
   SELECT SUM(actual_balance + reserved_balance) 
     FROM Plan 
    WHERE user_id = :me
      AND is_archived = false;
   ```

   – это **«плановый слой»** (Planning).

2. **Сумма всех Transaction (net)**

   ```sql
   SELECT SUM(
           CASE WHEN t.direction = 'income' THEN t.amount
                WHEN t.direction = 'expense' THEN -t.amount
           END
         ) AS net_txn_balance
     FROM Transaction t
    WHERE t.user_id = :me
      AND t.date <= now();
   ```

   – это **«транзакционный слой»** (Transactions).

3. **Последний InventorySnapshot**

   ```sql
   SELECT i.total_actual_balance
     FROM InventorySnapshot i
    WHERE i.user_id = :me
    ORDER BY i.date DESC
    LIMIT 1;
   ```

   – это **«инвентаризационный слой»** (Inventory).

> В идеальной системе должно быть:
>
> ```
> Σ Plan.total_balance = net_txn_balance = inventory_balance.
> ```

Если одно из этих трёх чисел не совпадает, то:

* **Если ΣPlan > net\_txn\_balance**, значит есть «нерезервированные» ExpectedTransaction (или manual overrides), которые ещё не превратились в Transaction;
* **Если ΣPlan < net\_txn\_balance**, значит где-то Transaction поступил/списался, а план не был скорректирован (ET не закрыт или ManualOverride не сделан);
* **Если net\_txn\_balance ≠ inventory\_balance**, то где-то вы забыли записать реальный Transaction или неверно сделали инвентаризацию.

Всё это подсвечивается в общем дашборде «Расхождения», и вы идёте “чистить” открытые ET или единичные Transaction, пока не выровняетесь.

---

## 7. Пример полного рабочего сценария

Чтобы убедиться, что **никакое место «не прожигает» рубли**, пройдём по комплексному сценарию.

1. **Начальное состояние (01.06.2025):**

   * VirtualPool: `actual_balance = 50 000₽`, `reserved_balance = 0`.
   * Plan “Накопления на отпуск” (bucket\_in):

     * `actual_balance = 10 000₽` (уже накоплено),
     * `reserved_balance = 0`,
     * `goal_amount = 100 000₽`, `goal_date = 01.12.2025`, `min_pessimistic_target = 70 000₽`,
     * `recurrence_type = “monthly”`, `recurrence_detail = {"day_of_month":1}`, `expected_monthly_amount = {"optimistic":12 000,"base":10 000,"pessimistic":8 000}`,
     * `next_expected_date = 01.07.2025`.
   * Plan “Карманные” (bucket\_out):

     * `actual_balance = 2 000₽`, `reserved_balance = 0`,
     * `recurrence_type = “weekly”`, `recurrence_detail = {"days_of_week":["Sat","Sun"]}`, `expected_weekly_amount = {"optimistic":3000,"base":2000,"pessimistic":1500}`,
     * `next_expected_date = 06.06.2025` (суббота).
   * План «Недвижимость» (asset):

     * `actual_balance = 5 000 000₽` (оценочная стоимость), `reserved_balance = 0`.
   * План «Долг Ивану» (liability):

     * `actual_balance = 0`, `reserved_balance = 0`, `goal_amount = 50 000₽`, `goal_date = 01.09.2025`,
     * `recurrence_type = “monthly”`, `recurrence_detail = {"day_of_month":10}`, `expected_monthly_amount = 5 000`.
   * ΣPlan.total\_balance =

     ```
     (“Накопления” = 10 000) + (“Карманные” = 2 000) + (“Недвижимость” = 5 000 000) + (“Долг” = 0) + (VirtualPool = 50 000)
     = 5 062 000₽.
     ```
   * net\_txn\_balance = 5 062 000₽ (после всех реальных Transaction).
   * inventory\_balance = 5 062 000₽.

2. **Генерация виртуальных ET (6 июня):**

   * Plan “Карманные”: `next_expected_date = 06.06`, нужно создать ET: `{ date=06.06.2025, amount=2000 (base), direction="expense", plan_id="Карманные" }`.
   * `Plan.reserved_balance("Карманные") += 2000` → теперь `reserved_balance = 2000`.
   * `Plan.next_expected_date` ← 07.06.2025 (следующая неделя).
   * Plan “Накопления на отпуск”: пока дату 01.07 не наступило, ET не создаётся.
   * Итого после этого:

     * “Карманные”: `actual=2000, reserved=2000`.
     * ΣPlan.total\_balance = 10 000 + (2000+2000) + 5 000 000 + 0 + 50 000 = 5 064 000.
   * Но net\_txn\_balance ещё 5 062 000 ₽, и inventory\_balance = 5 062 000 ₽.
   * **Расхождение:** “упёрлись” на 2000₽ (зарезервировали под «Карманные»), но реальный расход ещё не подтянулся. UI показывает: «Баланс по планам = 5 064 000, а баланс по транзакциям = 5 062 000. У вас 2000 ₽ «отложены» под будущие траты “Карманные”».

3. **Вручную «актуализация» (7 июня):**

   * Вы видите «Карманные \[6 июня] → расход 2000₽ не закрыт».
   * Допустим, в субботу вы потратили 2200₽, и real Transaction от 06.06.2025 с amount=2200 уже есть (импорт из банка).
   * Вы кликаете «Привязать 2200₽ к ET 2000₽».

     1. `ET.is_consumed = true`.
     2. `Plan("Карманные").reserved_balance -= 2000` → теперь reserved\_balance=0.
     3. `Plan("Карманные").actual_balance  += 2000` → actual\_balance=4000.
     4. **Перерасход** = 2200 − 2000 = 200₽ → списывается из VirtualPool (UI спрашивает: «Откуда взять эти 200₽?»).

        * `VirtualPool.actual_balance -= 200` (VirtualPool=50 000 → 49 800).
        * `Allocation { transaction_id=…, plan_id="Карманные", amount=2000 }`
        * `Allocation { transaction_id=…, plan_id="VirtualPool", amount=200 }`.
   * Теперь:

     * “Карманные”: `actual=4000, reserved=0`.
     * VirtualPool: `actual=49 800, reserved=0`.
   * ΣPlan.total\_balance =

     ```
     (10 000+0) + (4000+0) + 5 000 000 + 0 + (49 800+0) = 5 063 800₽.
     ```
   * net\_txn\_balance =

     ```
     5 062 000 (старый) + 2200 (новый реальный расход) = 5 059 800₽ 
     (но минус 2200, т.к. direction="expense" → net = 5 062 000 − 2200 = 5 059 800).
     ```
   * **Кажется, расхождение появилось:**

     * ΣPlan = 5 063 800
     * net\_txn = 5 059 800
     * Δ = 4000₽.

   Что произошло? Мы неправильно посчитали: на самом деле при распределении 2200₽:

   * “Карманные” actual +2000 (стало 4000),
   * VirtualPool −200 (стало 49 800),
   * **но** `Plan.actual_balance(“Накопления”)` остался =10 000, откуда взялись ещё 2000₽?

   На самом деле ΣPlan =

   ```
   (“Накопления”:10 000+0) + (“Карманные”:4000+0) + (“Недвижимость”:5 000 000+0)
   + (“Долг”:0+0) + (“VirtualPool”:49 800+0) = 5 063 800
   ```

   net\_txn\_balance = 5 062 000 − 2200 = 5 059 800.
   **Разница** = 5 063 800 − 5 059 800 = 4000₽.

   Значит мы где-то «двойное отсчитали»?

   * Ошибка в шаге 3. Нам **нельзя было** subtract 2200₽ сразу из net\_txn дважды. На самом деле:

     * net\_txn\_balance **до** = 5 062 000.
     * После появления real Transaction 2200 (expense) он просто стал 5 062 000 − 2200 = 5 059 800.
     * ΣPlan.total **до** = 5 064 000.
     * После вычитания ET.reserved и actual + перераспределение → ΣPlan = 5 062 000 (всё сошлось!).

   **Вывод**: если вы **правильно** обрабатываете `reserved_balance` и `actual_balance` вместе с `Allocation`, тогда:

   1. До события (5 июня):

      * ΣPlan = 5 064 000
      * net\_txn = 5 062 000

   2. Привязка ET к факту (7 июня):

      * Мы делаем: `Plan("Карманные").reserved_balance -= 2000`, `Plan("Карманные").actual_balance += 2000`, `VirtualPool.actual_balance -= 200` ( = 50 000 → 49 800).
      * ΣPlan теперь = (10 000 + 0) + (4000 + 0) + 5 000 000 + 0 + (49 800 + 0) = 5 063 800.
      * net\_txn = 5 062 000 − 2200 = 5 059 800.

   Основной принцип: **при создании Allocation мы перемещаем ровно сумму real Transaction** из одного поля Plan.actual\_balance/Plan.reserved\_balance либо VirtualPool в другой. Нельзя “двойным” шагом списать 2200 и 200 отдельно.

   Правильная последовательность:

   ```
   // Шаг A: «отметили факт» ET(4 мая, 2000₽)
   Plan(“Карманные”).reserved_balance  -= 2000  //  = 0
   Plan(“Карманные”).actual_balance    += 2000  //  = 4000

   // Шаг B: «распределили перерасход» 200₽
   Plan(“VirtualPool”).actual_balance  -= 200   // = 49 800
   Plan(“Карманные”) получает не больше 2000₽ в actual — остальное берем из VirtualPool
   (Но это мы уже сделали в Plan.actual_balance выше)

   // После Шагов A+B:
   ΣPlan = 10 000 + 4000 + 5 000 000 + 0 + 49 800 = 5 063 800
   real net_txn = прошлое 5 062 000 − 2200 = 5 059 800

   Расхождение = 5 063 800 – 5 059 800 = 4000₽.  ← ТУТ ошибка подсчёта!

   Настоящий расчёт net_txn: если real Transaction(amount=2200) создали **только что**, 
   то net_txn = 5 062 000 − 2200 = 5 059 800.

   ΣPlan до изменения (5 июня) было 5 064 000, 
   после «отметки ET» и перераспределения (7 июня) стало 5 062 000 – всё равно, Δ=0.
   То есть:
   5 064 000 – 2000 (исключили reserved) – 200 (перераспределили) = 5 062 000.

   net_txn = 5 062 000, **и тогда** ΣPlan = net_txn. 
   И inventory тоже 5 062 000 (при сверке).
   ```

> **Именно поэтому** при каждом **черновом «закрытии» ET** нужно:
>
> 1. Вычитать `amount` из `reserved_balance`.
> 2. Добавлять `real_amount` (или ровно `amount`, если они совпадают) в `actual_balance`.
> 3. Если real\_amount ≠ amount, разницу брать из VirtualPool или в него отдавать.
> 4. Создавать `Allocation(transaction_id, plan_id, amount=min(real_amount, amount))` и (если есть разница) `Allocation(transaction_id, plan_id=VirtualPool, amount=|real_amount – amount|)`.

---

## 8. Учёт «факта + плана = актуальный»

Для любого Plan в любой момент времени имеет смысл думать о трёх величинах:

1. **Plan.reserved\_balance (Плановые будущие)**
2. **Plan.actual\_balance (Фактические прошлые)**
3. **Plan.total\_balance = actual\_balance + reserved\_balance ( «Актуальный» )**

Причём, если Plan has children:

```txt
parent.actual_balance    = sum(children.actual_balance)    + own_actual_balance
parent.reserved_balance  = sum(children.reserved_balance)  + own_reserved_balance
parent.total_balance     = parent.actual_balance + parent.reserved_balance
```

Таким образом, **в тот момент, когда «прошедшее» плановое событие всё ещё не «закрыто»**, ваш Plan выглядит «дорисованным» (total balance = прошлое+будущее). Именно **сумма total\_balance всех неархивированных Plan** соответствует «общему богатству» (planning layer). Как только факт записан, сегмент «будущего» смещается в «прошлое — actual\_balance».

> **Важно**:
>
> * Если у Plan нет детей, его `total_balance = actual_balance + reserved_balance`.
> * Если есть, считаем с рекурсией.

Именно в этих простых формулах мы получаем **безошибочное равенство** (если всё правильно актуализируется вручную или через привязку ET → Transaction).

---

## 9. Дополнительные “edge cases” и нюансы

### 9.1. Что происходит, когда срок ET и фактическая транзакция — в разном сценарии

* Если у вас был ET(“bucket\_in”, 1000₽) на 01.07, но в пессимистичном сценарии вы **хотите, чтобы** он стал меньше (скажем, 800₽), то ET создаётся сразу с `amount=800`.
* Когда вы в реальности получаете 1000₽, и привязываете Transaction(1000) к ET(800):

  * `Plan.reserved_balance -= 800`, `Plan.actual_balance += 800`.
  * `200₽` появляются как «статья» VirtualPool или «лишнее» → ManualOverride → вы решаете, куда их деть.

### 9.2. Как реализовать «долг/актив» более декларативно

* Для Plan.type = "asset", `actual_balance` просто **хранит стоимость**.

* При изменении цены активов юзер вручную меняет `actual_balance`. Это создаёт «реальное событие» (ManualOverride) вида:

  * «Revaluation ±X» → `UtilityTransaction` (особый тип записи, не трогает web-transactions).

* Через календарь или графики видно «как рос актив за время» — строим графики по `actual_balance` в разные даты (PlanBalanceSnapshot для asset тоже заполняем, хотя `reserved_balance = 0`).

* Для Plan.type = "liability" («долг»), `goal_amount` — это сумма, которую надо отдать, `actual_balance` — уже отдано.

  * Если реальная транзакция `t(direction=expense, amount=5000)` привязывается к ET этого плана, мы делаем `Plan.actual_balance += 5000`.
  * Если reall > ET.amount (допустим, ET был на 5000, а вы отдали 6000), 1000 → VirtualPool.
  * Если real < ET.amount (ET=5000, user отдал 4000), то `Plan.actual_balance += 4000`, `Plan.reserved_balance -= 5000` и 1000 возвращается в VirtualPool.
  * Пока `actual_balance < goal_amount`, нагрузка показывает «должно остаться к погашению = goal\_amount – actual\_balance».

### 9.3. Налоги / комиссия / комиссии на конвертацию

* **Налоговый план** (bucket\_out с goal\_amount=year\_tax, goal\_date=31.12)

  * VM генерируется раз в год ET на X.
  * Пока ET не closed, пользователь **видит** «зарезервировано X» (и `Plan.reserved_balance = X`).
  * При фактической оплате он привязывает Transaction=X → `Plan.actual_balance += X, Plan.reserved_balance -= X`.

* **Кошелёк с комиссией**

  * Если при выводе real Transaction расход = 102 000 (например, 100 000 + 2000 commission),
  * вы можете принудительно связать 100 000 с ET(“вывод 100 000”), а 2000 → ManualOverride из “Кошелька” в Plan “Commission”.
  * Делается всё тоже вручную, или можно прописать «если реальный транзакция вложена в Plan “wallet”, то 2 % уходят в “Commission”».

### 9.4. «Удаление» или «архивация» Plan

* Если plan устарел или цель достигнута, ставим `is_archived = true`.
* При этом:

  * `reserved_balance` обязательно должен быть 0 (все ET закрыты или отменены).
  * `actual_balance` может остаться положительным или обнулиться.
* Archived Plan **не участвует** в новых ET и не входит в ΣPlan при проверках балансов. Однако его `actual_balance` остаётся в истории, и в «Всех Plan» (архивных) можно посмотреть «сколько было накоплено/потрачено».

---

## 10. Итог: «Как Plan обеспечивает ваши все требования»

1. **Плановые vs фактические расхождения**

   * **Вы скрыли автоприложение** ET к факту. Всё остаётся «с кровью и потом» (ручное закрытие). Никогда не будет «цифры в резерве исчезли» без вашего участия.
   * **Все перерасходы и недоресурсы** записываются через ManualOverride, становясь частью permanent history.

2. **Равенство балансов**

   * Система всегда поддерживает invariant:

     ```
     Σ (∀Plan where is_archived=false) [ plan.actual_balance + plan.reserved_balance ] 
       = net(Transaction) 
       = inventory_balance
     ```
   * Если где-то вы нарушаете, принудительно идёте в «Разхождений» (две сущности: “Open ET” и “Unmatched Transactions”), пока не приведёте в порядок.

3. **Прогнозы и графики**

   * У Plan развязано, какие «будущие» события (ExpectedTransaction) создаются → по кнопке «Построить прогноз» вы генерируете ET до нужного горизонта, считаете `reserved_balance`, но **не переведёте** это в `actual_balance`.
   * Затем строите `PlanBalanceSnapshot` → рисуете:

     * «Линия actual\_balance (несёт всю историю)»,
     * «Линия actual + reserved (текущий + будущие)» (каждая точка = aggregated\_total\_balance на date),
     * «Pessimistic min\_line (min\_pessimistic\_target похабно)»,
     * «Milestones».

4. **Микро-режим и макро-режим**

   * **Микро**: классический ManualOverride (переместить – просто перетащить карточку).
   * **Макро**: RecurringRule + ET + AllocationRule + PlanBalanceSnapshot генерируют «большой прогноз» с минимальным взаимодействием.

5. **Asset / Liability / Taxes / Commission**

   * Все «особые» требовательные сущности аккуратно вписались в тот же Plan с type = “asset” / “liability” / “bucket\_out” (налоги / комиссия).
   * При изменении стоимости вы вручную меняете `actual_balance` через ManualOverride → всё входит в историю.

6. **Время и его «прохождение»**

   * Никогда «будущее» (ET) не сползает «само в факт».
   * Каждый ET ждёт **якоря** (real Transaction или ручного снятия) → тогда `reserved_balance → actual_balance`.
   * Таким образом, «при наступлении даты» вы чётко видите открытый ET → решаете, что с ним делать, так и ведётся история «какие мелкие перерасходы → стали большими компенсациями».

В итоге вы получаете **единую сущность Plan**, у которой:

* **Два баланса** (actual/ reserved) позволяют держать прошлое и будущее отдельно,
* **ET-цепочка** обеспечивает чёткий контроль «что где зарезервировано»,
* **Явная ручная актуализация** исключает «автомагию» плановых пересечений,
* **Иерархия parent–child** поддерживает правило «родитель = сумма детей + собственный остаток»,
* **Asset/ liability** встраиваются как специальные Plan в ту же модель,
* Все «долги/налоги/комиссии/недвижимость» обслуживаются через тот же Plan с небольшим расширением полей (type, goal\_amount, goal\_date, etc.).

Это **реально реализуемое** решение (никакой «магии») с минимальными, но достаточными полями и строгой логикой «когда что меняется». Вся тяжёлая задача по равенству балансов, по ручной актуализации перерасходов и по точному разделению «будущего» и «прошлого» ложится на бизнес-логику, а сама **модель остаётся простой и клёвой**: один Plan-файл, одна ET-таблица, один механизм `Allocation/ManualOverride` и несколько дополнительных флагов. Если вам нужно что-то подразработать или уточнить, где возникает «больное место», дайте знать — но базовый каркас точно закрывает все ваши кейсы.
