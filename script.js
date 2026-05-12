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

// Анімована тема
function initTheme() {
    const btn = document.querySelector('#theme-toggle');
    const html = document.documentElement;

    const apply = (t) => {
        html.setAttribute('data-theme', t);
        localStorage.setItem('theme', t);
        
        const icon = btn.querySelector('i');
        icon.classList.add('theme-rotate');
        icon.className = t === 'light' ? 'fas fa-moon theme-rotate' : 'fas fa-sun theme-rotate';
        
        setTimeout(() => icon.classList.remove('theme-rotate'), 500);
    };

    apply(localStorage.getItem('theme') || 'light');
    btn.onclick = () => apply(html.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
}

// Анімована зміна мови
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
        btn.style.transform = 'scale(0.8)';
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
            const next = localStorage.getItem('lang') === 'ua' ? 'en' : 'ua';
            update(next);
        }, 150);
    };
}

// Паралакс фону
function initParallax() {
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;
        document.querySelectorAll('.blob').forEach((blob, i) => {
            const speed = (i + 1) * 40;
            blob.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });
}

// Мобільне меню
function initMenu() {
    const toggle = document.querySelector('#mobile-menu');
    const links = document.querySelector('.nav-links');
    toggle.onclick = () => {
        links.classList.toggle('active');
        const icon = toggle.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    };
}

// Завантаження галереї Cloudinary
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
            img.loading = "lazy";
            
            img.onclick = () => {
                const lb = document.getElementById('lightbox');
                const lbImg = lb.querySelector('img');
                lbImg.src = img.src.replace('w_700,h_700', 'w_1400');
                lb.style.display = 'flex';
                setTimeout(() => lb.classList.add('show'), 10);
            };

            div.appendChild(img);
            container.appendChild(div);
        });
    } catch (e) {
        container.innerHTML = '<p>Потрібно ввімкнути "Resource List" у Cloudinary</p>';
    }
}

// Lightbox
const lb = document.getElementById('lightbox') || document.createElement('div');
if (!document.getElementById('lightbox')) {
    lb.id = 'lightbox';
    lb.innerHTML = '<img src="">';
    document.body.appendChild(lb);
}
lb.onclick = () => {
    lb.classList.remove('show');
    setTimeout(() => lb.style.display = 'none', 400);
};

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLang();
    initParallax();
    initMenu();
    loadGallery('photos', 'photos-grid');
    loadGallery('artworks', 'drawings-grid');
});
