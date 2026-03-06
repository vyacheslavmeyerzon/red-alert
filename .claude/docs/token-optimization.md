# Token & Context Optimization

## Model Selection by Task

| Model | Use For | Cost Benefit |
|-------|---------|-------------|
| **Haiku** | Exploration, lookups, lightweight agents | ~80% savings vs Opus |
| **Sonnet** | Typical coding, orchestration | ~60% savings vs Opus |
| **Opus** | Complex reasoning, architecture decisions | Full cost |

Switch mid-session with `/model [name]`.

## Context Window Management

### Compact Strategically
- Use `/compact` after completing a milestone or before shifting focus
- Use `/clear` between unrelated tasks
- Don't wait for automatic compaction at 95% — set `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` to 50%

### Avoid the Danger Zone
The last 20% of context window degrades quality. Avoid it for:
- Large-scale refactoring
- Multi-file feature implementation
- Complex debugging sessions

Safe for the tail end of context:
- Single-file edits
- Independent utility creation
- Documentation updates
- Simple bug fixes

### Delegate to Subagents
Subagents get their own context windows. Use them for:
- Exploratory searches (results summarized, not dumped into main context)
- Independent research tasks
- Parallel analysis work

## Cost-Saving Configuration

```json
// ~/.claude/settings.json
{
  "model": "sonnet",
  "MAX_THINKING_TOKENS": 10000,
  "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": 50
}
```

Reducing `MAX_THINKING_TOKENS` from 31,999 to 10,000 cuts hidden cost by ~70%.

## MCP Server Discipline

- Keep enabled MCP servers under 10 per project
- Run `/mcp` to audit context costs
- Prefer CLI tools over MCP servers when equivalent
- Disable unused default servers

## Extended Thinking

- Toggle: Alt+T (Windows/Linux), Option+T (macOS)
- View thinking output: Ctrl+O
- Enable Plan Mode for structured complex reasoning
- Use multiple critique rounds for thorough analysis
