// Specialist Payment Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const paymentPopup = document.getElementById('paymentPopup');
    const paymentPopupOverlay = paymentPopup?.querySelector('.payment-popup-overlay');
    const paymentPopupClose = paymentPopup?.querySelector('.payment-popup-close');
    const paymentForm = document.getElementById('paymentForm');
    const phoneInput = document.getElementById('paymentPhone');
    const promoToggleBtn = document.querySelector('.promo-toggle-btn');
    const promoInputWrapper = document.querySelector('.promo-input-wrapper');
    const promoApplyBtn = document.querySelector('.promo-apply-btn');
    
    let currentPrice = 0;
    let currentSpecialist = '';
    let discountApplied = false;

    // Open payment popup
    document.addEventListener('click', function(e) {
        if (e.target.closest('.profile-pay-btn')) {
            const btn = e.target.closest('.profile-pay-btn');
            currentPrice = parseInt(btn.getAttribute('data-price'));
            currentSpecialist = btn.getAttribute('data-specialist');

            document.getElementById('paymentPopupPrice').textContent = formatPrice(currentPrice);
            openPopup();
        }
    });

    // Open booking popup
    document.addEventListener('click', function(e) {
        if (e.target.closest('.profile-booking-btn')) {
            const btn = e.target.closest('.profile-booking-btn');
            currentPrice = parseInt(btn.getAttribute('data-price'));
            currentSpecialist = btn.getAttribute('data-specialist');

            document.getElementById('paymentPopupPrice').textContent = formatPrice(currentPrice);
            openPopup();
        }
    });

    // Close popup
    function closePopup() {
        paymentPopup.classList.remove('active');
        document.body.style.overflow = '';
        paymentForm.reset();
        discountApplied = false;
        promoInputWrapper.style.display = 'none';
    }

    function openPopup() {
        paymentPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    if (paymentPopupClose) {
        paymentPopupClose.addEventListener('click', closePopup);
    }

    if (paymentPopupOverlay) {
        paymentPopupOverlay.addEventListener('click', closePopup);
    }

    // Close on Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && paymentPopup.classList.contains('active')) {
            closePopup();
        }
    });

    // Phone mask
    if (phoneInput) {
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
    }

    // Promo code toggle
    if (promoToggleBtn) {
        promoToggleBtn.addEventListener('click', function() {
            if (promoInputWrapper.style.display === 'none') {
                promoInputWrapper.style.display = 'flex';
                this.textContent = 'Скрыть промокод';
            } else {
                promoInputWrapper.style.display = 'none';
                this.textContent = 'Ввести промокод';
            }
        });
    }

    // Apply promo code
    if (promoApplyBtn) {
        promoApplyBtn.addEventListener('click', async function() {
            const promoInput = document.getElementById('promoCode');
            const promoCode = promoInput.value.trim().toUpperCase();
            
            if (!promoCode) {
                alert('Введите промокод');
                return;
            }
            
            if (discountApplied) {
                alert('Промокод уже применен');
                return;
            }
            
            try {
                const response = await fetch(API_CONFIG.getApiUrl('promo-codes/validate'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ code: promoCode })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    const discount = result.data.discount;
                    const newPrice = currentPrice * (1 - discount / 100);
                    
                    document.getElementById('paymentPopupPrice').innerHTML = 
                        `<span style="text-decoration: line-through; opacity: 0.5;">${formatPrice(currentPrice)}</span> ${formatPrice(newPrice)}`;
                    
                    currentPrice = newPrice;
                    discountApplied = true;
                    
                    alert(`Промокод применен! Скидка ${discount}%`);
                    promoInput.disabled = true;
                    this.disabled = true;
                    this.textContent = 'Применено';
                } else {
                    alert(result.error || 'Неверный промокод');
                }
            } catch (error) {
                console.error('Error validating promo code:', error);
                alert('Ошибка проверки промокода. Попробуйте позже.');
            }
        });
    }

    // Form submission
    if (paymentForm) {
        paymentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.payment-submit-btn');
            const originalText = submitBtn.innerHTML;
            
            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Обработка...</span>';
                
                const formData = {
                    name: document.getElementById('paymentName').value,
                    phone: document.getElementById('paymentPhone').value,
                    email: document.getElementById('paymentEmail').value,
                    request_type: 'specialist',
                    message: `Запись к специалисту: ${currentSpecialist}. Стоимость: ${formatPrice(currentPrice)}`,
                    specialist_id: null // You can add specialist ID if available
                };
                
                // Save request to database
                const response = await fetch(API_CONFIG.getApiUrl('requests'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Show success message
                    alert(`✅ Заявка создана! Мы свяжемся с вами для записи на консультацию с ${currentSpecialist} на сумму ${formatPrice(currentPrice)}`);

                    // In production, redirect to payment:
                    // window.location.href = 'https://your-payment-system.com/pay?amount=' + currentPrice;

                    closePopup();
                } else {
                    throw new Error(result.error || 'Ошибка создания заявки');
                }
            } catch (error) {
                console.error('Error submitting payment form:', error);
                alert('❌ Произошла ошибка. Попробуйте позже или свяжитесь с нами по телефону.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // Format price helper
    function formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    }


    // Review button handler
    document.addEventListener('click', function(e) {
        if (e.target.closest('.profile-review-btn-secondary')) {
            // Open review form or redirect
            alert('Форма отзыва будет добавлена позже');
            // You can implement a review form popup similar to payment popup
        }
    });
});
