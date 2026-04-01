const canvas = document.getElementById('vortexCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('loveOverlay');
const arrivalGate = document.getElementById('arrivalGate');
const endingCopy = document.querySelector('.ending-copy');
const endingPage = document.querySelector('.ending-page');
const endingReveal = document.getElementById('endingReveal');
const endingQuote = document.getElementById('endingQuote');
const spaceSection = document.getElementById('endingSpace');
const spaceCanvas = document.getElementById('spaceCanvas');
const spaceCtx = spaceCanvas.getContext('2d');
const spacePhrase = document.getElementById('endingSpacePhrase');
const spaceCamera = document.getElementById('endingSpaceCamera');

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

const spacePhrases = [
    'Gökyüzü güneş olsa, sensiz karanlıktayım. Sadece sen lazımsın bana.',
    'Biz hiçbir zaman uzak olmadık, olamayız. Ya aklımdasın ya kalbimde.',
    'Keşke yanımda olsan; değilsin. Bulunduğun ortam çok şanslı.',
    'Dünyanın enleri sende toplanmış sanki. Bir ruha üflenmiş; Tanrı, enlere bir beden vermiş gibi.',
    'Dünyanın kötülüğüne rağmen en güzeli sensin.',
    'Bir Tanrı’nın en güzel eseri.',
    'Seni duyup hissedenler ne kadar şanslı. Kim bilir, sesini gökyüzü sanan kuşlar bile vardır.',
    'Sende kusur arayan gözler, kusurlarına aşık olur.',
    'Hiç sarılmadan sarılmayı özletensin.',
];

const JOURNEY_DURATION = 6;
const REVEAL_TIME = 1;
const warpLines = [];
const warpRings = [];
const spaceStars = [];
let width = 0;
let height = 0;
let centerX = 0;
let centerY = 0;
let animationStart = performance.now();
let hasRevealed = false;
let wordIntervalId = null;
let quoteScreenTimeoutId = null;
let quoteTextTimeoutId = null;
let quoteLineTwoTimeoutId = null;
let spaceStartTimeoutId = null;
let spacePhraseTimeoutId = null;
let currentSpacePhraseIndex = 0;
let spaceAnimationFrame = 0;
const phraseAngles = [
    { x: 34, y: 34, ry: -20, rx: 6, z: 40, exit: 'is-exiting-right', align: 'is-left' },
    { x: 68, y: 42, ry: 18, rx: -4, z: -10, exit: 'is-exiting-left', align: 'is-right' },
    { x: 29, y: 63, ry: -14, rx: 5, z: 30, exit: 'is-exiting-right', align: 'is-left' },
    { x: 72, y: 60, ry: 22, rx: 3, z: -20, exit: 'is-exiting-left', align: 'is-right' },
    { x: 38, y: 36, ry: -9, rx: -5, z: 10, exit: 'is-exiting-right', align: 'is-left' },
    { x: 64, y: 54, ry: 12, rx: 6, z: -5, exit: 'is-exiting-left', align: 'is-right' },
];

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

    spaceCanvas.width = width * devicePixelRatio;
    spaceCanvas.height = height * devicePixelRatio;
    spaceCanvas.style.width = `${width}px`;
    spaceCanvas.style.height = `${height}px`;
    spaceCtx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
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

    for (let i = 0; i < 260; i += 1) {
        spaceStars.push(createSpaceStar());
    }
}

function createSpaceStar(z = Math.random()) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 0.9;
    return {
        angle,
        radius,
        z,
        speed: 0.005 + Math.random() * 0.012,
        size: 0.8 + Math.random() * 1.8,
    };
}

function drawBackgroundGlow(progress) {
    const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.78);
    glow.addColorStop(0, `rgba(126, 74, 224, ${0.12 + progress * 0.05})`);
    glow.addColorStop(0.18, `rgba(96, 44, 188, ${0.1 + rushBoost(progress) * 0.14})`);
    glow.addColorStop(0.46, 'rgba(51, 15, 112, 0.08)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
}

function rushBoost(progress) {
    return Math.max(0, (progress - REVEAL_TIME / JOURNEY_DURATION) / (1 - REVEAL_TIME / JOURNEY_DURATION));
}

function drawWarpRings(progress, elapsed, rushPhase) {
    for (const ring of warpRings) {
        ring.z -= ring.speed + progress * 0.006 + rushPhase * 0.065;
        if (ring.z <= 0.035) {
            Object.assign(ring, createWarpRing(1));
        }

        const depth = 1 - ring.z;
        const perspective = 1 / Math.max(ring.z, 0.08);
        const radius = Math.min(width, height) * (0.08 + rushPhase * 0.08) * perspective;
        const alpha = Math.min(0.4, 0.02 + depth * 0.12 + rushPhase * 0.16);
        const flatten = 0.9 + Math.sin(elapsed * 0.36 + ring.wobble) * (0.012 + rushPhase * 0.02);

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
        line.z -= line.speed + progress * 0.004 + rushPhase * 0.09;
        if (line.z <= 0.02) {
            Object.assign(line, createWarpLine(1));
        }

        const depth = 1 - line.z;
        const perspective = 1 / Math.max(line.z, 0.06);
        const startRadius = innerVoid * (1.04 + line.z * 0.16) * line.spread;
        const endRadius = startRadius * perspective * (1.45 + progress * 0.5 + rushPhase * 2.2);
        const x1 = centerX + Math.cos(line.angle) * startRadius;
        const y1 = centerY + Math.sin(line.angle) * startRadius * 0.96;
        const x2 = centerX + Math.cos(line.angle) * endRadius;
        const y2 = centerY + Math.sin(line.angle) * endRadius * 0.96;
        const alpha = Math.min(1, 0.035 + depth * 0.42 + rushPhase * 0.32);

        ctx.beginPath();
        ctx.lineWidth = line.thickness * (0.3 + depth * 0.65 + rushPhase * 1.1);
        ctx.strokeStyle = `hsla(${line.hue}, 100%, 80%, ${alpha})`;
        ctx.shadowBlur = 8 + depth * 10 + rushPhase * 26;
        ctx.shadowColor = `hsla(${line.hue}, 100%, 72%, ${alpha * 0.65})`;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    ctx.shadowBlur = 0;
}

function drawCenterVoid(progress, rushPhase) {
    const voidRadius = Math.min(width, height) * (0.13 - rushPhase * 0.08);
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

    if (progress > 0.45) {
        arrivalGate.classList.add('is-near');
        endingCopy.classList.add('is-arriving');
    }

    if (elapsed >= REVEAL_TIME && !endingReveal.classList.contains('is-target')) {
        endingReveal.classList.add('is-target');
    }

    if (progress > 0.86) {
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
        quoteScreenTimeoutId = setTimeout(() => {
            endingQuote.classList.add('is-visible');
            quoteTextTimeoutId = setTimeout(() => {
                endingQuote.classList.remove('is-line-2');
                endingQuote.classList.add('is-line-1');
                quoteLineTwoTimeoutId = setTimeout(() => {
                    endingQuote.classList.remove('is-line-1');
                    endingQuote.classList.add('is-line-2');
                }, 2600);
            }, 200);
            spaceStartTimeoutId = setTimeout(() => {
                startEndingSpace();
            }, 5200);
        }, 3000);
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

function startEndingSpace() {
    endingQuote.classList.remove('is-visible', 'is-line-1', 'is-line-2');
    spaceSection.classList.add('is-visible');
    cycleSpacePhrase();
    if (!spaceAnimationFrame) {
        spaceAnimationFrame = requestAnimationFrame(drawSpaceScene);
    }
}

function cycleSpacePhrase() {
    const phrase = spacePhrases[currentSpacePhraseIndex % spacePhrases.length];
    const config = phraseAngles[currentSpacePhraseIndex % phraseAngles.length];
    const exitClass = config.exit;
    const wordCount = phrase.trim().split(/\s+/).length;
    const holdDuration = wordCount > 10 ? 4000 : 3200;

    if (spacePhrase.textContent) {
        spacePhrase.classList.remove('is-visible');
        spacePhrase.classList.add(exitClass);
    }

    setTimeout(() => {
        spacePhrase.classList.remove('is-exiting-left', 'is-exiting-right');
        spacePhrase.classList.remove('is-left', 'is-right');
        spacePhrase.classList.add(config.align);
        spacePhrase.textContent = phrase;
        spacePhrase.style.left = `${config.x}%`;
        spacePhrase.style.top = `${config.y}%`;
        spacePhrase.style.transform = `translate3d(-50%, -50%, ${config.z}px) rotateY(${config.ry}deg) rotateX(${config.rx}deg) scale(0.72)`;
        spaceCamera.style.transform = `rotateY(${-config.ry * 0.7}deg) rotateX(${-config.rx * 0.7}deg) translateZ(0)`;
        spacePhrase.classList.add('is-visible');
        requestAnimationFrame(() => {
            spacePhrase.style.transform = `translate3d(-50%, -50%, ${config.z}px) rotateY(${config.ry}deg) rotateX(${config.rx}deg) scale(1)`;
        });
        currentSpacePhraseIndex += 1;
        spacePhraseTimeoutId = setTimeout(cycleSpacePhrase, holdDuration);
    }, spacePhrase.textContent ? 420 : 0);
}

function drawSpaceScene() {
    spaceCtx.clearRect(0, 0, width, height);

    for (const star of spaceStars) {
        star.z -= star.speed;
        if (star.z <= 0.02) {
            Object.assign(star, createSpaceStar(1));
        }

        const perspective = 1 / Math.max(star.z, 0.04);
        const travel = Math.pow(1 - star.z, 1.8);
        const orbit = Math.min(width, height) * star.radius * 0.6;
        const x = centerX + Math.cos(star.angle) * orbit * perspective;
        const y = centerY + Math.sin(star.angle) * orbit * perspective;
        const size = star.size * (0.4 + travel * 2.2);
        const alpha = Math.min(0.95, 0.16 + travel * 0.7);

        spaceCtx.beginPath();
        spaceCtx.fillStyle = `rgba(246, 236, 255, ${alpha})`;
        spaceCtx.arc(x, y, size, 0, Math.PI * 2);
        spaceCtx.fill();
    }

    spaceAnimationFrame = requestAnimationFrame(drawSpaceScene);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
requestAnimationFrame(drawTunnel);
startLoveWords();
