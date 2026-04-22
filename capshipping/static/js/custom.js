document.querySelectorAll(".faq-item").forEach(item => {
    item.addEventListener("click", () => {

        document.querySelectorAll(".faq-item").forEach(el => {
            if(el !== item) el.classList.remove("active");
        });

        item.classList.toggle("active");
    });
});







const counters = document.querySelectorAll(".counters");

const startCounter = (counter) => {
    const target = +counter.getAttribute("data-target");
    let count = 0;

    const update = () => {
        const increment = target / 120; // vitès

        if (count < target) {
            count += increment;
            counter.innerText = Math.ceil(count) + " +";
            requestAnimationFrame(update);
        } else {
            counter.innerText = target + " +";
        }
    };

    update();
};


/* SCROLL TRIGGER */
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            startCounter(entry.target);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.6 });

counters.forEach(counter => {
    observer.observe(counter);
});


// JavaScript pour animer la section "Our Working Process" au scroll
document.addEventListener('DOMContentLoaded', function() {

    // Sélectionner les éléments à animer
    const processSection = document.querySelector('.tp-process');
    const tpHeader = document.querySelector('.tp-header');
    const tpTag = document.querySelector('.tp-tag');
    const tpTitle = document.querySelector('.tp-header h2');
    const tpDescription = document.querySelector('.tp-header p');
    const shapeElement = document.querySelector('.shape');
    const tpSteps = document.querySelectorAll('.tp-step');

    // État initial des animations
    function setInitialStyles() {
        // Header animations
        if (tpTag) {
            tpTag.style.opacity = '0';
            tpTag.style.transform = 'translateY(30px)';
        }

        if (tpTitle) {
            tpTitle.style.opacity = '0';
            tpTitle.style.transform = 'translateY(30px)';
        }

        if (tpDescription) {
            tpDescription.style.opacity = '0';
            tpDescription.style.transform = 'translateY(30px)';
        }

        if (shapeElement) {
            shapeElement.style.opacity = '0';
            shapeElement.style.transform = 'scale(0.8) rotate(0deg)';
        }

        // Steps animations
        tpSteps.forEach((step, index) => {
            step.style.opacity = '0';
            step.style.transform = 'translateY(50px)';
            step.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.15}s`;
        });
    }

    // Appliquer les styles initiaux
    setInitialStyles();

    // Ajouter les transitions CSS pour les animations
    if (tpTag) {
        tpTag.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s';
    }

    if (tpTitle) {
        tpTitle.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s';
    }

    if (tpDescription) {
        tpDescription.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s';
    }

    if (shapeElement) {
        shapeElement.style.transition = 'all 0.8s cubic-bezier(0.34, 1.2, 0.64, 1) 0.4s';
    }

    // Fonction pour vérifier si un élément est visible dans le viewport
    function isElementInViewport(el, offset = 100) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;

        return rect.top <= windowHeight - offset && rect.bottom >= offset;
    }

    // Fonction pour animer les éléments quand ils deviennent visibles
    function animateOnScroll() {
        // Animer le header quand la section devient visible
        if (processSection && isElementInViewport(processSection, 150)) {
            if (tpTag && tpTag.style.opacity === '0') {
                tpTag.style.opacity = '1';
                tpTag.style.transform = 'translateY(0)';
            }

            if (tpTitle && tpTitle.style.opacity === '0') {
                tpTitle.style.opacity = '1';
                tpTitle.style.transform = 'translateY(0)';
            }

            if (tpDescription && tpDescription.style.opacity === '0') {
                tpDescription.style.opacity = '1';
                tpDescription.style.transform = 'translateY(0)';
            }

            if (shapeElement && shapeElement.style.opacity === '0') {
                shapeElement.style.opacity = '1';
                shapeElement.style.transform = 'scale(1) rotate(5deg)';
            }
        }

        // Animer chaque étape individuellement
        tpSteps.forEach((step, index) => {
            if (step && isElementInViewport(step, 100) && step.style.opacity === '0') {
                step.style.opacity = '1';
                step.style.transform = 'translateY(0)';

                // Ajouter une classe supplémentaire pour des effets avancés
                step.classList.add('animated');

                // Animation des icônes internes
                const icon = step.querySelector('.tp-icon');
                const img = step.querySelector('.tp-img img');
                const title = step.querySelector('h3');
                const desc = step.querySelector('p');

                if (icon) {
                    icon.style.animation = 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                }

                if (img) {
                    img.style.animation = 'fadeInScale 0.5s ease-out';
                }

                if (title) {
                    title.style.animation = 'slideInLeft 0.5s ease-out';
                }

                if (desc) {
                    desc.style.animation = 'fadeInUp 0.5s ease-out 0.2s forwards';
                    desc.style.opacity = '0';
                    desc.style.animationFillMode = 'forwards';
                }
            }
        });
    }

    // Créer et injecter les keyframes d'animation
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes bounceIn {
            0% {
                transform: scale(0);
                opacity: 0;
            }
            50% {
                transform: scale(1.2);
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }

        @keyframes fadeInScale {
            0% {
                opacity: 0;
                transform: scale(0.9);
            }
            100% {
                opacity: 1;
                transform: scale(1);
            }
        }

        @keyframes slideInLeft {
            0% {
                opacity: 0;
                transform: translateX(-30px);
            }
            100% {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes fadeInUp {
            0% {
                opacity: 0;
                transform: translateY(20px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes float {
            0% {
                transform: translateY(0px);
            }
            50% {
                transform: translateY(-10px);
            }
            100% {
                transform: translateY(0px);
            }
        }

        @keyframes pulse {
            0% {
                transform: scale(1);
                opacity: 0.5;
            }
            100% {
                transform: scale(1.5);
                opacity: 0;
            }
        }

        /* Effet de survol amélioré */
        .tp-step {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .tp-step:hover {
            transform: translateY(-10px) !important;
        }

        .tp-step:hover .tp-icon {
            animation: pulse 0.8s ease-out;
        }

        /* Effet de parallaxe pour la shape */
        .shape {
            transition: all 0.8s cubic-bezier(0.34, 1.2, 0.64, 1) !important;
        }

        /* Ligne de connexion animée entre les étapes */
        .tp-steps {
            position: relative;
        }

        .tp-steps::before {
            content: '';
            position: absolute;
            top: 25%;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, #f97316, #f97316, #f97316, transparent);
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 1s ease-out 0.5s;
            z-index: 0;
        }

        .tp-steps.animate-line::before {
            transform: scaleX(1);
        }

        /* Effet de scintillement sur les images */
        .tp-img img {
            transition: all 0.5s ease-out;
        }

        .tp-img img:hover {
            transform: scale(1.05);
            filter: brightness(1.05);
        }

        /* Animation de texte au scroll pour le titre */
        .tp-header h2 {
            position: relative;
            overflow: hidden;
        }

        /* Effet de contour progressif */
        .tp-step.animated {
            animation: none;
        }
    `;
    document.head.appendChild(styleSheet);

    // Fonction pour animer la ligne de connexion
    function animateConnectionLine() {
        const stepsContainer = document.querySelector('.tp-steps');
        if (stepsContainer && isElementInViewport(stepsContainer, 200)) {
            stepsContainer.classList.add('animate-line');
        }
    }

    // Effet de parallaxe pour la shape
    function parallaxEffect() {
        if (!shapeElement || !processSection) return;

        const scrollPosition = window.pageYOffset;
        const sectionTop = processSection.offsetTop;
        const sectionHeight = processSection.offsetHeight;
        const relativeScroll = scrollPosition - sectionTop;

        if (relativeScroll > 0 && relativeScroll < sectionHeight) {
            const speed = 0.3;
            const yPos = relativeScroll * speed;
            shapeElement.style.transform = `translateY(${yPos}px) rotate(5deg)`;
        }
    }

    // Effet de texte qui apparaît lettre par lettre pour le titre (optionnel)
    function animateTextLetterByLetter() {
        if (!tpTitle || tpTitle.hasAttribute('data-animated')) return;

        const text = tpTitle.innerHTML;
        if (isElementInViewport(tpTitle, 200)) {
            tpTitle.setAttribute('data-animated', 'true');
            // Optionnel: décomposer le texte pour un effet plus sophistiqué
            // Cette fonction peut être activée si désiré
        }
    }

    // Animation des compteurs (si vous voulez ajouter des statistiques plus tard)
    function animateCounters() {
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            if (isElementInViewport(counter, 100) && !counter.hasAttribute('data-counted')) {
                counter.setAttribute('data-counted', 'true');
                const target = parseInt(counter.getAttribute('data-target'));
                let current = 0;
                const increment = target / 50;
                const updateCounter = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        counter.textContent = target;
                        clearInterval(updateCounter);
                    } else {
                        counter.textContent = Math.floor(current);
                    }
                }, 20);
            }
        });
    }

    // Animation des images au chargement
    function preloadImages() {
        const images = document.querySelectorAll('.tp-img img');
        images.forEach(img => {
            if (img.complete) {
                img.style.opacity = '1';
            } else {
                img.style.opacity = '0';
                img.onload = () => {
                    img.style.transition = 'opacity 0.5s ease';
                    img.style.opacity = '1';
                };
            }
        });
    }

    // Observer pour les animations répétées (optionnel)
    let hasAnimated = false;

    // Fonction principale d'animation au scroll avec throttling pour performance
    let scrollTimeout;
    function handleScroll() {
        if (scrollTimeout) return;

        scrollTimeout = setTimeout(() => {
            animateOnScroll();
            animateConnectionLine();
            parallaxEffect();
            animateTextLetterByLetter();
            animateCounters();
            scrollTimeout = null;
        }, 10);
    }

    // Écouter l'événement scroll avec debounce pour les performances
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Écouter le redimensionnement pour recalculer les positions
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            handleScroll();
        }, 100);
    });

    // Exécuter une fois au chargement
    setTimeout(() => {
        handleScroll();
        preloadImages();
    }, 100);

    // Ajouter un effet de particules subtil (optionnel)
    function createParticles() {
        if (!processSection) return;

        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles-container';
        particlesContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
            z-index: 1;
        `;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(249, 115, 22, 0.3);
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: float ${3 + Math.random() * 4}s infinite ease-in-out;
                animation-delay: ${Math.random() * 2}s;
            `;
            particlesContainer.appendChild(particle);
        }

        processSection.style.position = 'relative';
        processSection.insertBefore(particlesContainer, processSection.firstChild);
    }

    // Créer l'effet de particules (décommentez si vous voulez cet effet)
    // createParticles();

    // Ajouter un effet de survol sur les étapes
    tpSteps.forEach(step => {
        step.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.tp-icon');
            if (icon) {
                icon.style.animation = 'none';
                setTimeout(() => {
                    icon.style.animation = 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                }, 10);
            }
        });
    });

    // Logger pour le débogage
    console.log('Animations de la section "Our Working Process" initialisées ✅');

    // Exposer des fonctions pour un contrôle manuel si nécessaire
    window.tpProcessAnimations = {
        refresh: handleScroll,
        animateAll: () => {
            tpSteps.forEach(step => {
                step.style.opacity = '1';
                step.style.transform = 'translateY(0)';
            });
            if (tpTag) {
                tpTag.style.opacity = '1';
                tpTag.style.transform = 'translateY(0)';
            }
            if (tpTitle) {
                tpTitle.style.opacity = '1';
                tpTitle.style.transform = 'translateY(0)';
            }
            if (tpDescription) {
                tpDescription.style.opacity = '1';
                tpDescription.style.transform = 'translateY(0)';
            }
            if (shapeElement) {
                shapeElement.style.opacity = '1';
                shapeElement.style.transform = 'scale(1) rotate(5deg)';
            }
        }
    };
});


// JavaScript pour animer la section FAQ moderne
document.addEventListener('DOMContentLoaded', function() {

    // Sélectionner tous les éléments à animer
    const faqSection = document.querySelector('.faq-modern');
    const faqContainer = document.querySelector('.faq-modern-container');
    const tagElement = document.querySelector('.tag');
    const titleElement = document.querySelector('.faq-left h2');
    const titleSpan = document.querySelector('.faq-left h2 span');
    const faqImageBox = document.querySelector('.faq-image-box');
    const experienceBox = document.querySelector('.experience');
    const faqItems = document.querySelectorAll('.faq-item');
    const faqRight = document.querySelector('.faq-right');

    // État initial des animations
    function setInitialStyles() {
        // Animation du tag
        if (tagElement) {
            tagElement.style.opacity = '0';
            tagElement.style.transform = 'translateX(-30px)';
        }

        // Animation du titre
        if (titleElement) {
            titleElement.style.opacity = '0';
            titleElement.style.transform = 'translateY(30px)';
        }

        // Animation du span dans le titre
        if (titleSpan) {
            titleSpan.style.opacity = '0';
            titleSpan.style.transform = 'translateY(20px)';
        }

        // Animation de l'image box
        if (faqImageBox) {
            faqImageBox.style.opacity = '0';
            faqImageBox.style.transform = 'translateX(-40px) scale(0.95)';
        }

        // Animation de l'expérience
        if (experienceBox) {
            experienceBox.style.opacity = '0';
            experienceBox.style.transform = 'translateY(30px) scale(0.9)';
        }

        // Animation des items FAQ
        faqItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(40px)';
            item.style.transition = `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.08}s`;
        });
    }

    // Appliquer les transitions CSS
    function applyTransitions() {
        if (tagElement) {
            tagElement.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s';
        }

        if (titleElement) {
            titleElement.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s';
        }

        if (titleSpan) {
            titleSpan.style.transition = 'all 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) 0.3s';
        }

        if (faqImageBox) {
            faqImageBox.style.transition = 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.15s';
        }

        if (experienceBox) {
            experienceBox.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.4s';
        }
    }

    setInitialStyles();
    applyTransitions();

    // Fonction pour vérifier si un élément est visible dans le viewport
    function isElementInViewport(el, offset = 100) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;

        return rect.top <= windowHeight - offset && rect.bottom >= offset;
    }

    // Fonction pour animer les éléments au scroll
    function animateOnScroll() {
        // Animer la section gauche
        if (faqSection && isElementInViewport(faqSection, 150)) {
            if (tagElement && tagElement.style.opacity === '0') {
                tagElement.style.opacity = '1';
                tagElement.style.transform = 'translateX(0)';
            }

            if (titleElement && titleElement.style.opacity === '0') {
                titleElement.style.opacity = '1';
                titleElement.style.transform = 'translateY(0)';
            }

            if (titleSpan && titleSpan.style.opacity === '0') {
                titleSpan.style.opacity = '1';
                titleSpan.style.transform = 'translateY(0)';
            }

            if (faqImageBox && faqImageBox.style.opacity === '0') {
                faqImageBox.style.opacity = '1';
                faqImageBox.style.transform = 'translateX(0) scale(1)';
            }

            if (experienceBox && experienceBox.style.opacity === '0') {
                experienceBox.style.opacity = '1';
                experienceBox.style.transform = 'translateY(0) scale(1)';

                // Ajouter une animation de comptage pour le nombre d'années
                animateCounter();
            }
        }

        // Animer les items FAQ individuellement
        faqItems.forEach((item, index) => {
            if (item && isElementInViewport(item, 120) && item.style.opacity === '0') {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
                item.classList.add('faq-visible');

                // Ajouter une animation subtile pour le span
                const span = item.querySelector('.faq-question span');
                if (span) {
                    span.style.animation = 'arrowPulse 0.5s ease-out';
                }
            }
        });
    }

    // Animation du compteur pour les années d'expérience
    function animateCounter() {
        if (!experienceBox || experienceBox.hasAttribute('data-animated')) return;

        const counterElement = experienceBox.querySelector('h3');
        if (!counterElement) return;

        experienceBox.setAttribute('data-animated', 'true');
        const targetValue = 10;
        let currentValue = 0;
        const duration = 1500;
        const increment = targetValue / (duration / 16);

        const updateCounter = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                counterElement.textContent = targetValue + '+';
                clearInterval(updateCounter);
            } else {
                counterElement.textContent = Math.floor(currentValue) + '+';
            }
        }, 16);
    }

    // Gestion des questions FAQ avec animations fluides
    function initFaqInteractions() {
        faqItems.forEach((item, index) => {
            const questionDiv = item.querySelector('.faq-question');
            const answerDiv = item.querySelector('.faq-answer');
            const arrowSpan = questionDiv.querySelector('span');

            // Configurer l'état initial des réponses
            if (!item.classList.contains('active')) {
                if (answerDiv) {
                    answerDiv.style.maxHeight = '0';
                    answerDiv.style.paddingTop = '0';
                    answerDiv.style.paddingBottom = '0';
                    answerDiv.style.opacity = '0';
                }
                if (arrowSpan) {
                    arrowSpan.textContent = '→';
                    arrowSpan.style.transform = 'rotate(0deg)';
                }
            } else {
                if (answerDiv) {
                    const height = answerDiv.scrollHeight;
                    answerDiv.style.maxHeight = height + 'px';
                    answerDiv.style.opacity = '1';
                    answerDiv.style.paddingTop = '0';
                    answerDiv.style.paddingBottom = '16px';
                }
                if (arrowSpan) {
                    arrowSpan.textContent = '⌄';
                    arrowSpan.style.transform = 'rotate(0deg)';
                }
            }

            // Ajouter l'événement click
            questionDiv.addEventListener('click', (e) => {
                e.stopPropagation();

                const isActive = item.classList.contains('active');

                if (!isActive) {
                    // Fermer tous les autres items
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains('active')) {
                            otherItem.classList.remove('active');
                            const otherAnswer = otherItem.querySelector('.faq-answer');
                            const otherArrow = otherItem.querySelector('.faq-question span');

                            if (otherAnswer) {
                                otherAnswer.style.maxHeight = '0';
                                otherAnswer.style.opacity = '0';
                                otherAnswer.style.paddingBottom = '0';
                            }
                            if (otherArrow) {
                                otherArrow.textContent = '→';
                                otherArrow.style.transform = 'rotate(0deg)';
                            }
                        }
                    });

                    // Ouvrir l'item actuel
                    item.classList.add('active');
                    if (answerDiv) {
                        const height = answerDiv.scrollHeight;
                        answerDiv.style.maxHeight = height + 'px';
                        answerDiv.style.opacity = '1';
                        answerDiv.style.paddingBottom = '16px';
                    }
                    if (arrowSpan) {
                        arrowSpan.textContent = '⌄';
                        arrowSpan.style.animation = 'arrowRotate 0.3s ease-out';
                        setTimeout(() => {
                            if (arrowSpan) arrowSpan.style.animation = '';
                        }, 300);
                    }

                    // Animation de la réponse
                    if (answerDiv) {
                        answerDiv.style.animation = 'fadeSlideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                        setTimeout(() => {
                            if (answerDiv) answerDiv.style.animation = '';
                        }, 400);
                    }
                } else {
                    // Fermer l'item actuel
                    item.classList.remove('active');
                    if (answerDiv) {
                        answerDiv.style.maxHeight = '0';
                        answerDiv.style.opacity = '0';
                        answerDiv.style.paddingBottom = '0';
                    }
                    if (arrowSpan) {
                        arrowSpan.textContent = '→';
                        arrowSpan.style.transform = 'rotate(0deg)';
                        arrowSpan.style.animation = 'arrowBack 0.3s ease-out';
                        setTimeout(() => {
                            if (arrowSpan) arrowSpan.style.animation = '';
                        }, 300);
                    }
                }
            });

            // Support clavier pour l'accessibilité
            questionDiv.setAttribute('tabindex', '0');
            questionDiv.setAttribute('role', 'button');
            questionDiv.setAttribute('aria-expanded', item.classList.contains('active'));

            questionDiv.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    questionDiv.click();
                }
            });
        });
    }

    // Animation de l'image au survol
    function initImageHoverEffect() {
        if (faqImageBox) {
            const img = faqImageBox.querySelector('img');
            if (img) {
                faqImageBox.addEventListener('mouseenter', () => {
                    img.style.transform = 'scale(1.05)';
                    img.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                });

                faqImageBox.addEventListener('mouseleave', () => {
                    img.style.transform = 'scale(1)';
                });
            }
        }
    }

    // Animation des particules subtiles (optionnel)
    function createParticles() {
        if (!faqSection) return;

        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'faq-particles';
        particlesContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
            z-index: 0;
        `;

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 4 + 2;
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: rgba(249, 115, 22, 0.2);
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: floatParticle ${5 + Math.random() * 10}s infinite ease-in-out;
                animation-delay: ${Math.random() * 5}s;
                opacity: ${Math.random() * 0.5};
            `;
            particlesContainer.appendChild(particle);
        }

        faqSection.style.position = 'relative';
        faqSection.insertBefore(particlesContainer, faqSection.firstChild);
    }

    // Effet de parallaxe sur l'image
    function initParallaxEffect() {
        if (!faqImageBox) return;

        window.addEventListener('scroll', () => {
            if (!isElementInViewport(faqSection, 200)) return;

            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.15;
            if (faqImageBox) {
                faqImageBox.style.transform = `translateY(${rate * 0.1}px)`;
            }
        });
    }

    // Ajouter les keyframes CSS dynamiquement
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes fadeSlideDown {
            0% {
                opacity: 0;
                transform: translateY(-10px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes arrowRotate {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(180deg);
            }
        }

        @keyframes arrowBack {
            0% {
                transform: rotate(180deg);
            }
            100% {
                transform: rotate(0deg);
            }
        }

        @keyframes arrowPulse {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.3);
                color: #f97316;
            }
            100% {
                transform: scale(1);
            }
        }

        @keyframes floatParticle {
            0% {
                transform: translateY(0) translateX(0);
                opacity: 0;
            }
            50% {
                opacity: 0.5;
            }
            100% {
                transform: translateY(-100px) translateX(50px);
                opacity: 0;
            }
        }

        @keyframes glowPulse {
            0% {
                box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(249, 115, 22, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(249, 115, 22, 0);
            }
        }

        /* Animation de surbrillance pour les items actifs */
        .faq-item.active {
            background: linear-gradient(135deg, #fff7ed 0%, #fff 100%);
            border-left: 3px solid #f97316;
        }

        .faq-item.active .faq-question {
            color: #f97316;
        }

        .faq-item.active .faq-question span {
            color: #f97316;
            transform: rotate(180deg);
        }

        /* Effet de vague sur le titre */
        .faq-left h2 span {
            display: inline-block;
            position: relative;
        }

        .faq-left h2 span::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 0;
            height: 3px;
            background: linear-gradient(90deg, #f97316, #fdba74);
            transition: width 0.6s ease-out;
        }

        .faq-left h2 span.animated::after {
            width: 100%;
        }

        /* Animation de l'expérience box */
        .experience {
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
        }

        .experience:hover {
            transform: translateY(-8px) scale(1.02) !important;
            box-shadow: 0 20px 35px -12px rgba(249, 115, 22, 0.3);
        }

        /* Effet de dégradé sur les questions */
        .faq-question {
            transition: all 0.3s ease;
        }

        .faq-question:hover {
            padding-left: 20px;
            color: #f97316;
        }

        /* Animation au scroll pour la section */
        .faq-modern-container {
            transition: all 0.5s ease;
        }

        /* Effet de scintillement sur l'image */
        .faq-image-box img {
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Animation d'apparition des items */
        .faq-item.faq-visible {
            animation: none;
        }
    `;
    document.head.appendChild(styleSheet);

    // Fonction pour initialiser toutes les animations
    function initAllAnimations() {
        initFaqInteractions();
        initImageHoverEffect();
        // createParticles(); // Décommentez pour activer les particules
        initParallaxEffect();

        // Animation spéciale pour le span du titre
        if (titleSpan && isElementInViewport(titleSpan, 200)) {
            setTimeout(() => {
                titleSpan.classList.add('animated');
            }, 800);
        }
    }

    // Gestion du scroll avec optimisation de performance
    let scrollTimeout;
    let ticking = false;

    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                animateOnScroll();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(animateOnScroll, 100);
    });

    // Initialiser
    setTimeout(() => {
        animateOnScroll();
        initAllAnimations();
    }, 100);

    // Observer pour les animations répétées (optionnel)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('faq-item') && entry.target.style.opacity === '0') {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }
            }
        });
    }, { threshold: 0.1 });

    faqItems.forEach(item => observer.observe(item));

    // Logger
    console.log('FAQ Moderne - Animations initialisées avec succès ✅');

    // Exposer des fonctions pour un contrôle manuel
    window.faqModernAnimations = {
        refresh: animateOnScroll,
        openItem: (index) => {
            if (faqItems[index]) {
                faqItems[index].querySelector('.faq-question').click();
            }
        },
        resetAnimations: () => {
            setInitialStyles();
            setTimeout(animateOnScroll, 100);
        }
    };
});





function showAlert(message, type="error"){

    const alertBox = document.getElementById("trackingAlert");

    alertBox.innerText = message;

    alertBox.className = "alert show " + type;

    // auto hide
    setTimeout(()=>{
        alertBox.classList.remove("show");
    }, 3000);
}

