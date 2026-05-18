#!/usr/bin/env bash

set -e

echo "== ECOFACTOR Marketplace Preflight =="

echo ""
echo "Current directory:"
pwd

echo ""
echo "Git:"
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git branch --show-current
  git status --short
else
  echo "Not a git repository"
fi

echo ""
echo "Node:"
if command -v node >/dev/null 2>&1; then
  node -v
else
  echo "Node not found"
fi

echo ""
echo "NPM:"
if command -v npm >/dev/null 2>&1; then
  npm -v
else
  echo "npm not found"
fi

echo ""
echo "Package scripts:"
if [ -f package.json ]; then
  node -e "const p=require('./package.json'); console.log(JSON.stringify(p.scripts || {}, null, 2))"
else
  echo "package.json not found"
fi

echo ""
echo "Artifact check (should be empty — if not, run cleanup):"
ARTIFACTS=$(find . -maxdepth 2 \( \
  -name "node_modules" -o \
  -name "dist" -o \
  -name ".vite" -o \
  -name "__MACOSX" -o \
  -name ".DS_Store" -o \
  -name "*.tsbuildinfo" -o \
  -name "settings.local.json" \
\) -print 2>/dev/null | head -20)
if [ -z "$ARTIFACTS" ]; then
  echo "  Clean — no artifacts found"
else
  echo "$ARTIFACTS"
fi

echo ""
echo "Key source files:"
find . -maxdepth 4 -type f \
  ! -path './node_modules/*' \
  ! -path './dist/*' \
  ! -path './.git/*' \
  ! -path './.vite/*' \
  ! -path './__MACOSX/*' \
  ! -name '.DS_Store' \
  ! -name '*.tsbuildinfo' \
  ! -path './.claude/settings.local.json' \
  ! -name '.env' \
  ! -name '.env.*' \
  | sort \
  | head -200

echo ""
echo "== Preflight done =="
