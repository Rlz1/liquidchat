import requests

OPENROUTER_API_KEY = "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"

MODEL_ENDPOINTS = {
    "gpt": "https://openrouter.ai/api/v1/gpt",
    "mistral": "https://openrouter.ai/api/v1/mistral"
}

def ask_model(model: str, message: str) -> str:
    """
    Отправляет сообщение на выбранную модель через OpenRouter
    и возвращает ответ.
    """
    if model not in MODEL_ENDPOINTS:
        return "Неизвестная модель"

    headers = {"Authorization": f"Bearer {OPENROUTER_API_KEY}"}
    payload = {"input": message}

    try:
        response = requests.post(MODEL_ENDPOINTS[model], json=payload, headers=headers, timeout=15)
        response.raise_for_status()
        return response.json().get("output", "Нет ответа")
    except Exception as e:
        return f"Ошибка: {e}"
