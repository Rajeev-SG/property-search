import asyncio
import os

from dotenv import load_dotenv
from browser_use import Agent, ChatOpenAI

load_dotenv()


def normalize_openrouter_model(model: str) -> str:
    if model == "glm-5":
        return "z-ai/glm-5"

    return model


async def main() -> None:
    model = normalize_openrouter_model(
        os.getenv("BROWSER_USE_MODEL") or os.getenv("OPENROUTER_MODEL") or "glm-5"
    )
    base_url = os.getenv("BROWSER_USE_OPENAI_COMPATIBLE_BASE_URL") or "https://openrouter.ai/api/v1"
    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY is required for browser-use smoke testing")

    llm = ChatOpenAI(
        model=model,
        base_url=base_url,
        api_key=api_key,
    )

    agent = Agent(
        task="Open https://example.com and return the page title only.",
        llm=llm,
        use_vision=False,
    )

    history = await agent.run(max_steps=5)

    is_successful = getattr(history, "is_successful", None)
    if callable(is_successful):
        if not is_successful():
            raise RuntimeError("browser-use agent run did not complete successfully")

    final_result = getattr(history, "final_result", None)
    if callable(final_result):
        result = final_result()
        if not result:
            raise RuntimeError("browser-use agent run did not produce a final result")

    print("browser-use smoke test completed")


if __name__ == "__main__":
    asyncio.run(main())
