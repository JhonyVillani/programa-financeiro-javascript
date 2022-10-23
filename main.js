const despesasController = new Despesas(1, 'Alice', 100);
const rendimentosController = new Rendimentos();
const categoriasController = new Categorias()
const desejosController = new Desejos()
const graphController = new Graph();

class Registro {
    constructor(id, tabela, despesa, valor, status, vencimento, forma, categoria, parcelas, modificacao, recorrente) {
        this.id = id;
        this.tabela = tabela //Grava a categoria da tabela para utilização de um único JSON
        this.despesa = despesa;
        this.valor = valor;
        this.status = status;
        this.vencimento = vencimento;
        this.forma = forma;
        this.categoria = categoria;
        this.parcelas = parcelas
        this.modificacao = modificacao
        this.recorrente = recorrente
    }
}

class Categoria {
    constructor(id, categoria, limite, cor) {
        this.id = id;
        this.categoria = categoria;
        this.limite = limite;
        this.cor = cor;
    }
}

var d = new Date()
var touchTime = d.getTime()
let touchstartX = 0
let touchendX = 0

function checkDirection() {
    let sensibilidade = 70
    let tempoMax = 200
    let maxPg = 5 // Máximo de janelas que rotaciona
    let dAux = new Date()
    let touchTimeAux = dAux.getTime()

    if (touchendX < touchstartX && (touchstartX - touchendX) > sensibilidade && (touchTimeAux - touchTime) < tempoMax) {
        if (++navigation > maxPg) {
            navigation = 1
        }
        viewController(navigation)
    }
    if (touchendX > touchstartX && (touchendX - touchstartX) > sensibilidade && (touchTimeAux - touchTime) < tempoMax) {
        if (--navigation <= 0) {
            navigation = maxPg
        }
        viewController(navigation)
    }
}

document.addEventListener('touchstart', e => {
    d = new Date()
    touchTime = d.getTime()
    touchstartX = e.changedTouches[0].screenX
})

document.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX
    checkDirection()
})

var mainTab = []
var categTab = []

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var mmName = today.toLocaleString('pt-BR', {
    month: 'long',
});
var yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;

var formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

var fixmeTop = $('.fixme').offset().top; //função para arrow mobile aparecer e rolar conforme scroll
$(window).scroll(function () {
    var currentScroll = $(window).scrollTop();
    if (currentScroll >= fixmeTop) {
        $('.fixme').css({
            position: 'fixed',
            top: '0',
            left: '0'
        });
    } else {
        $('.fixme').css({
            position: 'relative'
        });
    }
});

var navigation = 0 //controle de tela

var enableSound = true
var enableResponsive = true
var usingApp = false

var saldoTotal
var despesasTotais
var saldoEstimado
var despesaEstimada

function viewController(index) {
    carregaNav(index)
    switch (index) {
        case 1:
            rendimentosController.carregaRendimentos()
            break;
        case 2:
            despesasController.carregaDespesas()
            break;
        case 3:
            categoriasController.carregaCategorias()
            break;
        case 4:
            desejosController.carregaDesejos()
            break;
        case 5:
            graphController.carregaGraph()
            break;
    }
}

function onInit() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const section = urlParams.get('section')

    $(".progress-bar").animate({
        width: "100%"
    }, 600);

    setTimeout(function () {
        document.getElementById("loadingBar").style.display = "none";
        console.log("Implementar await da consulta com BD aqui")
        console.log("carrega temporário, excluir linha abaixo")
        console.log("Adicionar promise pra ler storage e devolver barra de carregamento")

        reorganizarMes() //Verifica o mês atual
        switch (section) {
            case "despesas":
                viewController(2)
                break;
            case "rendimentos":
                viewController(1)
                break;
            case "categorias":
                viewController(3)
                break;
            case "wishlist":
                viewController(4)
                break;
            default:
                viewController(5)
        }

    }, 800);

}

function carregaSaldo() {
    if (mainTab == "") {
        document.getElementById("saldo_tela").innerHTML = ""
        document.getElementById("saldo_estimado_tela").innerHTML = ""
        document.getElementById("despesa_estimada_tela").innerHTML = ""
        return
    }

    saldoTotal = 0
    despesasTotais = 0
    saldoEstimado = 0
    despesaEstimada = 0

    for (let i = 0; i < mainTab.length; i++) {
        //Valores reais
        if (mainTab[i].tabela == "despesas" && mainTab[i].status == "Pago") {
            despesasTotais += parseFloat((mainTab[i].valor == "" ? 0 : mainTab[i].valor))
        } else if (mainTab[i].tabela == "rendimentos" && mainTab[i].status == "Recebido") {
            saldoTotal += parseFloat((mainTab[i].valor == "" ? 0 : mainTab[i].valor))
        }

        //Valores estimados
        if (mainTab[i].tabela == "despesas") {
            despesaEstimada += parseFloat((mainTab[i].valor == "" ? 0 : mainTab[i].valor))
        } else if (mainTab[i].tabela == "rendimentos") {
            saldoEstimado += parseFloat((mainTab[i].valor == "" ? 0 : mainTab[i].valor))
        }
    }

    saldoTotal -= despesasTotais

    if (saldoTotal > 0) {
        document.getElementById("saldo_tela").innerHTML = `
            Saldo atual: <b class="text-success">${formatter.format(saldoTotal)} <i class="fa fa-caret-up" style="font-weight: bold;"></i></b>
        `;
    } else {
        document.getElementById("saldo_tela").innerHTML = `
            Saldo atual: <b class="text-danger">${formatter.format(saldoTotal)} <i class="fa fa-caret-down" style="font-weight: bold;"></i></b>
        `;
    }

    document.getElementById("saldo_estimado_tela").innerHTML = `
        Saldo total estimado: ${formatter.format(saldoEstimado)}
    `;

    document.getElementById("despesa_estimada_tela").innerHTML = `
        Despesa total estimada: ${formatter.format(despesaEstimada)} 
    `;

}

function carregaNav(index) {
    navigation = parseInt(index)

    let navTab = document.getElementsByClassName('nav-item')

    for (let i = 0; i < navTab.length; i++) {
        if (index == "5" && i == 0) {
            navTab[i].classList.add("active");
        } else if (index == i) {
            navTab[i].classList.add("active");
        } else {
            navTab[i].classList.remove("active");
        }
    }

}

function setUpperCase(string) {
    let str = string;
    let str2 = str.charAt(0).toUpperCase() + str.slice(1);
    return str2
}

function calculaStatus(status, data) {

    let vencimento
    if (data != "") {
        vencimento = data.substr(8, 2)
            + '/' + data.substr(5, 2)
            + '/' + data.substr(0, 4)
    }

    if (status == "Recebido" || status == "Pago") {
        return vencimento
    } else if (data != "") {
        let hoje = new Date(today)
        let venc = new Date(data)

        let diference = venc.getTime() - hoje.getTime()
        diference = Math.ceil(diference / (1000 * 3600 * 24))
        if (diference == 0) {
            return "Hoje"
        } else if (diference > 0) {
            return `Faltam ${diference} dia(s)`
        } else if (diference < 0) {
            return `Atrasado há ${diference * -1} dia(s)`
        }

    }
}

function reorganizarMes(action = false) {
    if (mainTab == "") {
        return
    }

    let tabDespesas = Array.from(mainTab).sort(function (a, b) {
        return a.vencimento - b.vencimento;
    });

    if (action) {
        let _confirm = confirm("Deseja reiniciar o status das despesas?")
        if (!_confirm) return
    }

    for (let i = 0; i < tabDespesas.length; i++) {
        let hoje = new Date(today)
        let venc = new Date(tabDespesas[i].vencimento)

        if (action) {
            if (tabDespesas[i].status == "Recebido" || tabDespesas[i].status == "Pago") {
                if (tabDespesas[i].recorrente == true) {
                    venc.setMonth(hoje.getMonth())

                    let vencdd = String(venc.getDate()).padStart(2, '0');
                    let vencmm = String(venc.getMonth() + 1).padStart(2, '0');
                    let vencyyyy = venc.getFullYear();

                    venc = vencyyyy + '-' + vencmm + '-' + (++vencdd);

                    tabDespesas[i].vencimento = venc
                    tabDespesas[i].status = "Pendente"
                } else {
                    tabDespesas.splice(i, 1)
                    --i
                }

            }

        } else {
            if (tabDespesas[i].status == "Recebido" || tabDespesas[i].status == "Pago") {
                if (hoje.getMonth() != venc.getMonth()) {
                    document.getElementById('btn_reorganizar').classList.add("btn-success");
                    document.getElementById('btn_reorganizar').disabled = false;
                    return
                }
            }
        }

    }

    if (action) {
        localStorage.setItem("__despesas__", JSON.stringify(tabDespesas))
        mainTab = tabDespesas

        playSoungEffect("success")

        location.reload()
    }

}

function carregaTelaInicio(firstTime = false) {

    window.history.replaceState(null, null, window.location.pathname);
    document.getElementById('conteudoJSON').innerHTML = "";
    $('.collapse').collapse('hide');

    omiteCamposTabela()

    if (firstTime) {

        $(".progress-bar").animate({
            width: "100%"
        }, 2500);

        setTimeout(function () {
            document.getElementById("loadingBar").style.display = "none";
            carregaCampos()
        }, 2500);

    } else {
        carregaCampos()
    }

    // function carregaCampos() {

    //     document.getElementById("tituloTabela").innerHTML = `<h3 id="tituloTabela">
    //         Nome da sua empresa AQUI
    //         <small class="text-muted">Início</small></h3>`;

    //     let img = document.createElement("IMG");

    //     let node = document.createElement("DIV");
    //     node.innerHTML = `
    //     <button type="button" class="btn btn-primary full-width"
    //         onclick="carregaClientes(), populaModal('clientes')"><i class="fa fa-user"></i> Clientes</button>
    //     <br><button type="button" class="btn btn-primary full-width"
    //         onclick="carregaItens(), populaModal('itens')"><i class="fa fa-shopping-bag"></i> Itens</button>
    //     <br><button type="button" class="btn btn-primary full-width"
    //         onclick="carregaPedidos(), populaModal('pedidos')"><i class="fa fa-shopping-cart"></i> Pedidos</button>
    //     <br><button type="button" class="btn btn-primary full-width"
    //         onclick="carregaHistorico(), populaModal('historico')"><i class="fa fa-history"></i> Histórico</button>
    // `;

    //     node.style.cssText = 'padding: 5px 0 5px 0;'
    //     node.setAttribute("class", "visible-xs-block visible-sm-block border border-light");

    //     img.src = "resources/img/bg senai adm.png";
    //     img.id = "bgImg"

    //     document.getElementById('conteudoJSON').appendChild(img);
    //     document.getElementById('conteudoJSON').appendChild(node);

    //     transicaoFade()
    // }

}

// // limpa campos ao clicar em Adicionar
// $("#addBtn").on("click", function () {
//     limpaCamposModal()
// })

// monta layout de impressão do orçamento
function printLayout(id, tabela) {

    let posPedido, detalhePedido, nomeCliente, htmlTable = "",
        vlrTotal = 0

    if (tabela == "pedidos") {
        posPedido = tabPedidos.findIndex(i => i.id == id);
        detalhePedido = tabPedidos[posPedido]
        nomeCliente = arraycheck(detalhePedido.pessoaId)
    } else {
        posPedido = tabHistorico.findIndex(i => i.id == id);
        nomeCliente = tabHistorico[posPedido].pessoaId
        detalhePedido = tabHistorico[posPedido]
    }

    let itensArray = detalhePedido.itens

    for (i = 0; i < itensArray.length; i++) {

        htmlTable += `
            <tr style="border: 1px solid black;">
                <td>${itensArray[i].nome}</td>
                <td>${formatter.format(itensArray[i].preco)}</td>
                <td>${formatter.format(itensArray[i].preco)}</td>
            </tr>
        `;

        vlrTotal += parseFloat(itensArray[i].preco)

    }

    htmlTable += `
        <tr style="border: 1px solid black;">
            <td></td>
            <td><b>TOTAL</b></td>
            <td><b>${formatter.format(vlrTotal)}</b></td>
        </tr>
    `;

    let dtPedido = detalhePedido.dtPedido.substr(8, 2) + '/' + detalhePedido.dtPedido.substr(5, 2) + '/' + detalhePedido.dtPedido.substr(0, 4)

    // let layout = window.open('', '', 'height=842px, width=595px, margin-left: auto, margin-right: auto');
    let layout = window.open('', 'Print-Window');

    layout.document.write(`
        <html>
            <head>
                <title>Orçamento - Meu negócio AQUI</title>

                <!-- Bootstrap core CSS -->
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css"
                    integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossorigin="anonymous">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css">

                <style type="text/css">
                    td {
                        padding-left: 20px;
                    }
                    p {
                        margin: 0;
                        padding: 0;
                    }
                </style>
            </head>

            <header>
                <div class="row">
                    <div class="col-md-4" align="center">
                        <img src="resources/img/bg senai adm.png" alt="Logo" style="width:150px;" />
                    </div>
                    <div class="col-md-4">
                        <h3>Seu negócio AQUI</h3>
                        <p>Rua Teste de Setembro, 1500 - Jd Teste - SP</p>
                        <p>Tel.: (11) 99999-9999 / E-mail: teste@seunegocio.com</p>
                    </div>
                    <div class="col-md-4" style="margin-top: auto; margin-bottom: auto;">
                        <p>Número do pedido: ${id}</p>
                        <p>Data: ${dtPedido}</p>
                        <p>Válido até:</p>
                    </div>
                </div>
            </header>

            <body>
                <div class="row">
                    <div class="col-md-12">
                        <h3 align="center"><b>Orçamento</b></h3>
                    </div>
                </div>

                <div>
                    <div class="row">
                        <div class="col-md-12" >
                            <p>Cliente: ${nomeCliente}</p>
                            <p>E-mail: teste@seunegocio.com</p>
                            <p>CPF: 999.999.999-10</p>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-12">
                        <p align="center"><b>Itens</b></p>
                    </div>
                </div>

                <div class="row" style="margin: 0 10% 0 10%">
                    <table style="width:100%; border: 1px solid black;">
                        <tr style="border: 1px solid black;">
                            <th style="width: 60%;">Quantidade</th>
                            <th style="width: 20%;">Valor Unitário</th>
                            <th style="width: 20%;">Valor Total</th>
                        </tr>
                        ` + htmlTable + `
                    </table>
                </div>
            </body>
        </html>
    `);

    setTimeout(function () { //necessário para carregar o conteúdo completo
        layout.document.close();
        layout.focus();
        layout.print();
        layout.close();
    }, 1000);

    return true

    function arraycheck(id) {

        let found = false; // flag
        let valor
        for (let i = 0; !found && i < tabPessoas.length; i++) {
            // sai do loop ao encontrar o valor
            found = id == tabPessoas[i].id; // define o flag ao encontrar
            valor = tabPessoas[i].nome + " " + tabPessoas[i].sobrenome
        }
        if (found) {
            return valor
        }
    }
}

function exibeCamposTabela() {
    document.getElementById("addBtn").style.display = "initial";
    document.getElementById("tabFilter").style.display = "initial";
    document.getElementById("tabExport").style.display = "initial";
    document.getElementById("tabNav").style.display = "initial";
}

function omiteCamposTabela() {
    document.getElementById("addBtn").style.display = "none"; //omite botão de adicionar na tela inicial
    document.getElementById("tabFilter").style.display = "none";
    document.getElementById("tabExport").style.display = "none";
    document.getElementById("tabNav").style.display = "none";
}

async function lerStorage() {

    mainTab = JSON.parse(localStorage.getItem("__despesas__")) == null ? [] : JSON.parse(localStorage.getItem("__despesas__"))
    categTab = JSON.parse(localStorage.getItem("__categorias__")) == null ? [] : JSON.parse(localStorage.getItem("__categorias__"))

    if (JSON.parse(sessionStorage.getItem('app')) == "true") {
        usingApp = true
    } else {
        usingApp = false
    }

    enableSound = JSON.parse(localStorage.getItem("__sound__"))
    if (enableSound == null) {
        enableSound = true
    }

    enableResponsive = JSON.parse(localStorage.getItem("__responsive__"))
    if (enableResponsive == null) {
        enableResponsive = true
    }

}

function playSoungEffect(effect) {

    if (!enableSound) {
        return false
    }

    let audio

    switch (effect) {
        case "success":
            audio = new Audio('resources/audio/mixkit-software-interface-start.wav');
            break;
        case "error":
            audio = new Audio('resources/audio/mixkit-software-interface-remove.wav');
            break;
        case "warning":
            audio = new Audio('resources/audio/mixkit-software-interface-back.wav');
            break;
        case "paid":
            audio = new Audio('resources/audio/mixkit-money-bag-drop.wav');
            break;
        case "undo":
            audio = new Audio('resources/audio/mixkit-coins-sound.wav');
            break;
        default:
            console.log("Efeito sonoro não existe")
    }

    audio.play();
}

function transicaoFade(interval = 1000) {
    //  efeito fade ao abrir tabela
    document.getElementById("conteudoJSON").style.display = "none";
    $('#conteudoJSON').fadeIn(interval);
}

// chama a classe datatables
function carregaTabelaDatatables(tabela) {

    if (!enableResponsive) {
        $("#tabelaJson").removeClass("dt-responsive nowrap")
    }

    $.extend(true, $.fn.dataTable.defaults, {
        "lengthMenu": [10, 25, 50, 75, 100],

        oLanguage: {
            "sProcessing": "Processando...",
            "sLengthMenu": "Mostrar _MENU_ registros",
            "sZeroRecords": "Não há resultados",
            "sEmptyTable": "Não há registros na tabela",
            "sInfo": "Mostrando registros de _START_ a _END_ de _TOTAL_ registros",
            "sInfoEmpty": "Mostrando registros de 0 a 0 de um total de 0 registros",
            "sInfoFiltered": "(filtrado de um total de _MAX_ registros)",
            "sInfoPostFix": "",
            "sSearch": "Buscar: ",
            "sUrl": "",
            "sInfoThousands": ",",
            "sLoadingRecords": "Carregando...",
            "oPaginate": {
                "sFirst": "Primeiro",
                "sLast": "Último",
                "sNext": "Seguinte",
                "sPrevious": "Anterior"
            }
        },

        lengthMenu: [
            [10, 25, 50, 100, -1],
            [10, 25, 50, 100, "Todos"]
        ],

        buttons: [
            // 'copy', 'csv', 'excel', 'pdf', 'print'

            {
                text: 'Copiar',
                extend: 'copy',
                className: 'btn btn-primary'
            },
            {
                text: 'CSV',
                extend: 'csv',
                className: 'btn btn-primary'
            },
            {
                text: 'Excel',
                extend: 'excel',
                className: 'btn btn-primary'
            },
            {
                text: 'PDF',
                extend: 'pdf',
                className: 'btn btn-primary'
            },
            {
                text: 'Imprimir',
                extend: 'print',
                className: 'btn btn-primary'
            }
        ],

        language: {
            searchPlaceholder: "digite aqui",
            buttons: {
                copyTitle: 'Copiou para área de transferência',
                copyKeys: 'Press <i>ctrl</i> or <i>\u2318</i> + <i>C</i> to copy the table data<br>to your system clipboard.<br><br>To cancel, click this message or press escape.',
                copySuccess: {
                    _: '%d linhas copiadas',
                    1: '1 linha copiada'
                }
            }
        },

        // 'sDom': 't', //oculta botões, barra de pesquisa e paginação

        responsive: enableResponsive,
        lengthChange: true,
        searching: true

    });

    $(document).ready(function () {

        let tabelaGerada

        switch (tabela) {
            case "despesas":
                tabelaGerada =
                    $('#tabelaJson').DataTable({
                        "order": [
                            [3, "desc"], [2, "desc"], [1, "asc"]
                        ], //asc ou desc, index com início 0

                        "columnDefs": [{
                            "targets": [0],
                            "visible": false,
                            "searchable": false,
                        },
                        {
                            "targets": [8, 9, 10],
                            "orderable": false
                        },
                        {
                            "responsivePriority": 2,
                            "targets": 8
                        }
                            // ,{
                            //     "targets": [2], "render": function (mData, type, row) {
                            //         return mData.replace(".",",")
                            //     }
                            // }
                        ]
                    });
                break;
            case "rendimentos":
                tabelaGerada =
                    $('#tabelaJson').DataTable({
                        "order": [
                            [0, "desc"]
                        ], //asc ou desc, index com início 0

                        "columnDefs": [{
                            "targets": [0],
                            "visible": false,
                            "searchable": false

                        },
                        {
                            "targets": [5, 6, 7],
                            "orderable": false
                        },
                        {
                            "responsivePriority": 2,
                            "targets": 5
                        }
                        ]
                    });
                break;
            case "categorias":
                tabelaGerada =
                    $('#tabelaJson').DataTable({
                        "order": [
                            [0, "desc"]
                        ], //asc ou desc, index com início 0

                        "columnDefs": [{
                            "targets": [0],
                            "visible": false,
                            "searchable": false
                        },
                        {
                            "targets": [2, 5, 6],
                            "orderable": false
                        },
                        {
                            "responsivePriority": 2,
                            "targets": 2
                        }
                        ]

                    });
                break;
            case "wishlist":
                tabelaGerada =
                    $('#tabelaJson').DataTable({
                        "order": [
                            [0, "desc"]
                        ], //asc ou desc, index com início 0

                        "columnDefs": [{
                            "targets": [0],
                            "visible": false,
                            "searchable": false
                        },
                        {
                            "targets": [5, 6, 7],
                            "orderable": false
                        },
                        {
                            "responsivePriority": 2,
                            "targets": 5
                        }
                        ]
                    });
                break;
        }

        // personalizando a posição dos botões da API Datatables em lugares CUSTOM
        $('#btnTabela').html(''); //devido à bug que recriar botões, limpamos antes
        $('#buscarTabela').html('');
        $('#exibirQtd').html('');
        $('#tabNav').html('');

        tabelaGerada.buttons().container().appendTo($('#btnTabela'));

        $("#tabelaJson_filter").appendTo("#buscarTabela") //movendo campos da API em div's custom
        $("#tabelaJson_length").appendTo("#exibirQtd")
        $('#tabelaJson_wrapper > div:nth-child(3)').appendTo("#tabNav")

        // habilitamos a busca para o campo da Navbar
        $('#campoBusca').keyup(function () {
            tabelaGerada.search($(this).val()).draw();
        })

    });
}

function logoff() {

    let _confirm = confirm("Deseja realmente sair?")

    if (_confirm) {
        sessionStorage.setItem('logoff', true)
        location.href = 'index.html';
    }
}

function carregaPreferencias() {

    $('.collapse').collapse('hide');
    let html = ""

    document.getElementById("tituloTabela").innerHTML = `<h3>Preferências</h3>`;

    html += `
        <div class="container" style="max-width: 20rem; padding: 15px 15px 15px 15px;">
            <div class="row">
                <div class="col-md-6">
                    <p>Efeitos sonoros</p>
                </div>

                <div class="col-md-6">
                    <label class="switch">
                    `;
    if (enableSound) {
        html += '<input type="checkbox" id="btnValidaSom" checked>'
    } else {
        html += '<input type="checkbox" id="btnValidaSom">'
    }

    html += `
                        <span class="slider round"></span>
                    </label>
                </div>
                <br><br><br>
                <div class="col-md-6">
                    <p>Responsivo</p>
                </div>

                <div class="col-md-6">
                    <label class="switch">
                    `;
    if (enableResponsive) {
        html += '<input type="checkbox" id="btnValidaResponsive" checked>'
    } else {
        html += '<input type="checkbox" id="btnValidaResponsive">'
    }

    html += `
                        <span class="slider round"></span>
                    </label>
                </div>

            </div>
        </div>
    `;

    html += `
                <input id="carga" class="btn" type="file" accept="application/json"/>
				<button class="btn btn-primary" type="button" onclick="despesasController.downloadJSON()">Exportar</button>
				<span id="carga_msg">Click para exportar</span>
    `

    document.getElementById("conteudoJSON").innerHTML = html;

    var carga = document.getElementById("carga");

    carga.addEventListener('change', function (e) {

        let file = carga.files[0];
        let reader = new FileReader();
        let plainTextJSON;

        reader.onload = function (e) {
            plainTextJSON = reader.result;

            let despesas = JSON.parse(plainTextJSON);

            despesasController.uploadJSON(despesas)
        }

        reader.readAsText(file);
    });

    transicaoFade()

    omiteCamposTabela()

    let btnSom = document.getElementById("btnValidaSom");
    btnSom.addEventListener("click", function () {
        let checkBox = document.getElementById("btnValidaSom");

        if (checkBox.checked == true) {
            enableSound = true
            playSoungEffect("success")
        } else {
            playSoungEffect("warning")
            enableSound = false
        }

        localStorage.setItem("__sound__", JSON.stringify(enableSound))

    }, false);

    let btnReponsive = document.getElementById("btnValidaResponsive");
    btnReponsive.addEventListener("click", function () {
        let checkBox = document.getElementById("btnValidaResponsive");

        if (checkBox.checked == true) {
            enableResponsive = true
        } else {
            enableResponsive = false
        }

        localStorage.setItem("__responsive__", JSON.stringify(enableResponsive))

    }, false);

}

function carregaSuporte() {

    window.history.replaceState(null, null, window.location.pathname);

    $('.collapse').collapse('hide');
    let content = JSON.parse(sessionStorage.getItem('BD'))
    let html = ""

    document.getElementById("tituloTabela").innerHTML = `<h3>Suporte</h3>`;

    html += `
        <div class="container" style="max-width: 20rem; padding: 15px 15px 15px 15px;">
            <div class="row">
                <div class="col-md-12">
                    <p>Bem vindo ${sessionStorage.getItem('name')}</p>
                    <p>Status: licenciado até 01/${content.licenseMonth}/${content.licenseYear}</p>
                    <br>
                    <br>
                    <br>
                    <br>
                    <p>Para maiores informações:</p>
                    <p><i class="fa fa-envelope"></i> jhony.villani@gmail.com</p>
                    <p id="btnWhatsapp"><a href="#whatsapp"><i class="fa fa-whatsapp"></i> (11) 98398-9972</a></p>                   
                </div>
            </div>
        </div>
    `;

    document.getElementById("conteudoJSON").innerHTML = html;

    transicaoFade()

    omiteCamposTabela()

    let btnWhatsapp = document.getElementById("btnWhatsapp");
    btnWhatsapp.addEventListener("click", function () {

        if (!usingApp) {
            window.open('https://api.whatsapp.com/send?phone=5511983989972&text=Ol%C3%A1,%20amigo!', '_blank').focus();
        }

    }, false);

}

async function getSystemInfo() {

    var counter = 0

    await firebase.database()
        .ref('system')
        .child('counter').get().then((snapshot) => {
            if (snapshot.exists()) {
                counter = snapshot.val()
            }
        }).catch((error) => {
            console.error(error);
        });

    return counter
}

// var myEvent = window.attachEvent || window.addEventListener;
// var chkevent = window.attachEvent ? 'onbeforeunload' : 'beforeunload'; /// make IE7, IE8 compitable

// myEvent(chkevent, function (e) { // For >=IE7, Chrome, Firefox
//     var confirmationMessage = 'Tem certeza que deseja sair da página?'; // a space
//     (e || window.event).returnValue = confirmationMessage;
//     return confirmationMessage;
// });

// window.onload = verificaAuth(), lerStorage(), carregaTelaInicio(true); //Carrega a tabela junto com a página.
window.onload = lerStorage(), onInit(); //Carrega a tabela junto com a página.