# Safe Refactor Skill

Use this skill before changing existing code.

## Rules

1. Read the target file first
2. Identify minimum necessary changes
3. Do not touch unrelated files
4. Do not rewrite the whole component
5. Do not add dependencies without reason
6. Run `npm run build` after code changes
7. Report changed files and what changed

## Process

1. `pwd && ls src/` to orient
2. Read the relevant file
3. Make a small plan (1-3 steps max)
4. Apply changes one at a time
5. `npm run build` to verify
6. If build fails, fix and retry — never mark done until build passes
