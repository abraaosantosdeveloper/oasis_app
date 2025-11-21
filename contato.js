/* ============================================
   OASIS Contact Page - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initContactForm();
});

/* ============================================
   Mobile Menu Toggle
   ============================================ */
function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        menu.classList.toggle('active');
        const icon = toggle.querySelector('i');
        icon.classList.toggle('bx-menu');
        icon.classList.toggle('bx-x');
    });

    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) {
            menu.classList.remove('active');
            const icon = toggle.querySelector('i');
            icon.classList.add('bx-menu');
            icon.classList.remove('bx-x');
        }
    });
}

/* ============================================
   Contact Form - Formspree Integration
   ============================================ */
function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formSuccess = document.getElementById('formSuccess');
    const newMessageBtn = document.getElementById('newMessageBtn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate form
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Set loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Collect form data
        const formData = new FormData(form);

        try {
            // Send to Formspree
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Success - show success message
                form.style.display = 'none';
                formSuccess.classList.add('show');
                form.reset();
            } else {
                // Error from Formspree
                const data = await response.json();
                if (data.errors) {
                    const errorMsg = data.errors.map(err => err.message).join(', ');
                    showAlert('Erro: ' + errorMsg, 'error');
                } else {
                    showAlert('Ocorreu um erro. Tente novamente.', 'error');
                }
            }
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            showAlert('Erro de conexão. Verifique sua internet e tente novamente.', 'error');
        } finally {
            // Remove loading state
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });

    // New message button
    if (newMessageBtn) {
        newMessageBtn.addEventListener('click', () => {
            formSuccess.classList.remove('show');
            form.style.display = 'block';
        });
    }
}

/* ============================================
   Alert Helper
   ============================================ */
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlert = document.querySelector('.form-alert');
    if (existingAlert) existingAlert.remove();

    // Create alert element
    const alert = document.createElement('div');
    alert.className = `form-alert form-alert-${type}`;
    alert.innerHTML = `
        <i class='bx ${type === 'error' ? 'bx-error-circle' : 'bx-info-circle'}'></i>
        <span>${message}</span>
        <button type="button" class="alert-close" aria-label="Fechar">
            <i class='bx bx-x'></i>
        </button>
    `;

    // Add styles dynamically (if not already in CSS)
    alert.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        margin-bottom: 20px;
        border-radius: 10px;
        font-size: 0.9375rem;
        animation: fadeIn 0.3s ease;
        background: ${type === 'error' ? '#FEE2E2' : '#E0F7F4'};
        color: ${type === 'error' ? '#DC2626' : '#00796B'};
        border: 1px solid ${type === 'error' ? '#FECACA' : '#A7F3D0'};
    `;

    // Insert before form
    const form = document.getElementById('contactForm');
    form.parentNode.insertBefore(alert, form);

    // Close button functionality
    const closeBtn = alert.querySelector('.alert-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        margin-left: auto;
        color: inherit;
        opacity: 0.7;
        transition: opacity 0.3s;
    `;
    closeBtn.addEventListener('click', () => alert.remove());

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-10px)';
            alert.style.transition = 'all 0.3s ease';
            setTimeout(() => alert.remove(), 300);
        }
    }, 5000);
}