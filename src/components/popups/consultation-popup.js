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

        // Hide the request type dropdown if the type is 'supervision'
        const requestTypeGroup = document.querySelector('#requestType').closest('.form-group');
        if (type === 'supervision') {
            if (requestTypeGroup) {
                requestTypeGroup.style.display = 'none';
            }
        } else {
            // Show the request type dropdown for other types
            if (requestTypeGroup) {
                requestTypeGroup.style.display = 'block';
            }
            // Pre-select request type if provided (not supervision)
            if (type) {
                const select = document.getElementById('requestType');
                if (select) {
                    select.value = type;
                }
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

        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        try {
            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Отправка...</span>';

            const formData = new FormData(this.form);

            // Get the request type from the dropdown or set to 'supervision' if it's hidden
            let requestTypeValue = formData.get('requestType');
            const requestTypeElement = document.getElementById('requestType');
            const requestTypeGroup = requestTypeElement.closest('.form-group');

            // Check if the request type group is hidden (which means it's a supervision form)
            if (requestTypeGroup && requestTypeGroup.style.display === 'none') {
                requestTypeValue = 'supervision';
            } else if (!requestTypeValue) {
                // If empty and not hidden, use default or throw an error
                if (requestTypeElement.required) {
                    alert('Пожалуйста, выберите тип заявки');
                    return;
                }
            }

            const data = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                request_type: requestTypeValue,
                message: formData.get('message')
            };

            const response = await fetch(API_CONFIG.getApiUrl('requests'), {
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
