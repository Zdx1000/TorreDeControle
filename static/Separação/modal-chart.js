// Modal Chart JavaScript
class ModalChart {
    constructor() {
        this.modal = document.getElementById('chartModal');
        this.chartBtn = document.getElementById('chartBtn');
        this.closeBtn = document.querySelector('.close-grafico');
        this.chart = null;
        this.originalData = [];
        this.filteredData = [];
        this.tabelaData = [];
        this.currentYAxis = 'Área Separação';
        
        // API URL
        this.API_URL_SEPARACAO = '/api/dadosseparacao';
        
        // Filter elements
        this.areaFilter = document.getElementById('areaFilter');
        this.ondaFilter = document.getElementById('ondaFilter');
        this.cargaFilter = document.getElementById('cargaFilter');
        this.stageFilter = document.getElementById('stageFilter');
        this.yAxisSelector = document.getElementById('yAxisSelector');
        this.clearFiltersBtn = document.getElementById('clearFilters');
        this.chartTitle = document.getElementById('chartTitle');
        this.toggleFiltersBtn = document.getElementById('toggleFilters');
        this.filtersContent = document.getElementById('filtersContent');
        this.filtrosContainer = document.getElementById('filtrosContainer');
        this.activeFiltersIndicator = document.getElementById('activeFiltersIndicator');
        
        // Filter state
        this.filtersCollapsed = false;
        
        // Initialize custom selects
        this.initCustomSelects();
        
        this.init();
    }
    
    initCustomSelects() {
        // Initialize custom select functionality
        [this.areaFilter, this.ondaFilter, this.cargaFilter, this.stageFilter, this.yAxisSelector].forEach(select => {
            const header = select.querySelector('.select-header');
            const dropdown = select.querySelector('.select-dropdown');
            
            // Touch-friendly event handling
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            
            if (isTouchDevice) {
                // For touch devices, use touchstart for better responsiveness
                header.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleDropdown(select);
                });
                
                // Also keep click for compatibility
                header.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Only handle if not already handled by touchstart
                    if (!e.defaultPrevented) {
                        this.toggleDropdown(select);
                    }
                });
            } else {
                header.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleDropdown(select);
                });
            }
            
            // Store selected values
            if (select === this.yAxisSelector) {
                select.selectedValues = ['Área Separação'];
            } else {
                select.selectedValues = [];
            }
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-select')) {
                this.closeAllDropdowns();
            }
        });
        
        // Close dropdowns when touching outside (for mobile)
        document.addEventListener('touchstart', (e) => {
            if (!e.target.closest('.custom-select')) {
                this.closeAllDropdowns();
            }
        });
        
        // Handle Y-axis selection
        this.yAxisSelector.addEventListener('change', (e) => {
            if (e.target.type === 'radio') {
                this.handleYAxisChange(e.target.value);
            }
        });
        
        // Prevent viewport zoom on double tap for iOS
        if (this.isMobile()) {
            document.addEventListener('touchend', (e) => {
                if (e.target.closest('.select-header')) {
                    e.preventDefault();
                }
            });
        }
    }
    
    // Helper method to detect mobile devices
    isMobile() {
        return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // Enhanced toggle dropdown with mobile optimizations
    toggleDropdown(selectElement) {
        const dropdown = selectElement.querySelector('.select-dropdown');
        const header = selectElement.querySelector('.select-header');
        const isActive = dropdown.classList.contains('active');
        
        // Close all dropdowns first
        this.closeAllDropdowns();
        
        // Toggle current dropdown
        if (!isActive) {
            dropdown.classList.add('active');
            header.classList.add('active');
            
            // Mobile-specific optimizations
            if (this.isMobile()) {
                // Check if dropdown goes outside viewport and adjust position
                setTimeout(() => {
                    const rect = dropdown.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    const viewportWidth = window.innerWidth;
                    
                    // Check if dropdown goes below viewport
                    if (rect.bottom > viewportHeight) {
                        const availableSpaceBelow = viewportHeight - rect.top;
                        const availableSpaceAbove = rect.top;
                        
                        // If more space above, show dropdown above
                        if (availableSpaceAbove > availableSpaceBelow) {
                            dropdown.style.top = 'auto';
                            dropdown.style.bottom = '100%';
                            dropdown.style.borderRadius = '8px 8px 0 0';
                            dropdown.style.borderTop = '2px solid #2a5298';
                            dropdown.style.borderBottom = 'none';
                        } else {
                            // Limit height to available space
                            dropdown.style.maxHeight = `${availableSpaceBelow - 20}px`;
                        }
                    }
                    
                    // Check if dropdown goes outside horizontal bounds
                    if (rect.right > viewportWidth) {
                        dropdown.style.right = '0';
                        dropdown.style.left = 'auto';
                    }
                    
                    // Scroll into view if needed
                    if (rect.top < 0 || rect.bottom > viewportHeight) {
                        selectElement.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'nearest' 
                        });
                    }
                }, 100);
                
                // Add touch scroll momentum for iOS
                dropdown.style.webkitOverflowScrolling = 'touch';
            }
        }
    }
    
    closeAllDropdowns() {
        [this.areaFilter, this.ondaFilter, this.cargaFilter, this.stageFilter, this.yAxisSelector].forEach(select => {
            const dropdown = select.querySelector('.select-dropdown');
            const header = select.querySelector('.select-header');
            dropdown.classList.remove('active');
            header.classList.remove('active');
            
            // Reset dropdown position styles
            dropdown.style.top = '';
            dropdown.style.bottom = '';
            dropdown.style.left = '';
            dropdown.style.right = '';
            dropdown.style.maxHeight = '';
            dropdown.style.borderRadius = '';
            dropdown.style.borderTop = '';
            dropdown.style.borderBottom = '';
        });
    }
    
    init() {
        this.setupEventListeners();
        this.loadData();
    }
    
    setupEventListeners() {
        // Open modal
        this.chartBtn.addEventListener('click', () => {
            this.openModal();
        });
        
        // Close modal
        this.closeBtn.addEventListener('click', () => {
            this.closeModal();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Auto-apply filters when selection changes
        // Event listeners are now handled in populateSelect method
        
        // Clear filters button
        this.clearFiltersBtn.addEventListener('click', () => {
            this.clearFilters();
        });
        
        // Toggle filters button
        this.toggleFiltersBtn.addEventListener('click', () => {
            this.toggleFilters();
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }        });
    }
    
    handleYAxisChange(newYAxis) {
        this.currentYAxis = newYAxis;
        
        // Update the select header text
        const selectText = this.yAxisSelector.querySelector('.select-text');
        selectText.textContent = newYAxis === 'Área Separação' ? 'Área de Separação' : newYAxis;
        
        // Update chart title
        this.updateChartTitle();
        
        // Close the dropdown
        this.closeAllDropdowns();
        
        // Clear all filters and repopulate with empty selections
        this.clearFilters();
        
        // Repopulate filters for the new Y-axis
        this.populateFilters();
        
        // Se o modal estiver aberto, atualizar o gráfico imediatamente
        if (this.modal.style.display === 'block') {
            if (this.chart) {
                this.chart.destroy();
                this.chart = null;
            }
            setTimeout(() => {
                this.initChart();
            }, 100);
        }
    }
    
    updateChartTitle() {
        const titles = {
            'Área Separação': 'Containers por Área de Separação',
            'Onda': 'Containers por Onda',
            'Carga': 'Containers por Carga',
            'Stage': 'Containers por Stage'
        };
        
        this.chartTitle.textContent = titles[this.currentYAxis];
    }
    
    getFilterFields() {
        // Return the fields that should be used as filters (excluding the Y-axis)
        const allFields = ['Área Separação', 'Onda', 'Carga', 'Stage'];
        return allFields.filter(field => field !== this.currentYAxis);
    }
    
    getFilterElements() {
        // Return the filter elements that should be active
        const filterMap = {
            'Área Separação': this.areaFilter,
            'Onda': this.ondaFilter,
            'Carga': this.cargaFilter,
            'Stage': this.stageFilter
        };
        
        return this.getFilterFields().map(field => filterMap[field]).filter(el => el !== null);
    }

    async loadData() {
        try {
            this.showLoading();
            
            const response = await fetch(this.API_URL_SEPARACAO);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.message || 'Erro na API');
            }
            
            this.originalData = data.sep_data || [];
            this.filteredData = [...this.originalData];
            this.tabelaData = data.tabela_data || [];
            
            // Log para debug - mostrar estrutura dos dados
            console.log('Dados carregados:', {
                sep_data: this.originalData.length,
                tabela_data: this.tabelaData.length,
                sample_data: this.originalData[0] || 'Nenhum dado disponível'
            });
            
            this.populateFilters();
            this.hideLoading();
            
            // Não inicializar o gráfico aqui, apenas quando o modal for aberto
            console.log('Dados carregados com sucesso!');
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.showError('Erro ao carregar dados: ' + error.message);
        }
    }
    
    populateFilters() {
        const filterFields = this.getFilterFields();
        const filterElements = this.getFilterElements();
        
        // Hide all filter groups first
        [this.areaFilter, this.ondaFilter, this.cargaFilter, this.stageFilter].forEach(filter => {
            const filterGroup = filter.closest('.filter-group');
            filterGroup.style.display = 'none';
        });
        
        // Show and populate only the relevant filters
        filterElements.forEach(filterElement => {
            const filterGroup = filterElement.closest('.filter-group');
            filterGroup.style.display = 'flex';
            
            if (filterElement === this.areaFilter) {
                const areas = [...new Set(this.originalData.map(item => item['Área Separação']))].sort();
                // Start with empty selection
                this.areaFilter.selectedValues = [];
                this.populateSelect(this.areaFilter, areas);
            } else if (filterElement === this.ondaFilter) {
                const ondas = [...new Set(this.originalData.map(item => item.Onda))].sort();
                // Start with empty selection
                this.ondaFilter.selectedValues = [];
                this.populateSelect(this.ondaFilter, ondas);
            } else if (filterElement === this.cargaFilter) {
                const cargas = [...new Set(this.originalData.map(item => item.Carga))].sort();
                // Start with empty selection
                this.cargaFilter.selectedValues = [];
                this.populateSelect(this.cargaFilter, cargas);
            } else if (filterElement === this.stageFilter) {
                const stages = [...new Set(this.originalData.map(item => item.Stage))].sort();
                // Start with empty selection
                this.stageFilter.selectedValues = [];
                this.populateSelect(this.stageFilter, stages);
            }
        });
        
        // Apply filters with empty selections (will show no data initially)
        this.applyFilters();
        
        // Initial update of filter options
        this.updateFilterOptions();
    }
    
    populateSelect(selectElement, options) {
        const optionsContainer = selectElement.querySelector('.select-options');
        const selectText = selectElement.querySelector('.select-text');
        
        // Clear existing options
        optionsContainer.innerHTML = '';
        
        options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'select-option';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = option;
            checkbox.id = `${selectElement.id}_${option}`;
            
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = option;
            
            // Check if this option was previously selected
            if (selectElement.selectedValues && selectElement.selectedValues.includes(option)) {
                checkbox.checked = true;
                optionDiv.classList.add('selected');
            }
            
            // Add event listener for checkbox change
            checkbox.addEventListener('change', (e) => {
                e.stopPropagation();
                if (checkbox.checked) {
                    if (!selectElement.selectedValues.includes(option)) {
                        selectElement.selectedValues.push(option);
                    }
                    optionDiv.classList.add('selected');
                } else {
                    selectElement.selectedValues = selectElement.selectedValues.filter(val => val !== option);
                    optionDiv.classList.remove('selected');
                }
                
                this.updateSelectText(selectElement);
                this.applyFilters();
                this.updateFilterOptions();
            });
            
            // Add touch event listener for mobile
            if (this.isMobile()) {
                optionDiv.addEventListener('touchstart', (e) => {
                    e.stopPropagation();
                });
                
                optionDiv.addEventListener('click', (e) => {
                    e.stopPropagation();
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                });
            }
            
            optionDiv.appendChild(checkbox);
            optionDiv.appendChild(label);
            optionsContainer.appendChild(optionDiv);
        });
        
        this.updateSelectText(selectElement);
    }
    
    updateSelectText(selectElement) {
        const selectText = selectElement.querySelector('.select-text');
        const selectedCount = selectElement.selectedValues.length;
        
        // Get total available options for this filter
        const totalOptions = selectElement.querySelectorAll('.select-option').length;
        
        if (selectedCount === 0) {
            selectText.textContent = 'Selecione...';
            selectText.classList.remove('has-selection');
        } else if (selectedCount === 1) {
            selectText.textContent = selectElement.selectedValues[0];
            selectText.classList.add('has-selection');
        } else if (selectedCount === totalOptions) {
            selectText.textContent = 'Todos selecionados';
            selectText.classList.add('has-selection');
        } else {
            selectText.textContent = `${selectedCount} selecionados`;
            selectText.classList.add('has-selection');
        }
    }
    
    applyFilters() {
        const activeFilters = this.getFilterElements();
        
        const areaValues = activeFilters.includes(this.areaFilter) ? (this.areaFilter.selectedValues || []) : [];
        const ondaValues = activeFilters.includes(this.ondaFilter) ? (this.ondaFilter.selectedValues || []) : [];
        const cargaValues = activeFilters.includes(this.cargaFilter) ? (this.cargaFilter.selectedValues || []) : [];
        const stageValues = activeFilters.includes(this.stageFilter) ? (this.stageFilter.selectedValues || []) : [];
        
        // Check if any active filter has selections
        const hasActiveSelections = (areaValues.length > 0) || (ondaValues.length > 0) || (cargaValues.length > 0) || (stageValues.length > 0);
        
        if (!hasActiveSelections) {
            // If no filters are selected, show all data
            this.filteredData = [...this.originalData];
        } else {
            // Apply filters only if there are selections
            this.filteredData = this.originalData.filter(item => {
                const areaMatch = areaValues.length === 0 || areaValues.includes(item['Área Separação']);
                const ondaMatch = ondaValues.length === 0 || ondaValues.includes(item.Onda);
                const cargaMatch = cargaValues.length === 0 || cargaValues.includes(item.Carga);
                const stageMatch = stageValues.length === 0 || stageValues.includes(item.Stage);
                
                return areaMatch && ondaMatch && cargaMatch && stageMatch;
            });
        }
        
        this.updateChart();
        this.updateActiveFiltersIndicator();
    }
    
    updateActiveFiltersIndicator() {
        const activeFilters = this.getFilterElements();
        let totalActiveFilters = 0;
        
        activeFilters.forEach(filter => {
            if (filter.selectedValues && filter.selectedValues.length > 0) {
                totalActiveFilters += filter.selectedValues.length;
            }
        });
        
        if (totalActiveFilters > 0) {
            this.activeFiltersIndicator.textContent = `${totalActiveFilters} filtro${totalActiveFilters > 1 ? 's' : ''} ativo${totalActiveFilters > 1 ? 's' : ''}`;
            this.activeFiltersIndicator.style.display = 'inline-block';
        } else {
            this.activeFiltersIndicator.textContent = '0 filtros ativos';
            this.activeFiltersIndicator.style.display = 'none';
        }
    }

    clearFilters() {
        // Clear all selections for ALL filters (not just active ones)
        [this.areaFilter, this.ondaFilter, this.cargaFilter, this.stageFilter].forEach(filter => {
            filter.selectedValues = [];
        });
        
        // Update visual state for all filters
        [this.areaFilter, this.ondaFilter, this.cargaFilter, this.stageFilter].forEach(select => {
            const checkboxes = select.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
                checkbox.closest('.select-option').classList.remove('selected');
            });
            this.updateSelectText(select);
        });
        
        // Apply filters (which will show all data since no filters are selected)
        this.applyFilters();
        
        // Update filter options to show all available options
        this.updateFilterOptions();
        
        // Update active filters indicator
        this.updateActiveFiltersIndicator();
    }
    
    updateFilterOptions() {
        const activeFilters = this.getFilterElements();
        
        // Get current filter values
        const currentAreas = this.areaFilter.selectedValues || [];
        const currentOndas = this.ondaFilter.selectedValues || [];
        const currentCargas = this.cargaFilter.selectedValues || [];
        const currentStages = this.stageFilter.selectedValues || [];
        
        // Update Área filter (only if it's active and no areas are currently selected)
        if (activeFilters.includes(this.areaFilter) && currentAreas.length === 0) {
            const availableAreas = [...new Set(this.originalData.filter(item => {
                const ondaMatch = currentOndas.length === 0 || currentOndas.includes(item.Onda);
                const cargaMatch = currentCargas.length === 0 || currentCargas.includes(item.Carga);
                const stageMatch = currentStages.length === 0 || currentStages.includes(item.Stage);
                return ondaMatch && cargaMatch && stageMatch;
            }).map(item => item['Área Separação']))].sort();
            this.populateSelect(this.areaFilter, availableAreas);
        }
        
        // Update Onda filter (only if it's active and no ondas are currently selected)
        if (activeFilters.includes(this.ondaFilter) && currentOndas.length === 0) {
            const availableOndas = [...new Set(this.originalData.filter(item => {
                const areaMatch = currentAreas.length === 0 || currentAreas.includes(item['Área Separação']);
                const cargaMatch = currentCargas.length === 0 || currentCargas.includes(item.Carga);
                const stageMatch = currentStages.length === 0 || currentStages.includes(item.Stage);
                return areaMatch && cargaMatch && stageMatch;
            }).map(item => item.Onda))].sort();
            this.populateSelect(this.ondaFilter, availableOndas);
        }
        
        // Update Carga filter (only if it's active and no cargas are currently selected)
        if (activeFilters.includes(this.cargaFilter) && currentCargas.length === 0) {
            const availableCargas = [...new Set(this.originalData.filter(item => {
                const areaMatch = currentAreas.length === 0 || currentAreas.includes(item['Área Separação']);
                const ondaMatch = currentOndas.length === 0 || currentOndas.includes(item.Onda);
                const stageMatch = currentStages.length === 0 || currentStages.includes(item.Stage);
                return areaMatch && ondaMatch && stageMatch;
            }).map(item => item.Carga))].sort();
            this.populateSelect(this.cargaFilter, availableCargas);
        }
        
        // Update Stage filter (only if it's active and no stages are currently selected)
        if (activeFilters.includes(this.stageFilter) && currentStages.length === 0) {
            const availableStages = [...new Set(this.originalData.filter(item => {
                const areaMatch = currentAreas.length === 0 || currentAreas.includes(item['Área Separação']);
                const ondaMatch = currentOndas.length === 0 || currentOndas.includes(item.Onda);
                const cargaMatch = currentCargas.length === 0 || currentCargas.includes(item.Carga);
                return areaMatch && ondaMatch && cargaMatch;
            }).map(item => item.Stage))].sort();
            this.populateSelect(this.stageFilter, availableStages);
        }
    }
    
    toggleFilters() {
        this.filtersCollapsed = !this.filtersCollapsed;
        const chartContainer = document.querySelector('.chart-container');
        
        if (this.filtersCollapsed) {
            // Collapse filters
            this.filtersContent.classList.add('collapsed');
            this.filtrosContainer.classList.add('collapsed');
            this.toggleFiltersBtn.classList.add('collapsed');
            this.toggleFiltersBtn.title = 'Expandir Filtros';
            
            // Expand chart when filters are collapsed
            if (chartContainer) {
                chartContainer.classList.add('filters-collapsed');
            }
            
            // Update active filters indicator
            this.updateActiveFiltersIndicator();
            
            // Mobile-specific optimizations
            if (this.isMobile()) {
                // Scroll to chart area when filters are collapsed
                setTimeout(() => {
                    if (chartContainer) {
                        chartContainer.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start' 
                        });
                    }
                }, 300);
            }
        } else {
            // Expand filters
            this.filtersContent.classList.remove('collapsed');
            this.filtrosContainer.classList.remove('collapsed');
            this.toggleFiltersBtn.classList.remove('collapsed');
            this.toggleFiltersBtn.title = 'Recolher Filtros';
            
            // Shrink chart when filters are expanded
            if (chartContainer) {
                chartContainer.classList.remove('filters-collapsed');
            }
            
            // Update active filters indicator
            this.updateActiveFiltersIndicator();
        }
        
        // Give time for animation, then resize chart
        setTimeout(() => {
            if (this.chart) {
                this.chart.resize();
            }
        }, 300);
    }
    
    openModal() {
        this.modal.style.display = 'block';
        this.modal.classList.add('show');
        
        // Mobile-specific optimizations
        if (this.isMobile()) {
            // Prevent background scrolling on mobile
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.top = `-${window.scrollY}px`;
            
            // Store scroll position for restoration
            this.scrollPosition = window.scrollY;
            
            // Add mobile class for additional styling
            this.modal.classList.add('mobile-modal');
            
            // Optimize for mobile viewport
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                this.originalViewport = viewport.getAttribute('content');
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            }
        } else {
            document.body.style.overflow = 'hidden';
        }
        
        // Initialize chart after modal is shown
        setTimeout(() => {
            if (this.chart) {
                this.chart.destroy();
                this.chart = null;
            }
            this.initChart();
        }, 100);
    }
    
    closeModal() {
        this.modal.style.display = 'none';
        this.modal.classList.remove('show');
        
        // Mobile-specific cleanup
        if (this.isMobile()) {
            // Restore scrolling
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';
            
            // Restore scroll position
            if (this.scrollPosition !== undefined) {
                window.scrollTo(0, this.scrollPosition);
                this.scrollPosition = undefined;
            }
            
            // Remove mobile class
            this.modal.classList.remove('mobile-modal');
            
            // Restore viewport
            if (this.originalViewport) {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.setAttribute('content', this.originalViewport);
                }
                this.originalViewport = null;
            }
        } else {
            document.body.style.overflow = 'auto';
        }
        
        // Clean up chart
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        
        // Clean up tooltip
        const tooltipEl = document.getElementById('chartjs-tooltip');
        if (tooltipEl) {
            tooltipEl.remove();
        }
        
        // Close any open dropdowns
        this.closeAllDropdowns();
    }
    
    initChart() {
        const canvas = document.getElementById('separacaoChart');
        if (!canvas) {
            console.error('Canvas não encontrado - modal pode não estar aberto');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Aggregate data by current Y axis
        const aggregatedData = this.aggregateData(this.filteredData);
        
        if (aggregatedData.labels.length === 0) {
            console.log('Nenhum dado para exibir no gráfico');
            const chartContainer = document.querySelector('.chart-container');
            if (chartContainer) {
                // Check if there are any active filter selections
                const activeFilters = this.getFilterElements();
                const hasActiveSelections = activeFilters.some(filter => 
                    filter.selectedValues && filter.selectedValues.length > 0
                );
                
                const message = hasActiveSelections ? 
                    'Nenhum dado encontrado para os filtros selecionados' : 
                    'Todos os dados estão sendo exibidos';
                
                chartContainer.innerHTML = `<div class="no-data">${message}</div>`;
            }
            return;
        }
        
        // Armazenar dados detalhados para uso no tooltip
        this.chartDetails = aggregatedData.details;
        
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
            labels: aggregatedData.labels,
            datasets: [{
            label: 'Quantidade de Containers',
            data: aggregatedData.values,
            backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(30, 144, 255, 0.8)',
            'rgba(0, 123, 255, 0.8)',
            'rgba(65, 105, 225, 0.8)',
            'rgba(70, 130, 180, 0.8)',
            'rgba(100, 149, 237, 0.8)',
            'rgba(135, 206, 235, 0.8)',
            'rgba(176, 196, 222, 0.8)',
            'rgba(173, 216, 230, 0.8)',
            'rgba(0, 191, 255, 0.8)'
            ],
            borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(30, 144, 255, 1)',
            'rgba(0, 123, 255, 1)',
            'rgba(65, 105, 225, 1)',
            'rgba(70, 130, 180, 1)',
            'rgba(100, 149, 237, 1)',
            'rgba(135, 206, 235, 1)',
            'rgba(176, 196, 222, 1)',
            'rgba(173, 216, 230, 1)',
            'rgba(0, 191, 255, 1)'
            ],
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
            }]
            },
            options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
            title: {
            display: true,
            text: this.chartTitle.textContent,
            font: {
                size: 18,
                weight: 'bold'
            },
            padding: {
                top: 10,
                bottom: 30
            }
            },
            legend: {
            display: false
            },
            tooltip: {
            enabled: false, // Desabilita o tooltip padrão
            external: (context) => {
                const {chart, tooltip} = context;
                
                // Tooltip Element
                let tooltipEl = document.getElementById('chartjs-tooltip');
                
                // Create element on first render
                if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.id = 'chartjs-tooltip';
                tooltipEl.style.position = 'fixed';
                tooltipEl.style.pointerEvents = 'none';
                tooltipEl.style.zIndex = '99999';
                tooltipEl.style.maxWidth = '320px';
                tooltipEl.style.maxHeight = '80vh';
                tooltipEl.style.overflow = 'hidden';
                document.body.appendChild(tooltipEl);
                }
                
                // Hide if no tooltip
                if (tooltip.opacity === 0) {
                tooltipEl.style.opacity = '0';
                return;
                }
                
                // Set caret position
                tooltipEl.classList.remove('above', 'below', 'no-transform');
                if (tooltip.yAlign) {
                tooltipEl.classList.add(tooltip.yAlign);
                } else {
                tooltipEl.classList.add('no-transform');
                }
                
                if (tooltip.body) {
                const dataIndex = tooltip.dataPoints[0].dataIndex;
                const yValue = tooltip.title[0];
                const details = this.chartDetails[yValue];
                
                // Detectar se é mobile
                const isMobile = window.innerWidth <= 768;
                
                // Determinar status visual baseado nos dados
                const totalContainers = details?.count || 0;
                const uniqueContainers = details?.containerCount || 0;
                const pendencies = details?.pendencyCount || 0;
                const allocatedUsers = details?.userAllocationCount || 0;
                
                // Calcular o total geral de containers de todos os itens
                const totalContainersAll = Object.values(this.chartDetails).reduce((sum, item) => sum + (item.count || 0), 0);
                
                // Calcular porcentagem baseada no total geral
                const containerPercent = totalContainersAll > 0 ? 
                Math.round((totalContainers / totalContainersAll) * 100) : 0;
                
                // Determinar status baseado na porcentagem relativa
                const statusInfo = containerPercent >= 50 
                ? { text: 'Demanda concentrada', color: '#dc2626', bgColor: '#fee2e2', icon: '⚠️' }
                : containerPercent >= 30 
                ? { text: 'Demanda levimente concentrada', color: '#ea580c', bgColor: '#fed7aa', icon: '📌' }
                : containerPercent >= 10 
                ? { text: 'Demanda decentralizada', color: '#0284c7', bgColor: '#dbeafe', icon: '⚖️' }
                : { text: 'Menor Demanda', color: '#059669', bgColor: '#dcfce7', icon: '✅' };
                
                // Status das pendências
                const pendencyStatus = pendencies === 0 
                ? { text: 'Sem Pendências', color: '#059669', bgColor: '#dcfce7', icon: '✅' }
                : pendencies <= 5 
                ? { text: 'Poucas Pendências', color: '#0284c7', bgColor: '#dbeafe', icon: '🔍' }
                : { text: 'Várias Pendências', color: '#dc2626', bgColor: '#fee2e2', icon: '⚠️' };
                
                tooltipEl.innerHTML = `
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
                ">
                <!-- Cabeçalho do Item -->
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
                    background: linear-gradient(135deg, #0ea5e9 0%, #1e40af 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: ${isMobile ? '10px' : '12px'};
                    text-transform: uppercase;
                    box-shadow: 0 4px 8px rgba(14, 165, 233, 0.3);
                    ">
                    ${yValue.substring(0, 2)}
                    </div>
                    <div style="flex: 1;">
                    <div style="
                    font-weight: 700; 
                    color: #1e293b; 
                    font-size: ${isMobile ? '13px' : '15px'};
                    margin-bottom: 2px;
                    ">${yValue}</div>
                    <div style="
                    font-size: ${isMobile ? '10px' : '12px'}; 
                    color: #64748b;
                    ">${this.currentYAxis}</div>
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

                <!-- Percentual de Total de Containers -->
                <div style="margin-bottom: ${isMobile ? '12px' : '16px'};">
                    <div style="
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    margin-bottom: ${isMobile ? '6px' : '8px'};
                    ">
                    <span style="font-size: ${isMobile ? '11px' : '13px'}; color: #475569; font-weight: 500;">% Total de Containers</span>
                    <span style="
                    font-weight: 700; 
                    font-size: ${isMobile ? '14px' : '16px'};
                    color: ${statusInfo.color};
                    ">${containerPercent}%</span>
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
                    width: ${containerPercent}%;
                    height: 100%;
                    background: linear-gradient(90deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%);
                    border-radius: 10px;
                    transition: width 0.3s ease;
                    position: relative;
                    ">
                    ${containerPercent > 10 ? `
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

                <!-- Métricas Detalhadas -->
                <div style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: ${isMobile ? '8px' : '12px'};
                    margin-bottom: ${isMobile ? '10px' : '12px'};
                ">
                    <div style="
                    background: linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%);
                    padding: ${isMobile ? '8px' : '12px'};
                    border-radius: ${isMobile ? '6px' : '8px'};
                    text-align: center;
                    border: 1px solid #0284c720;
                    ">
                    <div style="
                    font-size: ${isMobile ? '14px' : '18px'};
                    font-weight: 700;
                    color: #0369a1;
                    margin-bottom: ${isMobile ? '2px' : '4px'};
                    ">${uniqueContainers.toLocaleString()}</div>
                    <div style="
                    font-size: ${isMobile ? '9px' : '11px'};
                    color: #0c4a6e;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    ">📦 Únicos</div>
                    </div>
                    
                    <div style="
                    background: linear-gradient(135deg, ${pendencies > 0 ? '#fef3c7' : '#dcfce7'} 0%, ${pendencies > 0 ? '#fde68a' : '#bbf7d0'} 100%);
                    padding: ${isMobile ? '8px' : '12px'};
                    border-radius: ${isMobile ? '6px' : '8px'};
                    text-align: center;
                    border: 1px solid ${pendencies > 0 ? '#f59e0b20' : '#22c55e20'};
                    ">
                    <div style="
                    font-size: ${isMobile ? '14px' : '18px'};
                    font-weight: 700;
                    color: ${pendencies > 0 ? '#d97706' : '#15803d'};
                    margin-bottom: ${isMobile ? '2px' : '4px'};
                    ">${pendencies.toLocaleString()}</div>
                    <div style="
                    font-size: ${isMobile ? '9px' : '11px'};
                    color: ${pendencies > 0 ? '#92400e' : '#166534'};
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    ">${pendencies > 0 ? '⚠️' : '✅'} Pendências</div>
                    </div>
                </div>

                <!-- Status das Pendências -->
                <div style="
                    background: linear-gradient(135deg, ${pendencyStatus.bgColor} 0%, ${pendencyStatus.bgColor}dd 100%);
                    padding: ${isMobile ? '8px' : '12px'};
                    border-radius: ${isMobile ? '6px' : '8px'};
                    text-align: center;
                    border: 1px solid ${pendencyStatus.color}20;
                    margin-bottom: ${isMobile ? '10px' : '12px'};
                ">
                    <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: ${isMobile ? '6px' : '8px'};
                    ">
                    <span style="font-size: ${isMobile ? '12px' : '14px'};">${pendencyStatus.icon}</span>
                    <span style="
                    font-size: ${isMobile ? '11px' : '13px'};
                    color: ${pendencyStatus.color};
                    font-weight: 600;
                    ">${pendencyStatus.text}</span>
                    </div>
                </div>

                <!-- Linha adicional: Usuários Alocados -->
                <div style="
                    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                    padding: ${isMobile ? '8px' : '12px'};
                    border-radius: ${isMobile ? '6px' : '8px'};
                    text-align: center;
                    border: 1px solid #3b82f620;
                    margin-bottom: ${isMobile ? '10px' : '12px'};
                ">
                    <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: ${isMobile ? '6px' : '8px'};
                    ">
                    <span style="
                    font-size: ${isMobile ? '10px' : '12px'};
                    color: #1d4ed8;
                    font-weight: 500;
                    ">👥 Usuários Alocados:</span>
                    <span style="
                    font-size: ${isMobile ? '14px' : '16px'};
                    font-weight: 700;
                    color: #1e3a8a;
                    ">${allocatedUsers.toLocaleString()}</span>
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
                    ">📊 Total de Containers:</span>
                    <span style="
                    font-size: ${isMobile ? '16px' : '20px'};
                    font-weight: 800;
                    color: #1e293b;
                    ">${totalContainers.toLocaleString()}</span>
                    </div>
                </div>

                ${(() => {
                    // Calcular porcentagem de pendências em relação aos containers únicos
                    const pendencyPercent = uniqueContainers > 0 ? 
                    Math.round((pendencies / uniqueContainers) * 100) : 0;
                    
                    if (pendencyPercent >= 100) {
                    return `
                    <div style="
                    margin-top: ${isMobile ? '8px' : '12px'};
                    padding: ${isMobile ? '6px' : '8px'};
                    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                    border-radius: ${isMobile ? '6px' : '8px'};
                    text-align: center;
                    border: 1px solid #dc2626;
                    ">
                    <span style="
                        font-size: ${isMobile ? '10px' : '12px'};
                        color: #dc2626;
                        font-weight: 600;
                    ">⚠️ Atenção: 100% Pendência</span>
                    </div>
                    `;
                    } else if (pendencyPercent >= 50) {
                    return `
                    <div style="
                    margin-top: ${isMobile ? '8px' : '12px'};
                    padding: ${isMobile ? '6px' : '8px'};
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    border-radius: ${isMobile ? '6px' : '8px'};
                    text-align: center;
                    border: 1px solid #f59e0b;
                    ">
                    <span style="
                        font-size: ${isMobile ? '10px' : '12px'};
                        color: #d97706;
                        font-weight: 600;
                    ">⚠️ Atenção: ${pendencyPercent}% da demanda Pendência</span>
                    </div>
                    `;
                    } else if (pendencyPercent === 0) {
                    return `
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
                    ">✅ Excelente! Sem pendências</span>
                    </div>
                    `;
                    } else {
                    return '';
                    }
                })()}
                </div>
                `;
                }
                
                // Display, position, and set styles for font
                tooltipEl.style.opacity = '1';
                tooltipEl.style.transition = 'all 0.2s ease';
                tooltipEl.style.position = 'fixed';
                tooltipEl.style.zIndex = '99999';
                
                // Usar getBoundingClientRect para posicionamento mais preciso
                const canvasRect = chart.canvas.getBoundingClientRect();
                let left = canvasRect.left + tooltip.caretX;
                let top = canvasRect.top + tooltip.caretY;
                
                // Posicionamento inicial para medir dimensões
                tooltipEl.style.left = left + 'px';
                tooltipEl.style.top = top + 'px';
                tooltipEl.style.transform = 'translate(-50%, -100%)';
                
                // Aguardar o próximo frame para obter dimensões corretas
                setTimeout(() => {
                const rect = tooltipEl.getBoundingClientRect();
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                const margin = 15;
                
                let finalLeft = left;
                let finalTop = top;
                let transformX = '-50%';
                let transformY = '-100%';
                
                // Ajustar posição horizontal
                if (rect.left < margin) {
                    // Muito à esquerda
                    transformX = '0%';
                    finalLeft = margin;
                } else if (rect.right > windowWidth - margin) {
                    // Muito à direita
                    transformX = '-100%';
                    finalLeft = windowWidth - margin;
                }
                
                // Ajustar posição vertical
                if (rect.top < margin) {
                    // Muito acima - mostrar abaixo
                    transformY = '15px';
                    finalTop = top + 30;
                } else if (rect.bottom > windowHeight - margin) {
                    // Muito abaixo - forçar para cima
                    transformY = '-100%';
                    finalTop = top - 30;
                }
                
                // Aplicar posição final
                tooltipEl.style.left = finalLeft + 'px';
                tooltipEl.style.top = finalTop + 'px';
                tooltipEl.style.transform = `translate(${transformX}, ${transformY})`;
                }, 0);
            }
            }
            },
            scales: {
            y: {
            beginAtZero: true,
            title: {
                display: false
            },
            grid: {
                display: false
            },
            ticks: {
                font: {
                size: 12
                }
            }
            },
            x: {
            title: {
                display: false
            },
            grid: {
                color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
                font: {
                size: 12
                }
            }
            }
            },
            animation: {
            duration: 1000,
            easing: 'easeOutQuart'
            }
            }
        });
    }
    
    updateChart() {
        // Se o modal não estiver aberto, não tentar atualizar o gráfico
        if (this.modal.style.display !== 'block') {
            return;
        }
        
        const aggregatedData = this.aggregateData(this.filteredData);
        
        if (aggregatedData.labels.length === 0) {
            // If no data, destroy chart and show message
            if (this.chart) {
                this.chart.destroy();
                this.chart = null;
            }
            const chartContainer = document.querySelector('.chart-container');
            if (chartContainer) {
                // Check if there are any active filter selections
                const activeFilters = this.getFilterElements();
                const hasActiveSelections = activeFilters.some(filter => 
                    filter.selectedValues && filter.selectedValues.length > 0
                );
                
                const message = hasActiveSelections ? 
                    'Nenhum dado encontrado para os filtros selecionados' : 
                    'Todos os dados estão sendo exibidos';
                
                chartContainer.innerHTML = `<div class="no-data">${message}</div>`;
            }
            return;
        }
        
        // Se o gráfico não existe, criar um novo
        if (!this.chart) {
            this.initChart();
            return;
        }
        
        // Atualizar dados detalhados para uso no tooltip
        this.chartDetails = aggregatedData.details;
        
        this.chart.data.labels = aggregatedData.labels;
        this.chart.data.datasets[0].data = aggregatedData.values;
        
        // Update chart title
        this.chart.options.plugins.title.text = this.chartTitle.textContent;
        
        this.chart.update('active');
    }
    
    aggregateData(data) {
        const aggregation = {};
        
        data.forEach(item => {
            const yValue = item[this.currentYAxis] || `Sem ${this.currentYAxis}`;
            
            if (aggregation[yValue]) {
                aggregation[yValue].count += item.Container || 0;
                aggregation[yValue].containerCount += item.containers_unicos || 0;
                aggregation[yValue].pendencyCount += item["Pendência"] || 0;
                aggregation[yValue].userAllocationCount += item["Usuário Alocado"] || 0;
            } else {
                aggregation[yValue] = {
                    count: item.Container || 0,
                    containerCount: item.containers_unicos || 0,
                    pendencyCount: item["Pendência"] || 0,
                    userAllocationCount: item["Usuário Alocado"] || 0
                };
            }
        });
        
        // Sort by value (descending)
        const sorted = Object.entries(aggregation)
            .sort(([,a], [,b]) => b.count - a.count);
        
        return {
            labels: sorted.map(([yValue]) => yValue),
            values: sorted.map(([, data]) => data.count),
            details: sorted.reduce((acc, [yValue, data]) => {
                acc[yValue] = data;
                return acc;
            }, {})
        };
    }
    
    showLoading() {
        const chartContainer = document.querySelector('.chart-container');
        chartContainer.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Carregando dados...</p>
            </div>
        `;
    }
    
    hideLoading() {
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = '<canvas id="separacaoChart"></canvas>';
        }
    }
    
    showError(message) {
        const chartContainer = document.querySelector('.chart-container');
        chartContainer.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <p>${message}</p>
            </div>
        `;
    }
}

// Initialize the modal chart when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ModalChart();
});

