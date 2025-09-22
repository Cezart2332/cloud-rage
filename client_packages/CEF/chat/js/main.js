const settings = {
    timeStamp: false,
    removeInputColors: false,
    characterCount: true,
    lowerCaseCommand: true,
    scrollbar: false,
    maxLength: 200
}

let CHAT_BOX, MESSAGE_LIST, CHAT_INPUT, CHAR_COUNT, CONTEXT_MENU, COPY_ITEM;

let chatActive = true;
let chatInputStatus = false;
let selectedMessage = null;

const inputHistory = [];
let inputHistoryPosition = -1;
let inputCache = "";

const chatAPI = {
    clear: () => {
        MESSAGE_LIST.innerHTML = "";
    },

    push: (text) => {
        if(text.length < 1) return;

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message stroke';
        
        // Add timestamp if enabled
        if(settings.timeStamp) {
            const timeSpan = document.createElement('span');
            timeSpan.className = 'timeStamp';
            timeSpan.textContent = getDateString();
            messageDiv.appendChild(timeSpan);
        }
        
        // Add message text
        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        messageDiv.appendChild(textSpan);
        
        // Add right-click event listener
        messageDiv.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            selectedMessage = messageDiv;
            showContextMenu(e.clientX, e.clientY);
        });
        
        MESSAGE_LIST.appendChild(messageDiv);

        MESSAGE_LIST.childElementCount > 100 && MESSAGE_LIST.firstElementChild.remove();
        MESSAGE_LIST.scrollTop = MESSAGE_LIST.scrollHeight;
    },

    activate: (toggle) => {
        if(!toggle && chatActive)
            setChatInputStatus(false);
        chatActive = toggle;
    },

    show: (toggle) => {
        if(!toggle && chatInputStatus)
            setChatInputStatus(false);

        toggle ? CHAT_BOX.className = "chatBox" : CHAT_BOX.className = "hide";

        chatActive = toggle;
    }
}

if(typeof mp !== 'undefined') {
    const api = {"chat:push": chatAPI.push, "chat:clear": chatAPI.clear, "chat:activate": chatAPI.activate, "chat:show": chatAPI.show}; 

    for(const fn in api) {
        mp.events.add(fn, api[fn]);
    }
}

const setChatInputStatus = (status) => {
    if((!chatActive && status) || (status == chatInputStatus))
        return;

    mp.invoke("focus", status);
    mp.invoke("setTypingInChatState", status);

    if(status) {
        chatInputStatus = true;
        CHAT_INPUT.className = "inputBar";
        if(settings.characterCount)
            CHAR_COUNT.className = "charCount stroke";
        
        // Ensure proper focus with a small delay
        setTimeout(() => {
            CHAT_INPUT.focus();
            CHAT_INPUT.select();
        }, 10);
    } else {
        chatInputStatus = false;
        CHAT_INPUT.className = "hide";
        CHAR_COUNT.className = "hide";
        CHAT_INPUT.blur();
    }
}

const getDateString = () => {
    const date = new Date();
    const h = "0"+date.getHours().toString();
    const m = "0"+date.getMinutes().toString();
    const s = "0"+date.getSeconds().toString();
    return `[${h.substr(h.length-2)}:${m.substr(m.length-2)}:${s.substr(s.length-2)}]`;
}

String.prototype.lowerCaseFirstWord = function() {
    const word = this.split(" ")[0];
    return this.replace(new RegExp(word, "gi"), word.toLowerCase());
}

const updateCharCount = () => {
    CHAR_COUNT.innerText = `${CHAT_INPUT.value.length}/${settings.maxLength}`;
}

const sendInput = () => {
    let message = CHAT_INPUT.value.trim();

    if(settings.removeInputColors)
        message = message.replace(/(?=!{).*(?<=})/g, "");

    if(message.length < 1) {
        setChatInputStatus(false);
        return;
    }

    if(message[0] == "/") {
        if(message.length < 2) {
            setChatInputStatus(false);
            return;
        }
        mp.invoke("command", settings.lowerCaseCommand ? message.lowerCaseFirstWord().substr(1) : message.substr(1));
    } else {
        mp.invoke("chatMessage", message);
    }

    inputHistory.unshift(message);
    inputHistory.length > 100 && inputHistory.pop();
    CHAT_INPUT.value = "";
    inputHistoryPosition = -1;
    CHAR_COUNT.innerText = `0/${settings.maxLength}`;
    setChatInputStatus(false);
}

const onArrowUp = () => {
    if(inputHistoryPosition == inputHistory.length - 1)
        return;

    if(inputHistoryPosition == -1)
        inputCache = CHAT_INPUT.value;

    inputHistoryPosition++;
    CHAT_INPUT.value = inputHistory[inputHistoryPosition];
}

const onArrowDown = () => {
    if(inputHistoryPosition === -1)
        return;

    if(inputHistoryPosition === 0) {
        CHAT_INPUT.value = inputCache;
        inputHistoryPosition = -1;
        return;
    }

    inputHistoryPosition--;
    CHAT_INPUT.value = inputHistory[inputHistoryPosition];
}

// Context Menu Functions
const showContextMenu = (x, y) => {
    CONTEXT_MENU.style.display = 'block';
    CONTEXT_MENU.style.left = x + 'px';
    CONTEXT_MENU.style.top = y + 'px';
    
    // Ensure menu stays within viewport
    const rect = CONTEXT_MENU.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        CONTEXT_MENU.style.left = (x - rect.width) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
        CONTEXT_MENU.style.top = (y - rect.height) + 'px';
    }
}

const hideContextMenu = () => {
    CONTEXT_MENU.style.display = 'none';
    selectedMessage = null;
}

const copyMessageText = () => {
    if (!selectedMessage) return;
    
    // Extract text content from the message, excluding timestamp
    const textSpans = selectedMessage.querySelectorAll('span:not(.timeStamp)');
    const messageText = Array.from(textSpans).map(span => span.textContent).join(' ');
    
    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(messageText).then(() => {
            hideContextMenu();
        }).catch(() => {
            // Fallback for older browsers
            fallbackCopyTextToClipboard(messageText);
        });
    } else {
        // Fallback for older browsers
        fallbackCopyTextToClipboard(messageText);
    }
}

const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Fallback: Could not copy text: ', err);
    }
    
    document.body.removeChild(textArea);
    hideContextMenu();
}

const onDocumentReady = () => {
    CHAT_BOX = document.getElementById("chatbox");
    MESSAGE_LIST = document.getElementById("messageslist");
    CHAT_INPUT = document.getElementById("chatinput");
    CHAR_COUNT = document.getElementById("charCount");
    CONTEXT_MENU = document.getElementById("contextMenu");
    COPY_ITEM = document.getElementById("copyItem");
    CHAT_INPUT.oninput = updateCharCount;
    CHAT_INPUT.maxLength = settings.maxLength;

    if(settings.scrollbar) {
        MESSAGE_LIST.style.overflowY = "auto"
    }

    updateCharCount();

    // Context menu event listeners
    COPY_ITEM.addEventListener('click', copyMessageText);
    document.addEventListener('click', (e) => {
        if (!CONTEXT_MENU.contains(e.target)) {
            hideContextMenu();
        }
    });

    chatAPI.push("Multiplayer started.");

    document.addEventListener("keydown", (e) => {
        switch(e.which) {
            case 84:
                if(!chatInputStatus && chatActive) {
                    setChatInputStatus(true); 
                    e.preventDefault();
                }
                break;

            case 13:
                if(chatInputStatus)
                    sendInput();
                break;

            case 38:
                if(chatInputStatus) {
                    onArrowUp();
                    updateCharCount();
                    e.preventDefault();
                }
                break;

            case 40:
                if(chatInputStatus) {
                    onArrowDown(); 
                    updateCharCount();
                    e.preventDefault();
                }
                break;

            case 33:
                MESSAGE_LIST.scrollTop -= 15;
                break;

            case 34:
                MESSAGE_LIST.scrollTop += 15;
                break;

            case 27:
                if(chatInputStatus && chatActive) {
                    setChatInputStatus(false);
                    e.preventDefault();
                }
                break;
        }
    });
}

document.addEventListener('DOMContentLoaded', onDocumentReady);