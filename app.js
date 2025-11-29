// State management
const state = {
    selectedTime: '14:00',
    timezones: []
};

// Common timezones
const popularTimezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Toronto',
    'America/Mexico_City',
    'America/Sao_Paulo',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Moscow',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Hong_Kong',
    'Australia/Sydney',
    'Pacific/Auckland'
];

// Initialize app
function init() {
    populateTimezoneSelect();
    setupEventListeners();
    loadFromLocalStorage();
    updateAllTimes();
}

// Populate timezone dropdown
function populateTimezoneSelect() {
    const select = document.getElementById('timezone-select');
    
    popularTimezones.forEach(tz => {
        const option = document.createElement('option');
        option.value = tz;
        option.textContent = tz.replace(/_/g, ' ');
        select.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('meeting-time').addEventListener('change', (e) => {
        state.selectedTime = e.target.value;
        updateAllTimes();
    });

    document.getElementById('now-btn').addEventListener('click', setCurrentTime);
    document.getElementById('add-btn').addEventListener('click', addTimezone);
    document.getElementById('copy-btn').addEventListener('click', copyAllTimes);
    document.getElementById('clear-btn').addEventListener('click', clearAll);
}

// Set current time
function setCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    state.selectedTime = `${hours}:${minutes}`;
    document.getElementById('meeting-time').value = state.selectedTime;
    updateAllTimes();
}

// Add timezone
function addTimezone() {
    const select = document.getElementById('timezone-select');
    const timezone = select.value;
    
    if (!timezone) {
        showToast('Please select a timezone');
        return;
    }
    
    if (state.timezones.includes(timezone)) {
        showToast('Timezone already added');
        return;
    }
    
    state.timezones.push(timezone);
    select.value = '';
    saveToLocalStorage();
    renderTimezones();
}

// Remove timezone
function removeTimezone(timezone) {
    state.timezones = state.timezones.filter(tz => tz !== timezone);
    saveToLocalStorage();
    renderTimezones();
}

// Render timezones
function renderTimezones() {
    const container = document.getElementById('timezone-list');
    container.innerHTML = '';
    
    if (state.timezones.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">Add timezones to get started</p>';
        return;
    }
    
    state.timezones.forEach(timezone => {
        const card = createTimezoneCard(timezone);
        container.appendChild(card);
    });
}

// Create timezone card
function createTimezoneCard(timezone) {
    const card = document.createElement('div');
    card.className = 'timezone-card';
    
    const timeData = getTimeInTimezone(timezone);
    
    // Highlight business hours (9 AM - 5 PM)
    if (timeData.hour >= 9 && timeData.hour < 17) {
        card.classList.add('business-hours');
    }
    
    card.innerHTML = `
        <div class="timezone-info">
            <div class="timezone-name">${timezone.replace(/_/g, ' ')}</div>
            <div class="timezone-time">${timeData.time}</div>
            <div class="timezone-date">${timeData.date}</div>
        </div>
        <button class="remove-btn" onclick="removeTimezone('${timezone}')">Remove</button>
    `;
    
    return card;
}

// Get time in specific timezone
function getTimeInTimezone(timezone) {
    const [hours, minutes] = state.selectedTime.split(':');
    const now = new Date();
    now.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
    
    const hourFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false
    });
    
    return {
        time: formatter.format(now),
        date: dateFormatter.format(now),
        hour: parseInt(hourFormatter.format(now))
    };
}

// Update all times
function updateAllTimes() {
    renderTimezones();
}

// Copy all times to clipboard
async function copyAllTimes() {
    if (state.timezones.length === 0) {
        showToast('Add timezones first');
        return;
    }
    
    let text = `Meeting Time:\n\n`;
    
    state.timezones.forEach(timezone => {
        const timeData = getTimeInTimezone(timezone);
        text += `${timezone.replace(/_/g, ' ')}: ${timeData.time} (${timeData.date})\n`;
    });
    
    try {
        await navigator.clipboard.writeText(text);
        showToast('✓ Copied to clipboard!');
    } catch (err) {
        showToast('Failed to copy');
    }
}

// Clear all timezones
function clearAll() {
    if (state.timezones.length === 0) return;
    
    if (confirm('Clear all timezones?')) {
        state.timezones = [];
        saveToLocalStorage();
        renderTimezones();
        showToast('All timezones cleared');
    }
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Local storage
function saveToLocalStorage() {
    localStorage.setItem('meetingTimeFinder', JSON.stringify(state));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('meetingTimeFinder');
    if (saved) {
        const data = JSON.parse(saved);
        state.timezones = data.timezones || [];
        if (data.selectedTime) {
            state.selectedTime = data.selectedTime;
            document.getElementById('meeting-time').value = data.selectedTime;
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
