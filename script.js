const GITHUB_USERNAME = 'grefle';
const GITHUB_REPO = 'grefle.github.io';

/**
 * Автоматичне підвантаження зображень через GitHub API
 */
async function loadGallery(folderPath, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // URL для отримання вмісту папки
    const apiUrl = https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${folderPath};

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Помилка API');
        
        let files = await response.json();

        // Фільтруємо лише картинки
        const imageFiles = files.filter(file => 
            file.name.match(/\.(jpe?g|png|gif|webp|svg)$/i)
        ).reverse(); // Нові файли (за алфавітом) будуть першими

        if (imageFiles.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; opacity: 0.5;">Тут поки порожньо...</p>';
            return;
        }

        imageFiles.forEach(file => {
            const div = document.createElement('div');
            div.className = 'item';
            
            const img = document.createElement('img');
            // Використовуємо download_url для прямого доступу до картинки
            img.src = file.download_url;
            img.alt = "Art by Grefle";
            img.loading = "lazy";
            
            div.appendChild(img);
            container.appendChild(div);
        });
    } catch (err) {
        console.error(Не вдалося завантажити ${folderPath}:, err);
        container.innerHTML = <p>Помилка завантаження галереї.</p>;
    }
}

/**
 * Перемикач тем
 */
function initTheme() {
    const toggleBtn = document.querySelector('#theme-toggle');
    const icon = toggleBtn.querySelector('i');
    const html = document.documentElement;

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

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadGallery('images', 'photos-grid');
    loadGallery('artworks', 'drawings-grid');
});
