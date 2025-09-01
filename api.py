from openai import OpenAI
import json
import os
from typing import List, Optional

class OpenRouterClient:
    def __init__(self, api_keys: List[str]):
        self.api_keys = api_keys
        self.current_key_index = 0
        self.clients = []
        self._initialize_clients()
    
    def _initialize_clients(self):
        """Инициализирует клиенты для всех ключей"""
        self.clients = []
        for key in self.api_keys:
            try:
                client = OpenAI(
                    base_url="https://openrouter.ai/api/v1",
                    api_key=key
                )
                self.clients.append(client)
            except Exception as e:
                print(f"Ошибка инициализации клиента для ключа: {e}")
    
    def get_current_client(self) -> Optional[OpenAI]:
        """Возвращает текущий активный клиент"""
        if not self.clients:
            return None
        return self.clients[self.current_key_index]
    
    def rotate_key(self) -> bool:
        """Переключается на следующий ключ"""
        if len(self.clients) <= 1:
            return False
        
        self.current_key_index = (self.current_key_index + 1) % len(self.clients)
        print(f"Переключено на ключ #{self.current_key_index + 1}")
        return True

def load_api_keys(file_path: str = "api_keys.json") -> List[str]:
    """Загружает API ключи из JSON файла"""
    try:
        if not os.path.exists(file_path):
            print(f"Файл {file_path} не найден. Использую ключ по умолчанию.")
            return []
        
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        return data.get("openrouter", [])
    
    except Exception as e:
        print(f"Ошибка загрузки API ключей: {e}")
        return []

# Загружаем ключи из файла
api_keys = load_api_keys()

# Если файл не найден или пустой, используем ключ по умолчанию
if not api_keys:
    api_keys = ["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"]

# Создаем клиент с ротацией ключей
openrouter_client = OpenRouterClient(api_keys)

# Словарь моделей
MODELS = {
    "deepseek": "deepseek/deepseek-chat-v3.1:free",
    "mistral": "mistralai/mistral-small-3.2-24b-instruct:free",
    "hunyuan": "tencent/hunyuan-a13b-instruct:free",
    "dolphin": "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    "kimi": "moonshotai/kimi-k2:free",
    "qwen_coder": "qwen/qwen3-coder:free",
    "glm": "z-ai/glm-4.5-air:free"
}

def ask_model(model_key: str, message: str, max_retries: int = 3) -> str:
    """Запрашивает ответ у модели с возможностью ротации ключей"""
    if model_key not in MODELS:
        return "Неизвестная модель"
    
    model_name = MODELS[model_key]
    messages = [{"role": "user", "content": message}]
    
    retries = 0
    last_error = None
    
    while retries < max_retries:
        client = openrouter_client.get_current_client()
        if not client:
            return "Нет доступных API клиентов"
        
        try:
            completion = client.chat.completions.create(
                model=model_name,
                messages=messages,
                extra_headers={
                    "HTTP-Referer": "http://localhost:5000",
                    "X-Title": "LoqChat"
                }
            )
            return completion.choices[0].message.content
        
        except Exception as e:
            last_error = str(e)
            print(f"Ошибка запроса (попытка {retries + 1}): {last_error}")
            
            # Пробуем следующий ключ
            if not openrouter_client.rotate_key():
                break  # Если ключи закончились, выходим
            
            retries += 1
    
    # Если все попытки исчерпаны
    error_msg = f"Ошибка запроса после {retries} попыток"
    if last_error:
        error_msg += f": {last_error}"
    
    return error_msg

# Функция для получения информации о текущем ключе (для отладки)
def get_current_key_info() -> dict:
    """Возвращает информацию о текущем используемом ключе"""
    return {
        "current_key_index": openrouter_client.current_key_index,
        "total_keys": len(openrouter_client.clients),
        "keys_available": len(openrouter_client.api_keys)
    }