const canvas = document.getElementById('vortexCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('loveOverlay');
const arrivalGate = document.getElementById('arrivalGate');
const endingCopy = document.querySelector('.ending-copy');

const lovePhrases = [
    'I love you',
    'Seni seviyorum',
    'Je t’aime',
    'Ich liebe dich',
    'Te amo',
    'Ti amo',
    'Я тебя люблю',
    'أحبك',
    '愛してる',
    '사랑해',
    'Eu te amo',
    'Ik hou van jou',
    'Σε αγαπώ',
    'Kocham cię',
    'אני אוהב אותך',
];

let width = 0;
let height = 0;
let centerX = 0;
let centerY = 0;
let animationStart = performance.now();
const JOURNEY_DURATION = 20;

const tunnelParticles = [];
const streakCount = 280;

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    centerX = width / 2;
    centerY = height / 2;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

function createParticle(randomZ = true) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 0.95 + 0.05;
    return {
        angle,
        radius,
        z: randomZ ? Math.random() : 1,
        speed: 0.004 + Math.random() * 0.009,
        size: 0.8 + Math.random() * 2.8,
        hue: 280 + Math.random() * 60,
        sway: (Math.random() - 0.5) * 0.65,
    };
}

function ensureParticles() {
    if (tunnelParticles.length) return;
    for (let i = 0; i < streakCount; i += 1) {
        tunnelParticles.push(createParticle());
    }
}

function drawTunnel(now) {
    const elapsed = (now - animationStart) / 1000;
    const progress = Math.min(elapsed / JOURNEY_DURATION, 1);
    const introBoost = Math.max(0, 1 - progress);
    const travelSpeed = 0.016 + introBoost * 0.02 + progress * 0.016;

    ctx.clearRect(0, 0, width, height);
    ensureParticles();

    const background = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.62);
    background.addColorStop(0, 'rgba(136, 66, 252, 0.24)');
    background.addColorStop(0.28, 'rgba(80, 17, 172, 0.12)');
    background.addColorStop(1, 'rgba(4, 1, 13, 0)');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    for (const particle of tunnelParticles) {
        particle.z -= particle.speed + introBoost * 0.0025 + progress * 0.002;
        if (particle.z <= 0.02) {
            Object.assign(particle, createParticle(false), { z: 1 });
        }

        const depth = 1 - particle.z;
        const perspective = 1 / Math.max(particle.z, 0.04);
        const orbit = particle.angle + elapsed * particle.sway;
        const tunnelRadius = (particle.radius * Math.min(width, height) * 0.21 + 12) * perspective;
        const x = centerX + Math.cos(orbit) * tunnelRadius;
        const y = centerY + Math.sin(orbit) * tunnelRadius * 0.78;
        const tailX = centerX + Math.cos(orbit) * tunnelRadius * 0.72;
        const tailY = centerY + Math.sin(orbit) * tunnelRadius * 0.72 * 0.78;
        const alpha = Math.min(0.95, 0.08 + depth * (0.8 + progress * 0.4));
        const lineWidth = 0.5 + particle.size * depth * (0.85 + progress * 0.3);

        ctx.beginPath();
        ctx.strokeStyle = `hsla(${particle.hue}, 95%, 78%, ${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.shadowBlur = 16 + depth * 16;
        ctx.shadowColor = `hsla(${particle.hue}, 95%, 72%, ${alpha})`;
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = `hsla(${particle.hue}, 100%, 86%, ${Math.min(1, alpha + 0.08)})`;
        ctx.arc(x, y, 0.7 + particle.size * depth * 0.55, 0, Math.PI * 2);
        ctx.fill();
    }

    if (progress > 0.7) {
        arrivalGate.classList.add('is-near');
        endingCopy.classList.add('is-arriving');
    }

    if (progress > 0.94) {
        arrivalGate.classList.add('is-arrived');
    }

    ctx.shadowBlur = 0;
    requestAnimationFrame(drawTunnel);
}

function spawnLoveWord() {
    const word = document.createElement('span');
    const fromLeft = Math.random() > 0.5;
    const phrase = lovePhrases[Math.floor(Math.random() * lovePhrases.length)];
    const top = 10 + Math.random() * 76;
    const duration = 4200 + Math.random() * 2800;
    const driftY = (Math.random() - 0.5) * 90;
    const scale = 0.9 + Math.random() * 0.9;

    word.className = 'love-word';
    word.textContent = phrase;
    word.style.top = `${top}%`;
    word.style.fontSize = `${1.1 + Math.random() * 1.5}rem`;
    word.style.transform = `translate3d(${fromLeft ? '-18vw' : '118vw'}, 0, 0) scale(${scale})`;
    overlay.appendChild(word);

    const animation = word.animate(
        [
            { opacity: 0, transform: `translate3d(${fromLeft ? '-18vw' : '118vw'}, 0, 0) scale(${scale})` },
            { opacity: 1, offset: 0.2, transform: `translate3d(${fromLeft ? '10vw' : '72vw'}, ${driftY * 0.35}px, 0) scale(${scale + 0.05})` },
            { opacity: 1, offset: 0.7, transform: `translate3d(${fromLeft ? '62vw' : '18vw'}, ${driftY}px, 0) scale(${scale})` },
            { opacity: 0, transform: `translate3d(${fromLeft ? '112vw' : '-20vw'}, ${driftY * 1.15}px, 0) scale(${scale - 0.05})` },
        ],
        { duration, easing: 'ease-in-out' }
    );

    animation.onfinish = () => word.remove();
}

function startLoveWords() {
    for (let i = 0; i < 8; i += 1) {
        setTimeout(spawnLoveWord, i * 260);
    }
    setInterval(spawnLoveWord, 1100);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
requestAnimationFrame(drawTunnel);
startLoveWords();
