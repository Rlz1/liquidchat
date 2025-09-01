from openai import OpenAI

OPENROUTER_API_KEY = "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"

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY
)

MODELS = {
    "deepseek": "deepseek/deepseek-chat-v3.1:free",
    "mistral": "mistralai/mistral-small-3.2-24b-instruct:free",
    "hunyuan": "tencent/hunyuan-a13b-instruct:free",
    "dolphin": "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    "kimi": "moonshotai/kimi-k2:free",
    "qwen_coder": "qwen/qwen3-coder:free",
    "glm": "z-ai/glm-4.5-air:free"
}

def ask_model(model_key: str, message: str) -> str:
    if model_key not in MODELS:
        return "Неизвестная модель"
    
    model_name = MODELS[model_key]

    messages = [{"role": "user", "content": message}]

    try:
        completion = client.chat.completions.create(
            model=model_name,
            messages=messages,
            extra_headers={
                "HTTP-Referer": "http://localhost:5000",
                "X-Title": "LiquidChat"
            }
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Ошибка запроса: {e}"