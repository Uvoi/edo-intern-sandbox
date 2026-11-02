## WebStorm File Templates / Live Templates 

После загрузки файла ```configs.zip``` в IDE нужно пройти по следующему пути```File -> Manage IDE Settings -> Import Settings...``` 
и найти загруженный ранее архив, выбрать его и импортировать все настройки.

Схемы для конкретного приложения следует хранить в корне приложения, внутри директории .templates.
Это нужно для того, чтобы "подгонять" их под конкретный проект (например, настраивать алиасы, возможно дополнять или изменять темплейты).

После изменения темплейтов, необходимо их экспортировать (для этого необходимо выбрать 4 настройки: Live Templates, Live Templates (schemes), 
File Templates, File Templates (schemes)).

## Реализованные File Templates
[Что такое File Templates?](https://www.jetbrains.com/help/webstorm/using-file-and-code-templates.html)

На данный момент существуют следующие темплейты:

```
1. Component - создание React Component-а с props;
2. UIStore - создание UI-стора
3. NamedStore - создание стора по пути ./$Name}Store/${Name}Store.ts
4. Screen - создание сущности screen без стора 
5. ScreenWithStore - создание сущности screen со стором
6. Repository - создание репозитория;
7. Feature - создание фичи;
8. UtilityFunction - создание функции-утилиты;
9. source - создание сурса
10. Form - создание формы
```

Для получения к ним доступа, после импорта конфигов и перезапуска IDE, нужно зайти в контекстное меню, где вы обычно создаете файлы (New ... )
и в самом конце списка будут перечисленные выше шаблоны. 

## Наcтройка
Во всех темплейтах необходимо заменить путь ``@example/shared`` на алиас, который используется в вашем проекте.

## Полезные хоткеи
``ALT + INSERT`` (``⌘ + N``) - откроет панель с файловыми темплейтами, где с помощью ввода можно найти любой темплейт, либо выбрать из списка.

``CTRL + J`` (``⌘ + J``) - открытие окна с лайв-темплейтами


## Реализованные Live Templates 
[Что такое Live Templates?](https://www.jetbrains.com/help/webstorm/using-live-templates.html)

### Data 

**networkSource** - создаст сурс.

**repository**  - создаст репозиторий

**dto** создаст неймспейс

### Styled Components
**scomp** - создаст styled компонент

**scompwp** - создаст styled компонент с пропсами

**theme** - шорткат для быстрого доступа к theme в styled component

``
${({ theme }) => theme.};
``
*****
**Предупреждение**: для корректной работы сниппета theme, в начале нужно ввести
символ шаблонной строки `, а затем theme. В ином случае IDE не будет предлагать использовать сниппет.

Пример использования:
``
margin-bottom: `theme ->>>> ${({ theme }) => theme.}};
``

### MobX
**mobxStore** - создаст mobXStore и инстанс этого стора

### React
**rfc** - создание react component с type

**screen**  - шорткат для создания screen (импорт pageLayout, постфикс screen для компонента)

### Tests

**iteach** - шорткат для it.each

**describeTest** шорткат для describe и it внутри


