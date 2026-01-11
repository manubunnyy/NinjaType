// High-Performance Web Audio API
const AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioContext();

const buffers = {
    click: null,
    impact: null,
    bgm: null
};

// Generic Buffer Loader
async function loadSound(key, url) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
        buffers[key] = decodedBuffer;
    } catch (e) {
        console.warn(`Failed to load sound ${key}:`, e);
    }
}

// Preload Assets
loadSound('click', 'assets/sounds/click.mp3');
loadSound('impact', 'assets/sounds/impact.mp3');
loadSound('bgm', 'assets/sounds/bgm.mp3');

let bgmSource = null;

export function playTypeSound() {
    if (!buffers.click) return;
    
    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') ctx.resume();

    const source = ctx.createBufferSource();
    source.buffer = buffers.click;
    
    // Gain Node for Volume Control
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.4; // 40% Volume
    
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    source.start(0);
}

export function playHitSound() {
    if (!buffers.impact) return;
    
    const source = ctx.createBufferSource();
    source.buffer = buffers.impact;
    
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.6;
    
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    source.start(0);
}

export function playMusic() {
    if (!buffers.bgm) return;
    if (bgmSource) return; // Already playing

    bgmSource = ctx.createBufferSource();
    bgmSource.buffer = buffers.bgm;
    bgmSource.loop = true;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.3; // 30% Volume for BGM

    bgmSource.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    bgmSource.start(0);
}

export function stopMusic() {
    if (bgmSource) {
        try {
            bgmSource.stop();
        } catch(e) { /* ignore if already stop */ }
        bgmSource.disconnect();
        bgmSource = null;
    }
}
