// let mockDespesas = `
//     [{
//         "id": 1,
//         "despesa": "Mercado",
//         "valor": 99,
//         "status": "Pago",
//         "vencimento": "10/11/2022",
//         "forma": "Débito"
//     },
//     {
//         "id": 2,
//         "despesa": "Mercado",
//         "valor": 15,
//         "status": "Pendente",
//         "vencimento": "02/10/2022",
//         "forma": "Crédito"
//     },
//     {
//         "id": 3,
//         "despesa": "Carro",
//         "valor": 50,
//         "status": "Pago",
//         "vencimento": "10/10/2022",
//         "forma": "Crédito"
//     }]
//     `;

class Despesas {
    constructor(id, name, salary) {
        this.id = id;
        this.name = name;
        this.salary = salary;
    }

    carregaModal() {
        this.modalDespesas = `
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
                        <label for="">Despesa<span class="required">*</span></label>
                        <input id="despesa_nome" type="text" class="form-control"
                            placeholder="digite a despesa..." maxlength="20"/>
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
                            <option value="Pago" selected>Pago</option>
                            <option value="Pendente">Pendente</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="">Data de Vencimento</label>
                        <input id="despesa_venc" type="date" class="form-control" max="9999-12-31" />
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="">Forma</label>
                        <select id="despesa_forma" class="form-control">
                            <option value="Débito" selected>Débito</option>
                            <option value="Crédito">Crédito</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="">Parcelas</label>
                        <input id="despesa_parcelas" type="number" class="form-control"
                            placeholder="digite o número de parcelas..." maxlength="3" disabled="true"/>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="">Categoria</label> <button style="border-radius: 100%;" class="btn-primary" onclick="despesasController.adicionaCategoria()"><i class="fa fa-plus"></i></button>
                        <select id="despesa_categoria" class="form-control">
                            <option disabled selected value> -- selecione -- </option>
        `;

        if (this.tabCategorias != undefined) {
            this.tabCategorias.sort(function (a, b) {
                return a.categoria.localeCompare(b.categoria, 'pt', { sensitivity: 'base' })
            });

            for (let i = 0; i < this.tabCategorias.length; i++) {
                this.modalDespesas += `<option value=${this.tabCategorias[i].categoria}>${this.tabCategorias[i].categoria} [${categoriasController.carregaTotalUtilizado(this.tabCategorias[i].categoria, (this.tabCategorias[i].limite == "" ? 0 : this.tabCategorias[i].limite))}]</option>`
            }
        }

        this.modalDespesas += `</select>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="">Data de Modificação</label>
                        <input id="despesa_modificacao" type="date" class="form-control" disabled="true" />
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
                </div>
            </div>
        `;
    }

    carregaDespesas() {
        carregaSaldo()
        this.tab = mainTab //Sincroniza os dandos entre as views
        this.tabCategorias = categTab
        this.carregaModal()
        var addBtn = document.getElementById("addBtn");

        addBtn.addEventListener("click", function () {
            despesasController.limpaCamposModal()
        }, false);

        let tabDespesas = this.tab

        $('.collapse').collapse('hide');
        document.getElementById("tituloTabela").innerHTML = `<h3>Despesas (${setUpperCase(mmName)})</h3>`;

        exibeCamposTabela() //Omitidos em telas de configuração/gráficos

        // let html = `<table id="tabelaJson" class="table table-striped table-bordered dt-responsive nowrap" style="width:100%">
        let html = `<table id="tabelaJson" class=\"table table-bordered table-striped dt-responsive nowrap style=\"width: 100%\"\">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Despesa</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>Vencimento</th>
                        <th>Forma</th>
                        <th>Parcelas</th>
                        <th>Categoria</th>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>`;

        if (tabDespesas.length != "") {
            for (let i = 0; i < tabDespesas.length; i++) {
                if (tabDespesas[i].tabela != "despesas") continue //Exibe somente os dados referentes à tabela correta

                html += `<tr><td>${tabDespesas[i].id}</td>`

                if (tabDespesas[i].status == "Pago") {
                    html += `<td><s>${tabDespesas[i].despesa}</s></td>
                             <td><s>R$ ${Math.ceil(tabDespesas[i].valor)}</s></td>`
                } else {
                    html += `<td>${tabDespesas[i].despesa}</td>
                             <td>R$ ${Math.ceil(tabDespesas[i].valor)}</td>`
                }

                html += `<td>${tabDespesas[i].status}</td>
                         <td><span class="hide">${tabDespesas[i].vencimento}</span>${calculaStatus(tabDespesas[i].status, tabDespesas[i].vencimento)}</td>
                         <td>${tabDespesas[i].forma}</td>
                         <td>${tabDespesas[i].parcelas}</td>
                         <td>${tabDespesas[i].categoria}</td>
                `;

                if (tabDespesas[i].status == "Pago") {
                    html += `<td><button type='button' class='active btn btn-success' onclick='despesasController.statusPago( ${tabDespesas[i].id} )'><i class='fa fa-undo' /></button></td>`
                } else {
                    html += `<td><button type='button' class='btn btn-success' onclick='despesasController.statusPago( ${tabDespesas[i].id} )'><i class='fa fa-check' /></button></td>`
                }

                html += `<td><button type='button' class='btn btn-primary' onclick='despesasController.alteraRegistro( ${tabDespesas[i].id});'><i class='fa fa-edit' /></button></td>
                         <td><button type='button' class='btn btn-danger' onclick='despesasController.apagaRegistro( ${tabDespesas[i].id});'><i class='fa fa-trash' /></button></td>
                </tr>`;
            }
        }

        html += "<tbody></table>";

        document.getElementById("conteudoJSON").innerHTML = html;

        carregaTabelaDatatables("despesas")

        transicaoFade()

        // preenche modal
        document.getElementById("modalRegistroLabel").innerHTML = "Cadastrar Despesa"

        document.getElementById("btnSalvar").innerHTML = "Salvar"
        document.getElementById("btnSalvar").setAttribute('onClick', 'despesasController.adicionaRegistro()')
        document.getElementById("btnSalvar").style.display = "block";
        document.getElementById("modalWindow").innerHTML = this.modalDespesas

        var formaType = document.getElementById("despesa_forma");

        $("#despesa_modificacao").val(today) //Define data de modificação no formulário

        formaType.addEventListener("change", function () {
            if (formaType.value == "Crédito") {
                document.getElementById("despesa_parcelas").disabled = false;
            } else {
                document.getElementById("despesa_parcelas").disabled = true;
                $("#despesa_parcelas").val("")
            }
        }, false);

    }

    adicionaRegistro(id = null) {

        let tabDespesas = this.tab

        let despesa = document.getElementById('despesa_nome').value;
        let valor = document.getElementById('despesa_valor').value;
        let status = document.getElementById('despesa_status').value;
        let vencimento = document.getElementById('despesa_venc').value;
        let forma = document.getElementById('despesa_forma').value;
        let categoria = document.getElementById('despesa_categoria').value;
        let parcelas = document.getElementById('despesa_parcelas').value;
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

            tabDespesas.push(JSON.parse(JSON.stringify(new Registro(++id, "despesas", despesa, valor, status, vencimento, forma, categoria, (parcelas == "" ? "" : ("1/" + parcelas)), modificacao, recorrente))))

            playSoungEffect("success")

        } else { //alteração de registro

            let pos = tabDespesas.findIndex(i => i.id == id);

            tabDespesas[pos].despesa = despesa
            tabDespesas[pos].valor = valor
            tabDespesas[pos].status = status
            tabDespesas[pos].vencimento = vencimento
            // tabDespesas[pos].forma = forma
            tabDespesas[pos].categoria = categoria
            // tabDespesas[pos].parcelas = parcelas
            tabDespesas[pos].modificacao = today
            tabDespesas[pos].recorrente = recorrente

            // setClientesFirebase(id, nome, sobrenome, ano, formacao)

            playSoungEffect("success")

        }

        localStorage.setItem("__despesas__", JSON.stringify(tabDespesas))
        mainTab = tabDespesas

        $("#modalRegistro").modal("hide") //fecha a modal após clicar em salvar

        this.carregaDespesas()
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
        $("#despesa_forma").val(tabDespesas[pos].forma)
        $("#despesa_categoria").val(tabDespesas[pos].categoria)

        document.getElementById('despesa_parcelas').type = "text";
        $("#despesa_parcelas").val(tabDespesas[pos].parcelas)
        $("#despesa_modificacao").val(tabDespesas[pos].modificacao)
        $("#despesa_recorrente").prop('checked', tabDespesas[pos].recorrente);

        document.getElementById("despesa_forma").disabled = true;
        document.getElementById("despesa_parcelas").disabled = true;
        document.getElementById("despesa_modificacao").disabled = true;

        // document.getElementById("despesa_nome").disabled = true;

        document.getElementById("btnSalvar").innerHTML = "Alterar"
        document.getElementById("btnSalvar").setAttribute('onClick', 'despesasController.adicionaRegistro(' + id + ')');

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

            this.carregaDespesas()
        }

    }

    limpaCamposModal() {
        if ($('#despesa_nome').val() != undefined) {
            document.getElementById("despesa_nome").disabled = false;
            document.getElementById("despesa_valor").disabled = false;
            document.getElementById("despesa_status").disabled = false;
            document.getElementById("despesa_venc").disabled = false;
            document.getElementById("despesa_forma").disabled = false;
            document.getElementById("despesa_categoria").disabled = false;
            document.getElementById('despesa_parcelas').type = "number";
            document.getElementById("despesa_parcelas").disabled = true;
            document.getElementById("despesa_modificacao").disabled = true;

            document.getElementById('despesa_nome').value = "";
            document.getElementById('despesa_valor').value = "";
            document.getElementById('despesa_status').value = "Pago";
            document.getElementById('despesa_venc').value = today;
            document.getElementById('despesa_forma').value = "Débito";
            document.getElementById('despesa_categoria').value = "";
            document.getElementById('despesa_parcelas').value = "";
            document.getElementById('despesa_modificacao').value = today;
            document.getElementById('despesa_nome').focus();

            document.getElementById("btnSalvar").innerHTML = "Salvar"
            document.getElementById("btnSalvar").setAttribute('onClick', 'despesasController.adicionaRegistro()')
            document.getElementById("btnSalvar").style.display = "block";
        }

    }

    statusPago(id) {

        // document.getElementById('despesa_nome').classList.add("border-danger");
        let tabDespesas = this.tab

        let pos = tabDespesas.findIndex(i => i.id == id);

        if (tabDespesas[pos].status != "Pago") {
            tabDespesas[pos].status = "Pago"
            playSoungEffect("paid")
        } else {
            tabDespesas[pos].status = "Pendente"
            playSoungEffect("undo")
        }

        localStorage.setItem("__despesas__", JSON.stringify(tabDespesas))
        this.tab = tabDespesas

        this.carregaDespesas()

    }

    adicionaCategoria() {
        categoriasController.adicionaCategoria(null, "", "#337ab7", true)
    }

    uploadJSON(despesas) {
        localStorage.setItem("__despesas__", JSON.stringify(despesas))

        for (let i = 0; i < despesas.length; i++) {
            if (despesas[i].categoria == "") continue
            categoriasController.adicionaCategoria(despesas[i].categoria, "", "#337ab7", false)
        }
        location.reload()
    }

    downloadJSON() {

        let filename = "despesas.json";
        let element = document.createElement("a");

        let tabDespesas = JSON.parse(localStorage.getItem("__despesas__"))

        if (tabDespesas == null) {

            document.getElementById("carga_msg").innerHTML = "Sem dados a serem exportados"
            return
        }

        element.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tabDespesas)));
        element.setAttribute("download", filename);

        element.style.display = "none";
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);

        document.getElementById("carga_msg").innerHTML = "Exportado com sucesso"
    }

    htmlTabCategorias() {
        this.tabCategorias = categTab
        let html = `
        <select id="despesa_categoria" class="form-control">
                            <option disabled selected value> -- selecione -- </option>
        `;

        for (let i = 0; i < this.tabCategorias.length; i++) {
            html += `<option value=${this.tabCategorias[i].categoria}>${this.tabCategorias[i].categoria}</option>`
        }

        html += `</select>`

        return html
    }

}

