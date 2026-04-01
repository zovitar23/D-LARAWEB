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
];

const JOURNEY_DURATION = 20;
const warpLines = [];
const warpRings = [];
let width = 0;
let height = 0;
let centerX = 0;
let centerY = 0;
let animationStart = performance.now();

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
    const angle = Math.random() * Math.PI * 2;
    return {
        angle,
        z,
        speed: 0.012 + Math.random() * 0.02,
        thickness: 0.8 + Math.random() * 2.4,
        hue: 270 + Math.random() * 34,
    };
}

function createWarpRing(z = Math.random()) {
    return {
        z,
        speed: 0.014 + Math.random() * 0.01,
        wobble: Math.random() * Math.PI * 2,
    };
}

function bootstrapScene() {
    if (warpLines.length) return;

    for (let i = 0; i < 170; i += 1) {
        warpLines.push(createWarpLine());
    }

    for (let i = 0; i < 15; i += 1) {
        warpRings.push(createWarpRing(i / 15));
    }
}

function drawBackgroundGlow(progress) {
    const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.72);
    glow.addColorStop(0, `rgba(160, 92, 255, ${0.26 + progress * 0.08})`);
    glow.addColorStop(0.22, 'rgba(122, 55, 255, 0.14)');
    glow.addColorStop(0.5, 'rgba(58, 15, 128, 0.08)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
}

function drawWarpRings(progress, elapsed) {
    for (const ring of warpRings) {
        ring.z -= ring.speed + progress * 0.006;
        if (ring.z <= 0.03) {
            Object.assign(ring, createWarpRing(1));
        }

        const depth = 1 - ring.z;
        const perspective = 1 / Math.max(ring.z, 0.06);
        const radius = Math.min(width, height) * 0.09 * perspective;
        const alpha = Math.min(0.38, 0.04 + depth * 0.18);
        const flatten = 0.86 + Math.sin(elapsed * 0.35 + ring.wobble) * 0.02;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.beginPath();
        ctx.lineWidth = 1.2 + depth * 1.6;
        ctx.strokeStyle = `rgba(238, 220, 255, ${alpha})`;
        ctx.shadowBlur = 18;
        ctx.shadowColor = `rgba(192, 128, 255, ${alpha})`;
        ctx.ellipse(0, 0, radius, radius * flatten, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    ctx.shadowBlur = 0;
}

function drawWarpLines(progress) {
    const tunnelRadius = Math.min(width, height) * (0.08 + progress * 0.05);

    for (const line of warpLines) {
        line.z -= line.speed + progress * 0.003;
        if (line.z <= 0.02) {
            Object.assign(line, createWarpLine(1));
        }

        const depth = 1 - line.z;
        const perspective = 1 / Math.max(line.z, 0.05);
        const innerRadius = tunnelRadius * (0.85 + line.z * 0.25);
        const outerRadius = innerRadius * perspective * (1.2 + progress * 0.55);
        const x1 = centerX + Math.cos(line.angle) * innerRadius;
        const y1 = centerY + Math.sin(line.angle) * innerRadius;
        const x2 = centerX + Math.cos(line.angle) * outerRadius;
        const y2 = centerY + Math.sin(line.angle) * outerRadius;
        const alpha = Math.min(0.82, 0.05 + depth * 0.6);

        ctx.beginPath();
        ctx.lineWidth = line.thickness * (0.45 + depth * 0.9);
        ctx.strokeStyle = `hsla(${line.hue}, 100%, 82%, ${alpha})`;
        ctx.shadowBlur = 14 + depth * 18;
        ctx.shadowColor = `hsla(${line.hue}, 100%, 72%, ${alpha})`;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    ctx.shadowBlur = 0;
}

function drawCenterCore(progress) {
    const core = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.min(width, height) * 0.18);
    core.addColorStop(0, `rgba(255, 244, 255, ${0.95 - progress * 0.08})`);
    core.addColorStop(0.08, `rgba(255, 222, 249, ${0.72 - progress * 0.06})`);
    core.addColorStop(0.18, `rgba(195, 134, 255, ${0.34 + progress * 0.08})`);
    core.addColorStop(0.38, 'rgba(95, 42, 192, 0.14)');
    core.addColorStop(1, 'rgba(95, 42, 192, 0)');
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, width, height);
}

function drawTunnel(now) {
    const elapsed = (now - animationStart) / 1000;
    const progress = Math.min(elapsed / JOURNEY_DURATION, 1);

    ctx.clearRect(0, 0, width, height);
    bootstrapScene();
    drawBackgroundGlow(progress);
    drawWarpRings(progress, elapsed);
    drawWarpLines(progress);
    drawCenterCore(progress);

    if (progress > 0.72) {
        arrivalGate.classList.add('is-near');
        endingCopy.classList.add('is-arriving');
    }

    if (progress > 0.95) {
        arrivalGate.classList.add('is-arrived');
    }

    requestAnimationFrame(drawTunnel);
}

function spawnLoveWord() {
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
            { opacity: 0.82, offset: 0.24, transform: `translate3d(${fromLeft ? '14vw' : '66vw'}, ${driftY * 0.35}px, 0) scale(${scale + 0.04})` },
            { opacity: 0.84, offset: 0.72, transform: `translate3d(${fromLeft ? '60vw' : '20vw'}, ${driftY}px, 0) scale(${scale})` },
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

    setInterval(spawnLoveWord, 1800);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
requestAnimationFrame(drawTunnel);
startLoveWords();
