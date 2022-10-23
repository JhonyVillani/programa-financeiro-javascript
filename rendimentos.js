class Rendimentos {
    constructor() {

    }

    carregaModal() {
        this.modalRendimentos = `
            <div class="row">
                <div class="col-md-12">
                    <div class="form-group">
                        ${document.getElementById("saldo_tela").innerHTML}
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="">Rendimento<span class="required">*</span></label>
                        <input id="despesa_nome" type="text" class="form-control"
                            placeholder="digite o rendimento..." maxlength="20"/>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="">Valor</label>
                        <input id="despesa_valor" type="number" class="form-control"
                            placeholder="digite o valor..." maxlength="15" />
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="">Status</label>
                        <select id="despesa_status" class="form-control">
                            <option value="Recebido" selected>Recebido</option>
                            <option value="Pendente">Pendente</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="">Data de Recebimento</label>
                        <input id="despesa_venc" type="date" class="form-control" max="9999-12-31" />
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group" >
                        <input type="checkbox" id="despesa_recorrente" style="vertical-align: top;" />
                        <label for="">Recorrente</label>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="">Data de Modificação</label>
                        <input id="despesa_modificacao" type="date" class="form-control" disabled="true" />
                    </div>
                </div>
            </div>
        `;
    }

    carregaRendimentos() {
        carregaSaldo()
        this.tab = mainTab //Sincroniza os dandos entre as views
        this.tabCategorias = categTab
        this.carregaModal()
        var addBtn = document.getElementById("addBtn");

        addBtn.addEventListener("click", function () {
            rendimentosController.limpaCamposModal()
        }, false);

        let tabDespesas = this.tab

        $('.collapse').collapse('hide');
        document.getElementById("tituloTabela").innerHTML = `<h3>Rendimentos (${setUpperCase(mmName)})</h3>`;

        exibeCamposTabela() //Omitidos em telas de configuração/gráficos

        // let html = `<table id="tabelaJson" class="table table-striped table-bordered dt-responsive nowrap" style="width:100%">
        let html = `<table id="tabelaJson" class=\"table table-bordered table-striped dt-responsive nowrap style=\"width: 100%\"\">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Rendimento</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>Recebimento</th>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>`;

        if (tabDespesas.length != "") {
            for (let i = 0; i < tabDespesas.length; i++) {
                if (tabDespesas[i].tabela != "rendimentos") continue //Exibe somente os dados referentes à tabela correta

                html += `<tr><td>${tabDespesas[i].id}</td>`

                if (tabDespesas[i].status == "Recebido") {
                    html += `<td><s>${tabDespesas[i].despesa}</s></td>
                             <td><s>R$ ${Math.ceil(tabDespesas[i].valor)}</s></td>`
                } else {
                    html += `<td>${tabDespesas[i].despesa}</td>
                             <td>R$ ${Math.ceil(tabDespesas[i].valor)}</td>`
                }

                html += `<td>${tabDespesas[i].status}</td>
                         <td><span class="hide">${tabDespesas[i].vencimento}</span>${calculaStatus(tabDespesas[i].status, tabDespesas[i].vencimento)}</td>
                `;

                if (tabDespesas[i].status == "Recebido") {
                    html += `<td><button type='button' class='active btn btn-success' onclick='rendimentosController.statusPago( ${tabDespesas[i].id} )'><i class='fa fa-undo' /></button></td>`
                } else {
                    html += `<td><button type='button' class='btn btn-success' onclick='rendimentosController.statusPago( ${tabDespesas[i].id} )'><i class='fa fa-check' /></button></td>`
                }

                html += `<td><button type='button' class='btn btn-primary' onclick='rendimentosController.alteraRegistro( ${tabDespesas[i].id});'><i class='fa fa-edit' /></button></td>
                         <td><button type='button' class='btn btn-danger' onclick='rendimentosController.apagaRegistro( ${tabDespesas[i].id});'><i class='fa fa-trash' /></button></td>
                </tr>`;
            }
        }

        html += "<tbody></table>";

        document.getElementById("conteudoJSON").innerHTML = html;

        carregaTabelaDatatables("rendimentos")

        transicaoFade()

        // preenche modal
        document.getElementById("modalRegistroLabel").innerHTML = "Cadastrar Rendimento"

        document.getElementById("btnSalvar").innerHTML = "Salvar"
        document.getElementById("btnSalvar").setAttribute('onClick', 'rendimentosController.adicionaRegistro()')
        document.getElementById("btnSalvar").style.display = "block";
        document.getElementById("modalWindow").innerHTML = this.modalRendimentos

        var formaType = document.getElementById("despesa_forma");

        $("#despesa_modificacao").val(today) //Define data de modificação no formulário

        // formaType.addEventListener("change", function () {
        //     if (formaType.value == "Crédito") {
        //         document.getElementById("despesa_parcelas").disabled = false;
        //     } else {
        //         document.getElementById("despesa_parcelas").disabled = true;
        //         $("#despesa_parcelas").val("")
        //     }
        // }, false);

    }

    adicionaRegistro(id = null) {

        let tabDespesas = this.tab

        let despesa = document.getElementById('despesa_nome').value;
        let valor = document.getElementById('despesa_valor').value;
        let status = document.getElementById('despesa_status').value;
        let vencimento = document.getElementById('despesa_venc').value;
        // let forma = document.getElementById('despesa_forma').value;
        // let categoria = document.getElementById('despesa_categoria').value;
        // let parcelas = document.getElementById('despesa_parcelas').value;
        let modificacao = document.getElementById('despesa_modificacao').value;
        let recorrente = document.getElementById('despesa_recorrente').checked;

        // campos obrigatórios
        if (despesa == "") {
            document.getElementById('despesa_nome').classList.add("border-danger");
            playSoungEffect("error")
            document.getElementById('despesa_nome').focus();
            setTimeout(function () {
                document.getElementById('despesa_nome').classList.remove("border-danger");
            }, 1500);
            return false
        }

        if (id == null) { //cadastro de registro

            // let uid = await getSystemInfo()
            // id = ++uid

            // setClientesFirebase(id, nome, sobrenome, ano, formacao)

            if (tabDespesas == "") {
                id = 0
            } else {
                let sorted = Array.from(tabDespesas).sort(function (a, b) {
                    return b.id - a.id;
                });

                id = sorted[0].id
            }

            tabDespesas.push(JSON.parse(JSON.stringify(new Registro(++id, "rendimentos", despesa, valor, status, vencimento, null, null, null, modificacao, recorrente))))

            playSoungEffect("success")

        } else { //alteração de registro

            let pos = tabDespesas.findIndex(i => i.id == id);

            tabDespesas[pos].despesa = despesa
            tabDespesas[pos].valor = valor
            tabDespesas[pos].status = status
            tabDespesas[pos].vencimento = vencimento
            // tabDespesas[pos].forma = forma
            // tabDespesas[pos].categoria = categoria
            // tabDespesas[pos].parcelas = parcelas
            tabDespesas[pos].modificacao = today
            tabDespesas[pos].recorrente = recorrente

            // setClientesFirebase(id, nome, sobrenome, ano, formacao)

            playSoungEffect("success")

        }

        localStorage.setItem("__despesas__", JSON.stringify(tabDespesas))
        mainTab = tabDespesas

        $("#modalRegistro").modal("hide") //fecha a modal após clicar em salvar

        this.carregaRendimentos()
        this.limpaCamposModal()

    }

    exibeRegistro(id) {
        return
        $("#modalRegistro").modal("show") //exibe modal

        let pos = this.tab.findIndex(i => i.id == id);

        $('#despesa_nome').val(this.tab[pos].despesa)
        document.getElementById("btnSalvar").style.display = "none";

    }

    alteraRegistro(id) {

        let tabDespesas = this.tab

        $("#modalRegistro").modal("show") //exibe modal

        let pos = tabDespesas.findIndex(i => i.id == id);

        $('#despesa_nome').val(tabDespesas[pos].despesa)
        $("#despesa_valor").val(tabDespesas[pos].valor)
        $("#despesa_status").val(tabDespesas[pos].status)
        $("#despesa_venc").val(tabDespesas[pos].vencimento)
        // $("#despesa_forma").val(tabDespesas[pos].forma)
        // $("#despesa_categoria").val(tabDespesas[pos].categoria)

        // document.getElementById('despesa_parcelas').type = "text";
        // $("#despesa_parcelas").val(tabDespesas[pos].parcelas)
        $("#despesa_modificacao").val(tabDespesas[pos].modificacao)
        $("#despesa_recorrente").prop('checked', tabDespesas[pos].recorrente);

        // document.getElementById("despesa_forma").disabled = true;
        // document.getElementById("despesa_parcelas").disabled = true;
        document.getElementById("despesa_modificacao").disabled = true;

        // document.getElementById("despesa_nome").disabled = true;

        document.getElementById("btnSalvar").innerHTML = "Alterar"
        document.getElementById("btnSalvar").setAttribute('onClick', 'rendimentosController.adicionaRegistro(' + id + ')');

        // $('select[id="pedido_cliente"]').selectpicker('val', tabPedidos[posPedido].clienteId);
        // $("#pedido_data").val(tabPedidos[posPedido].dtPedido)

    }

    apagaRegistro(id) {

        let _confirm = confirm("Deseja realmente excluir esse registro?")

        if (_confirm) {
            let tabDespesas = this.tab
            let pos = tabDespesas.findIndex(i => i.id == id);
            tabDespesas.splice(pos, 1)

            // firebase.database()
            //     .ref('clientes')
            //     .child(id)
            //     .remove()

            localStorage.setItem("__despesas__", JSON.stringify(tabDespesas))
            mainTab = tabDespesas

            playSoungEffect("warning")

            this.carregaRendimentos()
        }

    }

    limpaCamposModal() {
        if ($('#despesa_nome').val() != undefined) {
            document.getElementById("despesa_nome").disabled = false;
            document.getElementById("despesa_valor").disabled = false;
            document.getElementById("despesa_status").disabled = false;
            document.getElementById("despesa_venc").disabled = false;
            // document.getElementById("despesa_forma").disabled = false;
            // document.getElementById("despesa_categoria").disabled = false;
            // document.getElementById('despesa_parcelas').type = "number";
            // document.getElementById("despesa_parcelas").disabled = true;
            document.getElementById("despesa_modificacao").disabled = true;

            document.getElementById('despesa_nome').value = "";
            document.getElementById('despesa_valor').value = "";
            document.getElementById('despesa_status').value = "Recebido";
            document.getElementById('despesa_venc').value = today;
            // document.getElementById('despesa_forma').value = "";
            // document.getElementById('despesa_categoria').value = "";
            // document.getElementById('despesa_parcelas').value = "";
            document.getElementById('despesa_modificacao').value = today;
            document.getElementById('despesa_nome').focus();

            document.getElementById("btnSalvar").innerHTML = "Salvar"
            document.getElementById("btnSalvar").setAttribute('onClick', 'rendimentosController.adicionaRegistro()')
            document.getElementById("btnSalvar").style.display = "block";
        }

    }

    statusPago(id) {

        // document.getElementById('despesa_nome').classList.add("border-danger");
        let tabDespesas = this.tab

        let pos = tabDespesas.findIndex(i => i.id == id);

        if (tabDespesas[pos].status != "Recebido") {
            tabDespesas[pos].status = "Recebido"
            playSoungEffect("paid")
        } else {
            tabDespesas[pos].status = "Pendente"
            playSoungEffect("undo")
        }

        localStorage.setItem("__despesas__", JSON.stringify(tabDespesas))
        this.tab = tabDespesas

        this.carregaRendimentos()

    }

    adicionaCategoria() {
        let categoria = prompt("Digite a categoria")

        if (categoria == null) return

        //Evita duplicidade de categorias
        let categoriasUnicas = new Set(this.tabCategorias)

        categoriasUnicas.add(categoria)

        this.tabCategorias = Array.from(categoriasUnicas)

        localStorage.setItem("__categorias__", JSON.stringify(this.tabCategorias))
        categTab = this.tabCategorias

        document.getElementById("despesa_categoria").innerHTML = this.htmlTabCategorias()

        $("#despesa_categoria").val(categoria)

    }

    htmlTabCategorias() {
        let html = `
        <select id="despesa_categoria" class="form-control">
                            <option disabled selected value> -- selecione -- </option>
        `;

        for (let i = 0; i < this.tabCategorias.length; i++) {
            html += `<option value=${this.tabCategorias[i]}>${this.tabCategorias[i]}</option>`
        }

        html += `</select>`

        return html
    }

}

