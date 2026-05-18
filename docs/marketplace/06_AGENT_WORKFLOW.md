# Agent Workflow

## Rules for Claude Code working on this project

### Before making changes

1. Run `bash scripts/ai/preflight.sh` to check project state
2. Read `CLAUDE.md` for current rules and context
3. Read the relevant source file before editing
4. Make a small plan — touch only necessary files

### Workflow

1. Check project structure
2. Write a plan
3. Change one small area at a time
4. Run `npm run build`
5. Update `docs/marketplace/DECISIONS.md` if architectural decision was made
6. Report changed files

### Prohibitions

- Do NOT do massive rewrites
- Do NOT install unnecessary dependencies
- Do NOT mix multiple tasks in one session
- Do NOT do production deploy without explicit user request
- Do NOT store secrets
- Do NOT read `.env` files
- Do NOT use `--no-verify` to skip hooks
- Do NOT run `git reset --hard` or `git push --force`

### Validation command

```bash
npm run build
```

Always run before reporting a task complete.

### Skills available

| Skill | When to use |
|---|---|
| `marketplace-architect` | Architecture changes |
| `universal-catalog` | Catalog changes |
| `dynamic-filters` | Filter changes |
| `figma-style-reference` | Figma analysis |
| `mobile-webview-review` | WebView readiness check |
| `ecofactor-ui-review` | UI style review |
| `safe-refactor` | Before refactoring code |
| `task-splitter` | Breaking large tasks into stages |
