const canvas = document.getElementById('vortexCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('loveOverlay');
const arrivalGate = document.getElementById('arrivalGate');
const endingCopy = document.querySelector('.ending-copy');
const endingPage = document.querySelector('.ending-page');
const endingReveal = document.getElementById('endingReveal');

const lovePhrases = [
    'Seni seviyorum',
    'Je t\u2019aime',
    'Ich liebe dich',
    'Te amo',
    'Ti amo',
    '\u042f \u0442\u0435\u0431\u044f \u043b\u044e\u0431\u043b\u044e',
    '\u0623\u062d\u0628\u0643',
    '\u611b\u3057\u3066\u308b',
    '\uc0ac\ub791\ud574',
    'Eu te amo',
    'Ik hou van jou',
];

const JOURNEY_DURATION = 20;
const REVEAL_TIME = 15;
const warpLines = [];
const warpRings = [];
let width = 0;
let height = 0;
let centerX = 0;
let centerY = 0;
let animationStart = performance.now();
let hasRevealed = false;
let wordIntervalId = null;

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

function createWarpLine(z = Math.random()) {
    return {
        angle: Math.random() * Math.PI * 2,
        z,
        speed: 0.012 + Math.random() * 0.018,
        thickness: 0.7 + Math.random() * 1.9,
        hue: 272 + Math.random() * 24,
        spread: 0.88 + Math.random() * 0.28,
    };
}

function createWarpRing(z = Math.random()) {
    return {
        z,
        speed: 0.013 + Math.random() * 0.008,
        wobble: Math.random() * Math.PI * 2,
    };
}

function bootstrapScene() {
    if (warpLines.length) return;

    for (let i = 0; i < 220; i += 1) {
        warpLines.push(createWarpLine());
    }

    for (let i = 0; i < 11; i += 1) {
        warpRings.push(createWarpRing(i / 11));
    }
}

function drawBackgroundGlow(progress) {
    const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.78);
    glow.addColorStop(0, `rgba(126, 74, 224, ${0.12 + progress * 0.03})`);
    glow.addColorStop(0.18, 'rgba(96, 44, 188, 0.1)');
    glow.addColorStop(0.46, 'rgba(51, 15, 112, 0.08)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
}

function drawWarpRings(progress, elapsed, rushPhase) {
    for (const ring of warpRings) {
        ring.z -= ring.speed + progress * 0.004 + rushPhase * 0.03;
        if (ring.z <= 0.035) {
            Object.assign(ring, createWarpRing(1));
        }

        const depth = 1 - ring.z;
        const perspective = 1 / Math.max(ring.z, 0.08);
        const radius = Math.min(width, height) * (0.08 + rushPhase * 0.04) * perspective;
        const alpha = Math.min(0.34, 0.02 + depth * 0.1 + rushPhase * 0.12);
        const flatten = 0.9 + Math.sin(elapsed * 0.26 + ring.wobble) * (0.012 + rushPhase * 0.016);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.beginPath();
        ctx.lineWidth = 0.8 + depth * 0.9 + rushPhase * 0.8;
        ctx.strokeStyle = `rgba(236, 221, 255, ${alpha})`;
        ctx.shadowBlur = 8 + rushPhase * 12;
        ctx.shadowColor = `rgba(189, 132, 255, ${alpha * 0.55})`;
        ctx.ellipse(0, 0, radius, radius * flatten, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    ctx.shadowBlur = 0;
}

function drawWarpLines(progress, rushPhase) {
    const innerVoid = Math.min(width, height) * (0.12 + progress * 0.025 - rushPhase * 0.05);

    for (const line of warpLines) {
        line.z -= line.speed + progress * 0.003 + rushPhase * 0.042;
        if (line.z <= 0.02) {
            Object.assign(line, createWarpLine(1));
        }

        const depth = 1 - line.z;
        const perspective = 1 / Math.max(line.z, 0.06);
        const startRadius = innerVoid * (1.04 + line.z * 0.16) * line.spread;
        const endRadius = startRadius * perspective * (1.3 + progress * 0.42 + rushPhase * 1.3);
        const x1 = centerX + Math.cos(line.angle) * startRadius;
        const y1 = centerY + Math.sin(line.angle) * startRadius * 0.96;
        const x2 = centerX + Math.cos(line.angle) * endRadius;
        const y2 = centerY + Math.sin(line.angle) * endRadius * 0.96;
        const alpha = Math.min(0.9, 0.035 + depth * 0.38 + rushPhase * 0.24);

        ctx.beginPath();
        ctx.lineWidth = line.thickness * (0.3 + depth * 0.6 + rushPhase * 0.65);
        ctx.strokeStyle = `hsla(${line.hue}, 100%, 80%, ${alpha})`;
        ctx.shadowBlur = 8 + depth * 10 + rushPhase * 18;
        ctx.shadowColor = `hsla(${line.hue}, 100%, 72%, ${alpha * 0.65})`;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    ctx.shadowBlur = 0;
}

function drawCenterVoid(progress, rushPhase) {
    const voidRadius = Math.min(width, height) * (0.13 - rushPhase * 0.05);
    const aura = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, voidRadius * 2.2);
    aura.addColorStop(0, 'rgba(255, 255, 255, 0)');
    aura.addColorStop(0.24, `rgba(173, 112, 255, ${0.12 + progress * 0.03 + rushPhase * 0.16})`);
    aura.addColorStop(0.48, `rgba(89, 34, 169, ${0.12 + rushPhase * 0.08})`);
    aura.addColorStop(1, 'rgba(89, 34, 169, 0)');
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.lineWidth = 2 + rushPhase * 1.6;
    ctx.strokeStyle = `rgba(237, 215, 255, ${0.16 + progress * 0.05 + rushPhase * 0.22})`;
    ctx.shadowBlur = 18 + rushPhase * 18;
    ctx.shadowColor = 'rgba(191, 132, 255, 0.2)';
    ctx.arc(centerX, centerY, voidRadius * 0.94, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const voidGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, voidRadius * 1.25);
    voidGradient.addColorStop(0, 'rgba(1, 0, 6, 1)');
    voidGradient.addColorStop(0.58, 'rgba(10, 3, 23, 0.98)');
    voidGradient.addColorStop(0.86, 'rgba(37, 11, 72, 0.38)');
    voidGradient.addColorStop(1, 'rgba(37, 11, 72, 0)');
    ctx.fillStyle = voidGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, voidRadius * 1.25, 0, Math.PI * 2);
    ctx.fill();
}

function drawTunnel(now) {
    const elapsed = (now - animationStart) / 1000;
    const progress = Math.min(elapsed / JOURNEY_DURATION, 1);
    const rushPhase = Math.max(0, Math.min((elapsed - REVEAL_TIME) / (JOURNEY_DURATION - REVEAL_TIME), 1));

    ctx.clearRect(0, 0, width, height);
    bootstrapScene();
    drawBackgroundGlow(progress);
    drawWarpRings(progress, elapsed, rushPhase);
    drawWarpLines(progress, rushPhase);
    drawCenterVoid(progress, rushPhase);

    if (progress > 0.72) {
        arrivalGate.classList.add('is-near');
        endingCopy.classList.add('is-arriving');
    }

    if (elapsed >= REVEAL_TIME && !endingReveal.classList.contains('is-target')) {
        endingReveal.classList.add('is-target');
    }

    if (progress > 0.95) {
        arrivalGate.classList.add('is-arrived');
    }

    if (!hasRevealed && progress >= 1) {
        hasRevealed = true;
        if (wordIntervalId) {
            clearInterval(wordIntervalId);
        }
        endingPage.classList.add('is-ended');
        endingCopy.classList.add('is-hidden');
        endingReveal.classList.add('is-arrived');
        return;
    }

    requestAnimationFrame(drawTunnel);
}

function spawnLoveWord() {
    if (hasRevealed) {
        return;
    }

    const word = document.createElement('span');
    const fromLeft = Math.random() > 0.5;
    const phrase = lovePhrases[Math.floor(Math.random() * lovePhrases.length)];
    const top = 14 + Math.random() * 68;
    const duration = 5200 + Math.random() * 2600;
    const driftY = (Math.random() - 0.5) * 70;
    const scale = 0.9 + Math.random() * 0.6;

    word.className = 'love-word';
    word.textContent = phrase;
    word.style.top = `${top}%`;
    word.style.fontSize = `${0.95 + Math.random() * 1.05}rem`;
    word.style.transform = `translate3d(${fromLeft ? '-16vw' : '116vw'}, 0, 0) scale(${scale})`;
    overlay.appendChild(word);

    const animation = word.animate(
        [
            { opacity: 0, transform: `translate3d(${fromLeft ? '-16vw' : '116vw'}, 0, 0) scale(${scale})` },
            { opacity: 0.8, offset: 0.24, transform: `translate3d(${fromLeft ? '14vw' : '66vw'}, ${driftY * 0.35}px, 0) scale(${scale + 0.04})` },
            { opacity: 0.82, offset: 0.72, transform: `translate3d(${fromLeft ? '60vw' : '20vw'}, ${driftY}px, 0) scale(${scale})` },
            { opacity: 0, transform: `translate3d(${fromLeft ? '108vw' : '-18vw'}, ${driftY * 1.1}px, 0) scale(${scale - 0.04})` },
        ],
        { duration, easing: 'ease-in-out' }
    );

    animation.onfinish = () => word.remove();
}

function startLoveWords() {
    for (let i = 0; i < 6; i += 1) {
        setTimeout(spawnLoveWord, i * 420);
    }

    wordIntervalId = setInterval(spawnLoveWord, 1800);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
requestAnimationFrame(drawTunnel);
startLoveWords();
