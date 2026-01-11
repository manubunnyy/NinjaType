// Animations Module using Anime.js

export function triggerShurikenAnimation(targetEl) {
    if (!targetEl) return;
    
    // Create Shuriken Element
    const shuriken = document.createElement('div');
    shuriken.className = 'shuriken-projectile';
    shuriken.innerHTML = `<svg width="40" height="40"><use href="#shuriken-icon"></use></svg>`;
    document.body.appendChild(shuriken);

    // Get Target Coordinates
    const rect = targetEl.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;

    // Start Position (Random off-screen)
    const startX = Math.random() > 0.5 ? -100 : window.innerWidth + 100;
    const startY = Math.random() * window.innerHeight;

    anime.set(shuriken, { left: startX, top: startY, opacity: 1 });

    // Animate Throw
    anime({
        targets: shuriken,
        left: targetX,
        top: targetY,
        rotate: 720,
        opacity: [1, 0], // Fade out on impact
        scale: [1, 0.5],
        easing: 'easeInExpo',
        duration: 1200, // Slowed down as requested
        complete: () => {
             shuriken.remove();
             // Impact Effect on Target
             anime({
                 targets: targetEl,
                 scale: [1, 1.4, 1],
                 color: ['#FFD700', '#FFF', '#FFD700'],
                 duration: 300,
                 easing: 'easeOutElastic(1, .8)'
             });
        }
    });
}

export function triggerBounceClick(btn) {
    // Bouncy Jiggle Animation
    anime({
        targets: btn,
        scale: [
            {value: 0.9, duration: 100, easing: 'easeOutQuad'},
            {value: 1.1, duration: 100, easing: 'easeOutQuad'},
            {value: 1, duration: 800, easing: 'easeOutElastic(1, .6)'}
        ]
    });
}
