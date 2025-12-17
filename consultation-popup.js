// Consultation Popup Manager
class ConsultationPopup {
    constructor() {
        this.popup = document.getElementById('consultationPopup');
        this.closeBtn = document.getElementById('closePopup');
        this.form = document.getElementById('consultationForm');

        if (this.popup) {
            this.init();
        }
    }

    init() {
        // Close button
        this.closeBtn.addEventListener('click', () => this.close());

        // Close on overlay click
        this.popup.addEventListener('click', (e) => {
            if (e.target === this.popup) {
                this.close();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.popup.classList.contains('active')) {
                this.close();
            }
        });

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Setup trigger buttons
        this.setupTriggers();
    }

    setupTriggers() {
        // Urgent consultation buttons
        document.querySelectorAll('.urgent-consultation-btn, .urgent-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.open('urgent');
            });
        });

        // Family session buttons - only those within family-session container
        document.querySelectorAll('.family-session .banner-btn-primary').forEach(btn => {
            btn.addEventListener('click', () => {
                this.open('family');
            });
        });

        // Specialist booking buttons
        document.querySelectorAll('.specialist-btn-primary:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => {
                this.open('specialist');
            });
        });
    }

    open(type = '', specialistInfo = null) {
        this.popup.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Pre-select request type if provided
        if (type) {
            const select = document.getElementById('requestType');
            if (select) {
                select.value = type;
            }
        }

        // If specialist info is provided, populate the comment field
        if (specialistInfo && specialistInfo.name) {
            const messageField = document.getElementById('message');
            if (messageField) {
                const currentMessage = messageField.value || '';
                const specialistComment = `Запись к специалисту: ${specialistInfo.name}${specialistInfo.role ? ' (' + specialistInfo.role + ')' : ''}`;

                // If there's already a message, append to it, otherwise just set the specialist info
                if (currentMessage.trim()) {
                    messageField.value = currentMessage + '\n' + specialistComment;
                } else {
                    messageField.value = specialistComment;
                }
            }
        }
    }

    close() {
        this.popup.classList.remove('active');
        document.body.style.overflow = '';
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Check if privacy checkboxes exist and are required
        const privacyPolicyCheckbox = document.getElementById('privacyPolicy');
        const personalDataPolicyCheckbox = document.getElementById('personalDataPolicy');

        // Validate checkboxes if they exist in the form (checking the common IDs used)
        if (privacyPolicyCheckbox && !privacyPolicyCheckbox.checked) {
            alert('Пожалуйста, подтвердите согласие с политикой конфиденциальности');
            return;
        }

        if (personalDataPolicyCheckbox && !personalDataPolicyCheckbox.checked) {
            alert('Пожалуйста, подтвердите согласие с политикой обработки персональных данных');
            return;
        }

        // Also check for other possible checkbox names in different contexts
        const orderPrivacyCheckbox = document.querySelector('input[type="checkbox"].order-checkbox[id$="Privacy"]');
        const orderConsentCheckbox = document.querySelector('input[type="checkbox"].order-checkbox[id$="Consent"]');

        if (orderPrivacyCheckbox && !orderPrivacyCheckbox.checked) {
            alert('Пожалуйста, подтвердите согласие с политикой конфиденциальности');
            return;
        }

        if (orderConsentCheckbox && !orderConsentCheckbox.checked) {
            alert('Пожалуйста, подтвердите согласие с политикой обработки персональных данных');
            return;
        }

        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        try {
            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Отправка...</span>';

            const formData = new FormData(this.form);
            const data = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                request_type: formData.get('requestType'),
                message: formData.get('message')
            };

            // Send to backend
            const API_URL = window.location.hostname === 'localhost'
                ? 'http://localhost:3001/api'
                : '/api';

            const response = await fetch(`${API_URL}/requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                // Show success message
                alert('✅ Спасибо за заявку! Мы свяжемся с вами в ближайшее время.');

                // Reset form and close popup
                this.form.reset();
                this.close();
            } else {
                throw new Error(result.message || 'Ошибка при отправке заявки');
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            alert('❌ Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.');
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.consultationPopup = new ConsultationPopup();
});

// Global function for header button and other pages
window.openConsultationPopup = function(type = 'consultation', specialistInfo = null) {
    if (window.consultationPopup && typeof window.consultationPopup.open === 'function') {
        window.consultationPopup.open(type, specialistInfo);
    }
};
