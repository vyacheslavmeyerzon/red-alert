# Git Workflow

## Commit Message Format

```
<type>: <description>

[optional body with more detail]
```

### Allowed Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructuring (no behavior change) |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `chore` | Build, tooling, dependencies |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |

## Branch Strategy

- Create feature branches from `main`
- Use descriptive branch names: `feat/user-auth`, `fix/cart-total`
- Push with `-u` flag on first push of a new branch

## Pull Request Process

1. Review full commit history, not just the latest commit
2. Run `git diff main...HEAD` to see all changes
3. Write a clear PR description with summary and test plan
4. Ensure all tests pass and coverage meets threshold

## Pre-Commit Checks

Before every commit, verify:
- No secrets in the diff (API keys, tokens, passwords)
- No `.env` files staged
- Tests pass
- Linter/formatter has run
