import { $ } from './utils.js';
import { initGame, handleInput, setDuration, getDuration } from './game.js';
import { triggerBounceClick } from './animations.js';

// DOM Elements
const buttons = document.querySelectorAll('.time-btn');
const indicator = $('#selection-indicator');

// Input Handling
document.onkeydown = (e) => {
    handleInput(e.key);
};

// Security: Disable Right Click
document.addEventListener('contextmenu', event => event.preventDefault());

// UI Handling (Pill & Buttons)
function updatePill(btn) {
    indicator.style.width = `${btn.offsetWidth}px`;
    indicator.style.left = `${btn.offsetLeft}px`;
    
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

buttons.forEach(btn => {
    btn.onclick = () => {
        triggerBounceClick(btn);
        
        const val = parseInt(btn.dataset.val);
        // We get current duration from game state if needed, or just track it.
        // But since we are setting it, we blindly set it.
        // Slight optimization: check if changed.
        if (getDuration() === val) return; 

        setDuration(val);
        updatePill(btn);
        initGame();
    };
});

$('#again').onclick = () => {
    triggerBounceClick($('#again'));
    initGame();
};

// Initialization
const defaultBtn = Array.from(buttons).find(b => b.dataset.val === "30");
if (defaultBtn) updatePill(defaultBtn);

initGame();
