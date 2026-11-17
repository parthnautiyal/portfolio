#!/usr/bin/env bash
# Downloads the LaTeX source and a freshly compiled PDF from an Overleaf read-only share link.
# Usage: scripts/fetch-overleaf.sh <https://www.overleaf.com/read/TOKEN> <out-dir>
# Produces <out-dir>/resume.tex and <out-dir>/resume.pdf, or exits non-zero.
#
# Overleaf has no static download URL for read-only links. A read token must first be exchanged
# for an anonymous read-only session (POST /read/:token/grant), which returns the project id;
# that session can then download the project zip and trigger a compile.
set -euo pipefail

SHARE_URL="${1:?usage: fetch-overleaf.sh <overleaf read link> <out-dir>}"
OUT_DIR="${2:?usage: fetch-overleaf.sh <overleaf read link> <out-dir>}"
BASE="https://www.overleaf.com"

fail() { echo "::error::$*" >&2; exit 1; }

TOKEN=$(sed -nE 's#.*overleaf\.com/read/([a-zA-Z0-9]+).*#\1#p' <<<"$SHARE_URL")
[ -n "$TOKEN" ] || fail "Expected an Overleaf read-only link (https://www.overleaf.com/read/<token>)"

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
JAR="$WORK/cookies"
mkdir -p "$OUT_DIR"

ol() { curl -sS --fail --retry 3 --retry-delay 2 -c "$JAR" -b "$JAR" "$@"; }
csrf_from() { grep -o 'name="ol-csrfToken" content="[^"]*"' "$1" | head -1 | sed 's/.*content="//;s/"$//'; }
json_field() { jq -er "$1"; }

echo "Requesting read-only access"
ol "$BASE/read/$TOKEN" -o "$WORK/read.html"
CSRF=$(csrf_from "$WORK/read.html")
[ -n "$CSRF" ] || fail "No CSRF token on Overleaf read page; the share link may be revoked"

PROJECT_PATH=$(ol -X POST -H "Content-Type: application/json" -H "X-Csrf-Token: $CSRF" \
  -d '{"confirmedByUser":false}' "$BASE/read/$TOKEN/grant" | json_field '.redirect') \
  || fail "Overleaf did not grant read access for this link"
[[ "$PROJECT_PATH" =~ ^/project/[a-f0-9]+$ ]] || fail "Unexpected grant redirect: $PROJECT_PATH"

echo "Downloading source zip"
ol -L "$BASE$PROJECT_PATH/download/zip" -o "$WORK/project.zip"
unzip -q -o "$WORK/project.zip" -d "$WORK/src" || fail "Overleaf download was not a valid zip"

# Pick the compile root: main.tex if present, otherwise the only file declaring \documentclass.
if [ -f "$WORK/src/main.tex" ]; then
  TEX="$WORK/src/main.tex"
else
  ROOTS=$(grep -l '\\documentclass' "$WORK/src"/*.tex 2>/dev/null || true)
  [ "$(grep -c . <<<"$ROOTS")" -eq 1 ] || fail "Cannot determine root .tex file (found: ${ROOTS:-none})"
  TEX="$ROOTS"
fi
grep -q '\\begin{document}' "$TEX" || fail "$(basename "$TEX") has no \\begin{document}"
cp "$TEX" "$OUT_DIR/resume.tex"
echo "Source: $(basename "$TEX")"

echo "Compiling PDF"
ol "$BASE$PROJECT_PATH" -o "$WORK/project.html"
CSRF=$(csrf_from "$WORK/project.html")
ol -X POST -H "Content-Type: application/json" -H "X-Csrf-Token: $CSRF" \
  -d '{"rootDoc_id":null,"draft":false,"check":"silent","incrementalCompilesEnabled":false}' \
  "$BASE$PROJECT_PATH/compile?auto_compile=true" -o "$WORK/compile.json"
STATUS=$(json_field '.status' <"$WORK/compile.json" || echo unknown)
[ "$STATUS" = "success" ] || fail "Overleaf compile status: $STATUS"

PDF_PATH=$(json_field '.outputFiles[] | select(.type=="pdf") | .url' <"$WORK/compile.json") \
  || fail "Compile succeeded but produced no PDF"
PDF_DOMAIN=$(json_field '.pdfDownloadDomain' <"$WORK/compile.json" || echo "$BASE")
CLSI=$(json_field '.clsiServerId' <"$WORK/compile.json" || echo "")
ol -L "$PDF_DOMAIN$PDF_PATH?compileGroup=standard&clsiserverid=$CLSI" -o "$OUT_DIR/resume.pdf"
head -c 5 "$OUT_DIR/resume.pdf" | grep -q '%PDF' || fail "Compiled output is not a PDF"

echo "Fetched $(wc -c <"$OUT_DIR/resume.tex" | tr -d ' ') byte .tex and $(wc -c <"$OUT_DIR/resume.pdf" | tr -d ' ') byte PDF"
