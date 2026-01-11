const { invoke } = window.__TAURI__.core;

const wordsContainer = document.getElementById("words-container");
const caret = document.getElementById("caret");
const hiddenInput = document.getElementById("hidden-input");
const wpmEl = document.getElementById("wpm");
const accEl = document.getElementById("acc");
const timeEl = document.getElementById("time");
const keyboardEl = document.getElementById("keyboard");

const WORD_LIST = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
];

let words = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let startTime = null;
let timerInterval = null;
let totalChars = 0;
let correctChars = 0;
let isFinished = false;

const KEYBOARD_LAYOUT = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
  ["space"]
];

function initKeyboard() {
  keyboardEl.innerHTML = "";
  KEYBOARD_LAYOUT.forEach(row => {
    const rowEl = document.createElement("div");
    rowEl.className = "keyboard-row";
    row.forEach(key => {
      const keyEl = document.createElement("div");
      keyEl.className = `key ${key === "space" ? "extra-wide" : ""}`;
      keyEl.id = `key-${key}`;
      keyEl.textContent = key === "space" ? "____" : key.toUpperCase();
      rowEl.appendChild(keyEl);
    });
    keyboardEl.appendChild(rowEl);
  });
}

function generateWords() {
  words = [];
  for (let i = 0; i < 50; i++) {
    words.push(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
  }
  renderWords();
}

function renderWords() {
  wordsContainer.innerHTML = "";
  words.forEach((word, wordIdx) => {
    const wordEl = document.createElement("div");
    wordEl.className = "word";
    if (wordIdx === currentWordIndex) wordEl.classList.add("active");
    
    [...word].forEach((char, charIdx) => {
      const charEl = document.createElement("span");
      charEl.className = "char";
      charEl.textContent = char;
      wordEl.appendChild(charEl);
    });
    
    // Add space after word (except last)
    if (wordIdx < words.length - 1) {
      const spaceEl = document.createElement("span");
      spaceEl.className = "char space";
      spaceEl.textContent = " ";
      wordEl.appendChild(spaceEl);
    }
    
    wordsContainer.appendChild(wordEl);
  });
  updateCaret();
}

function updateCaret() {
  const currentWord = wordsContainer.children[currentWordIndex];
  const currentChar = currentWord.children[currentCharIndex];
  
  if (currentChar) {
    const rect = currentChar.getBoundingClientRect();
    const containerRect = wordsContainer.getBoundingClientRect();
    caret.style.left = `${rect.left - containerRect.left}px`;
    caret.style.top = `${rect.top - containerRect.top + 4}px`;
  }
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const remaining = Math.max(0, 30 - Math.floor(elapsed));
    timeEl.textContent = remaining;
    
    if (remaining === 0) finish();
    
    updateStats(elapsed);
  }, 1000);
}

function updateStats(elapsed) {
  if (elapsed <= 0) return;
  const minutes = elapsed / 60;
  const wpm = Math.round((correctChars / 5) / minutes);
  const acc = totalChars === 0 ? 100 : Math.round((correctChars / totalChars) * 100);
  
  wpmEl.textContent = wpm;
  accEl.textContent = acc;
}

function finish() {
  isFinished = true;
  clearInterval(timerInterval);
  hiddenInput.disabled = true;
}

function handleInput(e) {
  if (isFinished) return;
  if (!startTime) startTimer();
  
  const char = e.data;
  const currentWord = words[currentWordIndex];
  const charElements = wordsContainer.children[currentWordIndex].children;
  
  // Handle space
  if (e.inputType === "insertText" && char === " ") {
    // If we're at the end of the word or middle, move to next
    currentWordIndex++;
    currentCharIndex = 0;
    renderWords();
    return;
  }

  // Handle backspace (simplified)
  if (e.inputType === "deleteContentBackward") {
    if (currentCharIndex > 0) {
      currentCharIndex--;
      const charEl = charElements[currentCharIndex];
      charEl.classList.remove("correct", "incorrect");
      updateCaret();
    }
    return;
  }

  if (char) {
    totalChars++;
    const targetChar = charElements[currentCharIndex];
    if (targetChar) {
      if (char === targetChar.textContent) {
        targetChar.classList.add("correct");
        correctChars++;
      } else {
        targetChar.classList.add("incorrect");
      }
      currentCharIndex++;
      updateCaret();
      
      // Auto move to next word if word completed (including space)
      if (currentCharIndex === charElements.length) {
        currentWordIndex++;
        currentCharIndex = 0;
        if (currentWordIndex >= words.length) finish();
        else renderWords();
      }
    }
  }
}

function highlightKey(key, active) {
  const id = `key-${key.toLowerCase() === " " ? "space" : key.toLowerCase()}`;
  const el = document.getElementById(id);
  if (el) {
    if (active) el.classList.add("active");
    else el.classList.remove("active");
  }
}

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playTypingSound() {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine'; // Soft mechanical sound
  oscillator.frequency.setValueAtTime(150 + Math.random() * 50, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1);
}

// Event Listeners
document.addEventListener("keydown", (e) => {
  highlightKey(e.key === " " ? "space" : e.key, true);
  playTypingSound();
  hiddenInput.focus();
});

document.addEventListener("keyup", (e) => {
  highlightKey(e.key === " " ? "space" : e.key, false);
});

hiddenInput.addEventListener("input", handleInput);

// Init
initKeyboard();
generateWords();
hiddenInput.focus();
