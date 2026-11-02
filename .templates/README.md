# Шаблоны для автогенерации кода

## Общая информация об интеграции шаблонов в проект

1. Нужно перенести директорию ``.templates`` в корень проекта, где будут использоваться шаблоны.
2. Добавить строку ``.templates`` в файле ``.dockerignore``, а также включить её в массив поля exclude, 
внутри конфигурационного файла ``vitest.config.ts``. 

```
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  ...,
  test: {
    ...
    exclude: [...configDefaults.exclude, '.templates'],
  },
});
```

3. Особенности работы с темплейтами для конкретного IDE и их настройки описаны в readme файлах для [Webstorm](./webstorm/README.md) и [VScode](./vscode/README.md)
