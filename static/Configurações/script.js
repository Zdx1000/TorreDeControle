// Configurações Dashboard Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Configurações module loaded');
    
    // Carregar configurações salvas
    loadConfig();
    
    // Event listeners para mudanças em tempo real
    setupRealTimeUpdates();
});

function setupRealTimeUpdates() {
    // Theme change
    document.getElementById('theme').addEventListener('change', function() {
        applyTheme(this.value);
    });
    
    // Font size change
    document.getElementById('fontSize').addEventListener('change', function() {
        applyFontSize(this.value);
    });
    
    // Animations toggle
    document.getElementById('animations').addEventListener('change', function() {
        toggleAnimations(this.checked);
    });
    
    // Notifications toggle
    document.getElementById('notifications').addEventListener('change', function() {
        toggleNotifications(this.checked);
    });
    
    // Turnos de trabalho
    setupTurnosListeners();
}

function setupTurnosListeners() {
    // Listener para hora extra do 1º turno
    document.getElementById('turno1HoraExtra').addEventListener('change', function() {
        updateHoraExtraInfo('turno1', this.checked);
    });
    
    // Listener para hora extra do 2º turno
    document.getElementById('turno2HoraExtra').addEventListener('change', function() {
        updateHoraExtraInfo('turno2', this.checked);
    });
    
    // Listeners para mudanças nos horários
    ['turno1Inicio', 'turno1Fim', 'turno2Inicio', 'turno2Fim'].forEach(id => {
        document.getElementById(id).addEventListener('change', function() {
            updateHoraExtraDisplay();
        });
    });
}

function loadConfig() {
    // Carregar configurações do localStorage
    const config = getStoredConfig();
    
    // Aplicar configurações aos elementos
    Object.keys(config).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = config[key];
            } else {
                element.value = config[key];
            }
        }
    });
    
    // Aplicar configurações visuais
    applyTheme(config.theme);
    applyFontSize(config.fontSize);
    toggleAnimations(config.animations);
    
    // Aplicar configurações de turnos
    updateHoraExtraDisplay();
}

function getStoredConfig() {
    const defaultConfig = {
        theme: 'light',
        fontSize: 'medium',
        animations: true,
        updateInterval: '60',
        notifications: true,
        sounds: false,
        apiUrl: 'www.acompanhamento-produccao-hora-a-hora.com/',
        timeout: '30',
        debug: false,
        moduleSeparacao: true,
        modulePendencia: true,
        moduleCarregamento: true,
        moduleHoraHora: true,
        // Configurações de turnos
        turno1Inicio: '05:00',
        turno1Fim: '13:40',
        turno1HoraExtra: false,
        turno2Inicio: '15:20',
        turno2Fim: '23:40',
        turno2HoraExtra: false
    };
    
    try {
        const stored = localStorage.getItem('dashboardConfig');
        return stored ? { ...defaultConfig, ...JSON.parse(stored) } : defaultConfig;
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        return defaultConfig;
    }
}

function saveConfig() {
    const config = {};
    
    // Coletar valores de todos os elementos de configuração
    const elements = document.querySelectorAll('select, input');
    elements.forEach(element => {
        if (element.id) {
            if (element.type === 'checkbox') {
                config[element.id] = element.checked;
            } else {
                config[element.id] = element.value;
            }
        }
    });
    
    try {
        localStorage.setItem('dashboardConfig', JSON.stringify(config));
        
        // Usar notificação aprimorada para mobile
        if (window.innerWidth <= 768) {
            showNotificationWithIcon('Configurações salvas com sucesso!', 'success');
        } else {
            showNotification('Configurações salvas com sucesso!', 'success');
        }
        
        // Aplicar configurações imediatamente
        applyAllConfigs(config);
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        
        // Usar notificação aprimorada para mobile
        if (window.innerWidth <= 768) {
            showNotificationWithIcon('Erro ao salvar configurações!', 'error');
        } else {
            showNotification('Erro ao salvar configurações!', 'error');
        }
    }
}

function resetConfig() {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
        localStorage.removeItem('dashboardConfig');
        location.reload();
    }
}

function clearData() {
    if (confirm('Tem certeza que deseja limpar todos os dados armazenados? Esta ação não pode ser desfeita.')) {
        localStorage.clear();
        sessionStorage.clear();
        
        // Usar notificação aprimorada para mobile
        if (window.innerWidth <= 768) {
            showNotificationWithIcon('Dados limpos com sucesso!', 'success');
        } else {
            showNotification('Dados limpos com sucesso!', 'success');
        }
        
        setTimeout(() => location.reload(), 1500);
    }
}

function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
}

function applyFontSize(size) {
    const sizes = {
        small: '14px',
        medium: '16px',
        large: '18px'
    };
    
    document.body.style.fontSize = sizes[size] || sizes.medium;
}

function toggleAnimations(enabled) {
    if (enabled) {
        document.body.classList.remove('no-animations');
    } else {
        document.body.classList.add('no-animations');
    }
}

function toggleNotifications(enabled) {
    if (enabled && 'Notification' in window) {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'denied') {
                    if (window.innerWidth <= 768) {
                        showNotificationWithIcon('Notificações foram negadas pelo navegador', 'warning');
                    } else {
                        showNotification('Notificações foram negadas pelo navegador', 'warning');
                    }
                }
            });
        } else if (Notification.permission === 'denied') {
            if (window.innerWidth <= 768) {
                showNotificationWithIcon('Notificações bloqueadas. Reative nas configurações do navegador', 'warning');
            } else {
                showNotification('Notificações bloqueadas. Reative nas configurações do navegador', 'warning');
            }
        }
    }
}

function applyAllConfigs(config) {
    applyTheme(config.theme);
    applyFontSize(config.fontSize);
    toggleAnimations(config.animations);
    toggleNotifications(config.notifications);
    
    // Aplicar outras configurações conforme necessário
    if (config.debug) {
        console.log('Modo debug ativado');
        window.DEBUG = true;
    }
}

function showNotification(message, type = 'success') {
    // Remover notificação existente
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Detectar se é mobile
    const isMobile = window.innerWidth <= 768;
    
    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Estilos específicos para mobile
    if (isMobile) {
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 40px)',
            maxWidth: '350px',
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: '500',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            zIndex: '10000',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
            lineHeight: '1.4'
        });
        
        // Cores específicas por tipo para mobile
        switch(type) {
            case 'success':
                Object.assign(notification.style, {
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff'
                });
                break;
            case 'error':
                Object.assign(notification.style, {
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#ffffff'
                });
                break;
            case 'warning':
                Object.assign(notification.style, {
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#ffffff'
                });
                break;
            case 'info':
                Object.assign(notification.style, {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: '#ffffff'
                });
                break;
        }
    } else {
        // Estilos para desktop (mantém o original)
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            zIndex: '10000',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '300px'
        });
        
        switch(type) {
            case 'success':
                Object.assign(notification.style, {
                    backgroundColor: '#10b981',
                    color: '#ffffff'
                });
                break;
            case 'error':
                Object.assign(notification.style, {
                    backgroundColor: '#ef4444',
                    color: '#ffffff'
                });
                break;
            case 'warning':
                Object.assign(notification.style, {
                    backgroundColor: '#f59e0b',
                    color: '#ffffff'
                });
                break;
            case 'info':
                Object.assign(notification.style, {
                    backgroundColor: '#3b82f6',
                    color: '#ffffff'
                });
                break;
        }
    }
    
    document.body.appendChild(notification);
    
    // Animação de entrada mais suave para mobile
    notification.style.opacity = '0';
    notification.style.transform = isMobile ? 'translateX(-50%) translateY(-20px)' : 'translateY(-20px)';
    notification.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Mostrar com animação
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = isMobile ? 'translateX(-50%) translateY(0)' : 'translateY(0)';
        notification.classList.add('show');
    }, 10);
    
    // Remover após 4 segundos para mobile (mais tempo para ler)
    const timeout = isMobile ? 2000 : 1000;
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = isMobile ? 'translateX(-50%) translateY(-20px)' : 'translateY(-20px)';
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, timeout);
    
    // Para mobile, permitir fechar tocando na notificação
    if (isMobile) {
        notification.addEventListener('touchstart', function() {
            this.style.opacity = '0';
            this.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => {
                if (this.parentNode) {
                    this.remove();
                }
            }, 300);
        }, { passive: true });
    }
}

// Função para criar notificação com ícone (mais visual para mobile)
function showNotificationWithIcon(message, type = 'success') {
    // Remover notificação existente
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Detectar se é mobile
    const isMobile = window.innerWidth <= 768;
    
    // Definir ícones por tipo
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Estrutura HTML com ícone
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: ${isMobile ? '18px' : '16px'};">${icons[type] || '📢'}</span>
            <span style="flex: 1;">${message}</span>
        </div>
    `;
    
    // Estilos específicos para mobile
    if (isMobile) {
        Object.assign(notification.style, {
            position: 'fixed',
            top: 'env(safe-area-inset-top, 20px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 40px)',
            maxWidth: '380px',
            padding: '18px 22px',
            fontSize: '15px',
            fontWeight: '600',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)',
            zIndex: '10001',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(12px)',
            textAlign: 'left',
            lineHeight: '1.5',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center'
        });
        
        // Cores específicas por tipo para mobile
        switch(type) {
            case 'success':
                Object.assign(notification.style, {
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
                    color: '#ffffff',
                    borderColor: 'rgba(34, 197, 94, 0.5)'
                });
                break;
            case 'error':
                Object.assign(notification.style, {
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                    color: '#ffffff',
                    borderColor: 'rgba(239, 68, 68, 0.5)'
                });
                break;
            case 'warning':
                Object.assign(notification.style, {
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
                    color: '#ffffff',
                    borderColor: 'rgba(245, 158, 11, 0.5)'
                });
                break;
            case 'info':
                Object.assign(notification.style, {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                    color: '#ffffff',
                    borderColor: 'rgba(59, 130, 246, 0.5)'
                });
                break;
        }
    }
    
    document.body.appendChild(notification);
    
    // Animação de entrada mais elaborada para mobile
    notification.style.opacity = '0';
    notification.style.transform = isMobile ? 'translateX(-50%) translateY(-30px) scale(0.9)' : 'translateY(-20px)';
    notification.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    
    // Mostrar com animação
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = isMobile ? 'translateX(-50%) translateY(0) scale(1)' : 'translateY(0)';
        notification.classList.add('show');
    }, 10);
    
    // Vibração sutil para feedback tátil (apenas mobile)
    if (isMobile && navigator.vibrate && type !== 'info') {
        const vibrationPattern = {
            success: [50, 30, 50],
            error: [100, 50, 100, 50, 100],
            warning: [80, 40, 80]
        };
        navigator.vibrate(vibrationPattern[type] || [50]);
    }
    
    // Remover após 5 segundos para mobile (mais tempo para ler)
    const timeout = isMobile ? 5000 : 3500;
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = isMobile ? 'translateX(-50%) translateY(-30px) scale(0.9)' : 'translateY(-20px)';
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 400);
    }, timeout);
    
    // Para mobile, permitir fechar deslizando para cima
    if (isMobile) {
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        
        notification.addEventListener('touchstart', function(e) {
            startY = e.touches[0].clientY;
            isDragging = true;
            this.style.transition = 'none';
        }, { passive: true });
        
        notification.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            currentY = e.touches[0].clientY - startY;
            if (currentY < 0) { // Só permite deslizar para cima
                this.style.transform = `translateX(-50%) translateY(${currentY}px)`;
                this.style.opacity = Math.max(0.3, 1 + currentY / 100);
            }
        }, { passive: true });
        
        notification.addEventListener('touchend', function() {
            isDragging = false;
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            
            if (currentY < -50) { // Se deslizou para cima mais de 50px, remove
                this.style.opacity = '0';
                this.style.transform = 'translateX(-50%) translateY(-100px)';
                setTimeout(() => {
                    if (this.parentNode) {
                        this.remove();
                    }
                }, 300);
            } else { // Volta para posição original
                this.style.transform = 'translateX(-50%) translateY(0)';
                this.style.opacity = '1';
            }
            currentY = 0;
        }, { passive: true });
    }
}

// Exportar configurações para outros módulos
window.getConfig = function(key) {
    const config = getStoredConfig();
    return key ? config[key] : config;
};

// Função para validar API URL
function validateApiUrl() {
    const apiUrl = document.getElementById('apiUrl').value;
    
    try {
        new URL(apiUrl);
        return true;
    } catch {
        // Usar notificação aprimorada para mobile
        if (window.innerWidth <= 768) {
            showNotificationWithIcon('URL da API inválida!', 'error');
        } else {
            showNotification('URL da API inválida!', 'error');
        }
        return false;
    }
}

// Event listener para validação em tempo real
document.getElementById('apiUrl').addEventListener('blur', validateApiUrl);

function updateHoraExtraInfo(turno, enabled) {
    const infoElement = document.getElementById(`${turno}ExtraInfo`);
    
    if (enabled) {
        infoElement.style.display = 'block';
        updateHoraExtraDisplay();
    } else {
        infoElement.style.display = 'none';
    }
}

function updateHoraExtraDisplay() {
    // Atualizar 1º turno
    const turno1Inicio = document.getElementById('turno1Inicio').value;
    const turno1Fim = document.getElementById('turno1Fim').value;
    const turno1Extra = document.getElementById('turno1HoraExtra').checked;
    
    if (turno1Extra && turno1Inicio && turno1Fim) {
        const fimComExtra = addHours(turno1Fim, 2);
        document.getElementById('turno1ExtraInfo').innerHTML = 
            `<small>Extra: até ${fimComExtra}</small>`;
    }
    
    // Atualizar 2º turno
    const turno2Inicio = document.getElementById('turno2Inicio').value;
    const turno2Fim = document.getElementById('turno2Fim').value;
    const turno2Extra = document.getElementById('turno2HoraExtra').checked;
    
    if (turno2Extra && turno2Inicio && turno2Fim) {
        const fimComExtra = addHours(turno2Fim, 2);
        document.getElementById('turno2ExtraInfo').innerHTML = 
            `<small>Extra: até ${fimComExtra}</small>`;
    }
}

function addHours(timeString, hours) {
    const [hourStr, minuteStr] = timeString.split(':');
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    
    hour += hours;
    
    // Tratar overflow de 24 horas
    if (hour >= 24) {
        hour -= 24;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

function getTurnoConfig() {
    return {
        turno1: {
            inicio: document.getElementById('turno1Inicio').value,
            fim: document.getElementById('turno1Fim').value,
            horaExtra: document.getElementById('turno1HoraExtra').checked
        },
        turno2: {
            inicio: document.getElementById('turno2Inicio').value,
            fim: document.getElementById('turno2Fim').value,
            horaExtra: document.getElementById('turno2HoraExtra').checked
        }
    };
}
