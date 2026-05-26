document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('carousel');
    const slides = carousel.querySelectorAll('[data-slide]');
    const landing2 = document.querySelector('.landing-2');

    let currentSlide = 0;
    let isUserScrolling = false;

    function updateBackgroundPosition() {
        const scrollLeft = carousel.scrollLeft;
        const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
        const percentage = (scrollLeft / maxScrollLeft) * 100;
        landing2.style.backgroundPosition = `${percentage}% 50%`;
    }

    function autoScroll() {
        if (isUserScrolling) return; // Skip auto-scroll if the user is scrolling

        currentSlide = (currentSlide + 1) % slides.length;
        const scrollLeft = currentSlide * carousel.clientWidth;
        carousel.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }

    carousel.addEventListener('scroll', () => {
        isUserScrolling = true;
        updateBackgroundPosition();

        clearTimeout(carousel.userScrollTimeout);
        carousel.userScrollTimeout = setTimeout(() => {
            isUserScrolling = false;
        }, 200);
    });

    setInterval(autoScroll, 4000);
});