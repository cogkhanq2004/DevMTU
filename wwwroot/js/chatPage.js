const partnerId = window.chatConfig.partnerId;
const currentUserId = window.chatConfig.currentUserId;
const partnerAvatar = window.chatConfig.partnerAvatar;
const partnerName = window.chatConfig.partnerName;
const currentUserAvatar = window.chatConfig.currentUserAvatar;
let selectedImage = null;
let lastMessageId = 0;
let typingTimeout = null;

const connection = new signalR.HubConnectionBuilder()
    .withUrl('/chatHub')
    .withAutomaticReconnect()
    .build();

connection.on('ReceiveMessage', function (msg) {
    if (msg.senderId !== partnerId) return;
    appendIncomingMessage(msg);
});

connection.on('ReceiveTyping', function (senderId) {
    if (senderId !== partnerId) return;
    const indicator = document.getElementById('typingIndicator');
    indicator.style.display = 'flex';
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(function () {
        indicator.style.display = 'none';
    }, 3000);
});

connection.start().catch(function (err) {
    console.error('SignalR error:', err);
});

document.addEventListener('DOMContentLoaded', function () {
    loadMessages();

    document.getElementById('messageInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendMessage();
    });

    document.getElementById('messageInput').addEventListener('input', function () {
        connection.invoke('SendTyping', partnerId).catch(function () { });
    });

    document.getElementById('sendBtn').addEventListener('click', sendMessage);

    document.getElementById('emojiBtn').addEventListener('click', function (e) {
        e.stopPropagation();
        const picker = document.getElementById('emojiPicker');
        picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
    });

    document.querySelectorAll('.emoji-item').forEach(function (item) {
        item.addEventListener('click', function () {
            const input = document.getElementById('messageInput');
            input.value += this.textContent;
            input.focus();
            document.getElementById('emojiPicker').style.display = 'none';
        });
    });

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.emoji-picker') && !e.target.closest('.emoji-btn')) {
            document.getElementById('emojiPicker').style.display = 'none';
        }
    });

    document.getElementById('imageInput').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            selectedImage = file;
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('previewImg').src = e.target.result;
                document.getElementById('imagePreviewBar').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
});

function removeImagePreview() {
    selectedImage = null;
    document.getElementById('imageInput').value = '';
    document.getElementById('imagePreviewBar').style.display = 'none';
}

async function loadMessages() {
    try {
        const response = await fetch('/Message/GetMessages?partnerId=' + partnerId);
        const data = await response.json();
        if (data.success) {
            renderMessages(data.messages);
            if (data.messages && data.messages.length > 0) {
                lastMessageId = data.messages[data.messages.length - 1].id;
            }
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

function appendIncomingMessage(msg) {
    const area = document.getElementById('messagesArea');
    const emptyChat = area.querySelector('.empty-chat');
    if (emptyChat) emptyChat.remove();

    const group = document.createElement('div');
    group.className = 'message-group other';

    const avatar = document.createElement('img');
    avatar.src = partnerAvatar;
    avatar.alt = '';
    avatar.className = 'message-avatar';

    const bubbles = document.createElement('div');
    bubbles.className = 'message-bubbles';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    if (msg.imageUrl) {
        const img = document.createElement('img');
        img.src = msg.imageUrl;
        img.className = 'message-image';
        img.onclick = function () { window.open(img.src); };
        bubble.appendChild(img);
    }

    if (msg.content && msg.content !== '[Hình ảnh]') {
        bubble.appendChild(document.createTextNode(msg.content));
    }

    const timeEl = document.createElement('div');
    timeEl.className = 'message-time';
    timeEl.textContent = msg.time;

    bubbles.appendChild(bubble);
    bubbles.appendChild(timeEl);
    group.appendChild(avatar);
    group.appendChild(bubbles);
    area.appendChild(group);
    area.scrollTop = area.scrollHeight;
}

function renderMessages(messages) {
    const area = document.getElementById('messagesArea');

    if (!messages || messages.length === 0) {
        area.innerHTML =
            '<div class="empty-chat">' +
            '<i class="fa-solid fa-comments"></i>' +
            '<h3>Bắt đầu cuộc trò chuyện</h3>' +
            '<p>Gửi tin nhắn đầu tiên để bắt đầu</p>' +
            '</div>';
        return;
    }

    let html = '';
    let currentDate = '';
    let lastSenderId = null;

    messages.forEach(function (msg, index) {
        if (msg.date !== currentDate) {
            currentDate = msg.date;
            html += '<div class="date-separator"><span>' + msg.date + '</span></div>';
            lastSenderId = null;
        }

        const isOwn = msg.isOwn;

        if (msg.senderId !== lastSenderId) {
            if (lastSenderId !== null) html += '</div></div>';
            html += '<div class="message-group ' + (isOwn ? 'own' : 'other') + '">';
            if (!isOwn) html += '<img src="' + partnerAvatar + '" alt="" class="message-avatar">';
            html += '<div class="message-bubbles">';
        }

        let bubbleContent = '';
        if (msg.imageUrl) bubbleContent += '<img src="' + msg.imageUrl + '" class="message-image" onclick="window.open(this.src)">';
        if (msg.content && msg.content !== '[Hình ảnh]') bubbleContent += escapeHtml(msg.content);

        html += '<div class="message-bubble">' + bubbleContent + '</div>';

        const nextMsg = messages[index + 1];
        if (!nextMsg || nextMsg.senderId !== msg.senderId || nextMsg.date !== msg.date) {
            html += '<div class="message-time">' + msg.time + '</div>';
            html += '</div></div>';
            lastSenderId = null;
        } else {
            lastSenderId = msg.senderId;
        }
    });

    area.innerHTML = html;
    area.scrollTop = area.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    const btn = document.getElementById('sendBtn');

    if (!content && !selectedImage) return;

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    try {
        const formData = new FormData();
        formData.append('receiverId', partnerId);
        if (content) formData.append('content', content);
        if (selectedImage) formData.append('image', selectedImage);

        input.value = '';

        const area = document.getElementById('messagesArea');
        const emptyChat = area.querySelector('.empty-chat');
        if (emptyChat) emptyChat.remove();

        const tempMsg = document.createElement('div');
        tempMsg.className = 'message-group own';
        tempMsg.innerHTML = '<div class="message-bubbles"><div class="message-bubble">' +
            (selectedImage ? '<i class="fa-solid fa-image"></i> ' : '') +
            escapeHtml(content || 'Đang gửi...') + '</div></div>';
        area.appendChild(tempMsg);
        area.scrollTop = area.scrollHeight;

        const response = await fetch('/Message/SendMessage', { method: 'POST', body: formData });
        const data = await response.json();

        if (data.success) {
            lastMessageId = data.message.id;
            const bubbles = document.createElement('div');
            bubbles.className = 'message-bubbles';
            const bubble = document.createElement('div');
            bubble.className = 'message-bubble';
            if (data.message.imageUrl) {
                const img = document.createElement('img');
                img.src = data.message.imageUrl;
                img.className = 'message-image';
                img.onclick = function () { window.open(img.src); };
                bubble.appendChild(img);
            }
            if (data.message.content && data.message.content !== '[Hình ảnh]') {
                bubble.appendChild(document.createTextNode(data.message.content));
            }
            const timeEl = document.createElement('div');
            timeEl.className = 'message-time';
            timeEl.textContent = data.message.time;
            bubbles.appendChild(bubble);
            bubbles.appendChild(timeEl);
            tempMsg.innerHTML = '';
            tempMsg.appendChild(bubbles);
        } else {
            tempMsg.remove();
            alert(data.message || 'Không thể gửi tin nhắn');
        }

        if (selectedImage) removeImagePreview();
    } catch (error) {
        console.error('Error sending message:', error);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
