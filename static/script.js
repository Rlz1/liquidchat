// Переключение темы
const themeToggle = document.getElementById("themeToggle");
const sidebarLogo = document.getElementById("sidebarLogo");
const headerLogo = document.getElementById("headerLogo");
const mobileLogo = document.getElementById("mobileLogo");

function updateLogos() {
    const isDark = document.body.classList.contains("dark");
    const logoPath = isDark ? "/static/img/logo_w.png" : "/static/img/logo_d.png";
    
    sidebarLogo.src = logoPath;
    headerLogo.src = logoPath;
    mobileLogo.src = logoPath;
}

themeToggle.addEventListener("click", () => {
    if(document.body.classList.contains("light")) {
        document.body.classList.remove("light");
        document.body.classList.add("dark");
        themeToggle.textContent = "☀️";
    } else {
        document.body.classList.remove("dark");
        document.body.classList.add("light");
        themeToggle.textContent = "🌙";
    }
    updateLogos();
});

// Переменные состояния
let currentModel = "deepseek";
let touchStartX = 0;
let touchCurrentX = 0;
let isSwiping = false;
const SWIPE_THRESHOLD = 50; // Минимальное расстояние свайпа
const modelAvatars = {
    deepseek: "/static/img/deepseek.png",
    mistral: "/static/img/mistral.png",
    hunyuan: "/static/img/hunyuan.png",
    dolphin: "/static/img/dolphin.png",
    kimi: "/static/img/kimi.png",
    qwen_coder: "/static/img/qwen_coder.png",
    glm: "/static/img/glm.png"
};
const modelNames = {
    deepseek: "DeepSeek",
    mistral: "Mistral Small",
    hunyuan: "Hunyuan",
    dolphin: "Dolphin",
    kimi: "Kimi",
    qwen_coder: "Qwen Coder",
    glm: "GLM 4.5"
};

// Элементы DOM
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatOutput = document.getElementById("chatOutput");
const desktopAiList = document.getElementById("desktopAiList");
const mobileAiList = document.getElementById("mobileAiList");
const mobileSidebar = document.getElementById("mobileSidebar");
const overlay = document.getElementById("overlay");
const closeSidebar = document.getElementById("closeSidebar");
const swipeHint = document.getElementById("swipeHint");

// Создание элементов списка ИИ
function createAiListItems(container) {
    container.innerHTML = '';
    Object.entries(modelNames).forEach(([modelKey, modelName]) => {
        const aiItem = document.createElement('div');
        aiItem.className = `ai-item ${modelKey === currentModel ? 'active' : ''}`;
        aiItem.dataset.model = modelKey;
        
        aiItem.innerHTML = `
            <img src="${modelAvatars[modelKey]}" alt="${modelName}">
            <div class="ai-info">
                <div class="ai-name">${modelName}</div>
            </div>
        `;
        
        aiItem.addEventListener('click', () => {
            selectModel(modelKey);
            if (window.innerWidth <= 768) {
                closeMobileSidebar();
            }
        });
        
        container.appendChild(aiItem);
    });
}

// Выбор модели
function selectModel(modelKey) {
    currentModel = modelKey;
    createAiListItems(desktopAiList);
    createAiListItems(mobileAiList);
    
    // Показываем уведомление о смене модели
    const notification = document.createElement('div');
    notification.className = 'message-container ai';
    notification.innerHTML = `
        <img class="avatar" src="${modelAvatars[modelKey]}" alt="${modelNames[modelKey]}">
        <div class="message-content">
            <div class="message ai-message">
                Теперь общаюсь как: <strong>${modelNames[modelKey]}</strong>
            </div>
        </div>
    `;
    chatOutput.appendChild(notification);
    chatOutput.scrollTop = chatOutput.scrollHeight;
}

// Открытие мобильной боковой панели
function openMobileSidebar() {
    mobileSidebar.classList.add('open');
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    if (swipeHint) swipeHint.style.display = 'none';
}

// Закрытие мобильной боковой панели
function closeMobileSidebar() {
    mobileSidebar.classList.remove('open');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
}

// Обработчики для мобильной панели
overlay.addEventListener('click', closeMobileSidebar);
closeSidebar.addEventListener('click', closeMobileSidebar);

// Улучшенная обработка свайпа для мобильных
function handleTouchStart(e) {
    if (window.innerWidth <= 768) {
        isSwiping = true;
        touchStartX = e.touches[0].clientX;
        touchCurrentX = touchStartX;
    }
}

function handleTouchMove(e) {
    if (!isSwiping) return;
    
    touchCurrentX = e.touches[0].clientX;
    const diff = touchCurrentX - touchStartX;
    
    // Предотвращаем скролл страницы во время свайпа
    if (Math.abs(diff) > 10) {
        e.preventDefault();
    }
    
    // Показываем панель при движении вправо
    if (diff > 0 && touchStartX < 50) {
        const translateX = Math.min(diff, mobileSidebar.offsetWidth);
        mobileSidebar.style.transform = `translateX(${translateX}px)`;
    }
}

function handleTouchEnd() {
    if (!isSwiping) return;
    
    const diff = touchCurrentX - touchStartX;
    
    // Если свайп достаточно длинный - открываем панель
    if (diff > SWIPE_THRESHOLD && touchStartX < 50) {
        openMobileSidebar();
    } else {
        // Иначе возвращаем на место
        mobileSidebar.style.transform = 'translateX(0)';
    }
    
    isSwiping = false;
    mobileSidebar.style.transform = ''; // Сбрасываем трансформацию
}

// Добавляем обработчики свайпа
document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('touchmove', handleTouchMove, { passive: false });
document.addEventListener('touchend', handleTouchEnd);
document.addEventListener('touchcancel', handleTouchEnd);

// Также обрабатываем клик по краю экрана для открытия
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && e.clientX < 20 && !mobileSidebar.classList.contains('open')) {
        openMobileSidebar();
    }
});

// Скрываем подсказку о свайпе после первого использования
let swipeHintShown = localStorage.getItem('swipeHintShown');

if (!swipeHintShown && window.innerWidth <= 768 && swipeHint) {
    setTimeout(() => {
        swipeHint.style.display = 'flex';
    }, 1000);
    
    setTimeout(() => {
        swipeHint.style.display = 'none';
        localStorage.setItem('swipeHintShown', 'true');
    }, 5000);
}

// Отправка сообщения по клику или Enter
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});

// Функция отправки сообщения
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    addMessageToChat(message, "user");
    messageInput.value = "";

    const typingIndicator = showTypingIndicator();

    try {
        const response = await fetch("/ask", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({message, model: currentModel})
        });

        const data = await response.json();
        removeTypingIndicator(typingIndicator);
        addMessageToChat(data.answer, "ai", true);
    } catch (error) {
        console.error("Ошибка:", error);
        removeTypingIndicator(typingIndicator);
        addMessageToChat("Произошла ошибка при отправке запроса.", "ai");
    }
}

// Функция показа индикатора печатания
function showTypingIndicator() {
    const typingContainer = document.createElement("div");
    typingContainer.classList.add("message-container", "ai");
    typingContainer.id = "typing-indicator";
    
    const avatar = document.createElement("img");
    avatar.classList.add("avatar");
    avatar.src = modelAvatars[currentModel];
    avatar.alt = modelNames[currentModel];
    
    const messageContent = document.createElement("div");
    messageContent.classList.add("message-content");
    
    const typingIndicator = document.createElement("div");
    typingIndicator.classList.add("typing-indicator");
    typingIndicator.innerHTML = `Печатает<span class="typing-dots"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></span>`;
    
    messageContent.appendChild(typingIndicator);
    typingContainer.appendChild(avatar);
    typingContainer.appendChild(messageContent);
    
    chatOutput.appendChild(typingContainer);
    chatOutput.scrollTop = chatOutput.scrollHeight;
    
    return typingContainer;
}

// Функция удаления индикатора печатания
function removeTypingIndicator(typingIndicator) {
    if (typingIndicator && typingIndicator.parentNode) {
        typingIndicator.parentNode.removeChild(typingIndicator);
    }
}

// Функция добавления сообщения в чат
function addMessageToChat(message, sender, withAnimation = false) {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("message-container", sender);
    
    if (sender === "ai") {
        const avatar = document.createElement("img");
        avatar.classList.add("avatar");
        avatar.src = modelAvatars[currentModel];
        avatar.alt = modelNames[currentModel];
        messageContainer.appendChild(avatar);
    }
    
    const messageContent = document.createElement("div");
    messageContent.classList.add("message-content");
    
    const messageEl = document.createElement("div");
    messageEl.classList.add("message", `${sender}-message`);
    
    if (sender === "ai" && withAnimation) {
        messageEl.innerHTML = `<span class="typing-animation">${message}</span>`;
        
        messageContent.appendChild(messageEl);
        messageContainer.appendChild(messageContent);
        chatOutput.appendChild(messageContainer);
        
        chatOutput.scrollTop = chatOutput.scrollHeight;
        
        setTimeout(() => {
            messageEl.innerHTML = message;
            chatOutput.scrollTop = chatOutput.scrollHeight;
        }, message.length * 40);
    } else {
        messageEl.textContent = message;
        messageContent.appendChild(messageEl);
        messageContainer.appendChild(messageContent);
        chatOutput.appendChild(messageContainer);
        chatOutput.scrollTop = chatOutput.scrollHeight;
    }
    
    if (sender === "user") {
        const avatar = document.createElement("img");
        avatar.classList.add("avatar");
        avatar.src = "/static/img/user.png";
        avatar.alt = "Вы";
        messageContainer.appendChild(avatar);
    }
}

// Инициализация
createAiListItems(desktopAiList);
createAiListItems(mobileAiList);
updateLogos();