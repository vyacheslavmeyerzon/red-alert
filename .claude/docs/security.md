# Security Guidelines

## Mandatory Pre-Commit Checklist

- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated and sanitized
- [ ] SQL queries use parameterized statements
- [ ] HTML output sanitized against XSS
- [ ] CSRF protection on state-changing endpoints
- [ ] Authentication and authorization verified
- [ ] Rate limiting on public endpoints
- [ ] Error messages don't leak internal details

## Secret Management

- Use environment variables or a dedicated secret manager
- Validate required secrets are present at startup
- Rotate any secret that may have been exposed immediately
- Never log secrets, even at debug level

## Security Response Protocol

If a security issue is discovered:

1. **STOP** current work immediately
2. Delegate to a security-reviewer agent
3. Fix CRITICAL issues before any other work
4. Rotate all potentially exposed secrets
5. Search entire codebase for similar vulnerabilities

## Common Vulnerability Prevention

| Vulnerability | Prevention |
|---------------|------------|
| SQL Injection | Parameterized queries, ORMs |
| XSS | Sanitize output, CSP headers |
| CSRF | Anti-CSRF tokens, SameSite cookies |
| Auth bypass | Middleware-level auth checks |
| Secret leaks | Env vars, `.gitignore`, pre-commit hooks |
| Path traversal | Validate and normalize file paths |
