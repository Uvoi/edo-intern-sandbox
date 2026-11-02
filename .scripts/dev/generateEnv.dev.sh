#!/bin/bash
# Создает index.html файл на основе index.template.html и инжектирует в него env

# Скрипт упадет, если какая-либо операция завершалась не удачно
set -e

HTML='./index.html'
TEMPLATE='./index.template.html'
ENV_FILE='./.env.development'
ENV_PREFIX='PUBLIC_'

# Временный файл для отфильтрованных строк
TMP_ENV=$(mktemp)
# Убираем пустые строки и комментарии, сохраняем во временный файл
grep -E -v '^[[:space:]]*#' "$ENV_FILE" | grep '=' > "$TMP_ENV"

ENVS=''
while IFS= read -r line; do
  # Удаляем возможные символы возврата каретки (CR) из строки
  line=$(printf '%s' "$line" | tr -d '\r')
  [ -z "$line" ] && continue  # пропуск пустых после очистки

  key=${line%%=*}
  val=${line#*=}

  # Убираем пробелы по краям и экранируем кавычки
  key=$(printf '%s' "$key" | sed 's/^[ \t]*//;s/[ \t]*$//' | sed 's/"/\\"/g')
  val=$(printf '%s' "$val" | sed 's/^[ \t]*//;s/[ \t]*$//' | sed 's/"/\\"/g')

  case "$key" in
    ${ENV_PREFIX}*)
      if [ -z "$ENVS" ]; then
        ENVS="\"$key\":\"$val\""
      else
        ENVS="$ENVS,\"$key\":\"$val\""
      fi
      ;;
  esac

done < "$TMP_ENV"
rm -f "$TMP_ENV"

# Заменяет window.__ENV__ на значение переменных и перезаписывает html с новым содержимым
sed "s|window\.__ENV__[[:space:]]*=[[:space:]]*{}|window.__ENV__={$ENVS}|g" \
    "$TEMPLATE" > "$HTML"
