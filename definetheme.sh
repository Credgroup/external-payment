#!/bin/sh

HTML_PAGE="./index.html"

if [ -z "$VITE_ENTERPRISE_NAME" ]; then
  echo "Uso: VITE_ENTERPRISE_NAME precisa estar definido"
  exit 1
fi

# 1. Remove linha do tema de desenvolvimento
sed -i '/<!--@THEME_DEV-->/,/<!--@\/THEME_DEV-->/d' "$HTML_PAGE"

# 2. Ativa linha do tema de produção
sed -i 's|<!--@THEME_BUILD-->||g' "$HTML_PAGE"
sed -i 's|<!-- <link rel="stylesheet" href="https://[^"]*/(NOMEEMPRESA)/theme.css"> -->|<link rel="stylesheet" href="'"$VITE_THEME_BLOBS_PATH"'/themescss/'"$VITE_ENTERPRISE_NAME"'/'"$VITE_THEME_FILENAME"'">|g' "$HTML_PAGE"
sed -i 's|<!--@/THEME_BUILD-->||g' "$HTML_PAGE"

echo "'$HTML_PAGE' atualizado com tema da empresa '$VITE_ENTERPRISE_NAME'."