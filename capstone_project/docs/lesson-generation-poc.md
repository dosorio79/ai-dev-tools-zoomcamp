# Lesson Generation Format PoC

## Overview

The proof-of-concept lives in `notebooks/lesson_generation_format_poc.ipynb`. It explores a strict JSON lesson format (objective + sections + blocks) and tests multiple topics/levels. Outputs are captured in `notebooks/data/lesson_generation_test_results.csv`.

## Prompt format used

The PoC prompt enforced a human-readable JSON schema with the following requirements:

- Total minutes across sections must sum to exactly 15.
- Use 1-3 sections total.
- section.id must be one of: `concept`, `example`, `exercise`.
- Each section must include at least 1 block.
- block.type must be `text` or `python`.
- At least one block.type must be `python`.
- Python blocks must be runnable, minimal, and directly related to the topic.

## Results summary

The seven test cases in the CSV produced valid JSON every time. Observations from the stored outputs:

- All lessons had 3 sections with ids `concept`, `example`, `exercise`.
- Total minutes always summed to 15.
- Each lesson included exactly one `python` block.

## Validator rule candidates

The current `ValidatorAgent` enforces section-level structure and normalizes total minutes. Based on the PoC, these additional checks are good candidates for future validation:

- Enforce section count between 1 and 3.
- Enforce allowed section IDs (`concept`, `example`, `exercise`) and ensure they are unique.
- Require at least one block per section, with `text` or `python` types.
- Require at least one `python` block across the lesson.
- Validate that Python blocks are runnable (syntax check) and related to the topic.
- Ensure no extra keys beyond the expected schema when returning JSON-only formats.
