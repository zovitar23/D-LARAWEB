document.addEventListener('DOMContentLoaded', function() {
    const keşfetBtn = document.getElementById('keşfetBtn');
    const statsSection = document.getElementById('stats');
    const dayCounter = document.getElementById('dayCount');

    const countTo = (element, target) => {
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
    };

    keşfetBtn.addEventListener('click', () => {
        statsSection.classList.remove('hidden');
        countTo(dayCounter, +dayCounter.getAttribute('data-target'));
        keşfetBtn.setAttribute('disabled', 'true');
        keşfetBtn.innerText = 'Kaydedildi';
    });
});