class Categorias {
    constructor() {

    }

    carregaModal() {
        this.modalCategorias = `
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="">Categoria<span class="required">*</span></label>
                        <input id="categoria_nome" type="text" class="form-control"
                            placeholder="digite a categoria..." maxlength="20"/>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="">Limite</label>
                        <input id="categoria_limite" type="number" class="form-control"
                            placeholder="digite o valor limite..." maxlength="15" />
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="" style="margin-top: 5px;">Cor</label>
                        <input type="color" id="categoria_cor" value="#337ab7" style="vertical-align: top;" />
                    </div>
                </div>
                <div class="col-md-6">
                    
                </div>
            </div>
        `;
    }

    carregaCategorias() {
        carregaSaldo()
        this.tabDespesas = mainTab //Sincroniza os dandos entre as views
        this.tabCategorias = categTab
        this.carregaModal()
        var addBtn = document.getElementById("addBtn");

        addBtn.addEventListener("click", function () {
            categoriasController.limpaCamposModal()
        }, false);

        let tabCategorias = this.tabCategorias

        $('.collapse').collapse('hide');
        document.getElementById("tituloTabela").innerHTML = `<h3>Categorias</h3>`;

        exibeCamposTabela() //Omitidos em telas de configuração/gráficos

        // let html = `<table id="tabelaJson" class="table table-striped table-bordered dt-responsive nowrap" style="width:100%">
        let html = `<table id="tabelaJson" class=\"table table-bordered table-striped dt-responsive nowrap style=\"width: 100%\"\">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Categoria</th>
                        <th>Cor</th>
                        <th>Limite</th>
                        <th>Total Utilizado</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>`;

        if (tabCategorias.length != "") {
            for (let i = 0; i < tabCategorias.length; i++) {

                html += `
                    <tr><td>${tabCategorias[i].id}</td>
                         <td>${tabCategorias[i].categoria}</td>
                         <td><div style="background: ${tabCategorias[i].cor}; padding: 17px; border-radius: 4px;"></div></td>
                         `;

                if (tabCategorias[i].limite != "") {
                    html += `<td>${formatter.format(tabCategorias[i].limite)}</td>`
                } else {
                    html += `<td>Indefinido</td>`
                }
                if (this.tabDespesas != "") {

                    let total = this.carregaTotalUtilizado(tabCategorias[i].categoria)

                    if (tabCategorias[i].limite == "") {
                        html += `<td>${formatter.format(total)}</td>`
                    } else {
                        let percentual = total / tabCategorias[i].limite

                        if (percentual >= 1) {
                            html += `<td>${formatter.format(total)} <b class="text-danger">[esgotado]</b></td>`
                        } else if (percentual >= 0.7) {
                            html += `<td>${formatter.format(total)} <b class="text-danger">[${(percentual * 100).toFixed(0)}%]</b></td>`
                        } else if (percentual >= 0.5) {
                            html += `<td>${formatter.format(total)} <b class="text-warning">[${(percentual * 100).toFixed(0)}%]</b></td>`
                        } else {
                            html += `<td>${formatter.format(total)} <b class="text-success">[${(percentual * 100).toFixed(0)}%]</b></td>`
                        }
                    }
                } else {
                    html += `<td></td>`
                }

                html += `
                         <td><button type='button' class='btn btn-primary' onclick='categoriasController.alteraRegistro( ${tabCategorias[i].id});'><i class='fa fa-edit' /></button></td>
                         <td><button type='button' class='btn btn-danger' onclick='categoriasController.apagaRegistro( ${tabCategorias[i].id});'><i class='fa fa-trash' /></button></td>
                    </tr>`;
            }
        }

        html += "<tbody></table>";

        document.getElementById("conteudoJSON").innerHTML = html;

        carregaTabelaDatatables("categorias")

        transicaoFade()

        // preenche modal
        document.getElementById("modalRegistroLabel").innerHTML = "Cadastrar Categoria"

        document.getElementById("btnSalvar").innerHTML = "Salvar"
        document.getElementById("btnSalvar").setAttribute('onClick', 'categoriasController.adicionaRegistro()')
        document.getElementById("btnSalvar").style.display = "block";
        document.getElementById("modalWindow").innerHTML = this.modalCategorias

    }

    carregaTotalUtilizado(categoria, limite = "") {
        this.tabDespesas = mainTab

        let total = 0

        for (let i = 0; i < this.tabDespesas.length; i++) {
            if (this.tabDespesas[i].tabela == 'despesas' && this.tabDespesas[i].categoria == categoria) {
                total += parseFloat(this.tabDespesas[i].valor)
            }
        }

        if (limite === 0) {
            return "indefinido"
        } else if (limite == "") {
            return isNaN(total) ? 0 : total
        } else {
            return (limite - total) < 0 ? "esgotado" : formatter.format((limite - total))
        }

    }

    adicionaRegistro(id = null) {
        let tabCategorias = this.tabCategorias

        let nome = document.getElementById('categoria_nome').value;
        let limite = document.getElementById('categoria_limite').value;
        let cor = document.getElementById('categoria_cor').value;

        // campos obrigatórios
        if (nome == "") {
            document.getElementById('categoria_nome').classList.add("border-danger");
            playSoungEffect("error")
            document.getElementById('categoria_nome').focus();
            setTimeout(function () {
                document.getElementById('categoria_nome').classList.remove("border-danger");
            }, 1500);
            return false
        }

        if (id == null) { //cadastro de registro

            // let uid = await getSystemInfo()
            // id = ++uid

            // setClientesFirebase(id, nome, sobrenome, ano, formacao)
            if (this.adicionaCategoria(nome, limite, cor)) {
                return
            } else {
                playSoungEffect("success")
                $("#modalRegistro").modal("hide") //fecha a modal após clicar em salvar
                this.carregaCategorias()
                this.limpaCamposModal()
                return
            }

        } else { //alteração de registro

            let pos = tabCategorias.findIndex(i => i.id == id);

            // tabCategorias[pos].categoria = nome
            tabCategorias[pos].limite = limite
            tabCategorias[pos].cor = cor
        }

        localStorage.setItem("__categorias__", JSON.stringify(tabCategorias))
        categTab = tabCategorias

        playSoungEffect("success")

        $("#modalRegistro").modal("hide") //fecha a modal após clicar em salvar

        this.carregaCategorias()
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

        let tabCategorias = categTab

        $("#modalRegistro").modal("show") //exibe modal

        let pos = tabCategorias.findIndex(i => i.id == id);

        $('#categoria_nome').val(tabCategorias[pos].categoria)
        $("#categoria_limite").val(tabCategorias[pos].limite)
        $("#categoria_cor").val(tabCategorias[pos].cor)

        document.getElementById("categoria_nome").disabled = true;

        document.getElementById("btnSalvar").innerHTML = "Alterar"
        document.getElementById("btnSalvar").setAttribute('onClick', 'categoriasController.adicionaRegistro(' + id + ')');

        // $('select[id="pedido_cliente"]').selectpicker('val', tabPedidos[posPedido].clienteId);
        // $("#pedido_data").val(tabPedidos[posPedido].dtPedido)

    }

    apagaRegistro(id) {

        let _confirm = confirm("Deseja realmente excluir esse registro?")

        if (_confirm) {
            let emUso = false
            let tabCategorias = categTab
            let pos = tabCategorias.findIndex(i => i.id == id);

            // Verifica se a categoria está em uso
            for (let i = 0; i < mainTab.length; i++) {
                if (mainTab[i].categoria == tabCategorias[pos].categoria) {
                    emUso = true
                }
            }

            if (emUso) {
                playSoungEffect("error")
                return
            } else {
                tabCategorias.splice(pos, 1)
                localStorage.setItem("__categorias__", JSON.stringify(tabCategorias))
                categTab = tabCategorias

                playSoungEffect("warning")
            }

            // firebase.database()
            //     .ref('clientes')
            //     .child(id)
            //     .remove()

            this.carregaCategorias()
        }

    }

    limpaCamposModal() {
        if ($('#categoria_nome').val() != undefined) {
            document.getElementById("categoria_nome").disabled = false;
            document.getElementById("categoria_limite").disabled = false;
            document.getElementById("categoria_cor").disabled = false;

            document.getElementById('categoria_nome').value = "";
            document.getElementById('categoria_limite').value = "";
            document.getElementById('categoria_cor').value = "#337ab7";
            document.getElementById('categoria_nome').focus();

            document.getElementById("btnSalvar").innerHTML = "Salvar"
            document.getElementById("btnSalvar").setAttribute('onClick', 'categoriasController.adicionaRegistro()')
            document.getElementById("btnSalvar").style.display = "block";
        }

    }

    adicionaCategoria(nome, limite, cor, promptOpt = false) {
        let tabCategorias = categTab
        let id

        if (promptOpt) { //Tela de Despesas
            nome = prompt("Digite a categoria")
            if (nome == null) return
        }

        nome = nome.replace(/\s+/g, '');

        if (tabCategorias == "") {
            id = 0
        } else {
            let sorted = Array.from(tabCategorias).sort(function (a, b) {
                return b.id - a.id;
            });

            id = sorted[0].id
        }

        //Evita duplicidade de categorias
        if (tabCategorias != "") {
            let categoriasUnicas = new Set()
            for (let i = 0; i < tabCategorias.length; i++) {
                categoriasUnicas.add(tabCategorias[i].categoria.toLowerCase())
            }

            if (promptOpt) { //Tela de Despesas
                categoriasUnicas.add(nome.toLowerCase())
                if (categoriasUnicas.size == tabCategorias.length) {
                    $("#despesa_categoria").val(nome)
                    return
                }

            } else { //Tela de Categorias
                let erro = false

                categoriasUnicas.add(nome.toLowerCase())
                if (categoriasUnicas.size == tabCategorias.length) {
                    erro = true
                    document.getElementById('categoria_nome').classList.add("border-danger");
                    playSoungEffect("error")
                    document.getElementById('categoria_nome').focus();
                    setTimeout(function () {
                        document.getElementById('categoria_nome').classList.remove("border-danger");
                    }, 1500);
                }

                if (erro) return erro
            }
        }

        tabCategorias.push(JSON.parse(JSON.stringify(new Categoria(++id, nome, limite, cor))))
        localStorage.setItem("__categorias__", JSON.stringify(tabCategorias))
        categTab = tabCategorias
        if (promptOpt) {
            document.getElementById("despesa_categoria").innerHTML = despesasController.htmlTabCategorias()
            $("#despesa_categoria").val(nome)
        }
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

