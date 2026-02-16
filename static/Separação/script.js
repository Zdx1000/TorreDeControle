/* =============================================================================
   PROJETO SEPARAÇÃO - JAVASCRIPT (EM CONSTRUÇÃO)
   ============================================================================= */

(function() {
    'use strict';
    
    // Aguardar DOM carregar
    document.addEventListener('DOMContentLoaded', initSeparacaoConstruction);
    
    function initSeparacaoConstruction() {
        console.log('� Sistema de Separação - Página em Construção inicializada');
        
        // Inicializar animações
        initAnimations();
        
        // Simular progresso de desenvolvimento
        animateProgressBar();
        
        // Adicionar efeitos de hover nas preview cards
        setupPreviewCards();
        
        // Adicionar contador de tempo estimado
        setupTimeCounter();
    }
    
    function initAnimations() {
        // Observer para animações quando elementos entram na viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        // Observar cards de preview
        const previewCards = document.querySelectorAll('.preview-card');
        previewCards.forEach((card, index) => {
            // Atraso escalonado para cada card
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = `all 0.6s ease ${index * 0.2}s`;
            observer.observe(card);
        });
        
        // Observar features
        const featureItems = document.querySelectorAll('.feature-item');
        featureItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            item.style.transition = `all 0.5s ease ${index * 0.1}s`;
            observer.observe(item);
        });
    }
    
    function animateProgressBar() {
        const progressFill = document.querySelector('.progress-fill-construction');
        const progressPercentage = document.querySelector('.progress-percentage');
        
        if (!progressFill || !progressPercentage) return;
        
        let currentProgress = 0;
        const targetProgress = 75;
        const duration = 2000; // 2 segundos
        const increment = targetProgress / (duration / 16); // 60fps
        
        function updateProgress() {
            currentProgress += increment;
            
            if (currentProgress >= targetProgress) {
                currentProgress = targetProgress;
                
                // Adicionar efeito de pulso quando completa
                progressFill.style.animation = 'progress-fill 3s ease-out, progress-shine 2s ease-in-out infinite';
            }
            
            progressFill.style.width = currentProgress + '%';
            progressPercentage.textContent = Math.round(currentProgress) + '%';
            
            if (currentProgress < targetProgress) {
                requestAnimationFrame(updateProgress);
            }
        }
        
        // Iniciar animação após um pequeno delay
        setTimeout(updateProgress, 500);
    }
    
    function setupPreviewCards() {
        const previewCards = document.querySelectorAll('.preview-card');
        
        previewCards.forEach(card => {
            // Efeito de magnetismo no mouse
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const deltaX = (x - centerX) / centerX;
                const deltaY = (y - centerY) / centerY;
                
                const maxTilt = 8;
                const tiltX = deltaY * maxTilt;
                const tiltY = -deltaX * maxTilt;
                
                card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            });
            
            // Efeito de click
            card.addEventListener('click', () => {
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                }, 150);
                
                // Mostrar mensagem
                showTemporaryMessage('Funcionalidade em desenvolvimento! 🚧');
            });
        });
    }
    
    function setupTimeCounter() {
        const timeElement = document.querySelector('.estimated-time span:last-child');
        if (!timeElement) return;
        
        const messages = [
            'Previsão: Em breve',
            'Progresso: Acelerando',
            'Status: Desenvolvendo',
            'Previsão: Quase pronto'
        ];
        
        let currentIndex = 0;
        
        setInterval(() => {
            timeElement.style.opacity = '0';
            
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % messages.length;
                timeElement.textContent = messages[currentIndex];
                timeElement.style.opacity = '1';
            }, 300);
        }, 3000);
    }
    
    function showTemporaryMessage(message) {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--primary-color);
            color: white;
            padding: 1rem 2rem;
            border-radius: 12px;
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            animation: popIn 0.3s ease-out;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remover após 2 segundos
        setTimeout(() => {
            notification.style.animation = 'popOut 0.3s ease-in forwards';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }
    
    // Adicionar estilos para as animações
    const style = document.createElement('style');
    style.textContent = `
        @keyframes popIn {
            0% { 
                opacity: 0; 
                transform: translate(-50%, -50%) scale(0.8);
            }
            100% { 
                opacity: 1; 
                transform: translate(-50%, -50%) scale(1);
            }
        }
        
        @keyframes popOut {
            0% { 
                opacity: 1; 
                transform: translate(-50%, -50%) scale(1);
            }
            100% { 
                opacity: 0; 
                transform: translate(-50%, -50%) scale(0.8);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Easter egg: Konami code para mostrar progresso extra
    let konamiCode = [];
    const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
    
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.keyCode);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join('') === konamiSequence.join('')) {
            showTemporaryMessage('🎉 Modo Desenvolvedor Ativado! Progresso: 99%');
            const progressFill = document.querySelector('.progress-fill-construction');
            const progressPercentage = document.querySelector('.progress-percentage');
            
            if (progressFill && progressPercentage) {
                progressFill.style.width = '99%';
                progressPercentage.textContent = '99%';
                progressFill.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
            }
            
            konamiCode = [];
        }
    });
    
})();
