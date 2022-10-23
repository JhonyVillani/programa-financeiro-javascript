class Graph {
    constructor() {

    }

    carregaGraph() {
        carregaSaldo()
        this.tab = mainTab //Sincroniza os dandos entre as views
        this.tabCategorias = categTab

        omiteCamposTabela()

        $('.collapse').collapse('hide');
        document.getElementById("tituloTabela").innerHTML = `<h3>Gráfico (${setUpperCase(mmName)})</h3>`;

        document.getElementById("conteudoJSON").innerHTML = '<canvas id="myChart"></canvas>'

        let ctx = document.getElementById("myChart");
        let dados

        dados = {
            // datasets: [{
            //     data: [10, 20, 30],
            //     backgroundColor: ['rgb(255, 99, 132)', 'rgb(255, 199, 132)', 'rgb(55, 99, 132)']
            // }],

            // labels: ['Vermelho', 'Amarelo', 'Azul']

            datasets: [{
                data: [10],
                backgroundColor: ['rgb(168, 168, 168)']
            }],

            labels: ['Rendimentos']
        };

        if (this.tab != "") {
            let totalCategorizado = 0
            let valores = []
            let cores = []
            let labels = []

            if (saldoEstimado != 0 || despesaEstimada != 0) {

                if (saldoEstimado > despesaEstimada) {
                    valores.push(saldoEstimado - despesaEstimada)
                    cores.push('rgb(77, 255, 0)')
                    labels.push('Saldo positivo')
                } else {
                    valores.push(saldoEstimado - despesaEstimada)
                    cores.push('rgb(255, 0, 0)')
                    labels.push('Saldo negativo')
                }

                for (let i = 0; i < this.tabCategorias.length; i++) {
                    totalCategorizado += categoriasController.carregaTotalUtilizado(this.tabCategorias[i].categoria)
                    valores.push(categoriasController.carregaTotalUtilizado(this.tabCategorias[i].categoria))
                    cores.push(this.tabCategorias[i].cor)
                    labels.push(this.tabCategorias[i].categoria)
                }

                if (despesaEstimada >= totalCategorizado && (despesaEstimada - totalCategorizado) != 0) {
                    valores.push(despesaEstimada - totalCategorizado)
                    cores.push('rgb(168, 168, 168)')
                    labels.push('Sem categoria')
                }

                dados = {
                    datasets: [{
                        data: valores,
                        backgroundColor: cores
                    }],

                    labels: labels
                };
            }
        }

        let opcoes = {
            responsive: true,
            legend: {
                position: 'bottom',
            },
            title: {
                display: false,
                text: 'Chart.js Doughnut Chart'
            },
            animation: {
                animateScale: true,
                animateRotate: true
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        var dataset = data.datasets[tooltipItem.datasetIndex];
                        var total = dataset.data.reduce(function (previousValue, currentValue, currentIndex, array) {
                            return previousValue + currentValue;
                        });
                        var currentValue = dataset.data[tooltipItem.index];
                        var percentage = Math.floor(((currentValue / total) * 100) + 0.5);
                        return percentage + "%";
                    }
                }
            }
        };

        let meuDonutChart = new Chart(ctx, {
            type: 'doughnut',
            data: dados,
            options: opcoes
        });

        transicaoFade(500)

    }

}

