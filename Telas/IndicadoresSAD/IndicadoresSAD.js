document.addEventListener('DOMContentLoaded', () => {
    // Verifica se Chart.js está carregado
    if (typeof Chart === 'undefined') {
        console.error('Chart.js não está carregado. Verifique o link no seu HTML.');
        return;
    }

    // Cor primária do CSS
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#0047bb';
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-secondary').trim() || '#e74c3c';

    // Dados simulados
    const monthlyLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyExtractionData = [800, 1200, 1000, 450, 550, 600, 580, 850, 840, 1150, 950, 1250];

    // --- 1. Gráfico Mini (Média Diária) ---
    const miniCtx = document.getElementById('daily-avg-chart-mini');
    if (miniCtx) {
        new Chart(miniCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'],
                datasets: [{
                    data: [1000, 900, 1200, 800, 1500, 1100, 1400],
                    borderColor: primaryColor,
                    backgroundColor: `${primaryColor}30`, // Cor com 30% de opacidade
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4,
                    fill: true,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } }
            }
        });
    }

    // --- 2. Gráfico Principal (Tendência de Extração) ---
    const mainCtx = document.getElementById('extraction-trend-chart');
    let extractionTrendChart;

    if (mainCtx) {
        extractionTrendChart = new Chart(mainCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: monthlyLabels,
                datasets: [{
                    label: 'Laudos Extraídos',
                    data: monthlyExtractionData,
                    backgroundColor: primaryColor,
                    hoverBackgroundColor: 'rgba(0, 71, 187, 0.8)',
                    borderRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Qtd. de Laudos' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }


    // --- 3. Ranking de Confiabilidade (Populando a lista) ---
    const rankingData = [
        { name: 'Tipo Laudo Urbano A', extracted: '3.234', reliability: '98,5%' },
        { name: 'Tipo Laudo Rural B', extracted: '2.871', reliability: '96,1%' },
        { name: 'Laudos Comerciais C', extracted: '1.922', reliability: '94,0%' },
        { name: 'Laudos Residenciais D', extracted: '1.503', reliability: '92,5%' },
        { name: 'Laudos Especiais E', extracted: '1.187', reliability: '90,8%' },
    ];

    const reliabilityRanking = document.getElementById('reliability-ranking');
    if (reliabilityRanking) {
        rankingData.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span class="rank-number" style="background-color: ${secondaryColor};">${index + 1}</span>
                <span class="ranking-name">${item.name}</span>
                <span class="ranking-value">${item.extracted}</span>
            `;
            reliabilityRanking.appendChild(listItem);
        });
    }

    // --- 4. Lógica de Filtros de Tempo ---
    const filterButtons = document.querySelectorAll('.filter-button');

    function updateChartData(period) {
        if (!extractionTrendChart) return;

        let newLabels, newData;

        // Simulação de dados para diferentes períodos
        switch(period) {
            case 'day':
                newLabels = ['08h', '10h', '12h', '14h', '16h', '18h', '20h'];
                newData = [150, 250, 300, 200, 400, 350, 100];
                break;
            case 'week':
                newLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
                newData = [1100, 1050, 1300, 1150, 1500, 800, 600];
                break;
            case 'year':
                newLabels = ['2021', '2022', '2023', '2024'];
                newData = [8500, 10500, 14000, 16000];
                break;
            case 'month':
            default:
                newLabels = monthlyLabels;
                newData = monthlyExtractionData;
                break;
        }

        // Atualiza o gráfico principal
        extractionTrendChart.data.labels = newLabels;
        extractionTrendChart.data.datasets[0].data = newData;
        extractionTrendChart.update();
    }
    
    // Event Listeners para filtros
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const period = this.getAttribute('data-period');
            updateChartData(period);
        });
    });

    // --- 5. Lógica de Abas (Tabs) ---
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove 'active' de todas as abas
            tabButtons.forEach(t => t.classList.remove('active'));
            // Adiciona 'active' à aba clicada
            this.classList.add('active');
            
            // Lógica de troca de gráfico
            if (this.textContent === 'Confiabilidade') {
                // Mudar o gráfico para Confiabilidade (simulação de um gráfico de linhas)
                const reliabilityData = [90, 92, 95, 93, 91, 95, 96, 95, 97, 98, 95, 99]; // Simulação de percentuais
                extractionTrendChart.config.type = 'line';
                extractionTrendChart.data.datasets[0].label = 'Confiabilidade Média (%)';
                extractionTrendChart.data.datasets[0].data = reliabilityData;
                extractionTrendChart.data.datasets[0].backgroundColor = `${secondaryColor}30`;
                extractionTrendChart.data.datasets[0].borderColor = secondaryColor;
                extractionTrendChart.data.datasets[0].type = 'line';
                extractionTrendChart.options.scales.y.title.text = 'Confiabilidade (%)';
            } else {
                // Voltar ao gráfico de Extrações (Barras)
                extractionTrendChart.config.type = 'bar';
                extractionTrendChart.data.datasets[0].label = 'Laudos Extraídos';
                extractionTrendChart.data.datasets[0].data = monthlyExtractionData;
                extractionTrendChart.data.datasets[0].backgroundColor = primaryColor;
                extractionTrendChart.data.datasets[0].borderColor = primaryColor;
                extractionTrendChart.data.datasets[0].type = 'bar';
                extractionTrendChart.options.scales.y.title.text = 'Qtd. de Laudos';
            }
            extractionTrendChart.update();
        });
    });

    // Inicializa o gráfico de extrações como o padrão
    if (extractionTrendChart) {
        updateChartData('month');
    }
});