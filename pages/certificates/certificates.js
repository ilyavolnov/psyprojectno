// Certificates page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get popups
    const detailsPopup = document.getElementById('detailsPopup');
    const paymentPopup = document.getElementById('paymentPopup');
    
    // Get buttons
    const detailsButtons = document.querySelectorAll('.certificate-btn-details');
    const payButtons = document.querySelectorAll('.certificate-btn-pay');
    const closeButtons = document.querySelectorAll('.certificate-popup-close');
    const overlays = document.querySelectorAll('.certificate-popup-overlay');
    
    // Get form
    const certificateForm = document.getElementById('certificateForm');
    
    let currentPrice = 0;
    
    // Format price
    function formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    }
    
    // Open details popup
    detailsButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentPrice = this.getAttribute('data-price');
            document.getElementById('popupPrice').textContent = formatPrice(currentPrice);
            detailsPopup.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Open payment popup
    payButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentPrice = this.getAttribute('data-price');
            document.getElementById('paymentPrice').textContent = formatPrice(currentPrice);
            paymentPopup.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Close popups
    function closePopup(popup) {
        popup.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const popup = this.closest('.certificate-popup');
            closePopup(popup);
        });
    });
    
    overlays.forEach(overlay => {
        overlay.addEventListener('click', function() {
            const popup = this.closest('.certificate-popup');
            closePopup(popup);
        });
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (detailsPopup.classList.contains('active')) {
                closePopup(detailsPopup);
            }
            if (paymentPopup.classList.contains('active')) {
                closePopup(paymentPopup);
            }
        }
    });
    
    // Phone mask
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            if (value[0] !== '7') {
                value = '7' + value;
            }
            
            let formatted = '+7';
            if (value.length > 1) {
                formatted += ' (' + value.substring(1, 4);
            }
            if (value.length >= 5) {
                formatted += ') ' + value.substring(4, 7);
            }
            if (value.length >= 8) {
                formatted += '-' + value.substring(7, 9);
            }
            if (value.length >= 10) {
                formatted += '-' + value.substring(9, 11);
            }
            
            e.target.value = formatted;
        }
    });
    
    // Form submission
    certificateForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            price: currentPrice
        };
        
        // Here you would typically send data to your payment system
        console.log('Form data:', formData);
        
        // Redirect to payment system (replace with your actual payment URL)
        // For now, just show an alert
        alert('Переход к оплате сертификата на сумму ' + formatPrice(currentPrice));
        
        // In production, you would redirect to payment:
        // window.location.href = 'https://your-payment-system.com/pay?amount=' + currentPrice;
        
        closePopup(paymentPopup);
        certificateForm.reset();
    });
    
    // Burger menu
    const burgerMenu = document.querySelector('.burger-menu');
    const nav = document.querySelector('.nav');
    
    if (burgerMenu) {
        burgerMenu.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('active');
        });
    }
    
    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('[data-scroll]').forEach(el => {
        observer.observe(el);
    });
});
