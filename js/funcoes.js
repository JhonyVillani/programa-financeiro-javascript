var mock = `
    [{
        "id": "1",
        "nome": "Jhony",
        "sobrenome": "Villani",
        "ano": "1995/08/14",
        "formacao": "Ensino médio"
    },
    {
        "id": "2",
        "nome": "Pedro",
        "sobrenome": "Villani",
        "ano": "2011/10/11",
        "formacao": "Nenhum"
    },
    {
        "id": "3",
        "nome": "Pamela",
        "sobrenome": "Villani",
        "ano": "2003/01/05",
        "formacao": "Ensino superior"
    }]
    `;

var modalClientes = `
    <div class="row">
        <div class="col-md-6">
            <div class="form-group">
                <label for="">Nome<span class="required">*</span></label>
                <input id="pessoa_nome" type="text" class="form-control"
                    placeholder="digite o nome..." maxlength="15" />
            </div>
        </div>
        <div class="col-md-6">
            <div class="form-group">
                <label for="">Sobrenome</label>
                <input id="pessoa_sobrenome" type="text" class="form-control"
                    placeholder="digite o sobrenome..." maxlength="15" />
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-md-6">
            <div class="form-group">
                <label for="">Data de Nascimento<span class="required">*</span></label>
                <input id="pessoa_ano" type="date" class="form-control" max="9999-12-31" />
            </div>
        </div>
        <div class="col-md-6">
            <div class="form-group">
                <label for="">Formação</label>
                <select id="pessoa_formacao" class="form-control">
                    <option value="Fundamental">Fundamental</option>
                    <option value="Médio">Médio</option>
                    <option value="Superior">Superior</option>
                    <option value="Nenhum">Nenhum</option>
                </select>
            </div>
        </div>
    </div>
`;

var modalPedidos = ""

var qtdEstoque = 0

var count = 0

var arrayItens = [] //auxilia no carrinho de compras do pedido

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

class Pessoa {
    constructor(id, nome, sobrenome, ano, formacao) {
        this.id = id;
        this.nome = nome;
        this.sobrenome = sobrenome;
        this.ano = ano;
        this.formacao = formacao;
    }
}

class Item {
    constructor(id, nome, preco, categoria, qtd) {
        this.id = id;
        this.nome = nome;
        this.preco = preco;
        this.categoria = categoria;
        this.qtd = qtd;
    }
}

class Pedido {
    constructor(id, clienteId, itens, dtPedido, status, total) {
        this.id = id;
        this.clienteId = clienteId;
        this.itens = itens;
        this.dtPedido = dtPedido;
        this.status = status;
        this.total = total;
    }
}

var tabPessoas = []
var tabItens = []
var tabPedidos = []
var tabHistorico = []
var enableSound = true
var enableResponsive = true
var usingApp = false

function verificaAuth() {
    if (sessionStorage.getItem('name') == null ||
        sessionStorage.getItem('mail') == null ||
        sessionStorage.getItem('uid') == null ||
        sessionStorage.getItem('verified') == null ||
        sessionStorage.getItem('BD') == null) {
        //location.href = 'index.html';
    } else {
        document.getElementById("btnLogoff").innerHTML = `Sair (${sessionStorage.getItem('name')})`
    }

    if (window.matchMedia("(max-width: 767px)").matches) {
        // The viewport is less than 768 pixels wide
        $("#divBusca").removeClass("float-right")
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

    function carregaCampos() {

        document.getElementById("tituloTabela").innerHTML = `<h3 id="tituloTabela">
            Nome da sua empresa AQUI
            <small class="text-muted">Início</small></h3>`;

        let img = document.createElement("IMG");

        let node = document.createElement("DIV");
        node.innerHTML = `
        <button type="button" class="btn btn-primary full-width"
            onclick="carregaClientes(), populaModal('clientes')"><i class="fa fa-user"></i> Clientes</button>
        <br><button type="button" class="btn btn-primary full-width"
            onclick="carregaItens(), populaModal('itens')"><i class="fa fa-shopping-bag"></i> Itens</button>
        <br><button type="button" class="btn btn-primary full-width"
            onclick="carregaPedidos(), populaModal('pedidos')"><i class="fa fa-shopping-cart"></i> Pedidos</button>
        <br><button type="button" class="btn btn-primary full-width"
            onclick="carregaHistorico(), populaModal('historico')"><i class="fa fa-history"></i> Histórico</button>
    `;

        node.style.cssText = 'padding: 5px 0 5px 0;'
        node.setAttribute("class", "visible-xs-block visible-sm-block border border-light");

        img.src = "resources/img/bg senai adm.png";
        img.id = "bgImg"

        document.getElementById('conteudoJSON').appendChild(img);
        document.getElementById('conteudoJSON').appendChild(node);

        transicaoFade()
    }

}

// limpa campos ao clicar em Adicionar
$("#addBtn").on("click", function () {
    limpaCamposModal()
})

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

// adiciona/altera registros
async function adicionaRegistro(id = null, tabela) {

    switch (tabela) {
        case 'clientes':

            let nome = document.getElementById('pessoa_nome').value;
            let sobrenome = document.getElementById('pessoa_sobrenome').value;
            let ano = document.getElementById('pessoa_ano').value;
            let formacao = document.getElementById('pessoa_formacao').value;

            // campos obrigatórios
            if (nome == "") {
                alert("Nome não preenchido!")
                return false
            } else if (ano == "") {
                alert("Data de Nascimento não preenchida!")
                return false
            }

            if (id == null) { //cadastro de registro

                let uid = await getSystemInfo()
                id = ++uid

                setClientesFirebase(id, nome, sobrenome, ano, formacao)

                tabPessoas.push(new Pessoa(id, nome, sobrenome, ano, formacao))

                playSoungEffect(1)

            } else { //alteração de registro

                let pos = tabPessoas.findIndex(i => i.id == id);

                tabPessoas[pos].nome = nome
                tabPessoas[pos].sobrenome = sobrenome
                tabPessoas[pos].ano = ano
                tabPessoas[pos].formacao = formacao

                setClientesFirebase(id, nome, sobrenome, ano, formacao)

                playSoungEffect(1)

            }

            // localStorage.setItem("__cadastros__", JSON.stringify(tabPessoas))

            carregaClientes()
            limpaCamposModal()

            break;
        case 'itens':

            let nomeItem = document.getElementById('item_nome').value;
            let preco = document.getElementById('item_preco').value;
            let categoria = document.getElementById('item_categ').value;
            let qtd = document.getElementById('item_qtd').value;

            // campos obrigatórios
            if (nomeItem == "") {
                alert("Nome não preenchido!")
                return false
            } else if (preco == "") {
                alert("Preço não preenchido!")
                return false
            } else if (categoria == "") {
                alert("Categoria não preenchido!")
                return false
            } else if (qtd == "") {
                alert("Quantidade não preenchido!")
                return false
            }

            if (id == null) { //cadastro de registro

                let uid = await getSystemInfo()
                id = ++uid

                setItensFirebase(id, nomeItem, preco, categoria, qtd)

                tabItens.push(new Item(id, nomeItem, preco, categoria, qtd))

                playSoungEffect(1)

            } else { //alteração de registro

                let pos = tabItens.findIndex(i => i.id == id);

                tabItens[pos].nome = nomeItem
                tabItens[pos].preco = preco
                tabItens[pos].categoria = categoria
                tabItens[pos].qtd = qtd

                setItensFirebase(id, nomeItem, preco, categoria, qtd)

                playSoungEffect(1)

            }

            // localStorage.setItem("__itens__", JSON.stringify(tabItens))

            carregaItens()
            limpaCamposModal()
            populaModal("itens")

            break;
        case 'pedidos':

            let cliente = document.getElementById('pedido_cliente').value;
            let dtPedido = document.getElementById('pedido_data').value;
            let itens = []
            let status = document.getElementById('pedido_status').value;
            let total = 0

            // campos obrigatórios
            if (cliente == "") {
                alert("Não há cliente selecionado")
                return false
            }

            if (id == null) { //cadastro de registro

                let uid = await getSystemInfo()
                id = ++uid

                for (let i = 0; i < arrayItens.length; i++) {

                    let idItem = arrayItens[i].id

                    let pos = tabItens.findIndex(i => i.id == idItem);

                    tabItens[pos].qtd -= arrayItens[i].qtdAtual

                    total += parseFloat(tabItens[pos].preco * arrayItens[i].qtdAtual)

                    itens.push(new Item(tabItens[pos].id, tabItens[pos].nome, tabItens[pos].preco, tabItens[pos].categoria, arrayItens[i].qtdAtual))

                    setItensFirebase(tabItens[pos].id, tabItens[pos].nome, tabItens[pos].preco, tabItens[pos].categoria, tabItens[pos].qtd)
                }

                if (arrayItens == "") {
                    alert("Não há itens selecionados!")
                    return false
                }

                setPedidosFirebase(id, cliente, itens, dtPedido, status, total)

                tabPedidos.push(new Pedido(id, cliente, itens, dtPedido, status, total))

                playSoungEffect(1)

            } else { //alteração de registro

                let pos = tabPedidos.findIndex(i => i.id == id);

                tabPedidos[pos].status = status

                setPedidosFirebase(tabPedidos[pos].id, tabPedidos[pos].clienteId, tabPedidos[pos].itens, tabPedidos[pos].dtPedido, status, tabPedidos[pos].total)

                playSoungEffect(1)

            }

            // localStorage.setItem("__pedidos__", JSON.stringify(tabPedidos))

            carregaPedidos()
            limpaCamposModal()

            function arraycheck(id) {

                let found = false; // flag
                let valor
                for (let i = 0; !found && i < tabItens.length; i++) {
                    // sai do loop ao encontrar o valor
                    found = id == tabItens[i].id; // define o flag ao encontrar
                    valor = tabItens[i].preco
                }
                if (found) {
                    return valor
                }
            }

            break;
    }

    $("#modalRegistro").modal("hide") //fecha a modal após clicar em salvar

}

// carrega a tabela de clientes
function carregaClientes() {

    $('.collapse').collapse('hide');
    document.getElementById("tituloTabela").innerHTML = `<h3>Clientes</h3>`;
    exibeCamposTabela()

    document.getElementById("modalRegistroLabel").innerHTML = "Cadastrar Cliente"
    document.getElementById("btnSalvar").innerHTML = "Salvar"

    document.getElementById("btnSalvar").setAttribute('onClick', 'adicionaRegistro(' + null + ', "clientes"' + ')');

    // let html = `<table id="tabelaJson" class="table table-striped table-bordered dt-responsive nowrap" style="width:100%">
    let html = `<table id="tabelaJson" class=\"table table-bordered table-striped dt-responsive nowrap style=\"width: 100%\"\">
            <thead>
                <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Sobrenome</th>
                <th>Ano</th>
                <th>Formação</th>
                <th></th>
                <th></th>
                <th></th>
                </tr>
            </thead>
            <tbody>`;

    for (let i = 0; i < tabPessoas.length; i++) {

        html += `
        <tr>
            <td>${tabPessoas[i].id}</td>
            <td>${tabPessoas[i].nome}</td>
            <td>${tabPessoas[i].sobrenome}</td>
            <td><span class="hide">${tabPessoas[i].ano}</span>${tabPessoas[i].ano.substr(8, 2) + '/' + tabPessoas[i].ano.substr(5, 2) + '/' + tabPessoas[i].ano.substr(0, 4)}</td> 
            <td>${tabPessoas[i].formacao}</td>
            <td><button type='button' class='btn btn-primary' onclick='exibeRegistro( ${tabPessoas[i].id}, "clientes" )'><i class='fa fa-eye' /></button></td>
            <td><button type='button' class='btn btn-primary' onclick='alteraRegistro( ${tabPessoas[i].id}, "clientes" )'><i class='fa fa-edit' /></button></td>
            <td><button type='button' class='btn btn-danger' onclick='apagaRegistro( ${tabPessoas[i].id}, "clientes" );'><i class='fa fa-trash' /></button></td>
            </tr>`;
    }
    html += "<tbody></table>";

    document.getElementById("conteudoJSON").innerHTML = html;

    carregaTabelaDatatables("clientes")

    transicaoFade()
}

// carrega a tabela de itens
function carregaItens() {

    $('.collapse').collapse('hide');
    document.getElementById("tituloTabela").innerHTML = `<h3>Itens</h3>`;
    exibeCamposTabela()

    document.getElementById("modalRegistroLabel").innerHTML = "Cadastrar Item"
    document.getElementById("btnSalvar").innerHTML = "Salvar"

    document.getElementById("btnSalvar").setAttribute('onClick', 'adicionaRegistro(' + null + ', "itens"' + ')');

    // let html = `<table id="tabelaJson" class="table table-striped table-bordered dt-responsive nowrap" style="width:100%">
    let html = `<table id="tabelaJson" class=\"table table-bordered table-striped dt-responsive nowrap style=\"width: 100%\"\">
            <thead>
                <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Qtd</th>
                <th></th>
                <th></th>
                <th></th>
                </tr>
            </thead>
            <tbody>`;

    for (let i = 0; i < tabItens.length; i++) {

        html += `
        <tr>
            <td>${tabItens[i].id}</td>
            <td>${tabItens[i].nome}</td>
            <td>${formatter.format(tabItens[i].preco)}</td>
            <td>${tabItens[i].categoria}</td>`;

        if (tabItens[i].qtd == -1) {
            html += `<td><i class='fa fa-wrench' /></td>`
        } else {
            html += `<td>${tabItens[i].qtd}</td>`
        }

        html += `            
            <td><button type='button' class='btn btn-primary' onclick='exibeRegistro( ${tabItens[i].id}, "itens" )'><i class='fa fa-eye' /></button></td>
            <td><button type='button' class='btn btn-primary' onclick='alteraRegistro( ${tabItens[i].id}, "itens" )'><i class='fa fa-edit' /></button></td>
            <td><button type='button' class='btn btn-danger' onclick='apagaRegistro( ${tabItens[i].id}, "itens" );'><i class='fa fa-trash' /></button></td>
            </tr>`;
    }
    html += "<tbody></table>";

    document.getElementById("conteudoJSON").innerHTML = html;

    carregaTabelaDatatables("itens")

    transicaoFade()
}

// carrega a tabela de pedidos
function carregaPedidos() {

    $('.collapse').collapse('hide');
    document.getElementById("tituloTabela").innerHTML = `<h3>Pedidos</h3>`;
    exibeCamposTabela()

    document.getElementById("modalRegistroLabel").innerHTML = "Cadastrar Pedido"
    document.getElementById("btnSalvar").innerHTML = "Salvar"

    document.getElementById("btnSalvar").setAttribute('onClick', 'adicionaRegistro(' + null + ', "pedidos"' + ')');

    // let html = `<table id="tabelaJson" class="table table-striped table-bordered dt-responsive nowrap" style="width:100%">
    let html = `<table id="tabelaJson" class=\"table table-bordered table-striped dt-responsive nowrap style=\"width: 100%\"\">
            <thead>
                <tr>
                <th>Nº</th>
                <th>Cliente</th>
                <th>Data Pedido</th>
                <th>Status</th>
                <th>Total</th>
                <th></th>
                <th></th>
                <th></th>
                </tr>
            </thead>
            <tbody>`;

    for (let i = 0; i < tabPedidos.length; i++) {

        html += `
            <tr>
            <td>${tabPedidos[i].id}</td>
            <td>${arraycheck(tabPedidos[i].clienteId)}</td>
            <td><span class="hide">${tabPedidos[i].dtPedido}</span>${tabPedidos[i].dtPedido.substr(8, 2) + '/' + tabPedidos[i].dtPedido.substr(5, 2) + '/' + tabPedidos[i].dtPedido.substr(0, 4)}</td>
            <td>${tabPedidos[i].status}</td>
            <td>${formatter.format(tabPedidos[i].total)}</td>
            <td><button type='button' class='btn btn-primary' onclick='exibeRegistro( ${tabPedidos[i].id}, "pedidos" )'><i class='fa fa-eye' /></button></td>
            <td><button type='button' class='btn btn-primary' onclick='alteraRegistro( ${tabPedidos[i].id}, "pedidos" )'><i class='fa fa-edit' /></button></td>
            <td><button type='button' class='btn btn-danger' onclick='apagaRegistro( ${tabPedidos[i].id}, "pedidos" );'><i class='fa fa-trash' /></button></td>
            </tr>`;
    }
    html += "<tbody></table>";

    document.getElementById("conteudoJSON").innerHTML = html;

    carregaTabelaDatatables("pedidos")

    transicaoFade()

    function arraycheck(id) {

        let found = false; // flag
        let itemFounded

        for (let i = 0; !found && i < tabPessoas.length; i++) {
            // sai do loop ao encontrar o valor
            found = id == tabPessoas[i].id; // define o flag ao encontrar
            itemFounded = tabPessoas[i].nome + " " + tabPessoas[i].sobrenome
        }
        if (found) {
            return itemFounded
        }
    }
}

// carrega a tabela de histórico de pedidos
function carregaHistorico() {

    $('.collapse').collapse('hide');
    document.getElementById("tituloTabela").innerHTML = `<h3>Histórico</h3>`;
    document.getElementById("addBtn").style.display = "none";
    document.getElementById("tabFilter").style.display = "initial";
    document.getElementById("tabExport").style.display = "initial";
    document.getElementById("tabNav").style.display = "initial";

    document.getElementById("modalRegistroLabel").innerHTML = "Consultar Pedido"
    document.getElementById("btnSalvar").style.display = "none";

    document.getElementById("btnSalvar").setAttribute('onClick', 'adicionaRegistro(' + null + ', "pedidos"' + ')');

    // let html = `<table id="tabelaJson" class="table table-striped table-bordered dt-responsive nowrap" style="width:100%">
    let html = `<table id="tabelaJson" class=\"table table-bordered table-striped dt-responsive nowrap style=\"width: 100%\"\">
            <thead>
                <tr>
                <th>Nº</th>
                <th>Cliente</th>
                <th>Data Pedido</th>
                <th>Status</th>
                <th>Total</th>
                <th></th>
                </tr>
            </thead>
            <tbody>`;

    for (let i = 0; i < tabHistorico.length; i++) {

        html += `
            <tr>
            <td>${tabHistorico[i].id}</td>
            <td>${tabHistorico[i].clienteId}</td>
            <td><span class="hide">${tabHistorico[i].dtPedido}</span>${tabHistorico[i].dtPedido.substr(8, 2) + '/' + tabHistorico[i].dtPedido.substr(5, 2) + '/' + tabHistorico[i].dtPedido.substr(0, 4)}</td>
            <td>${tabHistorico[i].status}</td>
            <td>${formatter.format(tabHistorico[i].total)}</td>
            <td><button type='button' class='btn btn-primary' onclick='exibeRegistro( ${tabHistorico[i].id}, "historico" )'><i class='fa fa-eye' /></button></td>
            </tr>`;
    }
    html += "<tbody></table>";

    document.getElementById("conteudoJSON").innerHTML = html;

    carregaTabelaDatatables("historico")

    transicaoFade()

}

function apagaRegistro(id, tabela) {

    let _confirm = confirm("Deseja realmente arquivar esse registro?")

    if (_confirm) {

        switch (tabela) {
            case "clientes":

                if (arraycheck(id)) { //checa se a pessoa possui pedido aberto
                    alert("O cliente possui um pedido! Não é possível exclui-lo!")
                    playSoungEffect(2)
                } else {
                    let pos = tabPessoas.findIndex(i => i.id == id);
                    tabPessoas.splice(pos, 1)

                    firebase.database()
                        .ref('clientes')
                        .child(id)
                        .remove()

                    // localStorage.setItem("__cadastros__", JSON.stringify(tabPessoas))

                    playSoungEffect(3)
                }

                carregaClientes()

                function arraycheck(id) {

                    let found = false; // flag
                    // let valor
                    for (let i = 0; !found && i < tabPedidos.length; i++) {
                        // sai do loop ao encontrar o valor
                        found = id == tabPedidos[i].pessoaId; // define o flag ao encontrar
                        // valor = tabItens[i].preco
                    }
                    return found
                }

                break;
            case "itens":

                let posItem = tabItens.findIndex(i => i.id == id);
                tabItens.splice(posItem, 1)

                firebase.database()
                    .ref('itens')
                    .child(id)
                    .remove()

                // localStorage.setItem("__itens__", JSON.stringify(tabItens))

                playSoungEffect(3)

                carregaItens()
                break;
            case "pedidos":

                let posPedido = tabPedidos.findIndex(i => i.id == id);
                tabPedidos.splice(posPedido, 1)

                firebase.database()
                    .ref('pedidos')
                    .child(id)
                    .remove()
                // localStorage.setItem("__pedidos__", JSON.stringify(tabPedidos))

                playSoungEffect(3)

                carregaPedidos()
                break;
        }

    }
}

function alteraRegistro(id, tabela) {

    limpaCamposModal()

    switch (tabela) {
        case "clientes":

            $("#modalRegistro").modal("show") //exibe modal

            let pos = tabPessoas.findIndex(i => i.id == id);

            $('#pessoa_nome').val(tabPessoas[pos].nome)
            $("#pessoa_sobrenome").val(tabPessoas[pos].sobrenome)
            $("#pessoa_ano").val(tabPessoas[pos].ano)
            $("#pessoa_formacao").val(tabPessoas[pos].formacao)

            document.getElementById("pessoa_nome").disabled = true;

            document.getElementById("btnSalvar").innerHTML = "Alterar"
            document.getElementById("btnSalvar").setAttribute('onClick', 'adicionaRegistro(' + id + ', "clientes"' + ')');
            break;
        case "itens":

            $("#modalRegistro").modal("show") //exibe modal

            let posItem = tabItens.findIndex(i => i.id == id);

            $('#item_nome').val(tabItens[posItem].nome)
            $("#item_preco").val(tabItens[posItem].preco)
            $("#item_categ").val(tabItens[posItem].categoria)
            $("#item_qtd").val(tabItens[posItem].qtd)

            qtdEstoque = tabItens[posItem].qtd //variavel auxiliar no controle de atualização do estoque atual
            document.getElementById("subTotalItens").innerHTML = ""

            document.getElementById("item_nome").disabled = true;

            document.getElementById("btnSalvar").innerHTML = "Alterar"
            document.getElementById("btnSalvar").setAttribute('onClick', 'adicionaRegistro(' + id + ', "itens"' + ')');
            break;
        case "pedidos":

            $("#modalRegistro").modal("show") //exibe modal

            let posPedido = tabPedidos.findIndex(i => i.id == id);

            arrayItens = tabPedidos[posPedido].itens
            let total = 0
            let ulHtml = '<label for="">Resumo</label><ul>'

            for (let i = 0; i < arrayItens.length; i++) {
                arrayItens[i].qtdAtual = 1

                ulHtml += `<li style="margin-bottom: 10px; border-bottom: 1px solid #e5e5e5;" id="li${i}">
                ${arrayItens[i].nome} - <b>${formatter.format(arrayItens[i].preco)}</b>
                <span style="font-size: 22px;"><br>${arrayItens[i].qtd}x 
                </span>
                </li>`;
                total += parseFloat(arrayItens[i].preco * arrayItens[i].qtd)
            }

            ulHtml += "</ul>"

            document.getElementById("ulItens").innerHTML = ulHtml
            document.getElementById("ulTotal").innerHTML = `<label for="">Total</label><p style="font-size: 17px;"><b>${formatter.format(total)}</b></p>`

            // let posPedido = tabPedidos.findIndex(i => i.id == id);

            // let itensArray = tabPedidos[posPedido].itens
            // let idItens = []
            // let ulHtml = '<label for="">Resumo</label><ul>'
            // let total = 0

            // // gera um array de ids para popular selectpicker
            // for (let i = 0; i < itensArray.length; i++) {
            //     idItens.push(itensArray[i].id)
            //     total += parseFloat(itensArray[i].preco)
            //     ulHtml += `<li>${itensArray[i].nome} - ${formatter.format(itensArray[i].preco)}</li>`
            // }

            // $('select[id="pedido_cliente"]').selectpicker('val', tabPedidos[posPedido].clienteId);

            // // $('#pedido_itens').val(arrayBugFix) //array para multiplas seleções
            // $('.selectpicker').selectpicker('refresh') //a partir daqui fará o evento onclick do populaModal()

            // ulHtml += "</ul>"

            // document.getElementById("ulItens").innerHTML = ulHtml
            // document.getElementById("ulTotal").innerHTML = `<label for="">Total</label><p><b>${formatter.format(total)}</b></p>`

            $('select[id="pedido_cliente"]').selectpicker('val', tabPedidos[posPedido].clienteId);
            $("#pedido_data").val(tabPedidos[posPedido].dtPedido)

            $("#pedido_status").val(tabPedidos[posPedido].status)

            // $("#pedido_itens").val(tabPedidos[posPedido].itens)


            document.getElementById("btnArquivar").innerHTML = `
                <button type='button' class='btn btn-success' onclick='arquivaPedido(${id})'>Arquivar</button>
            `;

            document.getElementById("btnImprimir").innerHTML = `
                <button type='button' class='btn btn-dark' onclick='printLayout(${id}, "pedidos")'><i class='fa fa-print'></i></button>
            `;

            document.getElementById("pedido_cliente").disabled = true;
            document.getElementById("pedido_status").disabled = false;
            document.getElementById("btnCalc").parentNode.style.display = "none";
            document.getElementById("pedido_itens").parentNode.parentNode.parentNode.style.display = "none";

            document.getElementById("btnSalvar").innerHTML = "Alterar"
            document.getElementById("btnSalvar").setAttribute('onClick', 'adicionaRegistro(' + id + ', "pedidos"' + ')');

            break;
    }
}

function arquivaPedido(id) {

    if ($("#pedido_status").val() == "aberto") {
        alert("Esse status não pode ser encerrado")
        playSoungEffect(2)
        return false
    }

    let pedido = arraycheck(id)

    if ($("#pedido_status").val() == "cancelado") {

        let itens = pedido.itens

        for (let i = 0; i < itens.length; i++) {
            let itemId = itens[i].id
            let posItem = tabItens.findIndex(i => i.id == itemId);
            let qtdTotal = 0

            if (posItem == -1) { //não existe mais na tabela, cria novamente
                tabItens.push(new Item(itens[i].id, itens[i].nome, itens[i].preco, itens[i].categoria, itens[i].qtd))
                qtdTotal = itens[i].qtd
            } else {
                tabItens[posItem].qtd += itens[i].qtd
                qtdTotal = tabItens[posItem].qtd
            }

            setItensFirebase(itens[i].id, itens[i].nome, itens[i].preco, itens[i].categoria, qtdTotal)

        }

    }

    setHistoricoFirebase(id, pedido.clienteId, pedido.itens, pedido.dtPedido, pedido.status, pedido.total)

    tabHistorico.push(new Pedido(id, pedido.clienteId, pedido.itens, pedido.dtPedido, pedido.status, pedido.total))

    // localStorage.setItem("__historico__", JSON.stringify(tabHistorico))

    apagaRegistro(id, "pedidos")

    $("#modalRegistro").modal("hide")

    function arraycheck(id) {

        let found = false; // flag
        let pedido, cliente

        for (let i = 0; !found && i < tabPedidos.length; i++) {
            // sai do loop ao encontrar o valor
            found = id == tabPedidos[i].id; // define o flag ao encontrar
            pedido = tabPedidos[i]
        }

        if (found) { //puxa nome do cliente
            found = false;

            for (let i = 0; !found && i < tabPessoas.length; i++) {
                // sai do loop ao encontrar o valor
                found = pedido.clienteId == tabPessoas[i].id; // define o flag ao encontrar
                cliente = tabPessoas[i]
            }
            if (found) {
                pedido.clienteId = cliente.nome + " " + cliente.sobrenome
                pedido.status = $("#pedido_status").val()
                return pedido
            }
        }
    }
}

function exibeRegistro(id, tabela) {

    switch (tabela) {
        case "clientes":

            $("#modalRegistro").modal("show") //exibe modal

            let pos = tabPessoas.findIndex(i => i.id == id);

            $('#pessoa_nome').val(tabPessoas[pos].nome)
            $("#pessoa_sobrenome").val(tabPessoas[pos].sobrenome)
            $("#pessoa_ano").val(tabPessoas[pos].ano)
            $("#pessoa_formacao").val(tabPessoas[pos].formacao)

            document.getElementById("pessoa_nome").disabled = true;
            document.getElementById("pessoa_sobrenome").disabled = true;
            document.getElementById("pessoa_ano").disabled = true;
            document.getElementById("pessoa_formacao").disabled = true;

            document.getElementById("btnSalvar").style.display = "none";

            break;
        case "itens":

            $("#modalRegistro").modal("show") //exibe modal

            let posItem = tabItens.findIndex(i => i.id == id);

            $('#item_nome').val(tabItens[posItem].nome)
            $("#item_preco").val(tabItens[posItem].preco)
            $("#item_categ").val(tabItens[posItem].categoria)
            $("#item_qtd").val(tabItens[posItem].qtd)

            document.getElementById("item_nome").disabled = true;
            document.getElementById("item_preco").disabled = true;
            document.getElementById("item_categ").disabled = true;
            document.getElementById("item_qtd").disabled = true;

            document.getElementById("itensCounter").style.display = "none";

            document.getElementById("btnSalvar").style.display = "none";

            break;
        case "pedidos":

            $("#modalRegistro").modal("show") //exibe modal

            let posPedido = tabPedidos.findIndex(i => i.id == id);

            arrayItens = tabPedidos[posPedido].itens
            let total = 0
            let ulHtml = '<label for="">Resumo</label><ul>'

            for (let i = 0; i < arrayItens.length; i++) {
                arrayItens[i].qtdAtual = 1

                ulHtml += `<li style="margin-bottom: 10px; border-bottom: 1px solid #e5e5e5;" id="li${i}">
                ${arrayItens[i].nome} - <b>${formatter.format(arrayItens[i].preco)}</b>
                <span style="font-size: 22px;"><br>${arrayItens[i].qtd}x 
                </span>
                </li>`;
                total += parseFloat(arrayItens[i].preco * arrayItens[i].qtd)
            }

            ulHtml += "</ul>"

            document.getElementById("ulItens").innerHTML = ulHtml
            document.getElementById("ulTotal").innerHTML = `<label for="">Total</label><p style="font-size: 17px;"><b>${formatter.format(total)}</b></p>`

            $('select[id="pedido_cliente"]').selectpicker('val', tabPedidos[posPedido].clienteId);
            $("#pedido_cliente").val(tabPedidos[posPedido].clienteId)
            $("#pedido_data").val(tabPedidos[posPedido].dtPedido)

            $("#pedido_status").val(tabPedidos[posPedido].status)

            document.getElementById("btnImprimir").innerHTML = `
                <button type='button' class='btn btn-dark' onclick='printLayout(${id}, "pedidos")'><i class='fa fa-print'></i></button>
            `;

            document.getElementById("pedido_cliente").disabled = true;
            document.getElementById("btnCalc").parentNode.style.display = "none";
            document.getElementById("pedido_itens").parentNode.parentNode.parentNode.style.display = "none";
            document.getElementById("pedido_status").disabled = true;
            document.getElementById("btnImprimir").style.display = "initial";

            document.getElementById("btnSalvar").style.display = "none";

            break;
        case "historico":

            $("#modalRegistro").modal("show") //exibe modal

            // let posHistorico = tabHistorico.findIndex(i => i.id == id);

            // let itensHistoricoArray = tabHistorico[posHistorico].itens
            // let ulHistoricoHtml = '<label for="">Resumo</label><ul>'
            // let totalHistorico = 0

            // // gera um array de ids para popular selectpicker
            // for (let i = 0; i < itensHistoricoArray.length; i++) {
            //     totalHistorico += parseFloat(itensHistoricoArray[i].preco)
            //     ulHistoricoHtml += `<li>${itensHistoricoArray[i].nome} - ${formatter.format(itensHistoricoArray[i].preco)}</li>`
            // }

            // $("#pedido_cliente").val(tabHistorico[posHistorico].clienteId)
            // $("#pedido_itens").val("Lista citada no resumo abaixo:")

            // ulHistoricoHtml += "</ul>"

            // document.getElementById("ulItens").innerHTML = ulHistoricoHtml
            // document.getElementById("ulTotal").innerHTML = `<label for="">Total</label><p><b>${formatter.format(totalHistorico)}</b></p>`

            let posHistorico = tabHistorico.findIndex(i => i.id == id);

            let itensHistoricoArray = tabHistorico[posHistorico].itens

            let totalHist = 0
            let ulHistoricoHtml = '<label for="">Resumo</label><ul>'

            for (let i = 0; i < itensHistoricoArray.length; i++) {
                itensHistoricoArray[i].qtdAtual = 1

                ulHistoricoHtml += `<li style="margin-bottom: 10px; border-bottom: 1px solid #e5e5e5;" id="li${i}">
                ${itensHistoricoArray[i].nome} - <b>${formatter.format(itensHistoricoArray[i].preco)}</b>
                <span style="font-size: 22px;"><br>${itensHistoricoArray[i].qtd}x 
                </span>
                </li>`;
                totalHist += parseFloat(itensHistoricoArray[i].preco * itensHistoricoArray[i].qtd)
            }

            ulHistoricoHtml += "</ul>"

            document.getElementById("ulItens").innerHTML = ulHistoricoHtml
            document.getElementById("ulTotal").innerHTML = `<label for="">Total</label><p style="font-size: 17px;"><b>${formatter.format(totalHist)}</b></p>`

            // $('select[id="pedido_cliente"]').selectpicker('val', tabHistorico[posHistorico].cliente);
            $("#pedido_cliente").val(tabHistorico[posHistorico].clienteId)
            $("#pedido_data").val(tabHistorico[posHistorico].dtPedido)
            $("#pedido_status").val(tabHistorico[posHistorico].status)
           
            document.getElementById("btnImprimir").innerHTML = `
                <button type='button' class='btn btn-dark' onclick='printLayout(${id}, "historico")'><i class='fa fa-print'></i></button>
            `;

            break;
    }
}

function limpaCamposModal() {

    document.getElementById("btnSalvar").style.display = "block";
    document.getElementById("btnSalvar").innerHTML = "Salvar"

    if ($('#pessoa_nome').val() !== undefined) {
        document.getElementById("pessoa_nome").disabled = false;
        document.getElementById("pessoa_sobrenome").disabled = false;
        document.getElementById("pessoa_ano").disabled = false;
        document.getElementById("pessoa_formacao").disabled = false;
        document.getElementById('pessoa_nome').value = "";
        document.getElementById('pessoa_sobrenome').value = "";
        document.getElementById('pessoa_ano').value = "";
        document.getElementById('pessoa_formacao').value = "";
        document.getElementById('pessoa_nome').focus();

        document.getElementById("btnSalvar").setAttribute('onClick', 'adicionaRegistro(' + null + ', "clientes"' + ')');

    } else if ($('#item_nome').val() !== undefined) {
        document.getElementById("item_nome").disabled = false;
        document.getElementById("item_preco").disabled = false;
        document.getElementById("item_categ").disabled = false;
        document.getElementById("item_qtd").disabled = false;
        document.getElementById('item_nome').value = "";
        document.getElementById('item_preco').value = "";
        document.getElementById('item_categ').value = "";
        document.getElementById('item_qtd').value = "";
        document.getElementById('item_nome').focus();

        document.getElementById("itensCounter").style.display = "block";

        document.getElementById("btnSalvar").setAttribute('onClick', 'adicionaRegistro(' + null + ', "itens"' + ')');

    } else if ($('#pedido_cliente').val() !== undefined) {
        document.getElementById("pedido_cliente").disabled = false;
        document.getElementById("pedido_itens").disabled = false;

        document.getElementById("pedido_status").disabled = true;
        document.getElementById("pedido_status").value = "aberto";
        $('#pedido_cliente').val("")

        document.getElementById("btnCalc").parentNode.style.display = "initial";
        document.getElementById("pedido_itens").parentNode.parentNode.parentNode.style.display = "initial";
        document.getElementById("btnImprimir").style.display = "none";
        $('#pedido_itens').val("")
        $('.selectpicker').selectpicker('refresh')

        document.getElementById("ulItens").innerHTML = "";
        document.getElementById("ulTotal").innerHTML = "";
        document.getElementById("btnArquivar").innerHTML = "";
        document.getElementById('pedido_cliente').focus();

        let date = new Date();
        let dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
            .toISOString()
            .split("T")[0];

        document.getElementById('pedido_data').value = dateString;
        document.getElementById("btnSalvar").setAttribute('onClick', 'adicionaRegistro(' + null + ', "pedidos"' + ')');

        // testar time para scrollar
        // document.getElementById("pedido_data").scrollIntoView();

        // setTimeout(function () { //necessário para carregar o conteúdo completo
        //     document.getElementById("pedido_data").scrollIntoView();
        //     console.log("entrou")
        // }, 1000);
    }
}

function populaModal(tabela) {

    switch (tabela) {
        case "clientes":
            document.getElementById("modalWindow").innerHTML = modalClientes
            document.getElementById("btnSalvar").setAttribute('onClick', 'adicionaRegistro(null, "clientes")')
            document.getElementById("btnSalvar").style.display = "block";
            break;
        case "itens":

            if (qtdEstoque !== 0) qtdEstoque = 0

            document.getElementById("modalWindow").innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="">Nome<span class="required">*</span></label>
                            <input id="item_nome"  class="form-control"
                                placeholder="digite o nome do produto..." maxlength="50" />
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="">Preço<span class="required">*</span></label>
                            <input id="item_preco" type="number" min="1" step="any" class="form-control"
                                placeholder="digite o preço..." />
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="">Categoria<span class="required">*</span></label>
                            <input id="item_categ"  class="form-control"
                                placeholder="digite a categoria do produto..." maxlength="50" />
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="">Quantidade<span class="required">*</span></label>
                                <input id="item_qtd" type="number" min="1" step="any" class="form-control"
                                    placeholder="digite a quantidade..." />
                                <small class="form-text text-muted">Digite "-1" para representar <b>serviços</b>.</small>
                        </div>
                    </div>
                </div>

                <div class="row" id="itensCounter">
                    <div class="col-md-6 col-xs-6" align="center">
                        <button type="button" class="btn btn-default btn-number" data-type="minus">
                            <span class="glyphicon glyphicon-minus"></span>
                        </button>
                    </div>

                    <div class="col-md-6 col-xs-6" align="center">
                        <button type="button" class="btn btn-default btn-number" data-type="plus">
                            <span class="glyphicon glyphicon-plus"></span>
                        </button>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-12 col-xs-12" align="center">
                        <div id="subTotalItens"></div>
                    </div>
                </div>
            `;

            populaAutocomplete("itens")

            document.getElementById("btnSalvar").setAttribute('onClick', 'adicionaRegistro(null, "itens")')
            document.getElementById("btnSalvar").style.display = "block";

            $('.btn-number').click(function (e) {
                e.preventDefault();

                type = $(this).attr('data-type');

                if ($('#item_qtd').val() == "") {
                    $('#item_qtd').val(1)
                    return
                }

                let num = $('#item_qtd').val()

                if (type == 'minus') {
                    $('#item_qtd').val(--num)
                } else if (type == 'plus') {
                    $('#item_qtd').val(++num)
                }

                // if (qtdEstoque !== 0) {
                if (num > qtdEstoque) {
                    document.getElementById("subTotalItens").innerHTML = `<br><p>Adicionando <b style="color: green;">${num - qtdEstoque}</b> ao estoque de <b>${qtdEstoque}</b></p>`
                } else if (num < qtdEstoque) {
                    document.getElementById("subTotalItens").innerHTML = `<br><p>Removendo <b style="color: red;">${qtdEstoque - num}</b> do estoque de <b>${qtdEstoque}</b></p>`
                } else {
                    document.getElementById("subTotalItens").innerHTML = ""
                }
                // }

            });
            break;
        case "pedidos":

            let selectOptCientes //leitura da tabela clientes
            let selectOptItens //leitura da tabela itens

            for (i = 0; i < tabPessoas.length; i++) {
                selectOptCientes += `<option value="${tabPessoas[i].id}">${tabPessoas[i].nome} ${tabPessoas[i].sobrenome}</option>`
            }

            let sorted = Array.from(tabItens).sort(function (a, b) {
                return a.categoria.localeCompare(b.categoria) || a.nome.localeCompare(b.nome);
            });

            for (i = 0, categoria = ""; i < sorted.length; i++) {

                if (sorted[i].qtd <= 0) continue

                if (categoria == "") {
                    categoria = sorted[i].categoria
                    selectOptItens += `<optgroup label="${categoria}" data-subtext="descrição" data-max-options="">`
                }

                if (categoria !== sorted[i].categoria) {
                    categoria = sorted[i].categoria
                    selectOptItens += `</optgroup>`
                    selectOptItens += `<optgroup label="${categoria}" data-subtext="descrição" data-max-options="">`
                }

                selectOptItens += `<option value="${sorted[i].id}">${sorted[i].nome}</option>`

            }

            selectOptItens += `</optgroup>`

            modalPedidos = `
                <div class="row">
                    <div class="col-md-6 col-sm-6">
                        <div class="form-group">
                            <label for="">Data do Pedido</label>
                            <input id="pedido_data" type="date" class="form-control" max="9999-12-31" disabled/>
                        </div>
                    </div>
                    <div class="col-md-6 col-sm-6">
                        <div class="form-group">
                            <label for="">Status</label>
                            <select id="pedido_status" class="form-control" disabled>
                                <option value="aberto">Aberto</option>
                                <option value="finalizado">Finalizado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </div>
                    </div>  
                </div>

                <div class="row">
                    <div class="col-md-6 col-sm-6">
                        <div class="form-group">
                            <label for="">Cliente</label>
                            <select id="pedido_cliente" class="form-control selectpicker" title="Lista Clientes" data-live-search="true">
                                ` + selectOptCientes + `
                            </select>
                        </div>
                    </div>
                    <div class="col-lg-6 col-sm-6">
                        <div class="form-group">
                            <label for="">Itens</label>
                            <select id="pedido_itens" data-dropup-auto="false" data-size="5" class="selectpicker show-menu-arrow form-control" multiple data-max-options="">
                                ` + selectOptItens + `
                            </select>
                        </div>
                    </div>
                </div>

                <div class="row" style="border-top: 1px solid #e5e5e5; margin-top: 10px;">
                    <div class="col-lg-12 col-sm-12 col-xs-12" align="center">
                        <br><button type='button' class='btn btn-danger' id="btnCalc" style="margin-bottom: 10px;"><i class='fa fa-calculator'></i></button>
                    </div>

                    <div class="col-lg-6 col-sm-6">
                        <div id="ulItens"></div>
                    </div>
                    <div class="col-lg-6 col-sm-6">
                        <div id="ulTotal"></div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-lg-6 col-sm-6 col-xs-6" align="center">
                        <div id="btnArquivar"></div>
                    </div>
                    <div class="col-lg-6 col-sm-6 col-xs-6" align="center">
                        <div id="btnImprimir"></div>
                    </div>
                </div>
            `;

            document.getElementById("modalWindow").innerHTML = modalPedidos
            document.getElementById("btnSalvar").setAttribute('onClick', 'adicionaRegistro(null, "pedidos")')
            document.getElementById("btnSalvar").style.display = "block";

            break;
        case "historico":

            modalHistorico = `
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="">Data do Pedido</label>
                            <input id="pedido_data" type="date" class="form-control" max="9999-12-31" disabled/>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="">Status</label>
                            <input id="pedido_status" type="text" class="form-control" disabled/>
                        </div>
                    </div>  
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="">Cliente</label>
                            <input id="pedido_cliente" type="text" class="form-control" disabled/>
                        </div>
                    </div>
                    <div class="col-lg-6"></div>
                </div>

                <div class="row">
                    <div class="col-lg-6">
                        <div id="ulItens"></div>
                    </div>
                    <div class="col-lg-6">
                        <div id="ulTotal"></div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-lg-12 col-sm-12 col-xs-12" align="center">
                        <div id="btnImprimir"></div>
                    </div>
                </div>
            `;

            document.getElementById("modalWindow").innerHTML = modalHistorico

            break;
    }

    document.getElementById("btnSalvar").innerHTML = "Salvar"

    // funções de busca no select options
    $(function () {
        $('.selectpicker').selectpicker();
    });

    // remove bug da tela que não minimiza
    $("#pedido_cliente").on("change", function () {
        $('.bootstrap-select.open').removeClass('open');
    });

    // // ao clicar, atualiza o selectpicker sem apagar o que havia sido selecionado
    // $('#pedido_itens').on('show.bs.select', function () {
    //     $('#pedido_itens').val(arrayBugFix) //array para multiplas seleções
    //     $('.selectpicker').selectpicker('refresh')
    // });

    // preenche o resumo dos pedidos
    // $("#pedido_itens").on("change", function () {
    $("#btnCalc").on("click", function () {

        if ($("#pedido_itens").val() == "") return

        let total = 0
        let ulHtml = '<label for="">Resumo</label><ul>'
        arrayItens = []

        Array.from(document.querySelector("#pedido_itens").options).forEach(function (option_element) {
            if (option_element.selected) {
                arraycheck(option_element.value)
            }
        });

        for (let i = 0; i < arrayItens.length; i++) {
            arrayItens[i].qtdAtual = 1

            ulHtml += `<li style="margin-bottom: 10px; border-bottom: 1px solid #e5e5e5;" id="li${i}">
            ${arrayItens[i].nome} - <b>${formatter.format(arrayItens[i].preco)}</b>
            <span style="font-size: 22px;"><br><i class="fa fa-minus-circle text-danger" onclick="carregaLiItens(${i}, '-')"></i> ${arrayItens[i].qtdAtual}x <i class="fa fa-plus-circle text-success" onclick="carregaLiItens(${i}, '+')"></i> 
            </span>
            </li>`;
            total += parseFloat(arrayItens[i].preco)
        }

        ulHtml += "</ul>"

        document.getElementById("ulItens").innerHTML = ulHtml
        document.getElementById("ulTotal").innerHTML = `<label for="">Total</label><p style="font-size: 17px;"><b>${formatter.format(total)}</b></p>`

    });

    function arraycheck(id) {

        let found = false; // flag
        let item
        for (let i = 0; !found && i < tabItens.length; i++) {
            // sai do loop ao encontrar o item
            found = id == tabItens[i].id; // define o flag ao encontrar
            item = tabItens[i]
        }
        if (found) {
            arrayItens.push(new Item(item.id, item.nome, item.preco, item.categoria, item.qtd))
        }
    }

    function populaAutocomplete(tabela) {
        switch (tabela) {
            case "itens":

                let itens = []
                let categoriasUnicas = new Set()

                for (let i = 0; i < tabItens.length; i++) {
                    itens.push(tabItens[i].nome)
                    categoriasUnicas.add(tabItens[i].categoria)
                }

                itens.sort()
                let categorias = Array.from(categoriasUnicas).sort()

                $("#item_nome").autocomplete({
                    source: itens
                });

                $("#item_categ").autocomplete({
                    source: categorias
                });

                break;

            default:
                break;
        }
    }

}

function carregaLiItens(id, operation) {

    // let liAtual = this.parentNode.parentNode
    let total = 0

    if (operation == "-") {
        if ((arrayItens[id].qtdAtual - 1) < 0) return
        arrayItens[id].qtdAtual -= 1
    } else if (operation == "+") {
        if (arrayItens[id].qtdAtual == arrayItens[id].qtd) return
        arrayItens[id].qtdAtual += +1
    }

    document.getElementById(`li${id}`).innerHTML = `
    <li id="li${id}">
    ${arrayItens[id].nome} - <b>${formatter.format(arrayItens[id].preco * arrayItens[id].qtdAtual)}</b>
    <span style="font-size: 22px;"><br><i class="fa fa-minus-circle text-danger" onclick="carregaLiItens(${id}, '-')"></i> ${arrayItens[id].qtdAtual}x <i class="fa fa-plus-circle text-success" onclick="carregaLiItens(${id}, '+')"></i> 
    </span>
    </li>`;

    for (let i = 0; i < arrayItens.length; i++) {
        total += arrayItens[i].qtdAtual * arrayItens[i].preco
    }

    document.getElementById("ulTotal").innerHTML = `<label for="">Total</label><p style="font-size: 17px;"><b>${formatter.format(total)}</b></p>`

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

    // funções anônimas ocultam dados no spec do navegador
    (function () {

        var firebaseConfig = {
            apiKey: "AIzaSyAyQwUvr-2-s12lAzRpjuW3AV-QEicbrm0",
            authDomain: "demoapp-b02e6.firebaseapp.com",
            projectId: "demoapp-b02e6",
            storageBucket: "demoapp-b02e6.appspot.com",
            messagingSenderId: "914730654490",
            appId: "1:914730654490:web:afeaf09b1e6d64eef22aa3"
        };
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);

        var appCheck = firebase.appCheck();
        appCheck.activate(
            '6LcTMMwbAAAAADeZ2C8e4Qn2eLAIBhRcLuYPPdRQ',
            true);

    })()

    if (JSON.parse(sessionStorage.getItem('app')) == "true") {
        usingApp = true
    } else {
        usingApp = false
    }

    await lerFirebase()

    // tabPessoas = JSON.parse(localStorage.getItem("__cadastros__"))
    // if (tabPessoas == null) {
    //     tabPessoas = []
    //     // tabPessoas = JSON.parse(mock)
    // }

    // tabItens = JSON.parse(localStorage.getItem("__itens__"))
    // if (tabItens == null) {
    //     tabItens = []
    // }

    // tabPedidos = JSON.parse(localStorage.getItem("__pedidos__"))
    // if (tabPedidos == null) {
    //     tabPedidos = []
    // }

    // tabHistorico = JSON.parse(localStorage.getItem("__historico__"))
    // if (tabHistorico == null) {
    //     tabHistorico = []
    // }

    enableSound = JSON.parse(localStorage.getItem("__sound__"))
    if (enableSound == null) {
        enableSound = true
    }

    enableResponsive = JSON.parse(localStorage.getItem("__responsive__"))
    if (enableResponsive == null) {
        enableResponsive = true
    }

    async function lerFirebase() {
        let dbRef = firebase.database().ref();

        getClientesFirebase(dbRef)
        getItensFirebase(dbRef)
        getPedidosFirebase(dbRef)
        getHistoricoFirebase(dbRef)
    }
}

function playSoungEffect(effect) {

    if (!enableSound) {
        return false
    }

    let audio

    if (effect == 1) { //success
        audio = new Audio('resources/audio/mixkit-software-interface-start.wav');
    } else if (effect == 2) { //error
        audio = new Audio('resources/audio/mixkit-software-interface-remove.wav');
    } else if (effect == 3) { //warning
        audio = new Audio('resources/audio/mixkit-software-interface-back.wav');
    }

    audio.play();
}

function transicaoFade() {
    //  efeito fade ao abrir tabela
    document.getElementById("conteudoJSON").style.display = "none";
    $('#conteudoJSON').fadeIn(500);
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
            case "clientes":
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
            case "itens":
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
                            }
                        ]
                    });
                break;
            case "pedidos":
                tabelaGerada =
                    $('#tabelaJson').DataTable({
                        "order": [
                            [0, "desc"]
                        ], //asc ou desc, index com início 0

                        columnDefs: [{
                                responsivePriority: 1,
                                targets: 0
                            },
                            {
                                responsivePriority: 2,
                                targets: 1
                            },
                            {
                                responsivePriority: 3,
                                targets: 5
                            },
                            {
                                targets: [5, 6, 7],
                                orderable: false
                            }
                        ]

                    });
                break;
            case "historico":
                tabelaGerada =
                    $('#tabelaJson').DataTable({
                        "order": [
                            [0, "desc"]
                        ], //asc ou desc, index com início 0

                        columnDefs: [{
                                responsivePriority: 1,
                                targets: 0
                            },
                            {
                                responsivePriority: 2,
                                targets: 1
                            },
                            {
                                responsivePriority: 3,
                                targets: 5
                            },
                            {
                                targets: [5],
                                orderable: false
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

    document.getElementById("conteudoJSON").innerHTML = html;

    transicaoFade()

    omiteCamposTabela()

    let btnSom = document.getElementById("btnValidaSom");
    btnSom.addEventListener("click", function () {
        let checkBox = document.getElementById("btnValidaSom");

        if (checkBox.checked == true) {
            enableSound = true
            playSoungEffect(1)
        } else {
            playSoungEffect(3)
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

function getClientesFirebase(dbRef) {

    // obter conteúdo da tabela clientes
    dbRef.child("clientes").get().then((snapshot) => {
        if (snapshot.exists()) {
            // console.log(snapshot.val());
            // convertendo os dados em array
            tabPessoas = []

            snapshot.forEach(function (pessoa) {
                let pessoaVal = pessoa.val();
                tabPessoas.push(pessoaVal);
            })

        }
    }).catch((error) => {
        console.error(error);
    });
}

function getItensFirebase(dbRef) {

    // obter conteúdo da tabela itens
    dbRef.child("itens").get().then((snapshot) => {
        if (snapshot.exists()) {
            // console.log(snapshot.val());
            // convertendo os dados em array
            tabItens = []

            snapshot.forEach(function (item) {
                let itemVal = item.val();
                tabItens.push(itemVal);
            })

        }
    }).catch((error) => {
        console.error(error);
    });
}

function getPedidosFirebase(dbRef) {

    // obter conteúdo da tabela itens
    dbRef.child("pedidos").get().then((snapshot) => {
        if (snapshot.exists()) {
            // console.log(snapshot.val());
            // convertendo os dados em array
            tabPedidos = []

            snapshot.forEach(function (pedido) {
                let pedidoVal = pedido.val();
                tabPedidos.push(pedidoVal);
            })

        }
    }).catch((error) => {
        console.error(error);
    });
}

function getHistoricoFirebase(dbRef) {

    // obter conteúdo da tabela itens
    dbRef.child("historico").get().then((snapshot) => {
        if (snapshot.exists()) {
            // console.log(snapshot.val());
            // convertendo os dados em array
            tabHistorico = []

            snapshot.forEach(function (historico) {
                let historicoVal = historico.val();
                tabHistorico.push(historicoVal);
            })

        }
    }).catch((error) => {
        console.error(error);
    });
}

function setClientesFirebase(id, nome, sobrenome, ano, formacao) {

    // firebase.database().ref('clientes/').push({ //criação com ID automático
    firebase.database().ref('clientes/' + id).update({ //atualização
        id: id,
        nome: nome,
        sobrenome: sobrenome,
        ano: ano,
        formacao: formacao
    }, (error) => {
        if (error) {
            console.log("Algo deu errado!")
        } else {
            console.log("Gravado com Sucesso!")
            firebase.database().ref('system').child('counter').set(firebase.database.ServerValue.increment(1))
        }
    });
}

function setItensFirebase(id, nomeItem, preco, categoria, qtd) {

    // firebase.database().ref('clientes/').push({ //criação com ID automático
    firebase.database().ref('itens/' + id).update({ //atualização
        id: id,
        nome: nomeItem,
        preco: preco,
        categoria: categoria,
        qtd: qtd
    }, (error) => {
        if (error) {
            console.log("Algo deu errado!")
        } else {
            console.log("Gravado com Sucesso!")
            firebase.database().ref('system').child('counter').set(firebase.database.ServerValue.increment(1))
        }
    });
}

function setPedidosFirebase(id, clienteId, itens, dtPedido, status, total) {

    // firebase.database().ref('clientes/').push({ //criação com ID automático
    firebase.database().ref('pedidos/' + id).update({ //atualização
        id: id,
        clienteId: clienteId,
        itens: itens,
        dtPedido: dtPedido,
        status: status,
        total: total
    }, (error) => {
        if (error) {
            console.log("Algo deu errado!")
        } else {
            console.log("Gravado com Sucesso!")
            firebase.database().ref('system').child('counter').set(firebase.database.ServerValue.increment(1))
        }
    });
}

function setHistoricoFirebase(id, clienteId, itens, dtPedido, status, total) {

    // firebase.database().ref('clientes/').push({ //criação com ID automático
    firebase.database().ref('historico/' + id).update({ //atualização
        id: id,
        clienteId: clienteId,
        itens: itens,
        dtPedido: dtPedido,
        status: status,
        total: total
    }, (error) => {
        if (error) {
            console.log("Algo deu errado!")
        } else {
            console.log("Gravado com Sucesso!")
            firebase.database().ref('system').child('counter').set(firebase.database.ServerValue.increment(1))
        }
    });
}

// var myEvent = window.attachEvent || window.addEventListener;
// var chkevent = window.attachEvent ? 'onbeforeunload' : 'beforeunload'; /// make IE7, IE8 compitable

// myEvent(chkevent, function (e) { // For >=IE7, Chrome, Firefox
//     var confirmationMessage = 'Tem certeza que deseja sair da página?'; // a space
//     (e || window.event).returnValue = confirmationMessage;
//     return confirmationMessage;
// });

window.onload = verificaAuth(), lerStorage(), carregaTelaInicio(true); //Carrega a tabela junto com a página.