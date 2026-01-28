// ========================================
// UTILITY FUNCTIONS
// ========================================

// Format number with locale
function formatNumber(num) {
    return num.toLocaleString('es-ES');
}

// Format date
function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return dateStr;
    }
}

// Show toast notification
function showToast(title, message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success'
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <p class="toast-title">${title}</p>
            <p class="toast-message">${message}</p>
        </div>
    `;

    container.appendChild(toast);

    // Remove toast after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Toggle mobile menu
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');

    if (btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('open');

            // Update icon
            const isOpen = menu.classList.contains('open');
            btn.innerHTML = isOpen
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
        });
    }
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('open');
        document.body.style.overflow = '';
    }
});

// Escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(modal => {
            modal.classList.remove('open');
        });
        document.body.style.overflow = '';
    }
});

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Calculate winner from scores
function calculateWinner(match) {
    let p1Sets = 0;
    let p2Sets = 0;

    if (match.score_p1_set1 !== null && match.score_p2_set1 !== null) {
        if (match.score_p1_set1 > match.score_p2_set1) p1Sets++;
        else if (match.score_p2_set1 > match.score_p1_set1) p2Sets++;
    }
    if (match.score_p1_set2 !== null && match.score_p2_set2 !== null) {
        if (match.score_p1_set2 > match.score_p2_set2) p1Sets++;
        else if (match.score_p2_set2 > match.score_p1_set2) p2Sets++;
    }
    if (match.score_p1_set3 !== null && match.score_p2_set3 !== null) {
        if (match.score_p1_set3 > match.score_p2_set3) p1Sets++;
        else if (match.score_p2_set3 > match.score_p1_set3) p2Sets++;
    }

    if (p1Sets >= 2) return match.player1_id;
    if (p2Sets >= 2) return match.player2_id;
    return null;
}

// Format match score
function formatMatchScore(match) {
    const sets = [];

    if (match.score_p1_set1 !== null && match.score_p2_set1 !== null) {
        sets.push(`${match.score_p1_set1}-${match.score_p2_set1}`);
    }
    if (match.score_p1_set2 !== null && match.score_p2_set2 !== null) {
        sets.push(`${match.score_p1_set2}-${match.score_p2_set2}`);
    }
    if (match.score_p1_set3 !== null && match.score_p2_set3 !== null) {
        sets.push(`${match.score_p1_set3}-${match.score_p2_set3}`);
    }

    return sets.length > 0 ? sets.join(' / ') : 'Sin resultado';
}

// Get rank class based on position
function getRankClass(rank) {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-default';
}

// Initialize common functionality
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
});
