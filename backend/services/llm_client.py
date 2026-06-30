import os
import time
import json
import logging
import re
from typing import Optional

import anthropic
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_client: Optional[anthropic.Anthropic] = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable not set")
        _client = anthropic.Anthropic(api_key=api_key)
    return _client


def call_claude(system_prompt: str, user_message: str, max_tokens: int = 2000) -> str:
    client = _get_client()
    last_error = None

    for attempt in range(3):
        try:
            start_time = time.time()
            message = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=max_tokens,
                system=system_prompt,
                messages=[{"role": "user", "content": user_message}]
            )
            elapsed = round((time.time() - start_time) * 1000)
            response_text = message.content[0].text
            logger.info(
                f"Claude call success | attempt={attempt+1} | "
                f"input_tokens={message.usage.input_tokens} | "
                f"output_tokens={message.usage.output_tokens} | "
                f"elapsed_ms={elapsed}"
            )
            return response_text

        except anthropic.RateLimitError as e:
            logger.warning(f"Claude rate limit on attempt {attempt+1}: {str(e)}")
            last_error = e
            time.sleep(2 * (attempt + 1))

        except anthropic.APIError as e:
            logger.error(f"Claude API error on attempt {attempt+1}: {str(e)}")
            last_error = e
            if attempt < 2:
                time.sleep(2)

    raise RuntimeError(f"Claude API call failed after 3 attempts: {str(last_error)}")


def call_claude_json(system_prompt: str, user_message: str, max_tokens: int = 2000) -> dict:
    response_text = call_claude(system_prompt, user_message, max_tokens)

    # First try direct JSON parse
    try:
        return json.loads(response_text.strip())
    except json.JSONDecodeError:
        pass

    # Try extracting from markdown code block
    code_block_match = re.search(r'```(?:json)?\s*([\s\S]*?)```', response_text, re.IGNORECASE)
    if code_block_match:
        try:
            return json.loads(code_block_match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Try finding first { ... } block
    brace_match = re.search(r'\{[\s\S]*\}', response_text)
    if brace_match:
        try:
            return json.loads(brace_match.group(0))
        except json.JSONDecodeError:
            pass

    logger.error(f"Failed to parse JSON from Claude response: {response_text[:500]}")
    raise ValueError(f"Could not parse JSON from Claude response. Raw: {response_text[:300]}")