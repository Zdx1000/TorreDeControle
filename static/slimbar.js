(function() {
    'use strict';
    
    // Aguardar DOM carregar
    document.addEventListener('DOMContentLoaded', initSlimbar);
    
    function initSlimbar() {
        createSlimbarElements();
        setupEventListeners();
        setActiveProject();
        
        // Garantir estado inicial correto baseado no tamanho da tela
        if (window.innerWidth <= 768) {
            // Mobile: começar fechado
            const slimbar = document.querySelector('.slimbar');
            if (slimbar) {
                slimbar.classList.remove('open');
            }
        }
    }
    
    // Criar elementos do slimbar
    function createSlimbarElements() {
        // Verificar se já existe para evitar duplicação
        if (document.querySelector('.slimbar')) {
            return;
        }
        
        // Criar overlay para mobile
        const overlay = document.createElement('div');
        overlay.className = 'slimbar-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(overlay);
        
        // Criar botão toggle para mobile
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'slimbar-toggle';
        toggleBtn.setAttribute('aria-label', 'Abrir menu de projetos');
        toggleBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        `;
        document.body.appendChild(toggleBtn);
        
        // Criar slimbar
        const slimbar = document.createElement('nav');
        slimbar.className = 'slimbar';
        slimbar.setAttribute('aria-label', 'Navegação de projetos');
        
        slimbar.innerHTML = `
            <!-- Logo/Brand -->
            <div class="slimbar-logo" title="Dashboard">
            DS
            </div>
            
            <!-- Navegação -->
            <ul class="slimbar-nav" role="menubar">
            <li class="slimbar-item" role="none" data-label="Dashboard Principal">
                <a href="/" class="slimbar-link" role="menuitem" aria-label="Dashboard Principal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span class="slimbar-tooltip">Dashboard Principal</span>
                </a>
            </li>
            
            <li class="slimbar-item" role="none" data-label="Separação">
                <a href="/Separação" class="slimbar-link" role="menuitem" aria-label="Separação">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M3 12h18M3 18h18"></path>
                    <circle cx="8" cy="6" r="2"></circle>
                    <circle cx="16" cy="12" r="2"></circle>
                    <circle cx="8" cy="18" r="2"></circle>
                </svg>
                <span class="slimbar-tooltip">Separação</span>
                </a>
            </li>
            
            <li class="slimbar-item" role="none" data-label="Pendência e Corte">
                <a href="/Pendencia&Corte" class="slimbar-link" role="menuitem" aria-label="Pendência e Corte">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4"></path>
                    <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                    <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                    <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"></path>
                    <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"></path>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                </svg>
                <span class="slimbar-tooltip">Pendência e Corte</span>
                </a>
            </li>
            
            <li class="slimbar-item" role="none" data-label="Carregamento">
                <a href="/Carregamento" class="slimbar-link" role="menuitem" aria-label="Carregamento">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <path d="M16 13H8M16 17H8"></path>
                    <path d="M10 9H9H8"></path>
                    <circle cx="18" cy="18" r="3"></circle>
                    <path d="M16.2 16.2l1.8 1.8"></path>
                </svg>
                <span class="slimbar-tooltip">Carregamento</span>
                </a>
            </li>
            
            <li class="slimbar-item" role="none" data-label="Hora a Hora">
                <a href="/Hora_Hora" class="slimbar-link" role="menuitem" aria-label="Hora a Hora">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
                <span class="slimbar-tooltip">Hora a Hora</span>
                </a>
            </li>
            
            <li class="slimbar-item" role="none" data-label="Configurações">
                <a href="/Configurações" class="slimbar-link" role="menuitem" aria-label="Configurações">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                <span class="slimbar-tooltip">Configurações</span>
                </a>
            </li>
            </ul>
        `;
        
        // Inserir slimbar no início do body
        document.body.insertBefore(slimbar, document.body.firstChild);
    }
    
    // Configurar event listeners
    function setupEventListeners() {
        const toggleBtn = document.querySelector('.slimbar-toggle');
        const overlay = document.querySelector('.slimbar-overlay');
        const slimbar = document.querySelector('.slimbar');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleSlimbar);
        }
        
        if (overlay) {
            overlay.addEventListener('click', closeSlimbar);
        }
        
        // Fechar com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && slimbar && slimbar.classList.contains('open')) {
                closeSlimbar();
            }
        });
        
        // Fechar ao clicar em um link (mobile)
        const slimbarLinks = document.querySelectorAll('.slimbar-link');
        slimbarLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    closeSlimbar();
                }
            });
        });
        
        // Navegação por teclado
        setupKeyboardNavigation();
    }
    
    // Toggle do slimbar (mobile e desktop)
    function toggleSlimbar() {
        const slimbar = document.querySelector('.slimbar');
        const toggleBtn = document.querySelector('.slimbar-toggle');
        
        if (slimbar && toggleBtn) {
            const isOpen = slimbar.classList.contains('open');
            
            if (isOpen) {
                closeSlimbar();
            } else {
                openSlimbar();
            }
        }
    }
    
    // Abrir slimbar
    function openSlimbar() {
        const slimbar = document.querySelector('.slimbar');
        const overlay = document.querySelector('.slimbar-overlay');
        const toggleBtn = document.querySelector('.slimbar-toggle');
        
        if (slimbar && toggleBtn) {
            slimbar.classList.add('open');
            toggleBtn.setAttribute('aria-label', 'Fechar menu de projetos');
            
            // Adicionar overlay apenas em mobile
            if (overlay && window.innerWidth <= 768) {
                overlay.classList.add('open');
            }
            
            // Foco no primeiro link
            const firstLink = slimbar.querySelector('.slimbar-link');
            if (firstLink) {
                setTimeout(() => firstLink.focus(), 300);
            }
        }
    }
    
    // Fechar slimbar
    function closeSlimbar() {
        const slimbar = document.querySelector('.slimbar');
        const overlay = document.querySelector('.slimbar-overlay');
        const toggleBtn = document.querySelector('.slimbar-toggle');
        
        if (slimbar && toggleBtn) {
            slimbar.classList.remove('open');
            toggleBtn.setAttribute('aria-label', 'Abrir menu de projetos');
            
            // Remover overlay
            if (overlay) {
                overlay.classList.remove('open');
            }
            
            // Retornar foco ao botão toggle apenas em mobile
            if (window.innerWidth <= 768) {
                toggleBtn.focus();
            }
        }
    }
    
    // Definir projeto ativo baseado na URL
    function setActiveProject() {
        const currentPath = window.location.pathname;
        const slimbarLinks = document.querySelectorAll('.slimbar-link');
        
        slimbarLinks.forEach(link => {
            link.classList.remove('active');
            
            const linkPath = new URL(link.href).pathname;
            if (linkPath === currentPath) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }
    
    // Navegação por teclado
    function setupKeyboardNavigation() {
        const slimbarLinks = document.querySelectorAll('.slimbar-link');
        
        slimbarLinks.forEach((link, index) => {
            link.addEventListener('keydown', function(e) {
                let targetIndex;
                
                switch(e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        targetIndex = (index + 1) % slimbarLinks.length;
                        slimbarLinks[targetIndex].focus();
                        break;
                        
                    case 'ArrowUp':
                        e.preventDefault();
                        targetIndex = (index - 1 + slimbarLinks.length) % slimbarLinks.length;
                        slimbarLinks[targetIndex].focus();
                        break;
                        
                    case 'Home':
                        e.preventDefault();
                        slimbarLinks[0].focus();
                        break;
                        
                    case 'End':
                        e.preventDefault();
                        slimbarLinks[slimbarLinks.length - 1].focus();
                        break;
                }
            });
        });
    }
    
    // Reajustar em mudanças de orientação
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            if (window.innerWidth > 768) {
                closeSlimbar();
            }
        }, 100);
    });
    
    // Reajustar no redimensionamento da janela
    window.addEventListener('resize', function() {
        const slimbar = document.querySelector('.slimbar');
        const overlay = document.querySelector('.slimbar-overlay');
        
        if (window.innerWidth > 768) {
            // Desktop: garantir que o slimbar esteja visível e sem overlay
            if (slimbar) {
                slimbar.classList.remove('open'); // Remove classe para não interferir
            }
            if (overlay) {
                overlay.classList.remove('open');
            }
        } else {
            // Mobile: fechar o slimbar se estiver aberto
            closeSlimbar();
        }
    });
    
})();
