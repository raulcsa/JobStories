/**
 * Job Stories - Core Application Engine (MVP Demo)
 */

// --- STATE MANAGEMENT ---
const AppState = {
    currentUser: null,
    stories: [],
    auditLogs: [],
    activeTags: [], // currently typed/selected tags in the form
    activeFilter: 'all', // current timeline skill filter
    searchQuery: '',
    currentView: 'editor', // 'editor' or 'recruiter'
    editingStoryId: null
};

// --- DEFAULT MOCK DATA ---
const MOCK_DEVELOPER_SESSION = {
    github: {
        name: "Raúl C.S.",
        handle: "raulcsa",
        avatar: "https://avatars.githubusercontent.com/u/1234567?v=4",
        provider: "GitHub"
    },
    google: {
        name: "Raúl C.S. (Google)",
        handle: "raul.csa.edu",
        avatar: "https://lh3.googleusercontent.com/a/default-user=s96-c",
        provider: "Google"
    }
};

const SUGGESTED_MOCK_ENTRIES = [
    {
        id: "st-101",
        title: "Problema de concurrencia en WebSocket con múltiples clientes",
        project: "JobStories Realtime",
        tried: "Intenté usar una variable global en memoria para almacenar las conexiones websocket de cada usuario y despachar eventos.",
        failed: "Al escalar a múltiples contenedores Docker en el pipeline, las variables de memoria no estaban sincronizadas y los mensajes fallaban en entregarse al 50% de los clientes de forma intermitente.",
        learned: "La persistencia local en memoria destruye el escalado horizontal. Migré la gestión de conexiones y mensajes a un bus Redis Pub/Sub en el backend.",
        tags: ["Node.js", "Docker", "Redis", "WebSockets"],
        visibility: "public",
        createdAt: "2026-05-18T10:30:00.000Z",
        editCount: 0,
        currentHash: "6c2e39ea2f10b7ea1310bdc179831ef78ad996b5a371c676bbfe2a4d3a010d8a"
    },
    {
        id: "st-102",
        title: "Refactorización de Pipeline CI/CD con Matriz Paralela",
        project: "GitHub Actions Lab",
        tried: "Crear una matriz de ejecución para probar múltiples versiones de Node.js (16, 18, 20) en paralelo.",
        failed: "Se agotaron los minutos gratuitos de mi cuenta en minutos debido a descargas redundantes de `node_modules` en cada Job independiente.",
        learned: "Implementé la acción oficial `actions/cache` en mi pipeline de GitHub Actions para compartir las dependencias de NPM compiladas entre los nodos paralelos, reduciendo el tiempo de ejecución en un 65%.",
        tags: ["GitHub Actions", "NPM", "Node.js"],
        visibility: "public",
        createdAt: "2026-05-19T14:15:00.000Z",
        editCount: 0,
        currentHash: "1f8f7c9e0d1e2e3f4a5b6c7d8e9f0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r"
    },
    {
        id: "st-103",
        title: "Deadlocks en base de datos PostgreSQL durante cargas masivas",
        project: "E-Commerce Backend",
        tried: "Realizar múltiples updates concurrentes en la tabla de Inventario dentro de un loop asíncrono en Node sin control transaccional explícito.",
        failed: "PostgreSQL bloqueó las transacciones lanzando errores de Deadlock Detectado, interrumpiendo el flujo de checkout de los compradores.",
        learned: "Comprendí la importancia del orden estricto de lockeo. Reestructuré las consultas para ordenar siempre los IDs antes de hacer updates y utilicé sentencias `SELECT FOR UPDATE` controladas.",
        tags: ["PostgreSQL", "Node.js", "SQL"],
        visibility: "public",
        createdAt: "2026-05-20T02:00:00.000Z",
        editCount: 1, // Simulates an update occurred
        currentHash: "3d9c7a2b9f314d65e9c0b1a2d3e4f5a6c7d8e9f0b1a2c3d4e5f6a7b8c9d0e1f2"
    }
];

const SUGGESTED_MOCK_AUDITS = [
    {
        timestamp: "2026-05-18T10:32:00.000Z",
        action: "CREATE",
        details: "Entrada registrada: 'Problema de concurrencia en WebSocket con múltiples clientes'",
        hash: "6c2e39ea2f10b7ea1310bdc179831ef78ad996b5a371c676bbfe2a4d3a010d8a"
    },
    {
        timestamp: "2026-05-19T14:16:10.000Z",
        action: "CREATE",
        details: "Entrada registrada: 'Refactorización de Pipeline CI/CD con Matriz Paralela'",
        hash: "1f8f7c9e0d1e2e3f4a5b6c7d8e9f0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r"
    },
    {
        timestamp: "2026-05-20T01:55:00.000Z",
        action: "CREATE",
        details: "Entrada registrada: 'Deadlocks en base de datos PostgreSQL durante cargas masivas'",
        hash: "ea2819cd7e83bc2d6f9a0c1e2b3f4a5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b"
    },
    {
        timestamp: "2026-05-20T02:05:30.000Z",
        action: "UPDATE",
        details: "Entrada actualizada: 'Deadlocks en base de datos PostgreSQL durante cargas masivas' (Revisión #2)",
        hash: "3d9c7a2b9f314d65e9c0b1a2d3e4f5a6c7d8e9f0b1a2c3d4e5f6a7b8c9d0e1f2"
    }
];

// --- HELPER FUNCTIONS ---
function generateShortHash() {
    return Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join('');
}

function generateSHA256Simulated(title, tried, failed, learned) {
    // Basic hash generation for UI visual credibility
    const val = title + tried + failed + learned;
    let hash = 0;
    for (let i = 0; i < val.length; i++) {
        const char = val.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0') + generateShortHash() + generateShortHash() + generateShortHash();
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = toast.querySelector('.toast-icon');
    
    toastMessage.textContent = message;
    if (type === 'success') {
        toast.style.borderColor = 'var(--accent-green)';
        toastIcon.className = 'fa-solid fa-circle-check toast-icon text-green';
    } else {
        toast.style.borderColor = 'var(--accent-red)';
        toastIcon.className = 'fa-solid fa-triangle-exclamation toast-icon text-red';
    }
    
    toast.classList.add('active');
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// --- LOCAL STORAGE / DATABASE ENGINE ---
const Database = {
    save() {
        localStorage.setItem('jobstories_user', JSON.stringify(AppState.currentUser));
        localStorage.setItem('jobstories_data', JSON.stringify(AppState.stories));
        localStorage.setItem('jobstories_audits', JSON.stringify(AppState.auditLogs));
    },
    load() {
        const user = localStorage.getItem('jobstories_user');
        const data = localStorage.getItem('jobstories_data');
        const audits = localStorage.getItem('jobstories_audits');
        
        if (user) AppState.currentUser = JSON.parse(user);
        if (data) AppState.stories = JSON.parse(data);
        if (audits) AppState.auditLogs = JSON.parse(audits);
    },
    clear() {
        localStorage.removeItem('jobstories_user');
        localStorage.removeItem('jobstories_data');
        localStorage.removeItem('jobstories_audits');
        AppState.currentUser = null;
        AppState.stories = [];
        AppState.auditLogs = [];
    }
};

// --- CORE UI CONTROLLER ---
const UI = {
    init() {
        this.cacheDom();
        this.bindEvents();
        Database.load();
        
        if (AppState.currentUser) {
            this.showScreen('dashboard-screen');
            this.renderDashboard();
        } else {
            this.showScreen('auth-screen');
        }
    },

    cacheDom() {
        this.screens = document.querySelectorAll('.screen');
        this.btnSsoGithub = document.getElementById('btn-sso-github');
        this.btnSsoGoogle = document.getElementById('btn-sso-google');
        this.ssoModal = document.getElementById('sso-modal');
        this.ssoIcon = document.getElementById('sso-icon');
        this.authProviderNode = document.getElementById('auth-provider-node');
        this.btnSsoCancel = document.getElementById('btn-sso-cancel');
        this.btnSsoApprove = document.getElementById('btn-sso-approve');
        
        this.userAvatar = document.getElementById('user-avatar');
        this.userDisplayName = document.getElementById('user-display-name');
        this.userHandle = document.getElementById('user-handle');
        this.btnLogout = document.getElementById('btn-logout');
        
        this.toggleEditor = document.getElementById('toggle-editor');
        this.toggleRecruiter = document.getElementById('toggle-recruiter');
        this.recruiterBanners = document.querySelectorAll('.recruiter-only');
        this.editorBanners = document.querySelectorAll('.editor-only');
        this.sidebarPanel = document.querySelector('.sidebar-panel');
        this.auditPanel = document.querySelector('.audit-ledger-panel');
        this.recruiterTargetName = document.querySelector('.recruiter-target-name');
        
        this.storyForm = document.getElementById('story-form');
        this.tagInput = document.getElementById('tag-input');
        this.tagsList = document.getElementById('tags-list');
        this.suggestedTagBtns = document.querySelectorAll('.btn-suggest');
        
        this.timelineSearch = document.getElementById('timeline-search');
        this.skillsFilterContainer = document.getElementById('skills-filter-container');
        this.timelineElementsList = document.getElementById('timeline-elements-list');
        this.timelineEmptyState = document.getElementById('timeline-empty-state');
        this.btnLoadMock = document.getElementById('btn-load-mock');
        
        this.auditLogList = document.getElementById('audit-log-list');
        
        // Edit Modal elements
        this.editModal = document.getElementById('edit-modal');
        this.editForm = document.getElementById('edit-story-form');
        this.btnCancelEdit = document.getElementById('btn-cancel-edit');
        this.btnCloseEdit = document.getElementById('btn-close-edit');
        
        // Counter labels
        this.statTotalEntries = document.getElementById('stat-total-entries');
        this.statTotalSkills = document.getElementById('stat-total-skills');
        this.statAuditCount = document.getElementById('stat-audit-count');
        
        this.btnExportPdf = document.getElementById('btn-export-pdf');
    },

    bindEvents() {
        // SSO triggers
        this.btnSsoGithub.addEventListener('click', () => this.openSSOPopup('github'));
        this.btnSsoGoogle.addEventListener('click', () => this.openSSOPopup('google'));
        this.btnSsoCancel.addEventListener('click', () => this.closeModal(this.ssoModal));
        this.btnSsoApprove.addEventListener('click', () => this.processSSOLogin());
        
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal-overlay'));
            });
        });
        
        // Logout
        this.btnLogout.addEventListener('click', () => this.logout());
        
        // Navigation View Toggle
        this.toggleEditor.addEventListener('click', () => this.changeView('editor'));
        this.toggleRecruiter.addEventListener('click', () => this.changeView('recruiter'));
        
        // Skills suggestions
        this.suggestedTagBtns.forEach(btn => {
            btn.addEventListener('click', () => this.addTag(btn.textContent.trim()));
        });
        
        // Tagging Input
        this.tagInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const tag = this.tagInput.value.trim().replace(/,/g, '');
                if (tag) this.addTag(tag);
            }
        });
        
        // Form submission
        this.storyForm.addEventListener('submit', (e) => this.handleNewStory(e));
        
        // Mock Loader
        this.btnLoadMock.addEventListener('click', () => this.loadMockData());
        
        // Search & Filter
        this.timelineSearch.addEventListener('input', (e) => {
            AppState.searchQuery = e.target.value.toLowerCase();
            this.renderTimeline();
        });
        
        // Edit Form Submit
        this.editForm.addEventListener('submit', (e) => this.handleSaveEdit(e));
        this.btnCancelEdit.addEventListener('click', () => this.closeModal(this.editModal));
        this.btnCloseEdit.addEventListener('click', () => this.closeModal(this.editModal));
        
        // Export to PDF
        this.btnExportPdf.addEventListener('click', () => {
            showToast("Generando reporte PDF...");
            setTimeout(() => {
                window.print();
            }, 500);
        });
    },

    showScreen(screenId) {
        this.screens.forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    },

    // --- SSO AUTH SIMULATION ---
    openSSOPopup(provider) {
        this.ssoModal.classList.add('active');
        this.ssoModal.dataset.provider = provider;
        
        if (provider === 'github') {
            this.ssoIcon.className = 'fa-brands fa-github';
            this.authProviderNode.className = 'auth-node provider-node text-white';
            this.authProviderNode.innerHTML = '<i class="fa-brands fa-github"></i>';
        } else {
            this.ssoIcon.className = 'fa-brands fa-google';
            this.authProviderNode.className = 'auth-node provider-node text-red';
            this.authProviderNode.innerHTML = '<i class="fa-brands fa-google"></i>';
        }
    },

    closeModal(modalElement) {
        if (modalElement) modalElement.classList.remove('active');
    },

    processSSOLogin() {
        const provider = this.ssoModal.dataset.provider;
        const approveBtn = this.btnSsoApprove;
        approveBtn.disabled = true;
        approveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Conectando...';
        
        // Simulates connection dot visual flow
        const dot = document.querySelector('.connector-dot');
        dot.style.animationDuration = '0.5s';
        
        setTimeout(() => {
            // Login successful
            AppState.currentUser = MOCK_DEVELOPER_SESSION[provider];
            
            // Add session audit log
            this.addAuditLog('SSO_LOGIN', `Usuario @${AppState.currentUser.handle} autenticado vía ${AppState.currentUser.provider}`);
            
            // Save state
            Database.save();
            
            // UI Switch
            approveBtn.disabled = false;
            approveBtn.innerHTML = 'Autorizar e Iniciar Sesión';
            dot.style.animationDuration = '1.5s';
            this.closeModal(this.ssoModal);
            
            showToast(`¡Bienvenido, ${AppState.currentUser.name}!`);
            this.showScreen('dashboard-screen');
            this.renderDashboard();
        }, 1500);
    },

    logout() {
        if(confirm("¿Seguro que deseas salir? Tus datos guardados permanecerán en tu navegador.")) {
            Database.clear();
            this.showScreen('auth-screen');
            showToast("Sesión cerrada con éxito");
        }
    },

    // --- VIEW TOGGLE ENGINE ---
    changeView(view) {
        AppState.currentView = view;
        
        if (view === 'editor') {
            this.toggleEditor.classList.add('active');
            this.toggleRecruiter.classList.remove('active');
            
            this.editorBanners.forEach(b => b.classList.remove('hidden'));
            this.recruiterBanners.forEach(b => b.classList.add('hidden'));
            
            this.sidebarPanel.style.display = 'flex';
            if (window.innerWidth > 1024) {
                this.auditPanel.style.display = 'block';
            }
        } else {
            this.toggleEditor.classList.remove('active');
            this.toggleRecruiter.classList.add('active');
            
            this.editorBanners.forEach(b => b.classList.add('hidden'));
            this.recruiterBanners.forEach(b => b.classList.remove('hidden'));
            
            this.sidebarPanel.style.display = 'none';
            this.auditPanel.style.display = 'none';
            
            this.recruiterTargetName.textContent = `@${AppState.currentUser.handle}`;
        }
        
        this.renderTimeline();
    },

    // --- FORM DYNAMIC TAGS ---
    addTag(tagText) {
        tagText = tagText.trim();
        if (!tagText) return;
        
        // Prevent duplicates
        if (AppState.activeTags.includes(tagText)) {
            this.tagInput.value = '';
            return;
        }
        
        AppState.activeTags.push(tagText);
        this.tagInput.value = '';
        this.renderFormTags();
    },

    removeTag(index) {
        AppState.activeTags.splice(index, 1);
        this.renderFormTags();
    },

    renderFormTags() {
        this.tagsList.innerHTML = '';
        AppState.activeTags.forEach((tag, idx) => {
            const pill = document.createElement('span');
            pill.className = 'tag-pill';
            pill.innerHTML = `${tag} <button type="button" onclick="UI.removeTag(${idx})">&times;</button>`;
            this.tagsList.appendChild(pill);
        });
    },

    // --- HANDLE CORE EVENTS (CRUD & AUDIT) ---
    handleNewStory(e) {
        e.preventDefault();
        
        const title = document.getElementById('story-title').value.trim();
        const tried = document.getElementById('story-tried').value.trim();
        const failed = document.getElementById('story-failed').value.trim();
        const learned = document.getElementById('story-learned').value.trim();
        const visibility = document.getElementById('story-visibility').value;
        const project = document.getElementById('story-project').value.trim() || 'General';
        
        if (!title || !tried || !failed || !learned) {
            showToast("Por favor rellena todos los campos obligatorios.", "error");
            return;
        }
        
        if (AppState.activeTags.length === 0) {
            showToast("Añade al menos una habilidad o tecnología.", "error");
            return;
        }
        
        // Generate simulated hash and unique id
        const id = 'st-' + Date.now();
        const hash = generateSHA256Simulated(title, tried, failed, learned);
        
        const newStory = {
            id,
            title,
            project,
            tried,
            failed,
            learned,
            tags: [...AppState.activeTags],
            visibility,
            createdAt: new Date().toISOString(),
            editCount: 0,
            currentHash: hash
        };
        
        // Write to AppState & Database
        AppState.stories.unshift(newStory);
        
        // Add cryptographically simulated audit log
        this.addAuditLog('CREATE', `Registrada entrada: '${title}'`, hash);
        
        Database.save();
        
        // Reset state & elements
        this.storyForm.reset();
        AppState.activeTags = [];
        this.renderFormTags();
        
        showToast("¡Job Story registrada con éxito!");
        this.renderDashboard();
    },

    editStory(id) {
        const story = AppState.stories.find(s => s.id === id);
        if (!story) return;
        
        AppState.editingStoryId = id;
        
        document.getElementById('edit-story-id').value = story.id;
        document.getElementById('edit-story-title').value = story.title;
        document.getElementById('edit-story-project').value = story.project;
        document.getElementById('edit-story-tried').value = story.tried;
        document.getElementById('edit-story-failed').value = story.failed;
        document.getElementById('edit-story-learned').value = story.learned;
        document.getElementById('edit-story-visibility').value = story.visibility;
        
        this.editModal.classList.add('active');
    },

    handleSaveEdit(e) {
        e.preventDefault();
        
        const id = document.getElementById('edit-story-id').value;
        const title = document.getElementById('edit-story-title').value.trim();
        const tried = document.getElementById('edit-story-tried').value.trim();
        const failed = document.getElementById('edit-story-failed').value.trim();
        const learned = document.getElementById('edit-story-learned').value.trim();
        const visibility = document.getElementById('edit-story-visibility').value;
        const project = document.getElementById('edit-story-project').value.trim() || 'General';
        
        const idx = AppState.stories.findIndex(s => s.id === id);
        if (idx === -1) return;
        
        // Generate new hash indicating modification
        const hash = generateSHA256Simulated(title, tried, failed, learned);
        
        AppState.stories[idx] = {
            ...AppState.stories[idx],
            title,
            project,
            tried,
            failed,
            learned,
            visibility,
            editCount: AppState.stories[idx].editCount + 1,
            currentHash: hash
        };
        
        this.addAuditLog('UPDATE', `Entrada modificada: '${title}' (Revisión #${AppState.stories[idx].editCount + 1})`, hash);
        Database.save();
        
        this.closeModal(this.editModal);
        showToast("Entrada actualizada correctamente.");
        this.renderDashboard();
    },

    deleteStory(id) {
        const story = AppState.stories.find(s => s.id === id);
        if (!story) return;
        
        if (confirm(`¿Estás seguro de que deseas eliminar la entrada '${story.title}'? Esta acción dejará un registro permanente en la auditoría.`)) {
            // Delete record
            AppState.stories = AppState.stories.filter(s => s.id !== id);
            
            // Add deletion audit log
            this.addAuditLog('DELETE', `Entrada eliminada: '${story.title}'`, generateShortHash());
            Database.save();
            
            showToast("Entrada eliminada de la línea de tiempo.");
            this.renderDashboard();
        }
    },

    addAuditLog(action, details, hash = '') {
        const log = {
            timestamp: new Date().toISOString(),
            action,
            details,
            hash: hash || generateShortHash() + generateShortHash()
        };
        AppState.auditLogs.unshift(log);
    },

    // --- MOCK SEED LOADER ---
    loadMockData() {
        AppState.stories = [...SUGGESTED_MOCK_ENTRIES];
        AppState.auditLogs = [...SUGGESTED_MOCK_AUDITS];
        this.addAuditLog('SEED', "Base de datos inicializada con datos de ejemplo");
        Database.save();
        
        showToast("Datos de ejemplo cargados con éxito");
        this.renderDashboard();
    },

    // --- RENDER METHODS ---
    renderDashboard() {
        // Update profile header
        this.userAvatar.src = AppState.currentUser.avatar;
        this.userDisplayName.textContent = AppState.currentUser.name;
        this.userHandle.textContent = `@${AppState.currentUser.handle}`;
        
        // Render panels
        this.renderFilters();
        this.renderTimeline();
        this.renderAuditLedger();
        this.updateStats();
    },

    updateStats() {
        // Core metrics
        this.statTotalEntries.textContent = AppState.stories.length;
        
        // Extract unique skills
        const skills = new Set();
        AppState.stories.forEach(s => s.tags.forEach(t => skills.add(t)));
        this.statTotalSkills.textContent = skills.size;
        
        // Audit logs
        this.statAuditCount.textContent = AppState.auditLogs.length;
    },

    renderFilters() {
        // Collect all skills
        const skills = new Set();
        AppState.stories.forEach(s => s.tags.forEach(t => skills.add(t)));
        
        // Save current active filter state
        const currentFilter = AppState.activeFilter;
        
        this.skillsFilterContainer.innerHTML = '';
        
        // "All" filter
        const allChip = document.createElement('span');
        allChip.className = `filter-chip ${currentFilter === 'all' ? 'active' : ''}`;
        allChip.textContent = 'Todas';
        allChip.dataset.skill = 'all';
        allChip.addEventListener('click', () => this.applyFilter('all'));
        this.skillsFilterContainer.appendChild(allChip);
        
        // Skill specific filters
        skills.forEach(skill => {
            const chip = document.createElement('span');
            chip.className = `filter-chip ${currentFilter === skill ? 'active' : ''}`;
            chip.textContent = skill;
            chip.dataset.skill = skill;
            chip.addEventListener('click', () => this.applyFilter(skill));
            this.skillsFilterContainer.appendChild(chip);
        });
    },

    applyFilter(skill) {
        AppState.activeFilter = skill;
        document.querySelectorAll('.filter-chip').forEach(c => {
            if (c.dataset.skill === skill) c.classList.add('active');
            else c.classList.remove('active');
        });
        this.renderTimeline();
    },

    renderTimeline() {
        this.timelineElementsList.innerHTML = '';
        
        // Filter stories based on Search & Active Skill filter
        let filtered = AppState.stories.filter(story => {
            // Search query filter
            const matchesSearch = story.title.toLowerCase().includes(AppState.searchQuery) ||
                                  story.tried.toLowerCase().includes(AppState.searchQuery) ||
                                  story.failed.toLowerCase().includes(AppState.searchQuery) ||
                                  story.learned.toLowerCase().includes(AppState.searchQuery) ||
                                  story.project.toLowerCase().includes(AppState.searchQuery);
                                  
            // Skill filter
            const matchesSkill = AppState.activeFilter === 'all' || story.tags.includes(AppState.activeFilter);
            
            // Recruiter view filter: omit private entries
            const matchesVisibility = AppState.currentView === 'editor' || story.visibility !== 'private';
            
            return matchesSearch && matchesSkill && matchesVisibility;
        });
        
        // Empty state visibility toggle
        if (filtered.length === 0) {
            this.timelineEmptyState.classList.remove('hidden');
            this.timelineElementsList.classList.add('hidden');
            return;
        } else {
            this.timelineEmptyState.classList.add('hidden');
            this.timelineElementsList.classList.remove('hidden');
        }
        
        // Generate nodes
        filtered.forEach(story => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            // Icon selection based on tags
            let nodeIcon = 'fa-solid fa-code';
            if (story.tags.includes('GitHub Actions') || story.tags.includes('CI/CD')) nodeIcon = 'fa-brands fa-github-alt';
            else if (story.tags.includes('PostgreSQL') || story.tags.includes('Redis') || story.tags.includes('SQL')) nodeIcon = 'fa-solid fa-database';
            else if (story.tags.includes('React') || story.tags.includes('Vue')) nodeIcon = 'fa-brands fa-react';
            
            // Visibilities text
            const visLabels = {
                public: '<span class="vis-badge public"><i class="fa-solid fa-earth-americas"></i> Público</span>',
                private: '<span class="vis-badge private"><i class="fa-solid fa-lock"></i> Privado</span>',
                link: '<span class="vis-badge link"><i class="fa-solid fa-link"></i> Enlace</span>'
            };
            
            // Credibility Audit Badge render
            const auditBadge = story.editCount === 0 
                ? `<span class="credibility-audit-badge unmodified"><i class="fa-solid fa-shield"></i> Creado (Verificado)</span>`
                : `<span class="credibility-audit-badge modified"><i class="fa-solid fa-clock-rotate-left"></i> Editado ${story.editCount} veces</span>`;
            
            // Action buttons visible only to Editor/User
            const actionsHTML = AppState.currentView === 'editor' ? `
                <div class="story-actions">
                    <button class="btn-action edit" onclick="UI.editStory('${story.id}')"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn-action delete" onclick="UI.deleteStory('${story.id}')"><i class="fa-solid fa-trash"></i> Eliminar</button>
                </div>
            ` : '';
            
            // Build tags markup
            const tagsHTML = story.tags.map(t => `<span class="sim-tag" style="cursor:pointer;" onclick="UI.applyFilter('${t}')">${t}</span>`).join('');
            
            item.innerHTML = `
                <div class="timeline-node-badge">
                    <i class="${nodeIcon}"></i>
                </div>
                <div class="timeline-card">
                    <div class="timeline-card-header">
                        <div class="timeline-title-area">
                            <span class="project-tag">${story.project}</span>
                            <h3>${story.title}</h3>
                            <div class="timeline-meta">
                                <span class="meta-date"><i class="fa-regular fa-calendar-days"></i> ${formatDate(story.createdAt)}</span>
                                ${AppState.currentView === 'editor' ? visLabels[story.visibility] : ''}
                                ${auditBadge}
                            </div>
                        </div>
                    </div>
                    
                    <div class="narrative-grid">
                        <div class="narrative-block tried">
                            <p><strong>Intenté solucionar</strong> ${story.tried}</p>
                        </div>
                        <div class="narrative-block failed">
                            <p><strong>Qué falló / Qué pasó</strong> ${story.failed}</p>
                        </div>
                        <div class="narrative-block learned">
                            <p><strong>Lección / Qué aprendí</strong> ${story.learned}</p>
                        </div>
                    </div>
                    
                    <div class="sim-tags">
                        ${tagsHTML}
                    </div>
                    
                    ${actionsHTML}
                </div>
            `;
            
            this.timelineElementsList.appendChild(item);
        });
    },

    renderAuditLedger() {
        this.auditLogList.innerHTML = '';
        
        // Take top 10 logs
        const recentLogs = AppState.auditLogs.slice(0, 15);
        
        recentLogs.forEach(log => {
            const li = document.createElement('li');
            li.className = 'audit-log-item';
            
            let dotClass = '';
            if (log.action === 'UPDATE') dotClass = 'modify';
            else if (log.action === 'DELETE') dotClass = 'delete';
            
            li.innerHTML = `
                <div class="audit-log-dot ${dotClass}"></div>
                <span class="audit-log-time">${formatDate(log.timestamp)}</span>
                <span class="audit-log-action">
                    [<strong>${log.action}</strong>] ${log.details}
                </span>
                <br>
                <span class="audit-log-hash">Hash: SHA-256(${log.hash.slice(0, 8)}...)</span>
            `;
            this.auditLogList.appendChild(li);
        });
    }
};

// Global exports so inline onclick event handlers in HTML can invoke them
window.UI = UI;

// Bootstrap Application
document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});
