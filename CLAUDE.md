# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This project follows best practices derived from the [everything-claude-code](https://github.com/affaan-m/everything-claude-code) framework — a production-tested system for AI-assisted development workflows.

See `.claude/docs/` for detailed reference guides.

## Development Workflow

### Research-First Approach
1. **Read before writing** — always understand existing code before modifying it
2. **Plan before implementing** — for complex features, break down into steps first
3. **Test before committing** — verify changes work before declaring done

### Test-Driven Development (TDD)
Follow the RED → GREEN → REFACTOR cycle:
1. Write a failing test first
2. Write minimal code to pass
3. Refactor while keeping tests green
4. Target 80%+ test coverage

### Git Workflow
- Commit format: `<type>: <description>` (types: feat, fix, refactor, docs, test, chore, perf, ci)
- Review full diff with `git diff [base-branch]...HEAD` before PRs
- Never commit secrets, `.env` files, or credentials

## Coding Standards

### File Organization
- Keep files 200–400 lines, hard max 800
- Keep functions under 50 lines
- Max nesting depth: 4 levels
- Organize by feature/domain, not file type
- File naming: `lowercase-with-hyphens`

### Immutability
Always create new objects — never mutate existing ones. This prevents hidden side effects and enables safe concurrency.

### Input Validation
Validate at system boundaries (user input, API responses, file contents). Use schema-based validation. Fail with clear error messages.

### API Response Format
Use a consistent envelope: `{ success, data, error, metadata }` for all endpoints.

### Design Patterns
- **Repository Pattern** for data access — abstract interface over concrete storage
- **Constants over magic numbers** — extract all literals into named constants

## Security Checklist (Before Every Commit)
- No hardcoded secrets (API keys, passwords, tokens)
- User inputs validated and sanitized
- Parameterized queries (no SQL injection)
- HTML output sanitized (no XSS)
- Error messages don't leak internals
- Auth/authz verified on protected routes

## Agent Delegation

Use subagents for parallel, independent work:
- **Planning** — delegate to planner agent for complex features
- **Code review** — delegate review to a separate agent after writing code
- **Security review** — delegate security analysis before commits
- **Parallel execution** — always launch independent agents concurrently, never sequentially

For complex problems, use multi-perspective analysis with split-role agents (security expert, senior engineer, consistency reviewer).

## Token & Context Management

- Use `/compact` at logical milestones, `/clear` between unrelated tasks
- Delegate exploratory searches to subagents to keep main context clean
- Keep MCP servers under 10 per project
- Prefer CLI tools over MCP servers when equivalent
- For large refactors, avoid working in the last 20% of the context window
