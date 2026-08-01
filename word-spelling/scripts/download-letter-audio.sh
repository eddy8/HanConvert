#!/usr/bin/env bash
set -euo pipefail

mkdir -p audio

for letter in {a..z}; do
  audio_key="$(printf "%s" "$letter" | tr "[:lower:]" "[:upper:]")"

  curl \
    --connect-timeout 10 \
    --max-time 30 \
    --retry 2 \
    --retry-delay 1 \
    -fsSL \
    -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36" \
    -H "Accept: audio/webm,audio/ogg,audio/wav,audio/*;codecs=opus,*/*;q=0.9" \
    -H "Accept-Language: zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7" \
    -H "Referer: https://dict.youdao.com/" \
    "https://dict.youdao.com/dictvoice?audio=${audio_key}&type=2" \
    -o "audio/${letter}.mp3"
done
