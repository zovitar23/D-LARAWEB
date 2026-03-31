function showStats() {
    const statsSection = document.getElementById('stats');
    const dayCountVisible = document.getElementById('dayCountVisible');
    const btn = document.getElementById('kesfetBtn');
    const hero = document.getElementById('startSection');

    if (hero) hero.style.display = 'none';

    startSpotifyPlayer();
    statsSection.classList.remove('hidden');
    countTo(dayCountVisible, +dayCountVisible.getAttribute('data-target'));
    btn.setAttribute('disabled', 'true');
    btn.innerText = 'Kaydedildi';
}

function startSpotifyPlayer() {
    const player = document.getElementById('spotifyPlayer');
    if (!player) return;

    if (!player.getAttribute('src')) {
        player.setAttribute('src', player.dataset.src);
    }

    player.classList.remove('spotify-player-hidden');
    player.classList.add('is-visible');
}

function countTo(element, target) {
    const duration = 1200;
    const frameTime = 20;
    let current = 0;
    const increment = Math.ceil(target / (duration / frameTime));

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.innerText = target;
            clearInterval(timer);
            element.classList.add('animated');
        } else {
            element.innerText = current;
        }
    }, frameTime);
}
