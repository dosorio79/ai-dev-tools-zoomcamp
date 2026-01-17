# Prompt Editing

## Files

- System prompt: `app/agents/prompts/content_llm_system.txt`
- User prompt template: `app/agents/prompts/content_llm_user.txt`

## Notes

- The user prompt uses Python `str.format`, so literal `{` or `}` must be escaped as `{{` and `}}`.
- Keep outputs strict JSON; any schema changes should be reflected in the validator tests.
- Text blocks must include a paragraph and a bullet or numbered list.
- Exercises must be plain text (no `:::exercise` markers or markdown fences).
