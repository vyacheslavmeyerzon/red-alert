# Testing Best Practices

## Coverage Target: 80%+

All three test types are required:

| Type | Scope | Examples |
|------|-------|---------|
| Unit | Individual functions, utilities | Pure logic, helpers, transformations |
| Integration | Connected components | API endpoints, database operations |
| E2E | Full user flows | Critical paths through the application |

## TDD Workflow (Mandatory for New Features)

```
1. WRITE test        → describe expected behavior
2. RUN test          → confirm it FAILS (RED)
3. WRITE minimal code → just enough to pass
4. RUN test          → confirm it PASSES (GREEN)
5. REFACTOR          → clean up, extract, simplify
6. CHECK coverage    → must stay ≥ 80%
```

## Troubleshooting Test Failures

1. Check test isolation — tests should not depend on each other
2. Verify mocks are correct and match real interfaces
3. Fix the implementation, not the tests (unless the test itself is wrong)
4. Use the tdd-guide agent for complex test scenarios

## Test Quality Rules

- Each test should test one thing
- Test names should describe the expected behavior, not the implementation
- Avoid testing implementation details — test behavior and outcomes
- Keep test setup minimal and focused
- Use factories/fixtures for test data, not hardcoded values

## When to Write Tests

- New features: always (TDD)
- Bug fixes: write a failing test that reproduces the bug first
- Refactors: ensure existing tests pass before and after
- API changes: update integration tests to cover new contracts
