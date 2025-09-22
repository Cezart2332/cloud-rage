// Admin Panel Configuration
let adminLevel = 4; // This will be set via mp.events
let playerList = []; // List of all players
let factionList = []; // List of all factions









// Initialize the panel
const initPanel = () => {
    // Setup event listeners for main buttons
    document.getElementById('kickBtn').addEventListener('click', () => openModal('kickModal'));
    document.getElementById('banBtn').addEventListener('click', () => openModal('banModal'));
    document.getElementById('promoteHelperBtn').addEventListener('click', () => openModal('promoteHelperModal'));
    document.getElementById('promoteAdminBtn').addEventListener('click', () => openModal('promoteAdminModal'));
    document.getElementById('promoteLeaderBtn').addEventListener('click', () => openModal('promoteLeaderModal'));

    // Close panel button
    document.getElementById('closeBtn').addEventListener('click', closePanel);

    // Setup character counters for reason textareas
    setupCharacterCounter('kickReason', 'kickCharCount');
    setupCharacterCounter('banReason', 'banCharCount');

    // Update admin level restrictions
    updateAdminLevelRestrictions();

    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
};

// Setup character counter for textarea
const setupCharacterCounter = (textareaId, counterId) => {
    const textarea = document.getElementById(textareaId);
    const counter = document.getElementById(counterId);
    
    textarea.addEventListener('input', () => {
        const count = textarea.value.length;
        counter.textContent = count;
        
        const countElement = counter.parentElement;
        countElement.classList.remove('warning', 'danger');
        
        if (count > 180) {
            countElement.classList.add('danger');
        } else if (count > 150) {
            countElement.classList.add('warning');
        }
    });
};

// Update UI based on admin level restrictions
const updateAdminLevelRestrictions = () => {
    // Helper promotion - requires admin level or higher
    if (adminLevel < 6) {
        document.getElementById('promoteHelperBtn').classList.add('hidden');
    } else {
        document.getElementById('promoteHelperBtn').classList.remove('hidden');
    }

    // Admin promotion - requires leader level
    if (adminLevel < 6) {
        document.getElementById('promoteAdminBtn').classList.add('hidden');
    } else {
        document.getElementById('promoteAdminBtn').classList.remove('hidden');
    }

    // Leader promotion - requires leader level
    if (adminLevel < 6) {
        document.getElementById('promoteLeaderBtn').classList.add('hidden');
    } else {
        document.getElementById('promoteLeaderBtn').classList.remove('hidden');
    }
};

// Open a modal
const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        // Initialize custom dropdowns in this modal with a small delay to ensure DOM is ready
        setTimeout(() => {
            const dropdowns = modal.querySelectorAll('.custom-dropdown');
            dropdowns.forEach((dropdown) => {
                initCustomDropdown(dropdown);
            });
            
            // Update player selects after initialization
            updatePlayerSelects();
            
            // Update faction list for leader promotion
            if (modalId === 'promoteLeaderModal') {
                setTimeout(() => {
                    updateFactionSelect();
                }, 50);
            }
        }, 50);
    } else {
        console.error('Modal not found:', modalId);
    }
};

// Close a specific modal
const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    
    // Clear form data
    clearModalForm(modalId);
};

// Close all modals
const closeAllModals = () => {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.classList.remove('active');
        clearModalForm(modal.id);
    });
};

// Clear form data in modal
const clearModalForm = (modalId) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Clear custom dropdowns
    const dropdowns = modal.querySelectorAll('.custom-dropdown');
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (toggle) {
            let placeholderText = 'Choose an option...';
            
            if (dropdown.classList.contains('player-dropdown')) {
                placeholderText = 'Choose a player...';
            } else if (dropdown.classList.contains('faction-dropdown')) {
                placeholderText = 'Choose a faction...';
            }
            
            // Reset toggle text properly
            const toggleTextNode = toggle.childNodes[0];
            if (toggleTextNode && toggleTextNode.nodeType === Node.TEXT_NODE) {
                toggleTextNode.textContent = placeholderText;
            } else {
                toggle.textContent = placeholderText;
            }
        }
        
        // Clear state
        dropdown.removeAttribute('data-value');
        dropdown.classList.remove('active');
        
        if (menu) {
            menu.querySelectorAll('.dropdown-item').forEach(item => {
                item.classList.remove('selected');
            });
        }
    });
    
    // Clear textareas
    const textareas = modal.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.value = '';
        // Update character count
        const event = new Event('input');
        textarea.dispatchEvent(event);
    });
};

// Update faction select dropdown
const updateFactionSelect = () => {
    updateFactionSelectCustom();
};

// Update all player select dropdowns
const updatePlayerSelects = () => {
    // Use custom dropdown function
    updatePlayerSelectsCustom();
};

// Execute kick action
const executeKick = () => {
    const dropdown = document.getElementById('kickPlayerDropdown');
    const playerId = getCustomDropdownValue(dropdown);
    const reason = document.getElementById('kickReason').value.trim();
    
    if (!playerId) {
        showError('Please select a player to kick');
        return;
    }
    
    if (!reason) {
        showError('Please provide a reason for the kick');
        return;
    }
    
    const player = playerList.find(p => p.id == playerId);
    if (!player) {
        showError('Selected player not found');
        return;
    }
    
    mp.trigger('kickPlayerClient', playerId, reason);
    showSuccess(`Kicked ${player.name} - Reason: ${reason}`);
    closeModal('kickModal');
};

// Execute ban action
const executeBan = () => {
    const dropdown = document.getElementById('banPlayerDropdown');
    const playerId = getCustomDropdownValue(dropdown);
    const reason = document.getElementById('banReason').value.trim();
    
    if (!playerId) {
        showError('Please select a player to ban');
        return;
    }
    
    if (!reason) {
        showError('Please provide a reason for the ban');
        return;
    }
    
    const player = playerList.find(p => p.id == playerId);
    if (!player) {
        showError('Selected player not found');
        return;
    }
    
    // Send to server
    
    showSuccess(`Banned ${player.name} - Reason: ${reason}`);
    closeModal('banModal');
};

// Execute promotion action
const executePromote = (rank) => {
    let dropdownId, modalId, factionDropdownId = null;
    
    switch(rank) {
        case 'helper':
            dropdownId = 'promoteHelperDropdown';
            modalId = 'promoteHelperModal';
            break;
        case 'admin':
            dropdownId = 'promoteAdminDropdown';
            modalId = 'promoteAdminModal';
            break;
        case 'leader':
            dropdownId = 'promoteLeaderDropdown';
            modalId = 'promoteLeaderModal';
            factionDropdownId = 'promoteLeaderFactionDropdown';
            break;
        default:
            showError('Invalid promotion rank');
            return;
    }
    
    const dropdown = document.getElementById(dropdownId);
    const playerId = getCustomDropdownValue(dropdown);
    
    if (!playerId) {
        showError('Please select a player to promote');
        return;
    }
    
    let factionId = null;
    // For leader promotion, faction is required
    if (rank === 'leader') {
        const factionDropdown = document.getElementById(factionDropdownId);
        factionId = getCustomDropdownValue(factionDropdown);
        
        if (!factionId) {
            showError('Please select a faction for leader promotion');
            return;
        }
    }
    
    const player = playerList.find(p => p.id == playerId);
    if (!player) {
        showError('Selected player not found');
        return;
    }
    
    // Prepare promotion data
    const promotionData = {
        playerId: playerId,
        rank: rank
    };
    
    // Add faction for leader promotion
    if (rank === 'leader' && factionId) {
        promotionData.factionId = factionId;
        const faction = factionList.find(f => f.id == factionId);
        if (faction) {
            promotionData.factionName = faction.name;
        }
    }
    
    // Send to server
    if (typeof mp !== 'undefined') {
        mp.trigger('admin:promotePlayer', JSON.stringify(promotionData));
    }
    
    let successMessage = `Promoted ${player.name} to ${rank.charAt(0).toUpperCase() + rank.slice(1)}`;
    if (rank === 'leader' && promotionData.factionName) {
        successMessage += ` of ${promotionData.factionName}`;
    }
    
    showSuccess(successMessage);
    closeModal(modalId);
};

// Show success message
const showSuccess = (message) => {
    // Placeholder for lightweight toasts/notifications
};

// Show error message
const showError = (message) => {
    // Placeholder for lightweight toasts/notifications
};

// Close the admin panel
const closePanel = () => {
    if (typeof mp !== 'undefined') {
        mp.trigger('admin:closePanel');
    }
};

// Functions that can be called from RAGE:MP client
function setAdminLevel(level) {
    adminLevel = parseInt(level) || 0;
    updateAdminLevelRestrictions();
}

function setPlayerList(players) {
    if (players && typeof players === 'string') {
        try {
            playerList = JSON.parse(players);
        } catch (e) {
            console.error('Error parsing player list:', e);
            playerList = [];
        }
    } else if (Array.isArray(players)) {
        playerList = players;
    } else {
        playerList = [];
    }
    updatePlayerSelects();
}

function setFactionList(factions) {
    if (factions && typeof factions === 'string') {
        try {
            factionList = JSON.parse(factions);
        } catch (e) {
            factionList = [];
        }
    } else if (Array.isArray(factions)) {
        factionList = factions;
    } else {
        factionList = [];
    }
    updateFactionSelect();
}

function showAdminPanel(adminLevel, players) {
    setAdminLevel(adminLevel);
    setPlayerList(players);
    initPanel();
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.style.display = 'block';
    } else {
        console.error('Admin panel element not found');
    }
}

function hideAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
    closeAllModals();
}

// Custom Dropdown Functions
function initCustomDropdown(dropdownElement) {
    if (!dropdownElement) return;
    
    // Prevent double initialization
    if (dropdownElement.hasAttribute('data-initialized')) {
        return;
    }
    dropdownElement.setAttribute('data-initialized', 'true');
    
    const toggle = dropdownElement.querySelector('.dropdown-toggle');
    const menu = dropdownElement.querySelector('.dropdown-menu');
    
    if (!toggle || !menu) {
        console.error('Dropdown missing required elements:', dropdownElement.id);
        return;
    }
    
    // Remove any existing listeners first
    const existingHandler = toggle._clickHandler;
    if (existingHandler) {
        toggle.removeEventListener('click', existingHandler);
    }
    
    // Toggle dropdown on click
    const clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Close other dropdowns
        document.querySelectorAll('.custom-dropdown.active').forEach(dropdown => {
            if (dropdown !== dropdownElement) {
                dropdown.classList.remove('active');
            }
        });
        
        // Toggle current dropdown
        const wasActive = dropdownElement.classList.contains('active');
        dropdownElement.classList.toggle('active');
    };
    
    toggle._clickHandler = clickHandler;
    toggle.addEventListener('click', clickHandler);
    
    // Handle item selection - use event delegation for better reliability
    const menuClickHandler = (e) => {
        e.stopPropagation();
        
        if (e.target.classList.contains('dropdown-item')) {
            const value = e.target.getAttribute('data-value');
            const text = e.target.textContent;
            
            // Update toggle text
            const toggleTextNode = toggle.childNodes[0];
            if (toggleTextNode && toggleTextNode.nodeType === Node.TEXT_NODE) {
                toggleTextNode.textContent = text;
            } else {
                toggle.textContent = text;
            }
            
            // Store selected value
            dropdownElement.setAttribute('data-value', value);
            
            // Remove selected class from all items
            menu.querySelectorAll('.dropdown-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            // Add selected class to clicked item
            e.target.classList.add('selected');
            
            // Close dropdown
            dropdownElement.classList.remove('active');
            
            // Trigger change event
            const event = new CustomEvent('change', { 
                detail: { value, text },
                bubbles: true
            });
            dropdownElement.dispatchEvent(event);
        }
    };
    
    menu._clickHandler = menuClickHandler;
    menu.addEventListener('click', menuClickHandler);
}

function populateCustomDropdown(dropdownElement, options, placeholder = 'Choose an option...') {
    if (!dropdownElement) {
        console.error('populateCustomDropdown: dropdownElement is null');
        return;
    }
    
    const toggle = dropdownElement.querySelector('.dropdown-toggle');
    const menu = dropdownElement.querySelector('.dropdown-menu');
    
    if (!toggle || !menu) {
        console.error('populateCustomDropdown: missing required elements in', dropdownElement.id);
        return;
    }
    
    // Reset toggle text, preserving any existing text nodes
    const toggleTextNode = toggle.childNodes[0];
    if (toggleTextNode && toggleTextNode.nodeType === Node.TEXT_NODE) {
        toggleTextNode.textContent = placeholder;
    } else {
        toggle.textContent = placeholder;
    }
    
    // Clear selected value
    dropdownElement.removeAttribute('data-value');
    
    // Clear menu with error handling
    try {
        menu.innerHTML = '';
    } catch (e) {
        console.error('Error clearing dropdown menu:', e);
        return;
    }
    
    // Add options with error handling
    options.forEach((option, index) => {
        try {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.setAttribute('data-value', option.value);
            item.textContent = option.text;
            menu.appendChild(item);
        } catch (e) {
            console.error('Error adding dropdown option', index, ':', e, option);
        }
    });
    
    // Ensure dropdown is initialized after population
    if (!dropdownElement.hasAttribute('data-initialized')) {
        setTimeout(() => initCustomDropdown(dropdownElement), 10);
    }
}

function getCustomDropdownValue(dropdownElement) {
    return dropdownElement.getAttribute('data-value') || '';
}

// Close dropdowns when clicking outside - improved version
document.addEventListener('click', (e) => {
    // Handle modal overlay clicks
    if (e.target.classList.contains('modal-overlay')) {
        closeModal(e.target.id);
        return;
    }
    
    // Handle dropdown outside clicks
    if (!e.target.closest('.custom-dropdown')) {
        const activeDropdowns = document.querySelectorAll('.custom-dropdown.active');
        if (activeDropdowns.length > 0) {
            activeDropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    }
});

// Initialize all custom dropdowns when DOM is loaded - improved version
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const dropdowns = document.querySelectorAll('.custom-dropdown');
        dropdowns.forEach((dropdown) => {
            initCustomDropdown(dropdown);
        });
    }, 50);
});

// Update the updatePlayerSelects function to work with custom dropdowns
const updatePlayerSelectsCustom = () => {
    const dropdownIds = [
        'kickPlayerDropdown',
        'banPlayerDropdown', 
        'promoteHelperDropdown',
        'promoteAdminDropdown',
        'promoteLeaderDropdown'
    ];
    
    dropdownIds.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        
        if (dropdown) {
            // Convert player list to options format
            const options = playerList.map(player => ({
                value: player.id.toString(),
                text: `${player.name} (ID: ${player.id})`
            }));
            
            populateCustomDropdown(dropdown, options, 'Choose a player...');
        } else {
            console.error(`Dropdown element not found: ${dropdownId}`);
        }
    });
};

// Update the updateFactionSelect function for custom dropdowns
const updateFactionSelectCustom = () => {
    const dropdown = document.getElementById('promoteLeaderFactionDropdown');
    if (dropdown) {
        const options = factionList.map(faction => ({
            value: faction.id.toString(),
            text: faction.name
        }));
        
        populateCustomDropdown(dropdown, options, 'Choose a faction...');
    }
};

function closeAdminPanel() {
    mp.trigger("closeAdminPanel");
}