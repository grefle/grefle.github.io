const GITHUB_USERNAME = 'grefle';
const GITHUB_REPO = 'grefle.github.io';

let scrollObserver; // Глобальна змінна для спостерігача скролу

/**
 * Ініціалізація анімацій при гортанні
 */
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    // Спостерігаємо за статичними елементами сторінки
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return observer;
}

/**
 * Створення Lightbox (повноекранний перегляд зображень)
 */
function createLightbox() {
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    
    const img = document.createElement('img');
    lightbox.appendChild(img);
    document.body.appendChild(lightbox);

    // Закриття по кліку будь-де
    lightbox.addEventListener('click', () => {
        lightbox.classList.remove('show');
        // Чекаємо завершення CSS-анімації перед приховуванням
        setTimeout(() => {
            if (!lightbox.classList.contains('show')) {
                lightbox.style.display = 'none';
            }
        }, 300);
    });
    
    return { lightbox, lightboxImg: img };
}

const { lightbox, lightboxImg } = createLightbox();

/**
 * Автоматичне підвантаження зображень через GitHub API
 */
async function loadGallery(folderPath, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<div class="loader">Завантаження робіт...</div>';
    const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${folderPath}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Помилка API');
        
        let files = await response.json();
        
        // Фільтруємо зображення і розвертаємо, щоб нові були першими
        const imageFiles = files.filter(file => 
            file.name.match(/\.(jpe?g|png|gif|webp|svg)$/i)
        ).reverse();

        container.innerHTML = ''; // Очищуємо лоадер

        if (imageFiles.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; opacity: 0.5; text-align: center;">Тут поки порожньо...</p>';
            return;
        }

        imageFiles.forEach((file, index) => {
            const div = document.createElement('div');
            div.className = 'item reveal';
            
            // Каскадна затримка для ефекту хвилі (макс. 1 секунда)
            div.style.transitionDelay = `${(index % 10) * 0.1}s`; 
            
            const img = document.createElement('img');
            img.src = file.download_url;
            img.alt = "Art by Grefle";
            img.loading = "lazy";
            
            // Логіка відкриття картинки
            img.addEventListener('click', () => {
                lightboxImg.src = file.download_url;
                lightbox.style.display = 'flex';
                // Мінімальна затримка, щоб спрацював transition: opacity
                setTimeout(() => lightbox.classList.add('show'), 10);
            });

            div.appendChild(img);
            container.appendChild(div);
            
            // Передаємо нові елементи до обзервера, щоб вони анімувалися
            if(scrollObserver) {
                scrollObserver.observe(div);
            }
        });
    } catch (err) {
        console.error(`Не вдалося завантажити ${folderPath}:`, err);
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff3b30; opacity: 0.8;">Не вдалося завантажити галерею. Спробуйте пізніше.</p>';
    }
}

/**
 * Перемикач світлої/темної теми
 */
function initTheme() {
    const toggleBtn = document.querySelector('#theme-toggle');
    if (!toggleBtn) return;
    
    const icon = toggleBtn.querySelector('i');
    const html = document.documentElement;

    // Читаємо збережену тему з браузера
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateIcon(savedTheme);

    toggleBtn.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateIcon(next);
    });

    function updateIcon(theme) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Головний запуск після повного завантаження HTML
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    scrollObserver = initScrollReveal();
    loadGallery('images', 'photos-grid');
    loadGallery('artworks', 'drawings-grid');
});
