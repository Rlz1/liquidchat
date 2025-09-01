async function sendMessage() {
    const msgInput = document.getElementById("userMsg");
    const msg = msgInput.value.trim();
    const model = document.getElementById("modelSelect").value;
    const chatLog = document.getElementById("chatLog");

    if (!msg) return;
    msgInput.value = "";

    // Показываем сообщение пользователя
    const userMsgElem = document.createElement("div");
    userMsgElem.className = "message user";
    userMsgElem.textContent = msg;
    chatLog.appendChild(userMsgElem);
    chatLog.scrollTop = chatLog.scrollHeight;

    // Показываем "печатает..." для бота
    const botMsgElem = document.createElement("div");
    botMsgElem.className = "message bot";
    botMsgElem.textContent = "Печатает...";
    chatLog.appendChild(botMsgElem);
    chatLog.scrollTop = chatLog.scrollHeight;

    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: msg, model: model })
        });
        const data = await res.json();
        botMsgElem.textContent = data.reply;
        chatLog.scrollTop = chatLog.scrollHeight;
    } catch (err) {
        botMsgElem.textContent = `Ошибка: ${err}`;
    }
}
