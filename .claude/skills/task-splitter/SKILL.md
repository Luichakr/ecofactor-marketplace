# Task Splitter Skill

Use this skill to split large tasks into safe stages.

## Output format

For each stage:
- **Stage name**: short label
- **Goal**: what should be working after this stage
- **Files to touch**: list of files
- **What NOT to touch**: files to leave alone
- **Validation**: `npm run build`
- **Expected result**: what the user will see
- **Next prompt**: suggested prompt for the next stage

## Rules

- One stage = one focused change
- Avoid giant rewrites
- Prefer visible working progress at each stage
- Keep rollback simple (one revert undoes one stage)
- Maximum 5 files per stage
