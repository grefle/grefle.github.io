const CLOUD_NAME = 'grefle'; 
let scrollObserver;

/**
 * Ініціалізація кастомного курсора
 */
function initCursor() {
    const cursor = document.getElementById('cursor');
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Збільшення курсора при наведенні на лінки
    const interactiveElements = document.querySelectorAll('a, button, .item img');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.style.transform = 'scale(2.5)');
        el.addEventListener('mouseleave', () => cursor.style.transform = 'scale(1)');
    });
}

/**
 * Анімація появи елементів при скролі
 */
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return observer;
}

/**
 * Створення лайтбоксу
 */
function createLightbox() {
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    const img = document.createElement('img');
    lightbox.appendChild(img);
    document.body.appendChild(lightbox);

    lightbox.addEventListener('click', () => {
        lightbox.classList.remove('show');
        setTimeout(() => lightbox.style.display = 'none', 400);
    });
    return { lightbox, lightboxImg: img };
}

const { lightbox, lightboxImg } = createLightbox();

/**
 * Завантаження галереї
 */
async function loadGallery(tag, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const apiUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${tag}.json`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        container.innerHTML = '';

        data.resources.forEach((resource) => {
            const div = document.createElement('div');
            div.className = 'item reveal';
            
            const previewUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_700,h_875,f_auto,q_auto/v${resource.version}/${resource.public_id}.${resource.format}`;
            const fullUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/v${resource.version}/${resource.public_id}.${resource.format}`;
            
            const img = document.createElement('img');
            img.src = previewUrl;
            img.alt = "Grefle Artwork";
            img.loading = "lazy";
            
            img.addEventListener('click', () => {
                lightboxImg.src = fullUrl;
                lightbox.style.display = 'flex';
                setTimeout(() => lightbox.classList.add('show'), 10);
            });

            div.appendChild(img);
            container.appendChild(div);
            scrollObserver.observe(div);
        });
    } catch (err) {
        console.error("Cloudinary error:", err);
        container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; opacity:0.5;">Налаштуйте Resource List у Cloudinary для відображення медіа.</p>';
    }
}

/**
 * Керування темою
 */
function initTheme() {
    const toggleBtn = document.querySelector('#theme-toggle');
    const icon = toggleBtn.querySelector('i');
    const html = document.documentElement;
    
    const setTheme = (theme) => {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    };

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    toggleBtn.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        setTheme(current === 'light' ? 'dark' : 'light');
    });
}

// Запуск всього після завантаження DOM
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCursor();
    scrollObserver = initScrollReveal();
    loadGallery('photos', 'photos-grid');
    loadGallery('artworks', 'drawings-grid');
    
    // Плавна зміна фону навігації при скролі
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        if (window.scrollY > 50) {
            nav.style.padding = '0.8rem 5%';
            nav.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        } else {
            nav.style.padding = '1.5rem 5%';
            nav.style.boxShadow = 'none';
        }
    });
});
