// Hakkımızda sayfası için JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Sayfaya yükleme sonrası animasyon sınıflarını etkinleştir
    setTimeout(() => {
        const elements = document.querySelectorAll('.animate-fade-up');
        elements.forEach(element => {
            element.style.opacity = '1';
        });
    }, 100);
    
    // Ana sayfaya yönlendirme yapan tüm bağlantıları düzeltme
    const mainPageLinks = document.querySelectorAll('.sidebar-menu .menu-item:not(.active)');
    mainPageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            
            // Sadece ana sayfadaki bölüm bağlantılarını kontrol et
            if (href && href.includes('#')) {
                console.log('Ana sayfadaki bölüme yönlendiriliyor:', href);
                
                // Ripple efekti uygula
                createRipple(e);
                
                // Sayfayı yönlendir
                window.location.href = href;
            }
        });
    });
    
    // Logo tıklaması için özel işlev
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', function(e) {
            e.preventDefault();
            createRipple(e);
            console.log('Logo tıklandı, ana sayfaya yönlendiriliyor');
            window.location.href = '../index.html';
        });
    }
    
    // Menü tıklamaları için ripple (dalga) efekti
    function createRipple(e) {
        const button = e.currentTarget;
        
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - button.getBoundingClientRect().left - diameter / 2}px`;
        circle.style.top = `${e.clientY - button.getBoundingClientRect().top - diameter / 2}px`;
        circle.classList.add('ripple');
        
        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
        
        // Ripple efekti tamamlandıktan sonra kaldır
        setTimeout(() => {
            circle.remove();
        }, 600);
    }
    
    // Tüm menü öğelerine ripple efekti ekleyelim
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(button => {
        button.addEventListener('click', createRipple);
    });
    
    // Konsola bilgi yazdırma
    console.log('Hakkımızda sayfası JavaScript yüklendi');
});