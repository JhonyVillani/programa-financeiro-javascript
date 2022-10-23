// funções anônimas ocultam dados no spec do navegador
(function () {
    // Your web app's Firebase configuration
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

    const appCheck = firebase.appCheck();
    appCheck.activate(
        '6LcTMMwbAAAAADeZ2C8e4Qn2eLAIBhRcLuYPPdRQ',
        true);

    // criarBD()

    // cria dados dentro do firebase
    function criarBD() {
        var itensDefault = `
            [{
            "id": 1,
            "nome": "Alinhamento",
            "preco": 250
            },
            {
            "id": 2,
            "nome": "Balanceamento",
            "preco": 200
            },
            {
            "id": 3,
            "nome": "Cambagem",
            "preco": 300
            }]
    `;

        function writeUserData(id, nome, preco) {
            // firebase.database().ref('itens/' + nome).update({ //atualização
            firebase.database().ref('itens/').push({ //criação com ID automático
                id: id,
                nome: nome,
                preco: preco
            }, (error) => {
                if (error) {
                    console.log("Algo deu errado!")
                } else {
                    console.log("Gravado com Sucesso!")
                }
            });
        }

        const itensArray = JSON.parse(itensDefault)

        for (let i = 0; i < itensArray.length; i++) {
            writeUserData(itensArray[i].id, itensArray[i].nome, itensArray[i].preco)
        }

    }

})()

function createAccount(email, password) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function (result) {
            return result.user.updateProfile({
                displayName: "Pedro" //document.getElementById("name").value
            })
        }).catch(function (error) {
            console.log(error);
        });
}

function updateAccount() {

    let user = firebase.auth().currentUser;

    user.updateProfile({
        displayName: "Admin"
        // , photoURL: "https://example.com/picture.jpg"
    }).then(() => {
        // Update successful
        alert("Atualizado")
    }).catch((error) => {
        // An error occurred
        // ...
    });
}

function login(form) {

    document.getElementById("errorMsg").innerHTML = '<i class="fa fa-spinner fa-pulse"></i>';

    firebase.auth().signInWithEmailAndPassword(form.inputEmail.value, form.inputPassword.value)
        .then(() => {
            sessionStorage.setItem('name', firebase.auth().currentUser.displayName)
            sessionStorage.setItem('mail', firebase.auth().currentUser.email)
            sessionStorage.setItem('uid', firebase.auth().currentUser.uid)
            sessionStorage.setItem('verified', firebase.auth().currentUser.emailVerified)

            const dbRef = firebase.database().ref();

            // // obter conteúdo da tabela itens
            // dbRef.child("itens").get().then((snapshot) => {
            //     if (snapshot.exists()) {
            //         // console.log(snapshot.val());
            //         // convertendo os dados em array
            //         let tabItens = []

            //         snapshot.forEach(function (item) {
            //             let itemVal = item.val();
            //             tabItens.push(itemVal);
            //         })

            //         sessionStorage.setItem('itens', JSON.stringify(tabItens))
            //     }
            // }).catch((error) => {
            //     console.error(error);
            // });

            // ler permissões do usuário
            dbRef.child("users").child(firebase.auth().currentUser.uid).get().then((snapshot) => {
                // dbRef.child("users").get().then((snapshot) => {
                if (snapshot.exists()) {
                    // console.log(snapshot.val());
                    sessionStorage.setItem('BD', JSON.stringify(snapshot.val()))

                    let content = snapshot.val()
                    if (new Date(content.licenseYear, content.licenseMonth, 01) < new Date()) {
                        document.getElementById("errorMsg").innerHTML = "Sua licença expirou"
                        localStorage.clear();
                        sessionStorage.clear();
                        return false
                    }

                    location.href = 'main.html';
                } else {
                    document.getElementById("errorMsg").innerHTML = "Contate o administrador"
                }
            }).catch((error) => {
                console.error(error);
                return login(form)
            });
        })
        .catch((error) => {
            // error.message ou error.code
            errorMsg(error.code)
        });

    // let user = firebase.auth().currentUser

    // if (user !== null) {
    //     // The user object has basic properties such as display name, email, etc.
    //     const displayName = user.displayName;
    //     const email = user.email;
    //     const photoURL = user.photoURL;
    //     const emailVerified = user.emailVerified;

    //     const uid = user.uid;

    //     console.log(displayName)
    // }

}

function errorMsg(e) {

    document.getElementById("loginBtn").disabled = true;
    let timeleft = 10;
    let downloadTimer = setInterval(function () {
        if (timeleft <= 0) {
            clearInterval(downloadTimer);
            document.getElementById("errorMsg").innerHTML = "Tente novamente";
            document.getElementById("loginBtn").disabled = false;
        } else {
            document.getElementById("errorMsg").innerHTML = "E-mail ou senha inválidos" + "<br>" + "Aguarde " + timeleft + " segundos";
        }
        timeleft -= 1;
    }, 1000);

    $("#inputEmail").focus();
}

function checkApp() {
    let url_string = window.location.href //"http://www.example.com/t.html?a=1&b=3&c=m2-m3-m4-m5"
    let url = new URL(url_string);
    let type = url.searchParams.get("app");
    if (type !== null) {
        sessionStorage.setItem('app', JSON.stringify(type))
    }
}

function logout() {

    if (sessionStorage.getItem('logoff')) {

        // sessionStorage.removeItem('name')
        // sessionStorage.removeItem('mail')
        // sessionStorage.removeItem('uid')
        // sessionStorage.removeItem('verified')
        // sessionStorage.removeItem('BD')

        firebase.auth().signOut().then(() => {
            sessionStorage.removeItem('logoff')
            document.getElementById("errorMsg").innerHTML = "Desconectado com sucesso!"
        })
        // .catch((error) => {
        //     // An error happened.
        // });

        localStorage.clear();
        sessionStorage.clear();
    }

}

window.onload = checkApp(), logout();