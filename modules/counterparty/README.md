# counterparty — работающий эталон для DOC-2

Контрагенты организации — компании, с которыми идёт обмен документами. Модуль показывает чтение данных и полный цикл изменения: **действие строки → подтверждение → mutation → pending → success/error → инвалидация списка**.

Модуль `document` и реализация задания стажёра этим примером не дополняются.

## Что попробовать в браузере

1. Запусти `pnpm dev`, открой раздел **«Контрагенты»**.
2. В строке обычного контрагента открой меню «…», выбери **«В архив»**.
3. Проверь **«Отмена»**: состояние не изменится, запрос не отправится.
4. Открой подтверждение ещё раз и нажми **«В архив»**. Во время запроса кнопки заблокированы; нельзя закрыть диалог, повторно подтвердить или поменять цель.
5. После успеха диалог закроется, появится уведомление, список перезапросится. Строка останется видна с состоянием **«В архиве»**, а действие изменится на **«Восстановить»**.
6. Восстанови контрагента и проверь возврат состояния **«Активен»**.
7. Найди через поиск **«Учебная ошибка»**. Для строки **«ООО Учебная ошибка архивации»** stub всегда отвечает отказом: уведомление содержит причину, диалог остаётся открытым, состояние не меняется, можно повторить или отменить.

Это in-memory API: изменения живут до F5. Архивирование учебное и не запрещает использование контрагента в документах; удаления и проверки ссылочной целостности здесь нет. Отдельный контрагент с отказом нужен только для демонстрации ошибки.

## Маршрут чтения

### 1. Понять API-контракт

- `api/dto/counterparty/dto.ts` — `ChangeArchiveStateInput` и необязательный `isArchived`.
- `api/fetchers/counterparty.ts` — готовый `mutations.changeArchiveState`.
- `api/fakers/endpoints/counterparty.ts` — работающий stub. Обновление заменяет запись новым объектом: старый ответ query не изменяется до инвалидации и перезапроса.
- `api/_endpoints/counterparty.ts` — учебный контракт будущего HTTP API. В текущем приложении используется **stub**, реальный сервер для этого маршрута не заявляется.

Поле `isArchived` необязательное, чтобы не менять уже существующие вложенные DTO документов; faker контрагента задаёт его явно.

### 2. Посмотреть mutation и состояние интерфейса

`features/CounterpartyList/UIStore/UIStore.ts`:
- mutation создаётся **один раз в конструкторе**, не в getter;
- в конструктор внедрены fetcher, notify и renderer ячейки;
- `getRowActions` готовит пункты меню, обработчик только выбирает контрагента и открывает диалог;
- выбранная строка копируется, чтобы последующее изменение внешнего объекта не переключило цель подтверждения;
- `archiveDialogProps` готовит текст, обработчики и pending-флаги для `ConfirmDialog`;
- `confirmArchiveChange` проверяет выбранную цель и pending, затем вызывает `sync({ params, onSuccess, onError })`;
- success закрывает диалог и инвалидирует **весь набор** `queries.counterpartyList`, включая другие поисковые запросы; UI не правит кэш вручную;
- error не выполняет успешные эффекты: сохраняет подтверждение и возможность повтора;
- query-ошибка списка и mutation-ошибка — разные состояния: первая отображается в таблице с retry, вторая — уведомлением.

### 3. Подключить действия к таблице без зависимости логики от JSX

- В `UIStore.columns` есть колонка **«Действия»**, вызывающая внедрённый renderer.
- Фабрика `createUIStore` собирает renderer через `adaptComponentToDomain(CounterpartyActionCell)`.
- `components/CounterpartyActionCell/CounterpartyActionCell.tsx` использует **`secondaryActions`**, а не устаревший prop `DataGridActionCell.actions`.
- Меню рендерится лениво. Вложенный `SecondaryActions` имеет свой `observer`, чтобы открытое меню реагировало на pending.
- `components/CounterpartyActionCell/useLogic.ts` готовит props; JSX остаётся отображением.
- UI-kit подключается через `shared/components/DataGridActionCell.ts` и `ConfirmDialog.ts`.

### 4. Прочитать тесты

`features/CounterpartyList/UIStore/UIStore.test.ts` показывает:
- свой cache service и `mockFetcher` на каждый тест;
- реальный `createMutationSet` с подменённым исполнителем, не `vi.mock` библиотеки;
- вызов mutation с правильными параметрами;
- ожидание success/error, а не ненадёжное ожидание только `!isLoading`;
- управляемый Promise для pending и защиты от повторов;
- запрет отмены/смены цели во время запроса;
- spy на инвалидацию всего набора, уведомления и renderer;
- восстановление архивного контрагента и отмену без отправки запроса.

Запуск из корня проекта:

```bash
pnpm exec vitest run modules/counterparty/features/CounterpartyList/UIStore
pnpm check
pnpm build
pnpm analyze-es-deps:circular
```

## Источники паттернов в продуктовом проекте

Пример адаптирован к маленькой песочнице по текущему локальному коду `Astral.Edo.Frontend/astraledo-web`:
- `actual/modules/gosEdo/features/GosEdoDocflowList/CellActions/CellActions.tsx` — современный `DataGridActionCell.secondaryActions`, собственный observer ленивого меню;
- `actual/modules/epdDocflows/features/EpdDocflowListCellActions/EpdDocflowListCellActions.tsx` — композиция ячейки действий;
- `actual/modules/abonents/domain/stores/AbonentSettingsStore/AbonentSettingsStore.ts` — создание mutations в конструкторе и отдельная обработка результата/ошибки.

В установленном mobx-query `sync` принимает объект с `params` и callbacks, а `async` — сами параметры. Для этого примера выбран `sync`; не копируй несовместимый пример `async({ params: ... })` из README без проверки реальных типов.

## Как использовать в DOC-2

Переноси **подход**, а не имена методов. В `document` другие DTO и готовый `deleteDocument`, своё domain-правило, тексты подтверждения и инвалидация infinite-списка/статистики. Удаление документов, фильтры, сортировка и копирование номера остаются задачей стажёра.
