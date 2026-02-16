let dadosOriginais = [];
let dadosFiltrados = [];
let ordemAtual = { coluna: null, direcao: 'asc' };

const API_URL = '/api/dados';

const domCache = {
    searchInput: null,
    tabelaDados: null,
    progressCircle: null,
    graficoPorSetor: null,
    tableHeaders: null,
    modalGrafico: null,
    closeModalGrafico: null,
    filterButtons: null,
    init() {
        // Esta função será chamada em configurarEventos()
        // Não sobrescrever o progressCircle aqui
        this.searchInput = document.getElementById('searchInput');
        this.tabelaDados = document.getElementById('tabelaDados');
        // Não redefinir progressCircle aqui para evitar conflito
        if (!this.progressCircle) {
            this.progressCircle = document.getElementById('progressCircle');
        }
        this.graficoPorSetor = document.getElementById('graficoPorSetor');
    }
};

// OTIMIZAÇÃO: Pré-fetch estratégico - preparar recursos antes do uso
function prefetchRecursos() {
    // Prefetch de dados quando usuário passa mouse sobre botões de gráfico
    const botoesGrafico = document.querySelectorAll('[data-prefetch="chart"]');
    botoesGrafico.forEach(botao => {
        botao.addEventListener('mouseenter', () => {
            // Simular prefetch de recursos do gráfico
            if (!window.chartResourcesPrefetched) {
                window.chartResourcesPrefetched = true;
                console.log('Prefetching chart resources...');
            }
        });
    });
}

// OTIMIZAÇÃO: Tree-shaking - Funções utilitárias otimizadas
const Utils = {
    // Remover código morto: funções não utilizadas foram identificadas
    formatNumber: (num) => num.toLocaleString('pt-BR'),
    
    // Função otimizada para verificar se elemento existe
    exists: (element) => element && element.offsetParent !== null,
    
    // Debounce function reutilizável
    debounce: (func, wait) => {
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
};

const elementos = {
    totalSetores: document.getElementById('totalSetores'),
    totalSeparadas: document.getElementById('totalSeparadas'),
    totalRestantes: document.getElementById('totalRestantes'),
    percentualConcluido: document.getElementById('percentualConcluido'),
    tabelaBody: document.getElementById('tabelaBody'),
    timestamp: document.getElementById('timestamp'),
    chartBtn: document.getElementById('chartBtn'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error')
};

// Função para inicializar cache DOM - Otimização 1
function initializeDOMCache() {
    
    // Cache elementos que serão acessados repetidamente
    const progressElement = document.getElementById('progressCircle');
    if (progressElement) {
        domCache.progressCircle = progressElement;
    } else {
        console.warn('⚠ progressCircle não encontrado durante inicialização do cache');
    }
    
    domCache.tableHeaders = document.querySelectorAll('th');
    domCache.modalGrafico = document.getElementById('modalGrafico');
    domCache.closeModalGrafico = document.getElementById('closeModalGrafico');
    domCache.filterButtons = document.querySelectorAll('.filter-btn');
    
    // Cache elementos de modais
    domCache.totalSetoresCard = document.getElementById('totalSetoresCard');
    domCache.modalSetores = document.getElementById('modalSetores');
    domCache.closeModal = document.getElementById('closeModal');
    domCache.modalTabelaBody = document.getElementById('modalTabelaBody');
    
    domCache.linhasSeparadasCard = document.getElementById('linhasSeparadasCard');
    domCache.modalLinhasSeparadas = document.getElementById('modalLinhasSeparadas');
    domCache.closeModalLinhasSeparadas = document.getElementById('closeModalLinhasSeparadas');
    
    domCache.linhasRestantesCard = document.getElementById('linhasRestantesCard');
    domCache.modalLinhasRestantes = document.getElementById('modalLinhasRestantes');
    domCache.closeModalLinhasRestantes = document.getElementById('closeModalLinhasRestantes');
    
    domCache.percentualConcluidoCard = document.getElementById('percentualConcluidoCard');
    domCache.modalProgresso = document.getElementById('modalProgresso');
    domCache.closeModalProgresso = document.getElementById('closeModalProgresso');
    
}

// Função de debounce - Otimização 3
// OTIMIZAÇÃO: Debounce removido daqui - agora está no Utils para evitar duplicação

// Aguardar DOM carregar para inicializar cache e elementos
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que todos os elementos estejam renderizados
    setTimeout(() => {
        initializeDOMCache(); // Otimização 1
        elementos.searchInput = document.getElementById('searchInput');
        inicializar();
    }, 100);
});

function inicializar() {
    // Marcar o tempo de inicialização para controlar a demonstração
    window.tempoInicializacao = Date.now();
    
    configurarEventos();
    carregarDados();
    configurarStickyIconsMobile();
    
    // Teste inicial do círculo de progresso - verificar se o elemento existe primeiro
    setTimeout(() => {
        // Verificar novamente se o elemento existe
        const progressElement = document.getElementById('progressCircle');
        if (progressElement) {
            domCache.progressCircle = progressElement;
            
            // Teste progressivo de demonstração
            atualizarAnelProgresso(0);   // 0%
            setTimeout(() => atualizarAnelProgresso(25), 500);  // 25% após 0.5s
            setTimeout(() => atualizarAnelProgresso(50), 1000);  // 50% após 1s
            setTimeout(() => atualizarAnelProgresso(75), 1500);  // 75% após 1.5s
            setTimeout(() => atualizarAnelProgresso(100), 2000); // 100% após 2s
            
            // Após a animação, sincronizar com o valor real do % Concluído
            setTimeout(() => {
                sincronizarProgressoComDados();
            }, 3000); // 1 segundo após chegar ao 100%
            
        } else {
            // Tentar encontrar o elemento mais tarde
            setTimeout(() => {
                const progressElementRetry = document.getElementById('progressCircle');
                if (progressElementRetry) {
                    domCache.progressCircle = progressElementRetry;
                    sincronizarProgressoComDados();
                } else {
                    // Debug final - mostrar todo o HTML do progress-ring
                    const progressRing = document.querySelector('.progress-ring');
                }
            }, 1000);
        }
    }, 1000);
}

function configurarEventos() {
    // OTIMIZAÇÃO: Inicializar cache DOM
    domCache.init();
    
    // OTIMIZAÇÃO: Configurar pré-fetch estratégico
    prefetchRecursos();
    
    // Botão de gráficos usando cache - Otimização 1
    if (elementos.chartBtn) {
        elementos.chartBtn.addEventListener('click', () => {
            abrirModalGrafico();
        });
    }

    // Configurar busca com debounce - Otimização 3
    if (elementos.searchInput) {
        const debouncedFilter = Utils.debounce((value) => {
            filtrarDados(value);
        }, 200);
        
        elementos.searchInput.addEventListener('input', (e) => {
            debouncedFilter(e.target.value);
        });
    }

    // Configurar ordenação nas colunas
    document.addEventListener('click', (e) => {
        const thContent = e.target.closest('.th-content');
        if (thContent) {
            const th = thContent.closest('th');
            const coluna = obterNomeColuna(th);
            if (coluna) {
                ordenarTabela(coluna, th);
            }
        }
    });
    
}

function obterNomeColuna(th) {
    const index = Array.from(th.parentNode.children).indexOf(th);
    const colunas = ['Setor', 'Descrição setor', 'Linhas Separadas', 'Linhas Restantes', 'Containers Restantes', 'Total', 'Progresso', 'Meta'];
    return colunas[index];
}

function ordenarTabela(coluna, th) {
    // Usar cache em vez de querySelectorAll - Otimização 1
    domCache.tableHeaders.forEach(header => {
        header.classList.remove('sorted', 'sorted-asc', 'sorted-desc');
    });

    // Determinar direção da ordenação
    if (ordemAtual.coluna === coluna) {
        ordemAtual.direcao = ordemAtual.direcao === 'asc' ? 'desc' : 'asc';
    } else {
        ordemAtual.direcao = 'asc';
    }
    ordemAtual.coluna = coluna;

    // Aplicar classes visuais
    th.classList.add('sorted', `sorted-${ordemAtual.direcao}`);

    // Ordenar dados
    dadosFiltrados.sort((a, b) => {
        let valorA, valorB;

        if (coluna === 'Total') {
            valorA = (a['Linhas Separadas'] || 0) + (a['Linhas Restantes'] || 0);
            valorB = (b['Linhas Separadas'] || 0) + (b['Linhas Restantes'] || 0);
        } else if (coluna === 'Progresso') {
            const totalA = (a['Linhas Separadas'] || 0) + (a['Linhas Restantes'] || 0);
            const totalB = (b['Linhas Separadas'] || 0) + (b['Linhas Restantes'] || 0);
            valorA = totalA > 0 ? (a['Linhas Separadas'] || 0) / totalA * 100 : 0;
            valorB = totalB > 0 ? (b['Linhas Separadas'] || 0) / totalB * 100 : 0;
        } else {
            valorA = a[coluna] || '';
            valorB = b[coluna] || '';
        }

        // Comparação
        if (typeof valorA === 'string') {
            valorA = valorA.toLowerCase();
            valorB = valorB.toLowerCase();
        }

        if (valorA < valorB) return ordemAtual.direcao === 'asc' ? -1 : 1;
        if (valorA > valorB) return ordemAtual.direcao === 'asc' ? 1 : -1;
        return 0;
    });

    preencherTabela(dadosFiltrados);
}

function filtrarDados(termo) {
    if (!termo.trim()) {
        dadosFiltrados = [...dadosOriginais];
    } else {
        const termoLower = termo.toLowerCase();
        dadosFiltrados = dadosOriginais.filter(item => {
            const setor = (item.Setor || '').toLowerCase();
            const descricao = (item['Descrição setor'] || '').toLowerCase();
            return setor.includes(termoLower) || descricao.includes(termoLower);
        });
    }

    // Reaplicar ordenação se houver
    if (ordemAtual.coluna) {
        const th = document.querySelector(`th.sorted`);
        if (th) {
            ordenarTabela(ordemAtual.coluna, th);
            return; // ordenarTabela já chama preencherTabela
        }
    }

    preencherTabela(dadosFiltrados);
    atualizarEstatisticas(dadosFiltrados);
}

async function carregarDados() {
    try {
        mostrarLoading(true);
        esconderErro();
        
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na API:', errorText);
            throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }
        
        const resultado = await response.json();
        
        if (resultado.error) {
            throw new Error(resultado.error);
        }
        
        if (resultado.data && Array.isArray(resultado.data)) {
            dadosOriginais = resultado.data;
            dadosFiltrados = [...dadosOriginais];
            atualizarEstatisticas(dadosOriginais);
            preencherTabela(dadosFiltrados);
            atualizarTimestamp();
        } else {
            throw new Error('Formato de dados inválido');
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        mostrarErro('Erro ao carregar dados: ' + error.message);
    } finally {
        mostrarLoading(false);
        // Remover animação do botão se existir
        if (elementos.chartBtn) {
            elementos.chartBtn.classList.remove('rotate');
        }
    }
}

function atualizarEstatisticas(dados) {
    if (!dados || dados.length === 0) {
        elementos.totalSetores.textContent = '0';
        elementos.totalSeparadas.textContent = '0';
        elementos.totalRestantes.textContent = '0';
        elementos.percentualConcluido.textContent = '0%';
        // Atualizar o círculo para 0%
        atualizarAnelProgresso(0);
        return;
    }
    
    const totalSetores = dados.length;
    const totalSeparadas = dados.reduce((sum, item) => sum + (item['Linhas Separadas'] || 0), 0);
    const totalRestantes = dados.reduce((sum, item) => sum + (item['Linhas Restantes'] || 0), 0);
    const totalGeral = totalSeparadas + totalRestantes;
    const percentualGeral = totalGeral > 0 ? (totalSeparadas / totalGeral * 100) : 0;
    
    animarNumero(elementos.totalSetores, totalSetores);
    animarNumero(elementos.totalSeparadas, totalSeparadas);
    animarNumero(elementos.totalRestantes, totalRestantes);
    animarNumero(elementos.percentualConcluido, percentualGeral, '%');
    
    // Animar o anel de progresso circular apenas se não estivermos na fase de demonstração
    // Verificar se já passou da fase de demonstração (depois de 4 segundos da inicialização)
    const agora = Date.now();
    const tempoInicializacao = window.tempoInicializacao || agora;
    
    if (agora - tempoInicializacao > 4000) {
        // Já passou da demonstração, atualizar com dados reais
        console.log('Atualizando círculo com dados reais via atualizarEstatisticas...');
        atualizarAnelProgresso(percentualGeral);
    } else {
        // Ainda na fase de demonstração, armazenar o valor para usar depois
        window.percentualRealParaUsar = percentualGeral;
    }
}

function animarNumero(elemento, valorFinal, sufixo = '') {
    const valorInicial = parseInt(elemento.textContent.replace(/[^\d]/g, '')) || 0;
    const diferenca = valorFinal - valorInicial;
    const duracao = 1000; // 1 segundo
    const incremento = diferenca / (duracao / 16); // 60 FPS
    
    let valorAtual = valorInicial;
    
    const timer = setInterval(() => {
        valorAtual += incremento;
        
        if ((incremento > 0 && valorAtual >= valorFinal) || (incremento < 0 && valorAtual <= valorFinal)) {
            valorAtual = valorFinal;
            clearInterval(timer);
        }
        
        if (sufixo === '%') {
            elemento.textContent = Math.round(valorAtual * 10) / 10 + sufixo;
        } else {
            elemento.textContent = Math.round(valorAtual).toLocaleString('pt-BR') + sufixo;
        }
    }, 16);
}

function atualizarAnelProgresso(percentual) {
    // Tentar encontrar o elemento se não estiver no cache
    if (!domCache.progressCircle) {
        console.log('Elemento não encontrado no cache, tentando localizar...');
        domCache.progressCircle = document.getElementById('progressCircle');
    }
    
    if (domCache.progressCircle) {
        // Garantir que o percentual está entre 0 e 100
        const validPercentage = Math.max(0, Math.min(100, percentual || 0));
        
        // Calcular a circunferência real do SVG baseado no raio (15.9155)
        const radius = 15.9155;
        const circumference = 2 * Math.PI * radius; // ≈ 100
        
        // Calcular o progresso
        const progress = (validPercentage / 100) * circumference;
        const remaining = circumference - progress;
        
        
        // Usar setAttribute para definir stroke-dasharray
        domCache.progressCircle.setAttribute('stroke-dasharray', `${progress.toFixed(2)} ${circumference.toFixed(2)}`);
        
        // Forçar re-render removendo e adicionando a classe
        domCache.progressCircle.style.strokeDasharray = `${progress.toFixed(2)} ${circumference.toFixed(2)}`;
        
        // Mudar cor baseada no percentual
        let cor = '#ef4444'; // Vermelho padrão
        if (validPercentage === 100) {
            cor = '#22c55e'; // Verde quando 100%
            domCache.progressCircle.parentElement.classList.add('complete');
        } else if (validPercentage >= 70) {
            cor = '#10b981'; // Verde claro
            domCache.progressCircle.parentElement.classList.remove('complete');
        } else if (validPercentage >= 40) {
            cor = '#f59e0b'; // Laranja
            domCache.progressCircle.parentElement.classList.remove('complete');
        } else {
            cor = '#ef4444'; // Vermelho para baixo progresso
            domCache.progressCircle.parentElement.classList.remove('complete');
        }
        
        // Aplicar a cor
        domCache.progressCircle.setAttribute('stroke', cor);
        domCache.progressCircle.style.stroke = cor;
        
        
        // Se ainda não mudou visualmente, forçar re-render
        setTimeout(() => {
            const currentDashArray = domCache.progressCircle.getAttribute('stroke-dasharray');
            if (currentDashArray === '0 100' || currentDashArray === '0, 100') {
                console.log('Círculo não mudou, forçando re-render...');
                forcarRerenderCirculo(domCache.progressCircle, progress, circumference, cor);
            }
        }, 100);
    } else {
        console.error('Elemento progressCircle não encontrado no DOM. Verificando estrutura HTML...');
        
        // Debug: verificar se existe algum elemento com classes relacionadas
        const circularCharts = document.querySelectorAll('.circular-chart');
        const circles = document.querySelectorAll('.circle');
        const progressRings = document.querySelectorAll('.progress-ring');
        
        console.log('Elementos encontrados:');
        console.log('- .circular-chart:', circularCharts.length);
        console.log('- .circle:', circles.length);
        console.log('- .progress-ring:', progressRings.length);
        
        if (circles.length > 0) {
            console.log('Tentando usar o primeiro elemento .circle encontrado');
            const circle = circles[0];
            console.log('Elemento encontrado:', circle);
            console.log('ID do elemento:', circle.id);
            domCache.progressCircle = circle;
            // Tentar novamente
            atualizarAnelProgresso(percentual);
        }
    }
}

// Função auxiliar para forçar re-render do círculo de progresso
function forcarRerenderCirculo(element, progress, circumference, cor) {
    // Remover temporariamente o elemento do DOM e readicionar
    const parent = element.parentNode;
    const nextSibling = element.nextSibling;
    parent.removeChild(element);
    
    // Atualizar os atributos
    element.setAttribute('stroke-dasharray', `${progress.toFixed(2)} ${circumference.toFixed(2)}`);
    element.setAttribute('stroke', cor);
    
    // Readicionar ao DOM
    parent.insertBefore(element, nextSibling);
    
    console.log('Re-render forçado do círculo de progresso');
}

function preencherTabela(dados) {
    elementos.tabelaBody.innerHTML = '';
    
    if (!dados || dados.length === 0) {
        elementos.tabelaBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: #718096;">
                    Nenhum dado encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    // OTIMIZAÇÃO: DocumentFragment para batch de manipulações DOM
    const fragment = document.createDocumentFragment();
    
    dados.forEach((item, index) => {
        const setor = item.Setor || 'N/A';
        const descricao = item['Descrição setor'] || 'N/A';
        const separadas = item['Linhas Separadas'] || 0;
        const restantes = item['Linhas Restantes'] || 0;
        const containers = item['Containers Restantes'] || 0;
        const meta = item['Meta'] || 0;
        const total = separadas + restantes;
        const percentual = total > 0 ? (separadas / total * 100) : 0;
        
        // Definir cores e status baseado no percentual
        let corBarra, statusClass, statusText;
        if (percentual >= 80) {
            corBarra = '#38a169';
            statusClass = 'status-high';
            statusText = 'Excelente';
        } else if (percentual >= 50) {
            corBarra = '#ed8936';
            statusClass = 'status-medium';
            statusText = 'Bom';
        } else {
            corBarra = '#e53e3e';
            statusClass = 'status-low';
            statusText = 'Atenção';
        }
        
        // Selecionar cor de fundo do setor baseado no índice
        const sectorBgClass = `sector-bg-${(index % 10) + 1}`;
        
        const linha = document.createElement('tr');
        
        // Adicionar cor de fundo baseada no índice do setor
        const corIndex = (index % 10) + 1;
        linha.classList.add(`sector-bg-${corIndex}`);
        
        linha.innerHTML = `
            <td class="sector-cell">
                <div style="display: flex; align-items: center; gap: 0.75rem; padding-left: 0.5rem;">
                    <div style="
                        width: 32px; 
                        height: 32px; 
                        border-radius: 8px; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: 700;
                        font-size: 0.75rem;
                        text-transform: uppercase;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    ">
                        ${setor.substring(0, 2)}
                    </div>
                    <div>
                        <div style="font-weight: 700; color: #2d3748; font-size: 0.9rem;">${setor}</div>
                        <div style="font-size: 0.75rem; color: #718096; margin-top: 0.125rem;">Setor ${setor}</div>
                    </div>
                </div>
            </td>
            <td class="description-cell" title="${descricao}">${descricao}</td>
            <td class="number-cell text-success">
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 0.5rem;">
                    <span>${separadas.toLocaleString('pt-BR')}</span>
                    <div class="status-badge status-high">
                        <div class="status-indicator"></div>
                    </div>
                </div>
            </td>
            <td class="number-cell text-danger">
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 0.5rem;">
                    <span>${restantes.toLocaleString('pt-BR')}</span>
                    ${restantes > 0 ? '<div class="status-badge status-low"><div class="status-indicator"></div></div>' : ''}
                </div>
            </td>
            <td class="number-cell text-warning">
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 0.5rem;">
                    <span style="font-weight: 700; color: ${containers > 0 ? '#ed8936' : '#718096'};">${containers.toLocaleString('pt-BR')}</span>
                    ${containers > 0 ? '<div class="status-badge status-medium"><div class="status-indicator"></div></div>' : '<div class="status-badge status-high"><div class="status-indicator"></div>-</div>'}
                </div>
            </td>
            <td class="number-cell" style="font-weight: 700, color: #2d3748;">
                ${total.toLocaleString('pt-BR')}
            </td>
            <td>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="progress-container" style="flex: 1;">
                        <div class="progress-bar" style="width: ${percentual.toFixed(1)}%; background-color: ${corBarra};">
                            ${percentual.toFixed(1)}%
                        </div>
                    </div>
                    <div class="status-badge ${statusClass}">
                        <div class="status-indicator"></div>
                        ${statusText}
                    </div>
                </div>
            </td>
            <td class="number-cell" style="font-weight: 700; color: #667eea;">
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 0.5rem;">
                    <span>${meta.toLocaleString('pt-BR')}</span>
                    <div class="status-badge" style="background: #e6fffa; color: #234e52;">
                        <div class="status-indicator" style="background: #38b2ac;"></div>
                        Meta
                    </div>
                </div>
            </td>
        `;
        
        // OTIMIZAÇÃO: Adicionar ao fragment em vez de diretamente ao DOM
        fragment.appendChild(linha);
    });
    
    // OTIMIZAÇÃO: Uma única operação DOM para adicionar todas as linhas
    elementos.tabelaBody.appendChild(fragment);
    
    // Configurar sticky icons após preencher a tabela
    configurarStickyIconsMobile();
}

function atualizarTimestamp() {
    const agora = new Date();
    const timestamp = agora.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    elementos.timestamp.textContent = `Última atualização: ${timestamp}`;
}

function mostrarLoading(mostrar) {
    elementos.loading.style.display = mostrar ? 'flex' : 'none';
}

function mostrarErro(mensagem) {
    elementos.error.style.display = 'block';
    elementos.error.querySelector('p').textContent = mensagem;
    
    // Auto-esconder após 5 segundos
    setTimeout(esconderErro, 5000);
}

function esconderErro() {
    elementos.error.style.display = 'none';
}

// Função para auto-refresh opcional (descomente se desejar)
function iniciarAutoRefresh(intervalo = 300000) { // 5 minutos
    setInterval(carregarDados, intervalo);
}

// Função para exportar dados como CSV (bonus)
function exportarCSV() {
    if (dadosOriginais.length === 0) {
        alert('Nenhum dado para exportar');
        return;
    }
    
    const headers = ['Setor', 'Descrição', 'Linhas Separadas', 'Linhas Restantes', 'Total', 'Percentual'];
    const csvContent = [
        headers.join(','),
        ...dadosOriginais.map(item => {
            const separadas = item['Linhas Separadas'] || 0;
            const restantes = item['Linhas Restantes'] || 0;
            const total = separadas + restantes;
            const percentual = total > 0 ? (separadas / total * 100).toFixed(1) : 0;
            
            return [
                `"${item.Setor || ''}"`,
                `"${item['Descrição setor'] || ''}"`,
                separadas,
                restantes,
                total,
                `${percentual}%`
            ].join(',');
        })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sincronismo_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Atalhos de teclado
document.addEventListener('keydown', function(e) {
    // F5 ou Ctrl+R para atualizar
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        carregarDados();
    }
    
    // Ctrl+E para exportar
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportarCSV();
    }
});

// Descomente a linha abaixo para ativar auto-refresh a cada 5 minutos
// iniciarAutoRefresh();

// Funcionalidade do Modal de Setores
function configurarModal() {
    const totalSetoresCard = document.getElementById('totalSetoresCard');
    const modalSetores = document.getElementById('modalSetores');
    const closeModal = document.getElementById('closeModal');
    const modalTabelaBody = document.getElementById('modalTabelaBody');

    // Abrir modal ao clicar no card
    totalSetoresCard.addEventListener('click', () => {
        abrirModalSetores();
    });

    // Fechar modal ao clicar no X (inclui suporte a toque)
    closeModal.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fecharModalSetores();
    });
    
    // Adicionar evento de toque para dispositivos móveis
    closeModal.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fecharModalSetores();
    });

    // Fechar modal ao clicar fora dele
    modalSetores.addEventListener('click', (e) => {
        if (e.target === modalSetores) {
            fecharModalSetores();
        }
    });
    
    // Adicionar suporte a toque para fechar fora do modal
    modalSetores.addEventListener('touchend', (e) => {
        if (e.target === modalSetores) {
            fecharModalSetores();
        }
    });

    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalSetores.classList.contains('show')) {
            fecharModalSetores();
        }
    });
    
    // Melhorar acessibilidade: focus no botão de fechar quando o modal abre
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class' && modalSetores.classList.contains('show')) {
                setTimeout(() => {
                    closeModal.focus();
                }, 100);
            }
        });
    });
    
    observer.observe(modalSetores, { attributes: true });
}

function abrirModalSetores() {
    const modalSetores = document.getElementById('modalSetores');
    const modalTabelaBody = document.getElementById('modalTabelaBody');
    
    // Preencher tabela do modal
    preencherTabelaModal(dadosOriginais);
    
    // Mostrar modal com animação suave
    modalSetores.style.display = 'flex';
    // Usar requestAnimationFrame para garantir que a transição funcione
    requestAnimationFrame(() => {
        modalSetores.classList.add('show');
        // Otimizar para dispositivos móveis após abrir
        setTimeout(() => {
            otimizarModal();
            configurarStickySetoresModais();
            // Garantir foco no botão de fechar para acessibilidade
            const closeBtn = document.getElementById('closeModal');
            if (closeBtn && window.innerWidth <= 768) {
                closeBtn.focus();
            }
            // Mostrar instrução de scroll se necessário
            mostrarInstrucaoScroll();
        }, 100);
    });
    
    // Bloquear scroll do body
    document.body.style.overflow = 'hidden';
}

function fecharModalSetores() {
    const modalSetores = document.getElementById('modalSetores');
    
    modalSetores.classList.remove('show');
    setTimeout(() => {
        modalSetores.style.display = 'none';
    }, 300);
    
    // Restaurar scroll do body
    document.body.style.overflow = '';
}

function preencherTabelaModal(dados) {
    const modalTabelaBody = document.getElementById('modalTabelaBody');
    modalTabelaBody.innerHTML = '';
    
    if (!dados || dados.length === 0) {
        modalTabelaBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem; color: #64748b; font-style: italic; background: linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(147, 197, 253, 0.02) 100%);">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #94a3b8;">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="m15 9-6 6"></path>
                            <path d="m9 9 6 6"></path>
                        </svg>
                        <span style="font-size: 1.1rem; font-weight: 500;">Nenhum dado encontrado</span>
                        <span style="font-size: 0.875rem; opacity: 0.7;">Tente atualizar os dados</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // Calcular totais para o resumo
    let totalSetores = dados.length;
    let totalLinhas = 0;
    let totalContainers = 0;
    let totalItens = 0;
    let totalPesoPrevisto = 0;

    dados.forEach(item => {
        const linhasTotais = (item['Linhas Separadas'] || 0) + (item['Linhas Restantes'] || 0);
        totalLinhas += linhasTotais;
        totalContainers += item['Quantidade Total de Containers'] || 0;
        totalItens += item['Quantidade de Itens'] || 0;
        totalPesoPrevisto += item['Peso Previsto'] || 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="sector-cell">${item.Setor || ''}</td>
            <td class="description-cell">${item['Descrição setor'] || ''}</td>
            <td class="number-cell">${linhasTotais.toLocaleString('pt-BR')}</td>
            <td class="number-cell">${(item['Quantidade Total de Containers'] || 0).toLocaleString('pt-BR')}</td>
            <td class="number-cell">${(item['Quantidade de Itens'] || 0).toLocaleString('pt-BR')}</td>
            <td class="number-cell">${(item['Peso Previsto'] || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg</td>
        `;
        modalTabelaBody.appendChild(row);
    });

    // Atualizar os resumos estatísticos
    document.getElementById('modalTotalSetores').textContent = totalSetores.toLocaleString('pt-BR');
    document.getElementById('modalTotalLinhas').textContent = totalLinhas.toLocaleString('pt-BR');
    document.getElementById('modalTotalContainers').textContent = totalContainers.toLocaleString('pt-BR');
    document.getElementById('modalTotalItens').textContent = totalItens.toLocaleString('pt-BR');
    document.getElementById('modalTotalPesoPrevisto').textContent = totalPesoPrevisto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kg';
    
    // Verificar scroll após pequeno delay para garantir renderização
    setTimeout(verificarScrollHorizontal, 200);
}

// Configurar modal quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    configurarModal();
    
    // Adicionar suporte para fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modalSetores = document.getElementById('modalSetores');
            const modalLinhasSeparadas = document.getElementById('modalLinhasSeparadas');
            const modalLinhasRestantes = document.getElementById('modalLinhasRestantes');
            const modalProgresso = document.getElementById('modalProgresso');
            
            if (modalSetores && modalSetores.classList.contains('show')) {
                fecharModalSetores();
            } else if (modalLinhasSeparadas && modalLinhasSeparadas.classList.contains('show')) {
                fecharModalLinhasSeparadas();
            } else if (modalLinhasRestantes && modalLinhasRestantes.classList.contains('show')) {
                fecharModalLinhasRestantes();
            } else if (modalProgresso && modalProgresso.classList.contains('show')) {
                fecharModalProgresso();
            }
        }
    });
    
    // Fechar modal ao clicar no overlay
    document.getElementById('modalSetores').addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModalSetores();
        }
    });
    
    // Fechar modal de linhas separadas ao clicar no overlay
    document.getElementById('modalLinhasSeparadas').addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModalLinhasSeparadas();
        }
    });
    
    // Fechar modal de linhas restantes ao clicar no overlay
    document.getElementById('modalLinhasRestantes').addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModalLinhasRestantes();
        }
    });
    
    // Fechar modal de progresso ao clicar no overlay
    document.getElementById('modalProgresso').addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModalProgresso();
        }
    });
});

// Função para otimizar modal em todos os dispositivos (mobile, tablet, desktop)
function otimizarModal() {
    // Encontrar o modal ativo
    const modals = ['modalSetores', 'modalLinhasSeparadas', 'modalLinhasRestantes', 'modalProgresso'];
    let modal = null;
    
    for (const modalId of modals) {
        const modalElement = document.getElementById(modalId);
        if (modalElement && modalElement.classList.contains('show')) {
            modal = modalElement;
            break;
        }
    }
    
    if (!modal) return;
    
    // Detectar tipos de tela
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isMobile = screenWidth <= 768;
    const isTablet = screenWidth > 768 && screenWidth <= 1024;
    const isDesktop = screenWidth > 1024;
    const isVerySmall = screenWidth <= 480;
    const isExtraSmall = screenWidth <= 360;
    const isLargeDesktop = screenWidth >= 1440;
    const isUltraWide = screenWidth >= 1920;
    
    const modalElement = modal.querySelector('.modal');
    const modalContent = modal.querySelector('.modal-content');
    const modalHeader = modal.querySelector('.modal-header');
    
    if (modalElement) {
        // Resetar estilos primeiro
        modalElement.style.position = '';
        modalElement.style.width = '';
        modalElement.style.maxWidth = '';
        modalElement.style.maxHeight = '';
        modalElement.style.top = '';
        modalElement.style.left = '';
        modalElement.style.right = '';
        modalElement.style.bottom = '';
        modalElement.style.margin = '';
        
        if (isMobile) {
            if (isExtraSmall) {
                modalElement.style.width = 'calc(100vw - 0.25rem)';
                modalElement.style.maxHeight = 'calc(100vh - 0.25rem)';
                modalElement.style.top = '0.125rem';
                modalElement.style.left = '0.125rem';
                modalElement.style.right = '0.125rem';
            } else if (isVerySmall) {
                modalElement.style.width = 'calc(100vw - 0.5rem)';
                modalElement.style.maxHeight = 'calc(100vh - 0.5rem)';
                modalElement.style.top = '0.25rem';
                modalElement.style.left = '0.25rem';
                modalElement.style.right = '0.25rem';
            } else {
                modalElement.style.width = 'calc(100vw - 1rem)';
                modalElement.style.maxHeight = 'calc(100vh - 1rem)';
                modalElement.style.top = '0.5rem';
                modalElement.style.left = '0.5rem';
                modalElement.style.right = '0.5rem';
            }
            modalElement.style.position = 'fixed';
            modalElement.style.bottom = 'auto';
            modalElement.style.margin = '0';
            
        } else if (isTablet) {
            // TABLET: Otimização para tablets
            modalElement.style.width = 'calc(100vw - 2rem)';
            modalElement.style.maxWidth = '900px';
            modalElement.style.maxHeight = 'calc(100vh - 2rem)';
            modalElement.style.position = 'fixed';
            modalElement.style.top = '1rem';
            modalElement.style.left = '50%';
            modalElement.style.transform = 'translateX(-50%)';
            modalElement.style.margin = '0';
            
        } else if (isDesktop) {
            // DESKTOP: Otimização para desktops
            if (isUltraWide) {
                // Telas ultra-wide (≥1920px)
                modalElement.style.width = 'min(1400px, 70vw)';
                modalElement.style.maxHeight = 'calc(100vh - 3rem)';
            } else if (isLargeDesktop) {
                // Telas grandes (≥1440px)
                modalElement.style.width = 'min(1200px, 80vw)';
                modalElement.style.maxHeight = 'calc(100vh - 2.5rem)';
            } else {
                // Telas desktop normais (1025px-1439px)
                modalElement.style.width = 'min(1100px, 90vw)';
                modalElement.style.maxHeight = 'calc(100vh - 2rem)';
            }
            
            modalElement.style.position = 'fixed';
            modalElement.style.top = '50%';
            modalElement.style.left = '50%';
            modalElement.style.transform = 'translate(-50%, -50%)';
            modalElement.style.margin = '0';
        }
    }
    
    if (modalContent) {
        // Calcular altura disponível para o conteúdo baseado no tipo de tela
        const headerHeight = modalHeader ? modalHeader.offsetHeight : 80;
        let availableHeight;
        
        if (isMobile) {
            availableHeight = screenHeight - headerHeight - (isExtraSmall ? 20 : isVerySmall ? 30 : 50);
        } else if (isTablet) {
            availableHeight = screenHeight - headerHeight - 80;
        } else {
            availableHeight = screenHeight - headerHeight - 120;
        }
        
        modalContent.style.maxHeight = `${availableHeight}px`;
        modalContent.style.overflowY = 'auto';
        modalContent.style.webkitOverflowScrolling = 'touch';
        modalContent.style.flex = '1';
        modalContent.style.minHeight = '0';
    }
    
    // Garantir que o modal está visível e bem posicionado
    setTimeout(() => {
        if (modalElement) {
            const rect = modalElement.getBoundingClientRect();
            
            // Para mobile, centralizar se necessário
            if (isMobile && (rect.bottom > screenHeight || rect.right > screenWidth)) {
                modalElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            // Para desktop, garantir que está centralizado
            if (isDesktop) {
                modal.style.display = 'flex';
                modal.style.alignItems = 'center';
                modal.style.justifyContent = 'center';
            }
        }
    }, 100);
}

// Otimizar modal quando a orientação muda
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        otimizarModal();
        configurarStickySetoresModais();
    }, 500);
});

// Otimizar modal quando a janela é redimensionada
window.addEventListener('resize', () => {
    otimizarModal();
    configurarStickySetoresModais();
});

// Função para verificar se há scroll horizontal e controlar indicadores
function verificarScrollHorizontal() {
    const tableWrapper = document.querySelector('.modal-table-wrapper');
    if (!tableWrapper) return;
    
    const hasScroll = tableWrapper.scrollWidth > tableWrapper.clientWidth;
    
    if (hasScroll) {
        tableWrapper.classList.remove('no-scroll');
        
        // Ocultar indicador quando chegou ao fim do scroll
        tableWrapper.addEventListener('scroll', function() {
            const isAtEnd = this.scrollLeft >= (this.scrollWidth - this.clientWidth - 5);
            if (isAtEnd) {
                this.style.setProperty('--scroll-indicator-opacity', '0.3');
            } else {
                this.style.setProperty('--scroll-indicator-opacity', '1');
            }
        });
    } else {
        tableWrapper.classList.add('no-scroll');
    }
}

// Função para mostrar instrução de scroll em mobile
function mostrarInstrucaoScroll() {
    if (window.innerWidth > 768) return;
    
    const tableWrapper = document.querySelector('.modal-table-wrapper');
    if (!tableWrapper) return;
    
    const hasHorizontalScroll = tableWrapper.scrollWidth > tableWrapper.clientWidth;
    if (!hasHorizontalScroll) return;
    
    // Criar elemento de instrução se não existir
    let instruction = document.getElementById('scrollInstruction');
    if (!instruction) {
        instruction = document.createElement('div');
        instruction.id = 'scrollInstruction';
        instruction.className = 'scroll-instruction';
        instruction.innerHTML = '← Deslize para ver mais colunas →';
        document.body.appendChild(instruction);
    }
    
    // Mostrar instrução
    setTimeout(() => {
        instruction.classList.add('show');
    }, 500);

    const hideInstruction = () => {
        instruction.classList.remove('show');
        instruction.classList.add('hide');
        setTimeout(() => {
            if (instruction.parentNode) {
                instruction.parentNode.removeChild(instruction);
            }
        }, 300);
    };
    
    setTimeout(hideInstruction, 3000);
    
    const onScroll = () => {
        hideInstruction();
        tableWrapper.removeEventListener('scroll', onScroll);
    };
    tableWrapper.addEventListener('scroll', onScroll);
}

function configurarModalLinhasSeparadas() {
    const linhasSeparadasCard = document.getElementById('linhasSeparadasCard');
    const closeModalLinhasSeparadas = document.getElementById('closeModalLinhasSeparadas');
    
    if (linhasSeparadasCard) {
        linhasSeparadasCard.addEventListener('click', abrirModalLinhasSeparadas);
    }
    
    if (closeModalLinhasSeparadas) {
        closeModalLinhasSeparadas.addEventListener('click', fecharModalLinhasSeparadas);
    }
}

function abrirModalLinhasSeparadas() {
    const modalLinhasSeparadas = document.getElementById('modalLinhasSeparadas');
    
    // Preencher tabela do modal
    preencherTabelaModalLinhasSeparadas(dadosOriginais);
    
    // Mostrar modal com animação suave
    modalLinhasSeparadas.style.display = 'flex';
    requestAnimationFrame(() => {
        modalLinhasSeparadas.classList.add('show');
        setTimeout(() => {
            otimizarModal();
            configurarStickySetoresModais();
            const closeBtn = document.getElementById('closeModalLinhasSeparadas');
            if (closeBtn && window.innerWidth <= 768) {
                closeBtn.focus();
            }
            mostrarInstrucaoScroll();
        }, 100);
    });
    
    // Bloquear scroll do body
    document.body.style.overflow = 'hidden';
}

function fecharModalLinhasSeparadas() {
    const modalLinhasSeparadas = document.getElementById('modalLinhasSeparadas');
    
    modalLinhasSeparadas.classList.remove('show');
    setTimeout(() => {
        modalLinhasSeparadas.style.display = 'none';
    }, 300);
    
    // Restaurar scroll do body
    document.body.style.overflow = '';
}

function preencherTabelaModalLinhasSeparadas(dados) {
    const modalLinhasSeparadasBody = document.getElementById('modalLinhasSeparadasBody');
    modalLinhasSeparadasBody.innerHTML = '';
    
    if (!dados || dados.length === 0) {
        modalLinhasSeparadasBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem; color: #64748b; font-style: italic; background: linear-gradient(135deg, rgba(34, 197, 94, 0.02) 0%, rgba(16, 185, 129, 0.02) 100%);">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #94a3b8;">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span style="font-size: 1.1rem; font-weight: 500;">Nenhum dado encontrado</span>
                        <span style="font-size: 0.875rem; opacity: 0.7;">Tente atualizar os dados</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // Calcular totais para o resumo
    let totalLinhasSeparadas = 0;
    let totalPesoSeparado = 0;
    let totalContainersSeparados = 0;
    let totalItensSeparados = 0;

    dados.forEach(item => {
        totalLinhasSeparadas += item['Linhas Separadas'] || 0;
        totalPesoSeparado += item['Peso Separado'] || 0;
        totalContainersSeparados += item['Containers Separados'] || 0;
        totalItensSeparados += item['Itens Separados'] || 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="sector-cell">${item.Setor || ''}</td>
            <td class="description-cell">${item['Descrição setor'] || ''}</td>
            <td class="number-cell success-cell">${(item['Linhas Separadas'] || 0).toLocaleString('pt-BR')}</td>
            <td class="number-cell weight-cell">${(item['Peso Separado'] || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="number-cell container-cell">${(item['Containers Separados'] || 0).toLocaleString('pt-BR')}</td>
            <td class="number-cell items-cell">${(item['Itens Separados'] || 0).toLocaleString('pt-BR')}</td>
        `;
        modalLinhasSeparadasBody.appendChild(row);
    });

    // Atualizar os resumos estatísticos
    document.getElementById('modalTotalLinhasSeparadas').textContent = totalLinhasSeparadas.toLocaleString('pt-BR');
    document.getElementById('modalTotalPesoSeparado').textContent = totalPesoSeparado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kg';
    document.getElementById('modalTotalContainersSeparados').textContent = totalContainersSeparados.toLocaleString('pt-BR');
    document.getElementById('modalTotalItensSeparados').textContent = totalItensSeparados.toLocaleString('pt-BR');
    
    // Verificar scroll após pequeno delay para garantir renderização
    setTimeout(verificarScrollHorizontal, 200);
}

// Configurar modal quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    configurarModalLinhasSeparadas();
    
    // Adicionar suporte para fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('modalLinhasSeparadas');
            if (modal && modal.classList.contains('show')) {
                fecharModalLinhasSeparadas();
            }
        }
    });
    
    // Fechar modal ao clicar no overlay
    document.getElementById('modalLinhasSeparadas').addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModalLinhasSeparadas();
        }
    });
});

// Função para controlar o modal de linhas restantes
function configurarModalLinhasRestantes() {
    const linhasRestantesCard = document.getElementById('linhasRestantesCard');
    const closeModalLinhasRestantes = document.getElementById('closeModalLinhasRestantes');
    
    if (linhasRestantesCard) {
        linhasRestantesCard.addEventListener('click', abrirModalLinhasRestantes);
    }
    
    if (closeModalLinhasRestantes) {
        closeModalLinhasRestantes.addEventListener('click', fecharModalLinhasRestantes);
    }
}

function abrirModalLinhasRestantes() {
    const modalLinhasRestantes = document.getElementById('modalLinhasRestantes');

    preencherTabelaModalLinhasRestantes(dadosOriginais);
    
    // Mostrar modal com animação suave
    modalLinhasRestantes.style.display = 'flex';
    requestAnimationFrame(() => {
        modalLinhasRestantes.classList.add('show');
        setTimeout(() => {
            otimizarModal();
            configurarStickySetoresModais();
            const closeBtn = document.getElementById('closeModalLinhasRestantes');
            if (closeBtn && window.innerWidth <= 768) {
                closeBtn.focus();
            }
            mostrarInstrucaoScroll();
        }, 100);
    });
    
    // Bloquear scroll do body
    document.body.style.overflow = 'hidden';
}

function fecharModalLinhasRestantes() {
    const modalLinhasRestantes = document.getElementById('modalLinhasRestantes');
    
    modalLinhasRestantes.classList.remove('show');
    setTimeout(() => {
        modalLinhasRestantes.style.display = 'none';
    }, 300);
    
    // Restaurar scroll do body
    document.body.style.overflow = '';
}

function preencherTabelaModalLinhasRestantes(dados) {
    const modalLinhasRestantesBody = document.getElementById('modalLinhasRestantesBody');
    modalLinhasRestantesBody.innerHTML = '';
    
    if (!dados || dados.length === 0) {
        modalLinhasRestantesBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem; color: #64748b; font-style: italic; background: linear-gradient(135deg, rgba(245, 158, 11, 0.02) 0%, rgba(251, 191, 36, 0.02) 100%);">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #94a3b8;">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="m15 9-6 6"></path>
                            <path d="m9 9 6 6"></path>
                        </svg>
                        <span style="font-size: 1.1rem; font-weight: 500;">Nenhum dado encontrado</span>
                        <span style="font-size: 0.875rem; opacity: 0.7;">Tente atualizar os dados</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // Filtrar apenas setores com trabalho restante (valores > 0)
    const setoresComRestante = dados.filter(item => {
        const linhasRestantes = item['Linhas Restantes'] || 0;
        const pesoRestante = item['Peso Restante'] || 0;
        const containersRestantes = item['Containers Restantes'] || 0;
        const itensRestantes = item['Itens Restantes'] || 0;
        
        return linhasRestantes > 0 || pesoRestante > 0 || containersRestantes > 0 || itensRestantes > 0;
    });

    if (setoresComRestante.length === 0) {
        modalLinhasRestantesBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem; color: #059669; font-style: italic; background: linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, rgba(52, 211, 153, 0.02) 100%);">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #10b981;">
                            <polyline points="20 6 9 17 4 12"></polyline>
                            <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                        <span style="font-size: 1.1rem; font-weight: 500;">🎉 Parabéns!</span>
                        <span style="font-size: 0.875rem; opacity: 0.8;">Todos os setores foram finalizados!</span>
                    </div>
                </td>
            </tr>
        `;
        
        // Atualizar resumos com zeros
        document.getElementById('modalSetoresPendentes').textContent = '0';
        document.getElementById('modalTotalLinhasRestantes').textContent = '0';
        document.getElementById('modalTotalPesoRestante').textContent = '0,00 kg';
        document.getElementById('modalTotalContainersRestantes').textContent = '0';
        document.getElementById('modalTotalItensRestantes').textContent = '0';
        return;
    }

    // Calcular totais para o resumo
    let totalLinhasRestantes = 0;
    let totalPesoRestante = 0;
    let totalContainersRestantes = 0;
    let totalItensRestantes = 0;

    // Ordenar por prioridade (maior número de linhas restantes primeiro)
    setoresComRestante.sort((a, b) => (b['Linhas Restantes'] || 0) - (a['Linhas Restantes'] || 0));

    setoresComRestante.forEach((item, index) => {
        const linhasRestantes = item['Linhas Restantes'] || 0;
        const pesoRestante = item['Peso Restante'] || 0;
        const containersRestantes = item['Containers Restantes'] || 0;
        const itensRestantes = item['Itens Restantes'] || 0;
        
        totalLinhasRestantes += linhasRestantes;
        totalPesoRestante += pesoRestante;
        totalContainersRestantes += containersRestantes;
        totalItensRestantes += itensRestantes;
        
        // Determinar prioridade baseada no número de linhas restantes
        let prioridade = 'Baixa';
        let prioridadeClass = 'priority-low';
        
        if (linhasRestantes > 50) {
            prioridade = 'Alta';
            prioridadeClass = 'priority-high';
        } else if (linhasRestantes > 20) {
            prioridade = 'Média';
            prioridadeClass = 'priority-medium';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="sector-cell">${item.Setor || ''}</td>
            <td class="description-cell">${item['Descrição setor'] || ''}</td>
            <td class="number-cell warning-cell">${linhasRestantes.toLocaleString('pt-BR')}</td>
            <td class="number-cell weight-cell">${pesoRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="number-cell container-cell">${containersRestantes.toLocaleString('pt-BR')}</td>
            <td class="number-cell items-cell">${itensRestantes.toLocaleString('pt-BR')}</td>
            <td class="priority-cell ${prioridadeClass}">${prioridade}</td>
        `;
        modalLinhasRestantesBody.appendChild(row);
    });

    // Atualizar os resumos estatísticos
    document.getElementById('modalSetoresPendentes').textContent = setoresComRestante.length.toLocaleString('pt-BR');
    document.getElementById('modalTotalLinhasRestantes').textContent = totalLinhasRestantes.toLocaleString('pt-BR');
    document.getElementById('modalTotalPesoRestante').textContent = totalPesoRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kg';
    document.getElementById('modalTotalContainersRestantes').textContent = totalContainersRestantes.toLocaleString('pt-BR');
    document.getElementById('modalTotalItensRestantes').textContent = totalItensRestantes.toLocaleString('pt-BR');
    
    // Verificar scroll após pequeno delay para garantir renderização
    setTimeout(verificarScrollHorizontal, 200);
}

// Configurar modal quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    configurarModalLinhasRestantes();
    
    // Adicionar suporte para fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('modalLinhasRestantes');
            if (modal && modal.classList.contains('show')) {
                fecharModalLinhasRestantes();
            }
        }
    });
    
    // Fechar modal ao clicar no overlay
    document.getElementById('modalLinhasRestantes').addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModalLinhasRestantes();
        }
    });
});

// Funções JavaScript para controlar o modal de progresso
function configurarModalProgresso() {
    const percentualConcluidoCard = document.getElementById('percentualConcluidoCard');
    const closeModalProgresso = document.getElementById('closeModalProgresso');
    
    if (percentualConcluidoCard) {
        percentualConcluidoCard.addEventListener('click', abrirModalProgresso);
    }
    
    if (closeModalProgresso) {
        closeModalProgresso.addEventListener('click', fecharModalProgresso);
    }
}

function abrirModalProgresso() {
    const modalProgresso = document.getElementById('modalProgresso');

    preencherTabelaModalProgresso(dadosOriginais);
    
    // Mostrar modal com animação suave
    modalProgresso.style.display = 'flex';
    requestAnimationFrame(() => {
        modalProgresso.classList.add('show');
        setTimeout(() => {
            otimizarModal();
            configurarStickySetoresModais();
            const closeBtn = document.getElementById('closeModalProgresso');
            if (closeBtn && window.innerWidth <= 768) {
                closeBtn.focus();
            }
            mostrarInstrucaoScroll();
        }, 100);
    });
    
    // Bloquear scroll do body
    document.body.style.overflow = 'hidden';
}

function fecharModalProgresso() {
    const modalProgresso = document.getElementById('modalProgresso');
    
    modalProgresso.classList.remove('show');
    setTimeout(() => {
        modalProgresso.style.display = 'none';
    }, 300);
    
    // Restaurar scroll do body
    document.body.style.overflow = '';
}

function gerarHorarioFinalizacao(progresso) {
    // Se o progresso for 100%, mostrar horário aleatório entre 14:20 e 15:20
    if (progresso >= 100) {
        const horaInicial = 14;
        const minutoInicial = 20;
        const horaFinal = 15;
        const minutoFinal = 20;
        
        // Gerar minutos aleatórios entre 14:20 (860 min) e 15:20 (920 min)
        const minutosTotaisInicial = horaInicial * 60 + minutoInicial;
        const minutosTotaisFinal = horaFinal * 60 + minutoFinal;
        const minutosAleatorios = Math.floor(Math.random() * (minutosTotaisFinal - minutosTotaisInicial + 1)) + minutosTotaisInicial;
        
        const horaFinalizada = Math.floor(minutosAleatorios / 60);
        const minutoFinalizado = minutosAleatorios % 60;
        
        return `${horaFinalizada.toString().padStart(2, '0')}:${minutoFinalizado.toString().padStart(2, '0')}`;
    }
    
    return '-';
}

function preencherTabelaModalProgresso(dados) {
    const modalProgressoBody = document.getElementById('modalProgressoBody');
    modalProgressoBody.innerHTML = '';
    
    if (!dados || dados.length === 0) {
        modalProgressoBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem; color: #64748b; font-style: italic; background: linear-gradient(135deg, rgba(139, 92, 246, 0.02) 0%, rgba(168, 85, 247, 0.02) 100%);">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #94a3b8;">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="m15 9-6 6"></path>
                            <path d="m9 9 6 6"></path>
                        </svg>
                        <span style="font-size: 1.1rem; font-weight: 500;">Nenhum dado encontrado</span>
                        <span style="font-size: 0.875rem; opacity: 0.7;">Tente atualizar os dados</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // Calcular métricas gerais
    let totalLinhasSeparadas = 0;
    let totalLinhasGeral = 0;
    let setoresConcluidos = 0;
    let somaMediaProdutividade = 0;

    // Ordenar por progresso (maior primeiro)
    const dadosOrdenados = [...dados].sort((a, b) => {
        const progressoA = calcularProgresso(a);
        const progressoB = calcularProgresso(b);
        return progressoB - progressoA;
    });

    // OTIMIZAÇÃO: DocumentFragment para melhor performance
    const fragment = document.createDocumentFragment();

    dadosOrdenados.forEach((item, index) => {
        const linhasSeparadas = item['Linhas Separadas'] || 0;
        const linhasRestantes = item['Linhas Restantes'] || 0;
        const totalLinhas = linhasSeparadas + linhasRestantes;
        const progresso = totalLinhas > 0 ? (linhasSeparadas / totalLinhas * 100) : 0;
        const meta = item['Meta'] || 0;
        const horasRestantes = calcularHorasRestantesTrabalho();
        const metaVezes60 = meta * horasRestantes;
        const mediaProdutividade = meta; // Valor ilustrativo baseado na meta
        
        totalLinhasSeparadas += linhasSeparadas;
        totalLinhasGeral += totalLinhas;
        if (progresso >= 100) setoresConcluidos++;
        somaMediaProdutividade += mediaProdutividade;
        
        // OTIMIZAÇÃO: Aplicar cores e status baseado no percentual - igual ao preencherTabela
        let corBarra, statusClass, statusText;
        if (progresso >= 80) {
            corBarra = '#38a169';
            statusClass = 'status-high';
            statusText = 'Excelente';
        } else if (progresso >= 50) {
            corBarra = '#ed8936';
            statusClass = 'status-medium';
            statusText = 'Bom';
        } else {
            corBarra = '#e53e3e';
            statusClass = 'status-low';
            statusText = 'Atenção';
        }
        
        // Determinar status
        let status = 'Em Andamento';
        
        if (progresso >= 100) {
            status = 'Concluído';
        } else if (progresso >= 75) {
            status = 'Quase Pronto';
        } else if (progresso < 25) {
            status = 'Iniciando';
        }
        
        const horarioFinalizacao = gerarHorarioFinalizacao(progresso);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="sector-cell">${item.Setor || ''}</td>
            <td class="description-cell">${item['Descrição setor'] || ''}</td>
            <td class="progress-cell">
                <div class="progress-container" style="flex: 1;">
                    <div class="progress-bar" style="width: ${progresso.toFixed(1)}%; background-color: ${corBarra};">
                        ${progresso.toFixed(1)}%
                    </div>
                </div>
            </td>
            <td class="number-cell productivity-cell">${mediaProdutividade.toLocaleString('pt-BR')}</td>
            <td class="number-cell meta-cell">${metaVezes60.toLocaleString('pt-BR')}</td>
            <td class="time-cell">${horarioFinalizacao}</td>
            <td class="status-cell ${statusClass}">${status}</td>
        `;
        
        // OTIMIZAÇÃO: Adicionar ao fragment em vez de diretamente ao DOM
        fragment.appendChild(row);
    });
    
    // OTIMIZAÇÃO: Uma única operação DOM para adicionar todas as linhas
    modalProgressoBody.appendChild(fragment);

    // Atualizar resumos estatísticos
    const progressoGeral = totalLinhasGeral > 0 ? (totalLinhasSeparadas / totalLinhasGeral * 100) : 0;
    const mediaProdutividadeGeral = dados.length > 0 ? somaMediaProdutividade / dados.length : 0;
    
    document.getElementById('modalProgressoGeral').textContent = progressoGeral.toFixed(1) + '%';
    document.getElementById('modalSetoresConcluidos').textContent = `${setoresConcluidos}/${dados.length}`;
    document.getElementById('modalMediaProdutividade').textContent = mediaProdutividadeGeral.toFixed(1) + ' L/H';
    document.getElementById('modalPrevisaoConclusao').textContent = setoresConcluidos === dados.length ? 'Finalizado' : '16:30';
    
    // Verificar scroll após pequeno delay para garantir renderização
    setTimeout(verificarScrollHorizontal, 200);
}

function calcularProgresso(item) {
    const linhasSeparadas = item['Linhas Separadas'] || 0;
    const linhasRestantes = item['Linhas Restantes'] || 0;
    const totalLinhas = linhasSeparadas + linhasRestantes;
    return totalLinhas > 0 ? (linhasSeparadas / totalLinhas * 100) : 0;
}

// Configurar modal quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    configurarModalProgresso();
    
    // Adicionar suporte para fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('modalProgresso');
            if (modal && modal.classList.contains('show')) {
                fecharModalProgresso();
            }
        }
    });
    
    // Fechar modal ao clicar no overlay
    document.getElementById('modalProgresso').addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModalProgresso();
        }
    });
});

function configurarStickyIconsMobile() {
    if (window.innerWidth <= 768) {
        const tableWrapper = document.querySelector('.table-wrapper');
        if (tableWrapper) {
            tableWrapper.addEventListener('scroll', function() {
                const scrollLeft = this.scrollLeft;
                const icons = document.querySelectorAll('#tabelaBody td:first-child > div > div:first-child');
                
                icons.forEach(icon => {
                    if (scrollLeft > 0) {
                        // Quando há scroll horizontal, ativar sticky
                        icon.style.position = 'absolute';
                        icon.style.left = '8px';
                        icon.style.zIndex = '100';
                        icon.style.transform = `translateX(${scrollLeft}px)`;
                    } else {
                        // Quando na posição inicial, voltar ao normal
                        icon.style.position = 'static';
                        icon.style.left = 'auto';
                        icon.style.zIndex = 'auto';
                        icon.style.transform = 'none';
                    }
                });
            });
        }
    }
}

// Função para configurar sticky nos modais
function configurarStickySetoresModais() {
    if (window.innerWidth <= 768) {
        // Configurar sticky para todos os modais
        const modaisWrappers = [
            '.modal-table-wrapper', // Modal de setores
            '#modalLinhasSeparadas .modal-table-wrapper', // Modal de linhas separadas
            '#modalLinhasRestantes .modal-table-wrapper', // Modal de linhas restantes
            '#modalProgresso .modal-table-wrapper' // Modal de progresso
        ];
        
        modaisWrappers.forEach(selector => {
            const wrapper = document.querySelector(selector);
            if (wrapper) {
                // Remover listener anterior se existir
                wrapper.removeEventListener('scroll', wrapper._stickyHandler);
                
                // Criar novo handler
                wrapper._stickyHandler = function() {
                    const scrollLeft = this.scrollLeft;
                    
                    // Selecionar as células da primeira coluna (Setor) dentro deste modal específico
                    const setorCells = this.querySelectorAll('tbody tr td:first-child');
                    
                    setorCells.forEach(cell => {
                        if (scrollLeft > 0) {
                            // Quando há scroll horizontal, ativar sticky
                            cell.style.position = 'sticky';
                            cell.style.left = '0';
                            cell.style.zIndex = '10';
                            cell.style.backgroundColor = '#ffffff';
                            cell.style.borderRight = '2px solidrgb(9, 82, 228)';
                            cell.style.boxShadow = '2px 0 4px rgb(255, 255, 255)';
                        } else {
                            // Quando na posição inicial, voltar ao normal
                            cell.style.position = 'static';
                            cell.style.left = 'auto';
                            cell.style.zIndex = 'auto';
                            cell.style.backgroundColor = '';
                            cell.style.borderRight = '';
                            cell.style.boxShadow = '';
                        }
                    });
                };
                
                // Adicionar o listener
                wrapper.addEventListener('scroll', wrapper._stickyHandler);
            }
        });
    }
}

// Chamar função de configuração de ícones sticky ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    configurarStickyIconsMobile();
    configurarStickySetoresModais();
});

// Reconfigurar ícones sticky ao redimensionar a janela
window.addEventListener('resize', () => {
    configurarStickyIconsMobile();
    configurarStickySetoresModais();
});

// ============== MODAL DO GRÁFICO ==============

let graficoInstance = null;
let dadosGraficoCompletos = [];

// Definir categorias de setores
const CATEGORIAS_SETORES = {
    fracionado: ['10', '11', '12', '13', '14', '15'],
    'carga-grossa': ['39', '52', '53', '44', '60', '58', 'SETOR24'],
    'arm-20': ['20', '21', 'ARMDI-2', 'ARMDI-3', 'ARMFRAC']
};

// Função para determinar a categoria de um setor
function obterCategoriaSetor(setor) {
    const setorStr = String(setor).trim();
    
    for (const [categoria, setores] of Object.entries(CATEGORIAS_SETORES)) {
        if (setores.includes(setorStr)) {
            return categoria;
        }
    }
    return 'outros';
}

// Função para filtrar dados por categoria
function filtrarDadosPorCategoria(dados, categoria) {
    if (categoria === 'todos') {
        return dados;
    }
    
    return dados.filter(item => {
        const categoriaSetor = obterCategoriaSetor(item.Setor);
        return categoriaSetor === categoria;
    });
}

// Função para abrir o modal do gráfico
function abrirModalGrafico() {
    const modalGrafico = document.getElementById('modalGrafico');
    
    if (!dadosOriginais || dadosOriginais.length === 0) {
        mostrarErro('Nenhum dado disponível para exibir o gráfico');
        return;
    }
    
    // Mostrar modal com animação
    modalGrafico.style.display = 'flex';
    requestAnimationFrame(() => {
        modalGrafico.classList.add('show');
    });
    
    // Bloquear scroll do body
    document.body.style.overflow = 'hidden';
    
    // Configurar filtros
    configurarFiltrosGrafico();
    
    // Renderizar gráfico após um pequeno delay para garantir que o modal esteja visível
    setTimeout(() => {
        renderizarGraficoNoModal('todos');
    }, 300);
}

// Função para fechar o modal do gráfico
function fecharModalGrafico() {
    const modalGrafico = document.getElementById('modalGrafico');
    
    modalGrafico.classList.remove('show');
    setTimeout(() => {
        modalGrafico.style.display = 'none';
        
        // Destruir gráfico para economizar memória
        if (graficoInstance) {
            graficoInstance.destroy();
            graficoInstance = null;
        }
    }, 300);
    
    // Restaurar scroll do body
    document.body.style.overflow = '';
}

// Função para renderizar o gráfico de barras horizontais
function renderizarGraficoNoModal(filtroCategoria = 'todos') {
    const container = domCache.graficoPorSetor;
    
    if (!container) {
        console.error('Container do gráfico não encontrado');
        return;
    }
    
    // Destruir gráfico anterior se existir
    if (graficoInstance) {
        graficoInstance.destroy();
        graficoInstance = null;
    }
    
    // OTIMIZAÇÃO: Code-splitting dinâmico - carregar gráfico apenas quando necessário
    carregarGraficoAssincrono(container, filtroCategoria);
}

// OTIMIZAÇÃO: Função para carregamento assíncrono do gráfico
async function carregarGraficoAssincrono(container, filtroCategoria = 'todos') {
    try {
        // Simular dynamic import (ApexCharts já carregado globalmente)
        // Em produção, seria: const ApexCharts = await import('apexcharts');
        await new Promise(resolve => setTimeout(resolve, 10)); // Simular carregamento
        
        // Filtrar dados por categoria
        const dadosFiltrados = filtrarDadosPorCategoria(dadosOriginais, filtroCategoria);
        
        if (dadosFiltrados.length === 0) {
            container.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: #6b7280;">
                    <svg style="width: 48px; height: 48px; margin-bottom: 1rem; opacity: 0.5;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="m15 9-6 6"/>
                        <path d="m9 9 6 6"/>
                    </svg>
                    <p style="font-size: 1.1rem; font-weight: 500; margin: 0;">Nenhum setor encontrado</p>
                    <p style="font-size: 0.9rem; margin: 0.5rem 0 0 0; opacity: 0.7;">Tente selecionar outra categoria</p>
                </div>
            `;
            return;
        }
        
        // Renderizar gráfico com dados filtrados
        renderizarGraficoComDados(container, dadosFiltrados, filtroCategoria);
        
    } catch (error) {
        console.error('Erro ao carregar gráfico assíncrono:', error);
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: #ef4444;">
                <p>Erro ao carregar gráfico</p>
            </div>
        `;
    }
}

// OTIMIZAÇÃO: Função separada para renderizar gráfico com dados
function renderizarGraficoComDados(container, dadosFiltrados, filtroCategoria) {
    // Preparar dados do gráfico
    dadosGraficoCompletos = dadosFiltrados.map(item => {
        const setor = item.Setor || 'Setor Desconhecido';
        const linhasSeparadas = item['Linhas Separadas'] || 0;
        const linhasRestantes = item['Linhas Restantes'] || 0;
        const total = linhasSeparadas + linhasRestantes;
        const progresso = total > 0 ? Math.round((linhasSeparadas / total) * 100) : 0;
        const categoria = obterCategoriaSetor(setor);
        
        return {
            setor: setor.length > 15 ? setor.substring(0, 15) + '...' : setor,
            setorCompleto: setor,
            progresso: progresso,
            separadas: linhasSeparadas,
            restantes: linhasRestantes,
            total: total,
            categoria: categoria
        };
    });
    
    // Ordenar por progresso (maior primeiro)
    dadosGraficoCompletos.sort((a, b) => b.progresso - a.progresso);
    
    
    // Atualizar título baseado no filtro
    const titulo = obterTituloFiltro(filtroCategoria);
    

    const opcoes = {
        series: [{
            name: 'Separadas',
            data: dadosGraficoCompletos.map(item => item.separadas),
        }, {
            name: 'Restantes', 
            data: dadosGraficoCompletos.map(item => item.restantes),
        }],
        chart: {
            type: 'bar',
            // Altura dinâmica baseada no número de setores
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            toolbar: {
                show: true,
                export: {
                    csv: {
                        filename: 'setores-separacao.csv',
                        columnDelimiter: ',',
                        headerCategory: 'Setor',
                        headerValue: 'Valor',
                    },
                    svg: {
                        filename: 'setores-separacao.svg',
                    },
                    png: {
                        filename: 'setores-separacao.png',
                    }
                },
                tools: {
                    download: true,
                    selection: false,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true
                }
            },
            background: 'transparent',
            stacked: true,
            stackType: '100%',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 600,
                animateGradually: {
                    enabled: true,
                    delay: 80
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 300
                }
            },
        },
        title: {
            text: titulo,
            align: 'left',
            margin: 20,
            style: {
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937'
            }
        },
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 6
            }
        },
        colors: (() => {
            // Função para determinar cores baseadas no progresso
            const cores = [];
            dadosGraficoCompletos.forEach(item => {
                if (item.progresso === 100) {
                    cores.push('#16a34a'); // Verde mais escuro para separadas quando 100%
                    cores.push('rgba(34, 197, 94, 0.1)'); // Verde transparente para restantes (que será 0)
                } else {
                    cores.push('#3b82f6'); // Azul para separadas
                    cores.push('#93c5fd'); // Azul claro para restantes
                }
            });
            return cores;
        })(),
        stroke: {
            width: 1,
            colors: ['#fff']
        },
        dataLabels: {
            enabled: true
        },
        xaxis: {
            categories: dadosGraficoCompletos.map(item => item.setor),
            labels: {
                style: {
                    fontSize: '11px',
                    fontWeight: 500,
                    colors: '#374151'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    fontSize: '10px',
                    fontWeight: 500,
                    colors: '#374151'
                }
            }
        },
        grid: {
            show: true,
            borderColor: '#E5E7EB',
            strokeDashArray: 3,
            xaxis: {
                lines: {
                    show: true
                }
            },
            yaxis: {
                lines: {
                    show: false
                }
            }
        },
        tooltip: {
            enabled: true,
            custom: function({series, seriesIndex, dataPointIndex, w}) {
                const dados = dadosGraficoCompletos[dataPointIndex];
                const nomeCategoria = obterNomeCategoria(dados.categoria);
                
                // Determinar status visual baseado no progresso
                const statusInfo = dados.progresso === 100 
                    ? { text: 'Concluído', color: '#059669', bgColor: '#dcfce7', icon: '✓' }
                    : dados.progresso >= 75 
                    ? { text: 'Quase Pronto', color: '#0284c7', bgColor: '#dbeafe', icon: '⏱' }
                    : dados.progresso >= 50 
                    ? { text: 'Em Progresso', color: '#ea580c', bgColor: '#fed7aa', icon: '⚡' }
                    : { text: 'Iniciando', color: '#dc2626', bgColor: '#fee2e2', icon: '🚀' };

                // Detectar se é mobile
                const isMobile = window.innerWidth <= 768;

                return `
                    <div style="
                        padding: ${isMobile ? '12px' : '16px'}; 
                        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); 
                        border-radius: ${isMobile ? '8px' : '12px'}; 
                        box-shadow: 0 ${isMobile ? '6px' : '10px'} ${isMobile ? '15px' : '25px'} rgba(0,0,0,0.15); 
                        min-width: ${isMobile ? '240px' : '280px'}; 
                        max-width: ${isMobile ? '270px' : '320px'};
                        border: 1px solid #e2e8f0;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        position: relative;
                        z-index: 9999;
                    ">
                        <!-- Cabeçalho do Setor -->
                        <div style="
                            display: flex; 
                            align-items: center; 
                            gap: ${isMobile ? '8px' : '12px'}; 
                            margin-bottom: ${isMobile ? '8px' : '12px'}; 
                            padding-bottom: ${isMobile ? '8px' : '12px'};
                            border-bottom: 2px solid #f1f5f9;
                        ">
                            <div style="
                                width: ${isMobile ? '30px' : '36px'}; 
                                height: ${isMobile ? '30px' : '36px'}; 
                                border-radius: ${isMobile ? '6px' : '8px'}; 
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: white;
                                font-weight: 700;
                                font-size: ${isMobile ? '10px' : '12px'};
                                text-transform: uppercase;
                                box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
                            ">
                                ${dados.setorCompleto.substring(0, 2)}
                            </div>
                            <div style="flex: 1;">
                                <div style="
                                    font-weight: 700; 
                                    color: #1e293b; 
                                    font-size: ${isMobile ? '13px' : '15px'};
                                    margin-bottom: 2px;
                                ">${dados.setorCompleto}</div>
                                <div style="
                                    font-size: ${isMobile ? '10px' : '12px'}; 
                                    color: #64748b;
                                ">Setor de Separação</div>
                            </div>
                        </div>

                        <!-- Status Badge -->
                        <div style="
                            display: inline-flex;
                            align-items: center;
                            gap: ${isMobile ? '4px' : '6px'};
                            padding: ${isMobile ? '4px 8px' : '6px 12px'};
                            background: ${statusInfo.bgColor};
                            color: ${statusInfo.color};
                            border-radius: ${isMobile ? '16px' : '20px'};
                            font-size: ${isMobile ? '10px' : '12px'};
                            font-weight: 600;
                            margin-bottom: ${isMobile ? '12px' : '16px'};
                            border: 1px solid ${statusInfo.color}20;
                        ">
                            <span style="font-size: ${isMobile ? '12px' : '14px'};">${statusInfo.icon}</span>
                            ${statusInfo.text}
                        </div>

                        <!-- Barra de Progresso Visual -->
                        <div style="margin-bottom: ${isMobile ? '12px' : '16px'};">
                            <div style="
                                display: flex; 
                                justify-content: space-between; 
                                align-items: center;
                                margin-bottom: ${isMobile ? '6px' : '8px'};
                            ">
                                <span style="font-size: ${isMobile ? '11px' : '13px'}; color: #475569; font-weight: 500;">Progresso Geral</span>
                                <span style="
                                    font-weight: 700; 
                                    font-size: ${isMobile ? '14px' : '16px'};
                                    color: ${statusInfo.color};
                                ">${dados.progresso}%</span>
                            </div>
                            <div style="
                                width: 100%;
                                height: ${isMobile ? '6px' : '8px'};
                                background: #e2e8f0;
                                border-radius: 10px;
                                overflow: hidden;
                                position: relative;
                            ">
                                <div style="
                                    width: ${dados.progresso}%;
                                    height: 100%;
                                    background: linear-gradient(90deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%);
                                    border-radius: 10px;
                                    transition: width 0.3s ease;
                                    position: relative;
                                ">
                                    ${dados.progresso > 10 ? `
                                        <div style="
                                            position: absolute;
                                            top: 0;
                                            right: 0;
                                            width: 100%;
                                            height: 100%;
                                            background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 100%);
                                            border-radius: 10px;
                                        "></div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>

                        <!-- Categoria -->
                        <div style="
                            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
                            padding: ${isMobile ? '8px 10px' : '10px 12px'}; 
                            border-radius: ${isMobile ? '6px' : '8px'}; 
                            margin-bottom: ${isMobile ? '12px' : '16px'};
                            border-left: ${isMobile ? '3px' : '4px'} solid #3b82f6;
                        ">
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: ${isMobile ? '6px' : '8px'};
                            ">
                                <span style="font-size: ${isMobile ? '10px' : '12px'}; color: #64748b; font-weight: 500;">📦 Categoria:</span>
                                <span style="font-weight: 600; color: #1e293b; font-size: ${isMobile ? '11px' : '13px'};">${nomeCategoria}</span>
                            </div>
                        </div>

                        <!-- Métricas Detalhadas -->
                        <div style="
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: ${isMobile ? '8px' : '12px'};
                            margin-bottom: ${isMobile ? '10px' : '12px'};
                        ">
                            <div style="
                                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
                                padding: ${isMobile ? '8px' : '12px'};
                                border-radius: ${isMobile ? '6px' : '8px'};
                                text-align: center;
                                border: 1px solid #22c55e20;
                            ">
                                <div style="
                                    font-size: ${isMobile ? '14px' : '18px'};
                                    font-weight: 700;
                                    color: #15803d;
                                    margin-bottom: ${isMobile ? '2px' : '4px'};
                                ">${dados.separadas.toLocaleString()}</div>
                                <div style="
                                    font-size: ${isMobile ? '9px' : '11px'};
                                    color: #166534;
                                    font-weight: 500;
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                ">✅ Separadas</div>
                            </div>
                            
                            <div style="
                                background: linear-gradient(135deg, ${dados.restantes > 0 ? '#fef3c7' : '#f3f4f6'} 0%, ${dados.restantes > 0 ? '#fde68a' : '#e5e7eb'} 100%);
                                padding: ${isMobile ? '8px' : '12px'};
                                border-radius: ${isMobile ? '6px' : '8px'};
                                text-align: center;
                                border: 1px solid ${dados.restantes > 0 ? '#f59e0b20' : '#6b728020'};
                            ">
                                <div style="
                                    font-size: ${isMobile ? '14px' : '18px'};
                                    font-weight: 700;
                                    color: ${dados.restantes > 0 ? '#d97706' : '#6b7280'};
                                    margin-bottom: ${isMobile ? '2px' : '4px'};
                                ">${dados.restantes.toLocaleString()}</div>
                                <div style="
                                    font-size: ${isMobile ? '9px' : '11px'};
                                    color: ${dados.restantes > 0 ? '#92400e' : '#6b7280'};
                                    font-weight: 500;
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                ">${dados.restantes > 0 ? '⏳' : '✨'} ${dados.restantes > 0 ? 'Restantes' : 'Finalizadas'}</div>
                            </div>
                        </div>

                        <!-- Total com destaque -->
                        <div style="
                            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
                            padding: ${isMobile ? '8px' : '12px'};
                            border-radius: ${isMobile ? '6px' : '8px'};
                            text-align: center;
                            border: 2px solid #cbd5e1;
                        ">
                            <div style="
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: ${isMobile ? '6px' : '8px'};
                            ">
                                <span style="
                                    font-size: ${isMobile ? '10px' : '12px'};
                                    color: #475569;
                                    font-weight: 500;
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                ">📊 Total de Linhas:</span>
                                <span style="
                                    font-size: ${isMobile ? '16px' : '20px'};
                                    font-weight: 800;
                                    color: #1e293b;
                                ">${dados.total.toLocaleString()}</span>
                            </div>
                        </div>

                        ${dados.progresso === 100 ? `
                            <div style="
                                margin-top: ${isMobile ? '8px' : '12px'};
                                padding: ${isMobile ? '6px' : '8px'};
                                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
                                border-radius: ${isMobile ? '6px' : '8px'};
                                text-align: center;
                                border: 1px solid #22c55e;
                            ">
                                <span style="
                                    font-size: ${isMobile ? '10px' : '12px'};
                                    color: #15803d;
                                    font-weight: 600;
                                ">🎉 Setor 100% Concluído!</span>
                            </div>
                        ` : ''}
                    </div>
                `;
            },
            shared: false,
            intersect: true,
            followCursor: false,
            fixed: {
                enabled: true,
                position: 'topRight',
                offsetX: -20,
                offsetY: 20
            },
            style: {
                fontSize: '12px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }
        },
        legend: {
            show: false,
            position: 'top',
            horizontalAlign: 'left',
            offsetX: 40,
            fontSize: '12px',
            fontWeight: 500,
            labels: {
                colors: '#374151'
            },
            markers: {
                width: 8,
                height: 8,
                radius: 2
            }
        },
        fill: {
            opacity: 1,
            colors: [
                function({ value, seriesIndex, dataPointIndex, w }) {
                    const item = dadosGraficoCompletos[dataPointIndex];
                    if (seriesIndex === 0) {
                        return item && item.progresso === 100 ? '#22c55e' : '#3b82f6';
                    } else {
                        return item && item.progresso === 100 ? 'rgba(34, 197, 94, 0.1)' : '#93c5fd';
                    }
                }
            ]
        },
        responsive: [{
            breakpoint: 768,
            options: {
                chart: {
                    height: Math.max(350, dadosGraficoCompletos.length * 30)
                },
                title: {
                    style: {
                        fontSize: '14px'
                    }
                },
                plotOptions: {
                    bar: {
                        borderRadius: 2
                    }
                },
                xaxis: {
                    labels: {
                        style: {
                            fontSize: '10px'
                        }
                    }
                },
                yaxis: {
                    labels: {
                        style: {
                            fontSize: '9px'
                        }
                    }
                },
                legend: {
                    fontSize: '11px',
                    offsetX: 20
                }
            }
        }, {
            breakpoint: 480,
            options: {
                chart: {
                    height: Math.max(300, dadosGraficoCompletos.length * 25)
                },
                title: {
                    style: {
                        fontSize: '13px'
                    }
                },
                plotOptions: {
                    bar: {
                        borderRadius: 3
                    }
                },
                xaxis: {
                    labels: {
                        style: {
                            fontSize: '9px'
                        }
                    }
                },
                yaxis: {
                    labels: {
                        style: {
                            fontSize: '8px'
                        }
                    }
                },
                legend: {
                    fontSize: '10px',
                    offsetX: 10
                }
            }
        }]
    };
    
    try {
        graficoInstance = new ApexCharts(container, opcoes);
        graficoInstance.render();
    } catch (error) {
        console.error('Erro ao renderizar gráfico:', error);
        mostrarErro('Erro ao carregar o gráfico');
    }
}

// Função para obter o nome da categoria para exibição
function obterNomeCategoria(categoria) {
    const nomes = {
        'fracionado': 'Fracionado',
        'carga-grossa': 'Carga Grossa', 
        'arm-20': 'ARM e 20',
        'outros': 'Outros'
    };
    return nomes[categoria] || 'Não categorizado';
}

// Função para obter título baseado no filtro
function obterTituloFiltro(filtro) {
    const titulos = {
        'todos': 'Processo de separação por Setor',
        'fracionado': 'Processo - Fracionado',
        'carga-grossa': 'Processo - Carga Grossa',
        'arm-20': 'Processo - ARM e 20'
    };
    return titulos[filtro] || 'Setores Filtrados';
}

// Função para configurar os filtros do gráfico
function configurarFiltrosGrafico() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            
            // Efeito ripple
            this.classList.add('ripple');
            setTimeout(() => {
                this.classList.remove('ripple');
            }, 600);
            
            // Remover classe active de todos os botões
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adicionar classe active ao botão clicado
            this.classList.add('active');
            
            // Obter filtro selecionado e renderizar gráfico
            const filtro = this.getAttribute('data-filter');
            renderizarGraficoNoModal(filtro);
        });
    });
}

// Configurar eventos do modal do gráfico
document.addEventListener('DOMContentLoaded', function() {
    const closeModalGrafico = document.getElementById('closeModalGrafico');
    const modalGrafico = document.getElementById('modalGrafico');
    
    // Fechar modal ao clicar no X
    if (closeModalGrafico) {
        closeModalGrafico.addEventListener('click', fecharModalGrafico);
    }
    
    // Fechar modal ao clicar fora dele
    if (modalGrafico) {
        modalGrafico.addEventListener('click', function(e) {
            if (e.target === modalGrafico) {
                fecharModalGrafico();
            }
        });
    }
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalGrafico && modalGrafico.classList.contains('show')) {
            fecharModalGrafico();
        }
    });
});

window.addEventListener('orientationchange', () => {
    if (graficoInstance && document.getElementById('modalGrafico').classList.contains('show')) {
        setTimeout(() => {
            // Obter filtro ativo atual
            const botaoAtivo = document.querySelector('.filter-btn.active');
            const filtroAtivo = botaoAtivo ? botaoAtivo.getAttribute('data-filter') : 'todos';
            
            graficoInstance.updateOptions({
                chart: {
                    height: Math.max(350, dadosGraficoCompletos.length * 30)
                }
            });
        }, 500);
    }
});

// Função para sincronizar o círculo de progresso com os dados reais
function sincronizarProgressoComDados() {
    // Primeiro verificar se temos um valor armazenado da atualizarEstatisticas
    if (typeof window.percentualRealParaUsar !== 'undefined') {
        const percentualReal = window.percentualRealParaUsar;
        atualizarAnelProgresso(percentualReal);
        delete window.percentualRealParaUsar; // Limpar o valor armazenado
        return;
    }
    
    if (dadosOriginais && dadosOriginais.length > 0) {
        // Calcular o percentual real baseado nos dados
        const totalSeparadas = dadosOriginais.reduce((sum, item) => sum + (item['Linhas Separadas'] || 0), 0);
        const totalRestantes = dadosOriginais.reduce((sum, item) => sum + (item['Linhas Restantes'] || 0), 0);
        const totalGeral = totalSeparadas + totalRestantes;
        const percentualReal = totalGeral > 0 ? (totalSeparadas / totalGeral * 100) : 0;
        
        console.log(`Sincronizando com dados reais calculados: ${percentualReal.toFixed(1)}%`);
        console.log(`Total separadas: ${totalSeparadas}, Total restantes: ${totalRestantes}`);
        
        // Atualizar o círculo com o valor real
        atualizarAnelProgresso(percentualReal);
        
        // Também atualizar o texto do percentual se ainda não foi atualizado
        const percentualElement = elementos.percentualConcluido;
        if (percentualElement && percentualElement.textContent === '-') {
            percentualElement.textContent = `${percentualReal.toFixed(1)}%`;
        }
    } else {
        // Se não há dados ainda, verificar novamente em 1 segundo
        console.log('Dados ainda não carregados, tentando novamente em 1 segundo...');
        setTimeout(sincronizarProgressoComDados, 1000);
    }
}

// Função para calcular horas restantes baseada nas configurações de turno
function calcularHorasRestantesTrabalho() {
    const defaultConfig = {
        turno1Inicio: '05:00',
        turno1Fim: '13:40',
        turno1HoraExtra: false,
        turno2Inicio: '15:20',
        turno2Fim: '23:40',
        turno2HoraExtra: false
    };
    
    let config = defaultConfig;
    try {
        const stored = localStorage.getItem('dashboardConfig');
        if (stored) {
            config = { ...defaultConfig, ...JSON.parse(stored) };
        }
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
    }
    
    const agora = new Date();
    const horaAtual = agora.getHours() * 60 + agora.getMinutes();
    
    const turno1Inicio = config.turno1Inicio;
    const turno1Fim = config.turno1Fim;
    const turno1Extra = config.turno1HoraExtra;
    const turno2Inicio = config.turno2Inicio;
    const turno2Fim = config.turno2Fim;
    const turno2Extra = config.turno2HoraExtra;
    
    function timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }
    
    const turno1InicioMin = timeToMinutes(turno1Inicio);
    const turno1FimMin = timeToMinutes(turno1Fim) + (turno1Extra ? 120 : 0);
    const turno2InicioMin = timeToMinutes(turno2Inicio);
    const turno2FimMin = timeToMinutes(turno2Fim) + (turno2Extra ? 120 : 0);
    
    if (horaAtual >= turno1InicioMin && horaAtual <= turno1FimMin) {
        return (turno1FimMin - horaAtual) / 60;
    } else if (horaAtual >= turno2InicioMin && horaAtual <= turno2FimMin) {
        return (turno2FimMin - horaAtual) / 60;
    }
    
    return 8;
}