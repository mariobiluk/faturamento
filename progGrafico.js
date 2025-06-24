document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const graficoCanvas = document.getElementById('graf');
    const diaSemanaSelect = document.getElementById('diaSemana');
    const valorInput = document.getElementById('valor');
    const listaValores = document.getElementById('listaValores');
    const adicionarBtn = document.getElementById('adicionarBtn');
    const gerarBtn = document.getElementById('gerarBtn');
    const limparBtn = document.getElementById('limparBtn');
    const exportarBtn = document.getElementById('exportarBtn');
    const tipoGraficoSelect = document.getElementById('tipoGrafico');
    
    // Dados
    const diasSemana = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
    const diasIds = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
    let valores = {
        segunda: null,
        terca: null,
        quarta: null,
        quinta: null,
        sexta: null
    };
    let chart = null;
    
    // Atualizar ano no footer
    document.getElementById('anoAtual').textContent = new Date().getFullYear();
    
    // Atualizar tabela de valores
    function atualizarTabelaValores() {
        listaValores.innerHTML = '';
        
        diasIds.forEach((dia, index) => {
            if (valores[dia] !== null) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${diasSemana[index]}</td>
                    <td>R$ ${valores[dia].toFixed(2)}</td>
                    <td>
                        <button class="action-btn" data-dia="${dia}" title="Remover valor">
                            ✖
                        </button>
                    </td>
                `;
                listaValores.appendChild(tr);
            }
        });
        
        // Adicionar event listeners aos botões de remover
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const dia = this.getAttribute('data-dia');
                valores[dia] = null;
                atualizarTabelaValores();
            });
        });
    }
    
    // Adicionar valor
    function adicionarValor() {
        const dia = diaSemanaSelect.value;
        const valor = parseFloat(valorInput.value);
        
        if (!dia) {
            alert('Por favor, selecione um dia da semana!');
            return;
        }
        
        if (isNaN(valor)) {
            alert('Por favor, insira um valor válido!');
            return;
        }
        
        valores[dia] = valor;
        atualizarTabelaValores();
        
        // Limpar campos
        diaSemanaSelect.value = '';
        valorInput.value = '';
        diaSemanaSelect.focus();
    }
    
    // Gerar gráfico
    function gerarGrafico() {
        const dados = diasIds.map(dia => valores[dia] || 0);
        const tipoGrafico = tipoGraficoSelect.value;
        
        if (dados.every(valor => valor === 0)) {
            alert('Adicione pelo menos um valor antes de gerar o gráfico!');
            return;
        }
        
        // Destruir gráfico existente
        if (chart) {
            chart.destroy();
        }
        
        // Configurações do gráfico
        const config = {
            type: tipoGrafico,
            data: {
                labels: diasSemana,
                datasets: [{
                    label: 'Faturamento (R$)',
                    data: dados,
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `R$ ${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: tipoGrafico === 'bar' || tipoGrafico === 'line' ? {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(2);
                            }
                        }
                    }
                } : {}
            }
        };
        
        // Criar novo gráfico
        chart = new Chart(graficoCanvas, config);
    }
    
    // Limpar todos os dados
    function limparTudo() {
        if (confirm('Tem certeza que deseja limpar todos os valores?')) {
            valores = {
                segunda: null,
                terca: null,
                quarta: null,
                quinta: null,
                sexta: null
            };
            atualizarTabelaValores();
            
            if (chart) {
                chart.destroy();
                chart = null;
            }
        }
    }
    
    // Exportar para Excel
    function exportarParaExcel() {
        if (Object.values(valores).every(val => val === null)) {
            alert('Não há dados para exportar!');
            return;
        }
        
        // Preparar dados
        const dados = [
            ['Dia da Semana', 'Faturamento (R$)'],
            ...diasSemana.map((dia, index) => [
                dia,
                valores[diasIds[index]] || 0
            ])
        ];
        
        // Criar planilha
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(dados);
        
        // Formatar colunas
        ws['!cols'] = [
            { wch: 20 }, // Largura coluna dias
            { wch: 15 }  // Largura coluna valores
        ];
        
        // Formatar valores como monetário
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let row = 1; row <= range.e.r; row++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: 1 });
            if (ws[cellAddress]) {
                ws[cellAddress].t = 'n';
                ws[cellAddress].z = '"R$"#,##0.00';
            }
        }
        
        // Adicionar planilha ao workbook
        XLSX.utils.book_append_sheet(wb, ws, "Faturamento");
        
        // Gerar nome do arquivo com data
        const dataAtual = new Date();
        const nomeArquivo = `Faturamento_${dataAtual.getDate()}-${dataAtual.getMonth()+1}-${dataAtual.getFullYear()}.xlsx`;
        
        // Exportar
        XLSX.writeFile(wb, nomeArquivo);
    }
    
    // Event Listeners
    adicionarBtn.addEventListener('click', adicionarValor);
    gerarBtn.addEventListener('click', gerarGrafico);
    limparBtn.addEventListener('click', limparTudo);
    exportarBtn.addEventListener('click', exportarParaExcel);
    tipoGraficoSelect.addEventListener('change', function() {
        if (chart) {
            gerarGrafico();
        }
    });
    
    // Permitir adicionar com Enter
    valorInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            adicionarValor();
        }
    });
});