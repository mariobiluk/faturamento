document.addEventListener('DOMContentLoaded', function() {
    const grafico = document.getElementById('graf');
    let chart = null;
    let valores = {
        segunda: null,
        terca: null,
        quarta: null,
        quinta: null,
        sexta: null
    };
    
    // Elementos do DOM
    const diaSemanaSelect = document.getElementById('diaSemana');
    const valorInput = document.getElementById('valor');
    const listaValores = document.getElementById('listaValores');
    const adicionarBtn = document.getElementById('adicionarBtn');
    const gerarBtn = document.getElementById('gerarBtn');
    const limparBtn = document.getElementById('limparBtn');
    
    // Dias da semana para labels
    const diasSemana = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
    const diasIds = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
    
    // Atualiza a lista de valores salvos
    function atualizarListaValores() {
        listaValores.innerHTML = '';
        
        diasIds.forEach((dia, index) => {
            if (valores[dia] !== null) {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="dia">${diasSemana[index]}:</span>
                    <span class="valor">R$ ${valores[dia].toFixed(2)}</span>
                    <button class="remover-btn" data-dia="${dia}">×</button>
                `;
                listaValores.appendChild(li);
            }
        });
        
        // Adiciona event listeners aos botões de remover
        document.querySelectorAll('.remover-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const dia = this.getAttribute('data-dia');
                valores[dia] = null;
                atualizarListaValores();
            });
        });
    }
    
    // Adiciona valor ao objeto de valores
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
        atualizarListaValores();
        
        // Limpa os campos
        diaSemanaSelect.value = '';
        valorInput.value = '';
        valorInput.focus();
    }
    
    // Gera o gráfico
    function gerarGrafico() {
        const dados = diasIds.map(dia => valores[dia] || 0);
        
        if (dados.every(valor => valor === 0)) {
            alert('Adicione pelo menos um valor antes de gerar o gráfico!');
            return;
        }
        
        if (chart) {
            chart.destroy();
        }
        
        chart = new Chart(grafico, {
            type: 'bar', // Pode mudar para 'doughnut' se preferir
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
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Valor (R$)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Dia da Semana'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `R$ ${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Limpa todos os valores
    function limparTudo() {
        if (confirm('Tem certeza que deseja limpar todos os valores?')) {
            valores = {
                segunda: null,
                terca: null,
                quarta: null,
                quinta: null,
                sexta: null
            };
            atualizarListaValores();
            
            if (chart) {
                chart.destroy();
                chart = null;
            }
        }
    }
    
    // Event Listeners
    adicionarBtn.addEventListener('click', adicionarValor);
    gerarBtn.addEventListener('click', gerarGrafico);
    limparBtn.addEventListener('click', limparTudo);
    
    // Permitir adicionar com Enter
    valorInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            adicionarValor();
        }
    });
});