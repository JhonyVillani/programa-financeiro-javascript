class Desejos {
    constructor(id, name, salary) {
        this.id = id;
        this.name = name;
        this.salary = salary;

    }

    carregaModal() {
        this.modalDesejos = `
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
                <label for="">Categoria</label> <button style="border-radius: 100%;" class="btn-primary" onclick="desejosController.adicionaCategoria()"><i class="fa fa-plus"></i></button>
                <select id="despesa_categoria" class="form-control">
                    <option disabled selected value> -- selecione -- </option>
`;

if (this.tabCategorias != undefined) {
    this.tabCategorias.sort(function (a, b) {
        return a.categoria.localeCompare(b.categoria, 'pt', { sensitivity: 'base' })
    });

    for (let i = 0; i < this.tabCategorias.length; i++) {
        this.modalDesejos += `<option value=${this.tabCategorias[i].categoria}>${this.tabCategorias[i].categoria} [${categoriasController.carregaTotalUtilizado(this.tabCategorias[i].categoria, (this.tabCategorias[i].limite == "" ? 0 : this.tabCategorias[i].limite))}]</option>`
    }
}

this.modalDesejos += `</select>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="">Data da Meta</label>
                        <input id="despesa_venc" type="date" class="form-control" max="9999-12-31" />
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
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

    carregaDesejos() {
        carregaSaldo()
        this.tab = mainTab //Sincroniza os dandos entre as views
        this.tabCategorias = categTab
        this.carregaModal()
        var addBtn = document.getElementById("addBtn");

        addBtn.addEventListener("click", function () {
            desejosController.limpaCamposModal()
        }, false);

        let tabDespesas = this.tab

        $('.collapse').collapse('hide');
        document.getElementById("tituloTabela").innerHTML = `<h3>Lista de Desejos</h3>`;

        exibeCamposTabela() //Omitidos em telas de configuração/gráficos

        // let html = `<table id="tabelaJson" class="table table-striped table-bordered dt-responsive nowrap" style="width:100%">
        let html = `<table id="tabelaJson" class=\"table table-bordered table-striped dt-responsive nowrap style=\"width: 100%\"\">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Desejo</th>
                        <th>Valor</th>
                        <th>Meta</th>
                        <th>Categoria</th>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>`;

        if (tabDespesas.length != "") {
            for (let i = 0; i < tabDespesas.length; i++) {
                if (tabDespesas[i].tabela != "wishlist") continue //Exibe somente os dados referentes à tabela correta

                html += `<tr>
                         <td>${tabDespesas[i].id}</td>
                         <td>${tabDespesas[i].despesa}</td>
                         <td>R$ ${Math.ceil(tabDespesas[i].valor)}</td>
                         <td><span class="hide">${tabDespesas[i].vencimento}</span>${calculaStatus('Pendente', tabDespesas[i].vencimento)}</td>
                         <td>${tabDespesas[i].categoria}</td>
                         <td><button type='button' class='btn btn-success' onclick='desejosController.simular( ${tabDespesas[i].id} )'><i class='fa fa-shopping-cart ' /></button></td>
                         <td><button type='button' class='btn btn-primary' onclick='desejosController.alteraRegistro( ${tabDespesas[i].id});'><i class='fa fa-edit' /></button></td>
                         <td><button type='button' class='btn btn-danger' onclick='desejosController.apagaRegistro( ${tabDespesas[i].id});'><i class='fa fa-trash' /></button></td>
                         </tr>
                `;
            }
        }

        html += "<tbody></table>";

        document.getElementById("conteudoJSON").innerHTML = html;

        carregaTabelaDatatables("wishlist")

        transicaoFade()

        // preenche modal
        document.getElementById("modalRegistroLabel").innerHTML = "Cadastrar Despesa"

        document.getElementById("btnSalvar").innerHTML = "Salvar"
        document.getElementById("btnSalvar").setAttribute('onClick', 'desejosController.adicionaRegistro()')
        document.getElementById("btnSalvar").style.display = "block";
        document.getElementById("modalWindow").innerHTML = this.modalDesejos

        $("#despesa_modificacao").val(today) //Define data de modificação no formulário

    }

    adicionaRegistro(id = null) {

        let tabDespesas = this.tab

        let desejo = document.getElementById('despesa_nome').value;
        let valor = document.getElementById('despesa_valor').value;
        let vencimento = document.getElementById('despesa_venc').value;
        let categoria = document.getElementById('despesa_categoria').value;
        let modificacao = document.getElementById('despesa_modificacao').value;

        // campos obrigatórios
        if (desejo == "") {
            document.getElementById('despesa_nome').classList.add("border-danger");
            playSoungEffect("error")
            document.getElementById('despesa_nome').focus();
            setTimeout(function () {
                document.getElementById('despesa_nome').classList.remove("border-danger");
            }, 1500);
            return false
        }

        if (id == null) { //cadastro de registro

            if (tabDespesas == "") {
                id = 0
            } else {
                let sorted = Array.from(tabDespesas).sort(function (a, b) {
                    return b.id - a.id;
                });

                id = sorted[0].id
            }

            tabDespesas.push(JSON.parse(JSON.stringify(new Registro(++id, "wishlist", desejo, valor, "", vencimento, "", categoria, "", modificacao, ""))))

            playSoungEffect("success")

        } else { //alteração de registro

            let pos = tabDespesas.findIndex(i => i.id == id);

            tabDespesas[pos].despesa = desejo
            tabDespesas[pos].valor = valor
            tabDespesas[pos].categoria = categoria
            tabDespesas[pos].vencimento = vencimento
            tabDespesas[pos].modificacao = today

            // setClientesFirebase(id, nome, sobrenome, ano, formacao)

            playSoungEffect("success")

        }

        localStorage.setItem("__despesas__", JSON.stringify(tabDespesas))
        mainTab = tabDespesas

        $("#modalRegistro").modal("hide") //fecha a modal após clicar em salvar

        this.carregaDesejos()
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
        $("#despesa_venc").val(tabDespesas[pos].vencimento)
        $("#despesa_categoria").val(tabDespesas[pos].categoria)
        $("#despesa_modificacao").val(tabDespesas[pos].modificacao)

        document.getElementById("despesa_modificacao").disabled = true;

        document.getElementById("btnSalvar").innerHTML = "Alterar"
        document.getElementById("btnSalvar").setAttribute('onClick', 'desejosController.adicionaRegistro(' + id + ')');

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

            this.carregaDesejos()
        }

    }

    limpaCamposModal() {
        if ($('#despesa_nome').val() != undefined) {
            document.getElementById("despesa_nome").disabled = false;
            document.getElementById("despesa_valor").disabled = false;
            document.getElementById("despesa_venc").disabled = false;
            document.getElementById("despesa_categoria").disabled = false;
            document.getElementById("despesa_modificacao").disabled = true;

            document.getElementById('despesa_nome').value = "";
            document.getElementById('despesa_valor').value = "";
            document.getElementById('despesa_venc').value = today;
            document.getElementById('despesa_categoria').value = "";
            document.getElementById('despesa_modificacao').value = today;
            document.getElementById('despesa_nome').focus();

            document.getElementById("btnSalvar").innerHTML = "Salvar"
            document.getElementById("btnSalvar").setAttribute('onClick', 'desejosController.adicionaRegistro()')
            document.getElementById("btnSalvar").style.display = "block";
        }

    }

    simular(id) {
        let tabDespesas = mainTab
        despesasController.carregaModal()
        document.getElementById("modalWindow").innerHTML = despesasController.modalDespesas
        $("#modalRegistro").modal("show")

        let pos = tabDespesas.findIndex(i => i.id == id);

        $('#despesa_nome').val(tabDespesas[pos].despesa)
        $("#despesa_valor").val(tabDespesas[pos].valor)
        $("#despesa_venc").val(tabDespesas[pos].vencimento)

        $("#despesa_categoria").parent().parent().hide()
        $("#despesa_modificacao").parent().parent().hide()
        $("#despesa_recorrente").parent().parent().hide()

        document.getElementById("despesa_nome").disabled = true;
        document.getElementById("despesa_modificacao").disabled = true;

        document.getElementById("btnSalvar").innerHTML = "Cadastrar"
        document.getElementById("btnSalvar").setAttribute('onClick', 'desejosController.trocaCategoria(' + id + ')');

    }

    trocaCategoria(id){
        let tabDespesas = mainTab

        let despesa = document.getElementById('despesa_nome').value;
        let valor = document.getElementById('despesa_valor').value;
        let status = document.getElementById('despesa_status').value;
        let vencimento = document.getElementById('despesa_venc').value;
        let forma = document.getElementById('despesa_forma').value;
        let parcelas = document.getElementById('despesa_parcelas').value;

        let pos = tabDespesas.findIndex(i => i.id == id);

        tabDespesas[pos].tabela = "despesas"
        tabDespesas[pos].despesa = despesa
        tabDespesas[pos].valor = valor
        tabDespesas[pos].status = status
        tabDespesas[pos].vencimento = vencimento
        tabDespesas[pos].forma = forma
        tabDespesas[pos].parcelas = parcelas

        localStorage.setItem("__despesas__", JSON.stringify(tabDespesas))
        mainTab = tabDespesas

        $("#modalRegistro").modal("hide")
        this.carregaDesejos()

    }

    adicionaCategoria() {
        categoriasController.adicionaCategoria(null, "", "#337ab7", true)
    }

    htmlTabCategorias() {
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

