# Coding Standards

Detailed coding standards derived from everything-claude-code best practices.

## Immutability First

```
// GOOD - create new object
const updated = { ...original, name: newName };

// BAD - mutate in place
original.name = newName;
```

Always create new objects. Never mutate existing ones. This prevents hidden side effects and enables safe concurrency.

## File Structure

| Metric | Target | Hard Limit |
|--------|--------|------------|
| File length | 200–400 lines | 800 lines |
| Function length | < 50 lines | — |
| Nesting depth | ≤ 3 levels | 4 levels |

Organize code by feature or domain, not by file type. Prefer many focused files over monolithic ones.

## Naming Conventions

- Files: `lowercase-with-hyphens.ext`
- Constants: `UPPER_SNAKE_CASE`
- No magic numbers — extract into named constants

## Error Handling

- Handle errors at every level
- User-facing: friendly messages
- Server-side: detailed logging with context
- Never silently swallow errors
- Never expose internal details in API error responses

## Input Validation

Validate at system boundaries:
- User input (forms, CLI args, query params)
- API responses from external services
- File contents and uploads
- Environment variables at startup

Use schema-based validation (Zod, Joi, Pydantic, etc.) and fail with transparent error messages.

## API Design

### Consistent Response Envelope

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "metadata": { "total": 100, "page": 1, "limit": 20 }
}
```

All endpoints return this shape. `data` is null on error. `error` is null on success. Include `metadata` for paginated responses.

## Repository Pattern

Encapsulate data access behind a consistent interface:

```
interface Repository<T> {
  findAll(filters?): T[]
  findById(id): T | null
  create(data): T
  update(id, data): T
  delete(id): void
}
```

Business logic depends on the abstract interface, never the storage mechanism. This simplifies testing and enables swapping data sources.

## Pre-Completion Checklist

Before marking any task done, verify:
- [ ] Code is readable with clear names
- [ ] Functions under 50 lines
- [ ] Files under 800 lines
- [ ] Nesting depth ≤ 4
- [ ] Proper error handling at all levels
- [ ] No magic numbers
- [ ] Immutable patterns used throughout
- [ ] Input validation at boundaries
