// Hora a Hora Dashboard Script - Versão Aprimorada
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema Hora a Hora v2.0 - Carregando...');
    
    // Inicializar animações
    initAnimations();
    
    // Inicializar dados
    initHourlyData();
    updateCurrentTime();
    
    // Atualizar dados a cada minuto
    setInterval(updateCurrentTime, 60000);
    setInterval(updateHourlyData, 300000); // 5 minutos
    
    // Event listeners para botões de período
    setupTimeButtons();
    
    // Adicionar indicadores de loading
    setupLoadingStates();
    
    console.log('✅ Sistema inicializado com sucesso!');
});

function initAnimations() {
    // Adicionar delay às animações para efeito cascata
    const elements = document.querySelectorAll('.fade-in-up');
    elements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Animar cards ao aparecer na viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.hourly-card, .hourly-table-container').forEach(card => {
        observer.observe(card);
    });
}

function setupTimeButtons() {
    const timeButtons = document.querySelectorAll('.time-btn');
    timeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Animação de feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Remover active de todos
            timeButtons.forEach(b => b.classList.remove('active'));
            // Adicionar active ao clicado
            this.classList.add('active');
            
            const period = this.dataset.period;
            loadDataForPeriod(period);
            
            // Adicionar feedback visual
            showNotification(`📊 Carregando dados de ${period}...`);
        });
        
        // Adicionar efeitos de hover melhorados
        btn.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(-2px)';
            }
        });
        
        btn.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = '';
            }
        });
    });
}

function setupLoadingStates() {
    // Simular carregamento inicial
    setTimeout(() => {
        const placeholder = document.querySelector('.chart-placeholder');
        if (placeholder) {
            placeholder.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">📈</div>
                    <div>Gráfico em desenvolvimento</div>
                    <small style="color: var(--construction-color);">Funcionalidade será implementada em breve</small>
                </div>
            `;
            placeholder.classList.remove('loading');
        }
    }, 2000);
}

function showNotification(message) {
    // Criar notificação toast
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--glass-bg);
        color: var(--text-primary);
        padding: 15px 20px;
        border-radius: 10px;
        border: 1px solid var(--glass-border);
        backdrop-filter: blur(10px);
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        box-shadow: var(--card-shadow);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function updateCurrentTime() {
    const now = new Date();
    const currentHour = now.getHours();
    const horaAtualElement = document.getElementById('horaAtual');
    
    if (horaAtualElement) {
        horaAtualElement.textContent = `${currentHour}:00`;
    }
}

function initHourlyData() {
    // Dados demo para desenvolvimento
    generateHourlyTable();
    updatePerformanceStats();
}

function updateHourlyData() {
    generateHourlyTable();
    updatePerformanceStats();
}

function updatePerformanceStats() {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Dados demo mais realistas
    const produzidoHora = Math.floor(Math.random() * 50) + 80;
    const metaHora = 100;
    const percentual = Math.round((produzidoHora / metaHora) * 100);
    
    // Atualizar elementos com animação
    const elements = {
        'horaAtual': `${currentHour}:00`,
        'produzidoHora': produzidoHora.toLocaleString('pt-BR'),
        'metaHora': metaHora.toLocaleString('pt-BR'),
        'percentualMeta': `${percentual}%`
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            // Animação de contagem
            animateValue(element, element.textContent, elements[id], 1000);
            
            // Colorir percentual baseado na performance
            if (id === 'percentualMeta') {
                setTimeout(() => {
                    if (percentual >= 100) {
                        element.style.color = 'var(--success-color)';
                        element.parentElement.style.borderLeftColor = 'var(--success-color)';
                    } else if (percentual >= 80) {
                        element.style.color = 'var(--warning-color)';
                        element.parentElement.style.borderLeftColor = 'var(--warning-color)';
                    } else {
                        element.style.color = 'var(--danger-color)';
                        element.parentElement.style.borderLeftColor = 'var(--danger-color)';
                    }
                }, 1000);
            }
        }
    });
}

function animateValue(element, start, end, duration) {
    // Extrair números do texto
    const startNum = parseInt(start.replace(/[^\d]/g, '')) || 0;
    const endNum = parseInt(end.replace(/[^\d]/g, '')) || 0;
    
    if (startNum === endNum) {
        element.textContent = end;
        return;
    }
    
    const range = endNum - startNum;
    const startTime = Date.now();
    
    function updateValue() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(startNum + (range * easeProgress));
        
        // Manter formato original
        element.textContent = end.replace(/\d+/, current);
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    requestAnimationFrame(updateValue);
}

function generateHourlyTable() {
    generateHourlyTableForPeriod('hoje');
}

function loadDataForPeriod(period) {
    console.log(`📊 Carregando dados para período: ${period}`);
    
    // Adicionar estado de loading
    const chart = document.querySelector('.chart-placeholder');
    const tableBody = document.getElementById('hourlyTableBody');
    
    if (chart) {
        chart.classList.add('loading');
        chart.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 1.5rem; margin-bottom: 10px;">⏳</div>
                <div>Processando dados de ${period}...</div>
                <small style="color: var(--accent-color);">Sistema em desenvolvimento</small>
            </div>
        `;
        
        setTimeout(() => {
            chart.classList.remove('loading');
            chart.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">📈</div>
                    <div>Dados de ${period} processados</div>
                    <small style="color: var(--construction-color);">Gráfico será implementado em breve</small>
                </div>
            `;
        }, 1500);
    }
    
    // Atualizar tabela com dados do período selecionado
    if (tableBody) {
        tableBody.style.opacity = '0.5';
        setTimeout(() => {
            generateHourlyTableForPeriod(period);
            tableBody.style.opacity = '1';
        }, 800);
    }
}

function generateHourlyTableForPeriod(period) {
    const tableBody = document.getElementById('hourlyTableBody');
    if (!tableBody) return;
    
    const now = new Date();
    const currentHour = now.getHours();
    let html = '';
    
    // Ajustar dados baseado no período
    const periodMultiplier = {
        'hoje': 1,
        'ontem': 0.9,
        'semana': 0.8,
        'mes': 0.7
    };
    
    const multiplier = periodMultiplier[period] || 1;
    
    // Gerar dados para as últimas 12 horas
    for (let i = 11; i >= 0; i--) {
        const hour = (currentHour - i + 24) % 24;
        const baseProduzido = Math.floor(Math.random() * 60) + 70;
        const produzido = Math.floor(baseProduzido * multiplier);
        const meta = 100;
        const percentual = Math.round((produzido / meta) * 100);
        
        let statusClass, statusText, statusIcon;
        if (percentual >= 100) {
            statusClass = 'status-success';
            statusText = 'Atingiu';
            statusIcon = '✅';
        } else if (percentual >= 80) {
            statusClass = 'status-warning';
            statusText = 'Próximo';
            statusIcon = '⚠️';
        } else {
            statusClass = 'status-danger';
            statusText = 'Abaixo';
            statusIcon = '❌';
        }
        
        html += `
            <tr style="animation-delay: ${i * 0.05}s">
                <td><strong>${hour.toString().padStart(2, '0')}:00</strong></td>
                <td>${produzido.toLocaleString('pt-BR')}</td>
                <td>${meta.toLocaleString('pt-BR')}</td>
                <td><strong>${percentual}%</strong></td>
                <td><span class="status-badge ${statusClass}">${statusIcon} ${statusText}</span></td>
            </tr>
        `;
    }
    
    tableBody.innerHTML = html;
    
    // Animar entrada das linhas
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            row.style.transition = 'all 0.3s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
        }, index * 50);
    });
}

// Função para conectar com API real (quando disponível)
async function fetchRealHourlyData() {
    try {
        const response = await fetch('/api/hora-a-hora');
        if (response.ok) {
            const data = await response.json();
            updateDisplayWithRealData(data);
        } else {
            console.log('API não disponível, usando dados demo');
            updateHourlyData();
        }
    } catch (error) {
        console.log('Erro ao conectar com API:', error);
        updateHourlyData();
    }
}

function updateDisplayWithRealData(data) {
    // Atualizar com dados reais da API
    if (data.performance) {
        updatePerformanceStats(data.performance);
    }
    
    if (data.hourlyData) {
        generateHourlyTableFromData(data.hourlyData);
    }
}

// Funcionalidades adicionais para melhor UX
function addInteractiveFeatures() {
    // Tooltip para elementos informativos
    const perfItems = document.querySelectorAll('.perf-item');
    perfItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const label = this.querySelector('.perf-label').textContent;
            const value = this.querySelector('.perf-value').textContent;
            
            // Criar tooltip simples
            const tooltip = document.createElement('div');
            tooltip.style.cssText = `
                position: absolute;
                background: var(--dark-bg);
                color: var(--text-primary);
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 0.9rem;
                pointer-events: none;
                z-index: 1000;
                border: 1px solid var(--glass-border);
                box-shadow: var(--card-shadow);
            `;
            tooltip.textContent = `${label}: ${value}`;
            
            document.body.appendChild(tooltip);
            
            // Posicionar tooltip
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.top - 40) + 'px';
            
            this._tooltip = tooltip;
        });
        
        item.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                document.body.removeChild(this._tooltip);
                this._tooltip = null;
            }
        });
    });
}

// Inicializar recursos extras quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        addInteractiveFeatures();
    }, 1000);
});

// Performance monitoring
function logPerformance() {
    if (window.performance) {
        const perfData = window.performance.timing;
        const loadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`⚡ Página carregada em ${loadTime}ms`);
    }
}

window.addEventListener('load', logPerformance);

// Auto-refresh com indicador visual
let autoRefreshTimer;
function startAutoRefresh() {
    autoRefreshTimer = setInterval(() => {
        console.log('🔄 Auto-refresh dos dados...');
        updateHourlyData();
        
        // Indicador visual de refresh
        const header = document.querySelector('.header');
        if (header) {
            header.style.filter = 'brightness(1.1)';
            setTimeout(() => {
                header.style.filter = '';
            }, 300);
        }
    }, 300000); // 5 minutos
}

function stopAutoRefresh() {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
    }
}

// Iniciar auto-refresh
startAutoRefresh();

// Parar auto-refresh quando a aba não está visível
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        stopAutoRefresh();
        console.log('⏸️ Auto-refresh pausado (aba não visível)');
    } else {
        startAutoRefresh();
        console.log('▶️ Auto-refresh retomado');
        updateHourlyData(); // Atualizar imediatamente
    }
});
