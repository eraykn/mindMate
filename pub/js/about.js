// Hakkımızda sayfası için JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Sayfaya yükleme sonrası animasyon sınıflarını etkinleştir
    setTimeout(() => {
        const elements = document.querySelectorAll('.animate-fade-up');
        elements.forEach(element => {
            element.style.opacity = '1';
        });
    }, 100);
    
    // Logo ve ana sayfa bağlantıları için tıklama işlevselliği
    const logoLink = document.querySelector('.logo-link');
    const anasayfaLink = document.querySelector('.menu-item[href="../index.html#anasayfa"]');
    
    // Logo tıklaması için özel işlev (Sorun burada olabilir)
    if (logoLink) {
        logoLink.addEventListener('click', function(e) {
            // Logo tıklamasında sayfa yönlendirmesini manuel yapalım
            window.location.href = '../index.html';
            return false; // Varsayılan davranışı engelleyelim
        });
    }
    
    // Ana sayfa tıklaması için özel işlev
    if (anasayfaLink) {
        anasayfaLink.addEventListener('click', function(e) {
            // Ana sayfa tıklamasında sayfa yönlendirmesini manuel yapalım
            window.location.href = '../index.html#anasayfa';
            return false; // Varsayılan davranışı engelleyelim
        });
    }
    
    // Tüm menü öğeleri için genel işlev
    const allMenuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    allMenuItems.forEach(item => {
        if (!item.classList.contains('active')) { // Aktif olmayan menü öğeleri için
            item.addEventListener('click', function(e) {
                const target = this.getAttribute('href');
                if (target && target !== '#' && !target.startsWith('javascript')) {
                    // Konsola yönlendirmeyi yazdıralım (debug için)
                    console.log('Menü tıklaması: Yönlendiriliyor:', target);
                    
                    // Sayfayı manuel olarak yönlendirelim
                    window.location.href = target;
                    
                    // Varsayılan davranışı engelleyelim
                    e.preventDefault();
                    return false;
                }
            });
        }
    });
    
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
    }
    
    // Tüm menü öğelerine ripple efekti ekleyelim
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(button => {
        button.addEventListener('click', createRipple);
    });
    
    // Logo-link için de ripple efekti ekleyelim
    if (logoLink) {
        logoLink.addEventListener('click', createRipple);
    }
    
    // Sayfa yüklendiğinde konsola bildiri yazdıralım (debug için)
    console.log('Hakkımızda sayfası JavaScript yüklendi');
    console.log('Logo link:', logoLink);
    console.log('Ana sayfa link:', anasayfaLink);
});