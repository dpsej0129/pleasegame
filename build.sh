#!/bin/bash
# LETHE 빌드: src/ 의 파트 파일을 순서대로 합쳐 단일 HTML(lethe.html)을 만든다.
# 순서: 머리·스타일 → 본문 → 데이터(설정·인물·그림·막별 데이터·엔딩) → 엔진(코어·도트·대화·화면)
cd "$(dirname "$0")/src" && cat \
  00_head.html 01_css.html 02_css_new.html 03_body.html \
  10_config.js 12_chars.js 34_drawings.js \
  20_act1.js 21_act2.js 22_act3.js 23_endings.js \
  30_core.js 31_pixel.js 32_bg.js 33_vn.js \
  40_flow.js 41_client.js 42_evening_night.js 43_ending.js \
  > ../lethe.html && echo "built lethe.html ($(wc -l < ../lethe.html) lines)"
