# Agent Delegation Patterns

## When to Use Agents

| Situation | Agent to Use |
|-----------|-------------|
| Complex feature request | Planner |
| Architectural decision | Architect |
| New feature or bug fix | TDD Guide |
| Code just written/modified | Code Reviewer |
| Before committing | Security Reviewer |
| Build failure | Build Error Resolver |
| Critical user flows | E2E Runner |
| Code maintenance | Refactor Cleaner |
| Docs out of date | Doc Updater |

## Immediate (No Prompt Needed) Agent Usage

Proactively delegate without waiting for user request:
- Complex feature → use **planner** agent first
- Code written → use **code-reviewer** agent
- Bug fix / new feature → use **tdd-guide** agent
- Architecture question → use **architect** agent

## Parallel Execution (Critical Rule)

ALWAYS launch independent agents concurrently:

```
GOOD: Launch 3 agents in parallel
  1. Security analysis of auth module
  2. Performance review of cache layer
  3. Type checking of utilities

BAD: Run them one after another when they don't depend on each other
```

## Multi-Perspective Analysis

For complex or high-stakes problems, use split-role sub-agents:
- **Factual reviewer** — checks correctness
- **Senior engineer** — evaluates architecture and maintainability
- **Security expert** — identifies vulnerabilities
- **Consistency reviewer** — checks alignment with codebase conventions
- **Redundancy checker** — finds duplication and unnecessary complexity

## Skeleton Project Pattern

When starting new functionality:
1. Search for proven skeleton/template projects
2. Evaluate in parallel: security, extensibility, relevance
3. Clone best match as foundation
4. Iterate within the proven structure
