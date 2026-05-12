const CLOUD_NAME = 'grefle';
const translations = {
    ua: {
        nav_about: "Про мене", nav_photos: "Фотографії", nav_drawings: "Малюнки",
        badge: "Visual Artist", hero_greet: "Привіт, я", 
        hero_desc: "Досліджую світ крізь об'єктив та цифрові полотна в пошуках сенсу",
        footer: "© 2026 Grefle. Створено з акцентом на візуальну чистоту."
    },
    en: {
        nav_about: "About", nav_photos: "Photography", nav_drawings: "Artworks",
        badge: "Visual Artist", hero_greet: "Hi, I'm", 
        hero_desc: "Exploring the world through lenses and digital canvases in search of meaning",
        footer: "© 2026 Grefle. Focused on visual purity."
    }
};

// Завантаження фону з тегом 'special'
async function initSpecialBackground() {
    const bgContainer = document.getElementById('dynamic-bg');
    try {
        const response = await fetch(`https://res.cloudinary.com/${CLOUD_NAME}/image/list/special.json`);
        const data = await response.json();
        if (data.resources && data.resources.length > 0) {
            // Беремо перше фото з тегом special
            const res = data.resources[0];
            const imgUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_1920/v${res.version}/${res.public_id}.${res.format}`;
            bgContainer.style.backgroundImage = `url('${imgUrl}')`;
        }
    } catch (e) { console.error("Bg load error:", e); }
}

// Паралакс тепер рухає весь фон
function initParallax() {
    const bg = document.getElementById('dynamic-bg');
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;
        // Рухаємо фон у протилежний бік для ефекту глибини
        bg.style.transform = `translate(${x * -20}px, ${y * -20}px) scale(1.05)`;
    });
}

function initTheme() {
    const btn = document.querySelector('#theme-toggle');
    const html = document.documentElement;
    const apply = (t) => {
        html.setAttribute('data-theme', t);
        localStorage.setItem('theme', t);
        btn.querySelector('i').className = t === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    };
    apply(localStorage.getItem('theme') || 'light');
    btn.onclick = () => apply(html.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
}

function initLang() {
    const btn = document.querySelector('#lang-toggle');
    const update = (l) => {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[l][key]) el.innerText = translations[l][key];
        });
        btn.innerText = l === 'ua' ? 'EN' : 'UA';
        localStorage.setItem('lang', l);
    };
    update(localStorage.getItem('lang') || 'ua');
    btn.onclick = () => {
        const next = localStorage.getItem('lang') === 'ua' ? 'en' : 'ua';
        update(next);
    };
}

function initMenu() {
    const toggle = document.querySelector('#mobile-menu');
    const links = document.querySelector('.nav-links');
    if(toggle) {
        toggle.onclick = () => {
            links.classList.toggle('active');
            toggle.querySelector('i').classList.toggle('fa-bars');
            toggle.querySelector('i').classList.toggle('fa-times');
        };
    }
}

async function loadGallery(tag, containerId) {
    const container = document.getElementById(containerId);
    try {
        const response = await fetch(`https://res.cloudinary.com/${CLOUD_NAME}/image/list/${tag}.json`);
        const data = await response.json();
        container.innerHTML = '';
        data.resources.forEach(res => {
            const div = document.createElement('div');
            div.className = 'item';
            const img = document.createElement('img');
            img.src = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_700,h_700,g_auto,f_auto,q_auto/v${res.version}/${res.public_id}.${res.format}`;
            img.onclick = () => {
                const lb = document.getElementById('lightbox');
                lb.querySelector('img').src = img.src.replace('w_700,h_700', 'w_1400');
                lb.style.display = 'flex';
            };
            div.appendChild(img);
            container.appendChild(div);
        });
    } catch (e) { console.error(e); }
}

document.getElementById('lightbox').onclick = function() { this.style.display = 'none'; };

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLang();
    initSpecialBackground();
    initParallax();
    initMenu();
    loadGallery('photos', 'photos-grid');
    loadGallery('artworks', 'drawings-grid');
});
