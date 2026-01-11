import { $ } from './utils.js';
import { triggerShurikenAnimation } from './animations.js';
import { playTypeSound, playHitSound, playMusic, stopMusic } from './sounds.js';

const WORD_LIST = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
];

let duration = 30;
let typed = "";
let timer = null;
let target = "";
let on = false;
let finished = false;
let t0 = 0;

const elements = {
    btns: $('#btns'),
    timer: $('#timer'),
    text: $('#text'),
    typing: $('#type-area'),
    wpm: $('#wpm'),
    acc: $('#accuracy'),
    results: $('#results'),
};

export function setDuration(val) {
    duration = val;
    elements.timer.textContent = duration;
}

export function getDuration() {
    return duration;
}

export function initGame() {
    resetGame();
    generateWords();
}

export function resetGame() {
    typed = "";
    on = false;
    finished = false;
    
    // UI Reset
    stopMusic(); // Ensure music stops on reset
    elements.typing.classList.remove('hide');
    elements.results.classList.add('hide');
    elements.results.classList.remove('results-animate');
    elements.btns.classList.remove('hide');
    elements.timer.classList.add('hide');

    elements.timer.textContent = duration;
    if (elements.wpm) elements.wpm.innerHTML = 'wpm';
    if (elements.acc) elements.acc.innerHTML = 'accuracy';
}

function generateWords() {
    const words = [];
    for (let i = 0; i < 50; i++) {
        words.push(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
    }
    target = words.join(" ");
    renderWords();
}

// Optimization: Render words once, then update classes
function renderWords() {
    if (!target) return;
    elements.text.innerHTML = target.split('').map((char) => {
        return `<span class="char">${char}</span>`;
    }).join('');
    // Initial cursor
    if (elements.text.children[0]) {
        elements.text.children[0].classList.add('cursor');
    }
}

function updateCharState(index, isBackspacing = false) {
    const chars = elements.text.children;
    
    // Clear previous cursor if exists
    const prevCursor = elements.text.querySelector('.cursor');
    if (prevCursor) prevCursor.classList.remove('cursor');

    if (isBackspacing) {
        // We just removed a char, so the char at 'index' (which is now typed.length) needs to be reset
        if (chars[index]) {
            chars[index].className = 'char cursor'; // Reset to simple char + cursor
        }
    } else {
        // We just typed a char at 'index-1'
        const typedChar = typed[index - 1];
        const targetChar = target[index - 1];
        const status = typedChar === targetChar ? 'correct' : 'incorrect';
        
        if (chars[index - 1]) {
            chars[index - 1].classList.add(status);
        }
        
        // Add cursor to next char
        if (chars[index]) {
            chars[index].classList.add('cursor');
        }
    }
}

function beginTimer() {
    on = true;
    t0 = Date.now();
    elements.btns.classList.add('hide');
    elements.timer.classList.remove('hide');
    playMusic(); // Start background music
    requestAnimationFrame(timerLoop);
}

function timerLoop() {
    if (!on) return;
    const now = Date.now();
    const elapsed = (now - t0) / 1000;
    const left = Math.max(0, duration - elapsed);
    
    elements.timer.textContent = left.toFixed(0);
    
    if (left <= 0) {
        endTimer();
        return;
    }
    requestAnimationFrame(timerLoop);
}

function endTimer() {
    on = false;
    finished = true;
    stopMusic(); // Stop music on game end
    
    elements.typing.classList.add('hide');
    elements.timer.classList.add('hide');
    elements.results.classList.remove('hide');
    elements.results.classList.add('results-animate');

    // Stats Calculation
    let correct = 0;
    for (let i = 0; i < typed.length; i++) {
        if (typed[i] === target[i]) correct++;
    }
    
    const calculatedWPM = correct / 5;
    const calculatedAcc = (correct / target.length) * 100;

    elements.wpm.innerHTML = `<b>${calculatedWPM.toFixed(2)}</b><small>wpm</small>`;
    elements.acc.innerHTML = `<b>${calculatedAcc.toFixed(2)}</b><small>accuracy</small>`;

    triggerShurikenAnimation(elements.wpm);
    triggerShurikenAnimation(elements.acc);
    
    // Play impact sound delayed slightly to match animation (approx when shuriken hits)
    setTimeout(() => {
       playHitSound();
    }, 1000); 
}

export function handleInput(key) {
    if (key === 'Escape') {
        initGame();
        return;
    }
    if (finished) return;
    
    if (key === 'Backspace') {
        if (typed.length > 0) {
            typed = typed.slice(0, -1);
            updateCharState(typed.length, true);
        }
        return;
    }
    
    if (key.length !== 1) return;
    
    if (!on) {
        beginTimer();
    }
    
    typed += key;
    playTypeSound(); // Sound on successful key press
    updateCharState(typed.length, false);
    
    if (typed.length === target.length) {
        endTimer();
    }
}
