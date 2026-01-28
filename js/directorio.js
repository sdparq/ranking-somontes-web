// ========================================
// DIRECTORIO PAGE
// ========================================

let allPlayers = [];
let showContacts = false;
const DIRECTORY_PASSWORD = 'somontesrank';

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadPlayers();
    initSearch();
    initContactsButton();
});

// Load players
async function loadPlayers() {
    const container = document.getElementById('playersGrid');
    const countEl = document.getElementById('playerCount');

    try {
        // Check if contacts were previously unlocked in this session
        if (sessionStorage.getItem('contactsUnlocked') === 'true') {
            showContacts = true;
            allPlayers = await fetchPlayersWithContact();
            updateContactsButton();
        } else {
            allPlayers = await fetchPlayersPublic();
        }

        if (!allPlayers || allPlayers.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <p>No hay jugadores registrados</p>
                </div>
            `;
            countEl.textContent = '0 jugadores';
            return;
        }

        countEl.textContent = `${allPlayers.length} jugadores`;
        renderPlayers(allPlayers);

    } catch (error) {
        console.error('Error loading players:', error);
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <p>Error al cargar los jugadores</p>
            </div>
        `;
    }
}

// Render players
function renderPlayers(players) {
    const container = document.getElementById('playersGrid');

    if (!players || players.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <p>No se encontraron jugadores</p>
            </div>
        `;
        return;
    }

    container.innerHTML = players.map((player, index) => {
        const points = player.current_atp_points || 0;
        const rank = allPlayers.findIndex(p => p.id === player.id) + 1;

        let contactInfo = '';
        if (showContacts) {
            const email = player.email || '';
            const phone = player.phone || '';

            if (email || phone) {
                contactInfo = `
                    <div class="player-card-contact">
                        ${phone ? `
                            <a href="tel:${phone}" class="contact-link">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                </svg>
                                ${phone}
                            </a>
                        ` : ''}
                        ${email ? `
                            <a href="mailto:${email}" class="contact-link">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                    <polyline points="22,6 12,13 2,6"/>
                                </svg>
                                ${email}
                            </a>
                        ` : ''}
                    </div>
                `;
            }
        }

        return `
            <div class="player-card ${showContacts ? 'with-contact' : ''}" style="animation-delay: ${index * 0.03}s">
                <div class="player-card-avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                </div>
                <div class="player-card-info">
                    <p class="player-card-name">${player.name}</p>
                    <p class="player-card-points">${formatNumber(points)} puntos ATP</p>
                    <p class="player-card-status">Posicion #${rank}</p>
                    ${contactInfo}
                </div>
            </div>
        `;
    }).join('');
}

// Initialize search
function initSearch() {
    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const term = e.target.value.toLowerCase().trim();

            if (!term) {
                renderPlayers(allPlayers);
                document.getElementById('playerCount').textContent = `${allPlayers.length} jugadores`;
                return;
            }

            const filtered = allPlayers.filter(player =>
                player.name.toLowerCase().includes(term) ||
                (showContacts && player.email && player.email.toLowerCase().includes(term)) ||
                (showContacts && player.phone && player.phone.includes(term))
            );

            renderPlayers(filtered);
            document.getElementById('playerCount').textContent =
                filtered.length === 1 ? '1 jugador encontrado' : `${filtered.length} jugadores encontrados`;
        }, 300));
    }
}

// Initialize contacts button
function initContactsButton() {
    const btnShowContacts = document.getElementById('btnShowContacts');
    const passwordModal = document.getElementById('passwordModal');
    const closePasswordModal = document.getElementById('closePasswordModal');
    const cancelPassword = document.getElementById('cancelPassword');
    const submitPassword = document.getElementById('submitPassword');
    const passwordInput = document.getElementById('directoryPassword');
    const passwordError = document.getElementById('passwordError');

    if (btnShowContacts) {
        btnShowContacts.addEventListener('click', () => {
            if (showContacts) {
                // Already unlocked, toggle off
                showContacts = false;
                sessionStorage.removeItem('contactsUnlocked');
                updateContactsButton();
                loadPlayers();
            } else {
                // Show password modal
                passwordModal.classList.add('active');
                passwordInput.value = '';
                passwordError.style.display = 'none';
                passwordInput.focus();
            }
        });
    }

    // Close modal
    if (closePasswordModal) {
        closePasswordModal.addEventListener('click', () => {
            passwordModal.classList.remove('active');
        });
    }

    if (cancelPassword) {
        cancelPassword.addEventListener('click', () => {
            passwordModal.classList.remove('active');
        });
    }

    // Submit password
    if (submitPassword) {
        submitPassword.addEventListener('click', checkPassword);
    }

    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
    }

    // Close modal on outside click
    if (passwordModal) {
        passwordModal.addEventListener('click', (e) => {
            if (e.target === passwordModal) {
                passwordModal.classList.remove('active');
            }
        });
    }

    // Update button state on load
    updateContactsButton();
}

// Check password
async function checkPassword() {
    const passwordInput = document.getElementById('directoryPassword');
    const passwordError = document.getElementById('passwordError');
    const passwordModal = document.getElementById('passwordModal');

    const password = passwordInput.value.trim();

    if (password === DIRECTORY_PASSWORD) {
        showContacts = true;
        sessionStorage.setItem('contactsUnlocked', 'true');
        passwordModal.classList.remove('active');
        updateContactsButton();

        // Reload players with contact info
        try {
            allPlayers = await fetchPlayersWithContact();
            renderPlayers(allPlayers);
            showToast('Contactos desbloqueados', 'success');
        } catch (error) {
            console.error('Error loading contacts:', error);
            showToast('Error al cargar contactos', 'error');
        }
    } else {
        passwordError.style.display = 'block';
        passwordInput.classList.add('error');
        setTimeout(() => {
            passwordInput.classList.remove('error');
        }, 500);
    }
}

// Update contacts button state
function updateContactsButton() {
    const btnShowContacts = document.getElementById('btnShowContacts');

    if (btnShowContacts) {
        if (showContacts) {
            btnShowContacts.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Ocultar Contactos
            `;
            btnShowContacts.classList.add('active');
        } else {
            btnShowContacts.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Ver Contactos
            `;
            btnShowContacts.classList.remove('active');
        }
    }
}
