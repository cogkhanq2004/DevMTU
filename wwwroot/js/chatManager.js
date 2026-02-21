(function () {
    'use strict';

    let activeChatWindows = [];
    const maxChatWindows = 3;
    let hubConnection = null;

    function getOrCreateConnection() {
        if (hubConnection) return hubConnection;
        if (typeof signalR === 'undefined') return null;

        hubConnection = new signalR.HubConnectionBuilder()
            .withUrl('/chatHub')
            .withAutomaticReconnect()
            .build();

        hubConnection.on('ReceiveMessage', function (msg) {
            const chatWindow = document.querySelector('.chat-box[data-chat-id="' + msg.senderId + '"]');
            if (!chatWindow) return;
            const messagesContainer = chatWindow.querySelector('.chat-messages');
            if (!messagesContainer) return;
            appendMessage(messagesContainer, msg.content, false, msg.time, msg.imageUrl);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });

        hubConnection.start().catch(function (err) {
            console.error('SignalR chatManager error:', err);
        });

        return hubConnection;
    }

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setup);
        } else {
            setup();
        }
    }

    function setup() {
        getOrCreateConnection();
        document.addEventListener('click', function (event) {
            const contactItem = event.target.closest('.contact-item');
            if (contactItem && !event.target.closest('.mini-chat-window')) {
                handleContactClick({ currentTarget: contactItem });
            }
        });
    }

    function handleContactClick(event) {
        const contactItem = event.currentTarget;
        const userId = contactItem.getAttribute('data-user-id');
        const userName = contactItem.querySelector('.contact-name')?.textContent || 'User';
        const userAvatar = contactItem.querySelector('.contact-avatar img')?.src || '/assets/user.png';
        if (userId) openChatWindow(userId, userName, userAvatar);
    }

    function openChatWindow(userId, userName, userAvatar) {
        const existingWindow = document.querySelector('.chat-box[data-chat-id="' + userId + '"]');
        if (existingWindow) {
            existingWindow.classList.add('chat-focus');
            setTimeout(function () { existingWindow.classList.remove('chat-focus'); }, 300);
            return;
        }

        if (activeChatWindows.length >= maxChatWindows) {
            const oldestWindow = activeChatWindows.shift();
            oldestWindow.remove();
        }

        getOrCreateConnection();

        const chatWindow = createChatWindow(userId, userName, userAvatar);
        document.body.appendChild(chatWindow);
        activeChatWindows.push(chatWindow);

        const rightOffset = 90 + (activeChatWindows.length - 1) * 320;
        chatWindow.style.right = rightOffset + 'px';

        attachChatWindowListeners(chatWindow, userId);

        setTimeout(function () { chatWindow.classList.add('chat-show'); }, 10);

        loadMessages(userId, chatWindow);
    }

    function createChatWindow(userId, userName, userAvatar) {
        const chatWindow = document.createElement('div');
        chatWindow.className = 'chat-box';
        chatWindow.setAttribute('data-chat-id', userId);
        chatWindow.innerHTML =
            '<div class="chat-header">' +
            '<img src="' + escapeHtml(userAvatar) + '" alt="' + escapeHtml(userName) + '" class="chat-user-avatar">' +
            '<div class="chat-user-info">' +
            '<span class="chat-user-name">' + escapeHtml(userName) + '</span>' +
            '<span class="chat-user-status">Đang hoạt động</span>' +
            '</div>' +
            '<button class="chat-close-btn" type="button" aria-label="Đóng">&times;</button>' +
            '</div>' +
            '<div class="chat-messages"></div>' +
            '<div class="chat-input-area">' +
            '<input type="text" class="chat-input" placeholder="Nhập tin nhắn..." />' +
            '<button class="chat-send-btn" type="button" aria-label="Gửi">' +
            '<i class="fa-solid fa-paper-plane"></i>' +
            '</button>' +
            '</div>';
        return chatWindow;
    }

    function attachChatWindowListeners(chatWindow, userId) {
        const closeBtn = chatWindow.querySelector('.chat-close-btn');
        if (closeBtn) closeBtn.onclick = function () { closeChatWindow(chatWindow); };

        const sendBtn = chatWindow.querySelector('.chat-send-btn');
        const input = chatWindow.querySelector('.chat-input');

        if (sendBtn && input) {
            sendBtn.onclick = function () { sendMessage(chatWindow, input, userId); };
            input.onkeypress = function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(chatWindow, input, userId);
                }
            };
        }
    }

    async function loadMessages(userId, chatWindow) {
        const messagesContainer = chatWindow.querySelector('.chat-messages');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = '<div class="chat-loading" style="text-align:center;padding:20px;color:var(--lofi-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải...</div>';

        try {
            const response = await fetch('/Message/GetMessages?partnerId=' + userId);
            const data = await response.json();

            messagesContainer.innerHTML = '';

            if (data.success && data.messages && data.messages.length > 0) {
                data.messages.forEach(function (msg) {
                    appendMessage(messagesContainer, msg.content, msg.isOwn, msg.time, msg.imageUrl);
                });
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            } else {
                messagesContainer.innerHTML = '<div class="chat-empty-state"><i class="fa-regular fa-comment-dots"></i><p>Chưa có tin nhắn</p></div>';
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            messagesContainer.innerHTML = '<div class="chat-empty-state"><p>Không thể tải tin nhắn</p></div>';
        }
    }

    function appendMessage(container, content, isOwn, time, imageUrl) {
        const emptyState = container.querySelector('.chat-empty-state');
        if (emptyState) emptyState.remove();

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message ' + (isOwn ? 'outgoing' : 'incoming');

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';

        if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = 'Image';
            img.style.cssText = 'max-width:200px;border-radius:8px;margin-bottom:4px;';
            bubble.appendChild(img);
            bubble.appendChild(document.createElement('br'));
        }
        if (content) bubble.appendChild(document.createTextNode(content));

        const timeEl = document.createElement('span');
        timeEl.className = 'message-time';
        timeEl.textContent = time || '';
        bubble.appendChild(timeEl);

        messageDiv.appendChild(bubble);
        container.appendChild(messageDiv);
    }

    async function sendMessage(chatWindow, input, receiverId) {
        const content = input.value.trim();
        if (!content) return;

        const messagesContainer = chatWindow.querySelector('.chat-messages');
        if (!messagesContainer) return;

        input.disabled = true;
        const sendBtn = chatWindow.querySelector('.chat-send-btn');
        if (sendBtn) sendBtn.disabled = true;

        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        appendMessage(messagesContainer, content, true, timeStr);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        input.value = '';

        try {
            const formData = new FormData();
            formData.append('ReceiverId', receiverId);
            formData.append('Content', content);

            const response = await fetch('/Message/SendMessage', { method: 'POST', body: formData });
            const data = await response.json();

            if (!data.success) {
                console.error('Failed to send message:', data.message);
                alert('Không thể gửi tin nhắn: ' + (data.message || 'Lỗi không xác định'));
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Không thể gửi tin nhắn. Vui lòng thử lại.');
        } finally {
            input.disabled = false;
            if (sendBtn) sendBtn.disabled = false;
            input.focus();
        }
    }

    function closeChatWindow(chatWindow) {
        chatWindow.classList.remove('chat-show');
        setTimeout(function () {
            chatWindow.remove();
            activeChatWindows = activeChatWindows.filter(function (w) { return w !== chatWindow; });
            repositionChatWindows();
        }, 300);
    }

    function repositionChatWindows() {
        activeChatWindows.forEach(function (window, index) {
            window.style.right = (90 + index * 320) + 'px';
        });
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    window.ChatManager = { openChat: openChatWindow, init: init };

    init();
})();
