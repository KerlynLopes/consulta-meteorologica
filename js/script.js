let campoCidade = document.querySelector("#cidade");
let campoTemperatura = document.querySelector("#temperatura");
let listaSugestoes = document.querySelector("#sugestoes-cidades");
let campoPrevisao = document.querySelector("#previsao");
let listaFavoritos = document.querySelector("#lista-favoritos");

let temporizador;
let cidadeSelecionada = null;

//Buscar cidade

campoCidade.addEventListener("input", function () {
    clearTimeout(temporizador);

    cidadeSelecionada = null;
    listaSugestoes.replaceChildren();

    let nomeCidade = campoCidade.value.trim();

    if (nomeCidade.length < 2) {
        campoTemperatura.textContent = "";
        campoPrevisao.replaceChildren();
        return;
    }

    campoTemperatura.textContent = "Buscando a sua cidade...";
    campoPrevisao.replaceChildren();

    temporizador = setTimeout(function () {
        let url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nomeCidade)}&count=10&language=pt&countryCode=BR`;

        fetch(url, { method: "GET" })
            .then(function (resposta) {
                if (!resposta.ok) {
                    throw new Error(`Erro HTTP: ${resposta.status}`);
                }

                return resposta.json();
            })
            .then(function (dados) {
                listaSugestoes.replaceChildren();

                if (!dados.results || dados.results.length === 0) {
                    campoTemperatura.textContent =
                        "Nenhuma cidade encontrada.";

                    return;
                }

                dados.results.forEach(function (cidade) {
                    let opcao = document.createElement("li");

                    opcao.textContent =
                        cidade.name +
                        (cidade.admin1 ? " - " + cidade.admin1 : "") +
                        (cidade.country ? ", " + cidade.country : "");

                    opcao.addEventListener("click", function () {
                        campoCidade.value = cidade.name;
                        cidadeSelecionada = cidade;

                        listaSugestoes.replaceChildren();

                        consultarClima(
                            cidade.latitude,
                            cidade.longitude,
                            cidade
                        );
                    });

                    listaSugestoes.appendChild(opcao);
                });
            })
            .catch(function (erro) {
                listaSugestoes.replaceChildren();

                campoTemperatura.textContent =
                    "Não foi possível buscar as cidades.";
            });
    }, 300);
});

// ESCOLHER ÍCONE DO CLIMA

function obterIconeClima(codigo) {

    const codigosClima = [];

    codigosClima[0] = "ceu-limpo.png";
    codigosClima[1] = "poucas-nuvens.png";
    codigosClima[2] = "parcialmente-nublado.png";
    codigosClima[3] = "nublado.png";

    codigosClima[45] = "neblina.png";
    codigosClima[48] = "neblina.png";

    codigosClima[51] = "garoa.png";
    codigosClima[53] = "garoa.png";
    codigosClima[55] = "garoa.png";
    codigosClima[56] = "garoa.png";
    codigosClima[57] = "garoa.png";

    codigosClima[61] = "chuva-moderada.png";
    codigosClima[63] = "chuva-moderada.png";
    codigosClima[65] = "chuva-forte.png";
    codigosClima[66] = "chuva-moderada.png";
    codigosClima[67] = "chuva-forte.png";

    codigosClima[71] = "neve.png";
    codigosClima[73] = "neve.png";
    codigosClima[75] = "neve.png";
    codigosClima[77] = "neve.png";

    codigosClima[80] = "chuva-moderada.png";
    codigosClima[81] = "chuva-moderada.png";
    codigosClima[82] = "chuva-forte.png";

    codigosClima[85] = "neve.png";
    codigosClima[86] = "neve.png";

    codigosClima[95] = "tempestade.png";
    codigosClima[96] = "tempestade.png";
    codigosClima[99] = "tempestade.png";

    return codigosClima[codigo] || "parcialmente-nublado.png";
}


// FAVORITOS

let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];


function mostrarFavoritos() {
    listaFavoritos.replaceChildren();

    favoritos.forEach(function (cidade) {
        let botaoCidade = document.createElement("button");

        botaoCidade.textContent = cidade.nome;
        botaoCidade.type = "button";
        botaoCidade.classList.add("botao-cidade-favorita");

        botaoCidade.addEventListener("click", function () {
            campoCidade.value = cidade.nome;

            consultarClima(
                cidade.latitude,
                cidade.longitude,
                cidade
            );
        });

        listaFavoritos.appendChild(botaoCidade);
    });
}


function salvarFavoritos() {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

mostrarFavoritos();

// CONSULTAR E MOSTRAR A PREVISÃO

function consultarClima(latitude, longitude, cidade) {

    let urlClima = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;

    campoTemperatura.textContent = "Buscando a previsão do tempo...";
    campoPrevisao.replaceChildren();

    fetch(urlClima, { method: "GET" })
        .then(function (respostaClima) {

            if (!respostaClima.ok) {
                throw new Error(`Erro HTTP: ${respostaClima.status}`);
            }

            return respostaClima.json();
        })
        .then(function (dadosClima) {

            campoTemperatura.replaceChildren();
            campoPrevisao.replaceChildren();

            // Nome da cidade
            let tituloCidade = document.createElement("h1");

            tituloCidade.textContent = cidade.name || cidade.nome;

            campoTemperatura.appendChild(tituloCidade);

            // BOTÃO FAVORITAR

            let botaoFavoritar = document.createElement("button");

            botaoFavoritar.type = "button";
            botaoFavoritar.id = "botao-favoritar";

            let jaFavoritada = favoritos.some(function (favorita) {
                return favorita.latitude === latitude &&
                    favorita.longitude === longitude;
            });

            if (jaFavoritada) {
                botaoFavoritar.textContent = "Já está nos favoritos! ♥";
            } else {
                botaoFavoritar.textContent = "Favoritar ♡";
            }

            campoTemperatura.appendChild(botaoFavoritar);

            botaoFavoritar.addEventListener("click", function () {

                let jaExiste = favoritos.some(function (favorita) {
                    return favorita.latitude === latitude &&
                        favorita.longitude === longitude;
                });

                if (jaExiste) {
                    botaoFavoritar.textContent =
                        "Já está nos favoritos!";

                    return;
                }

                let nomeCidade = cidade.name || cidade.nome;

                favoritos.push({
                    nome: nomeCidade,
                    latitude: latitude,
                    longitude: longitude
                });

                salvarFavoritos();
                mostrarFavoritos();

                botaoFavoritar.textContent = "Favoritado!";
            });


            // TEMPERATURA ATUAL

            let temperaturaAtual = document.createElement("p");

            temperaturaAtual.textContent =
                "Temperatura atual: " +
                dadosClima.current.temperature_2m +
                " °C";

            campoTemperatura.appendChild(temperaturaAtual);


            // ÍCONE DO CLIMA ATUAL

            let iconeAtual = document.createElement("img");

            iconeAtual.classList.add("icone-clima");

            iconeAtual.src =
                "./images/" +
                obterIconeClima(dadosClima.current.weather_code);

            iconeAtual.alt = "Condição meteorológica atual";

            campoTemperatura.appendChild(iconeAtual);

            // TÍTULO DA PREVISÃO

            let tituloPrevisao = document.createElement("h2");

            tituloPrevisao.textContent = "Próximos dias";

            campoPrevisao.appendChild(tituloPrevisao);


            // GRADE DOS DIAS

            let previsaoDias = document.createElement("div");

            previsaoDias.classList.add("previsao-dias");

            campoPrevisao.appendChild(previsaoDias);


            // CARTÕES DA PREVISÃO

            for (let i = 1; i < dadosClima.daily.time.length; i++) {

                let dia = document.createElement("div");

                dia.classList.add("cartao-dia");

                // Data

                let data = document.createElement("h3");

                data.textContent = new Date(
                    dadosClima.daily.time[i] + "T12:00:00"
                ).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "2-digit"
                });

                // Ícone do dia

                let iconeDia = document.createElement("img");

                iconeDia.classList.add("icone-clima");

                iconeDia.src =
                    "./images/" +
                    obterIconeClima(dadosClima.daily.weather_code[i]);

                iconeDia.alt = "Previsão do tempo";

                // Temperatura máxima

                let maxima = document.createElement("p");

                maxima.textContent =
                    "Máxima: " +
                    dadosClima.daily.temperature_2m_max[i] +
                    " °C";

                // Temperatura mínima

                let minima = document.createElement("p");

                minima.textContent =
                    "Mínima: " +
                    dadosClima.daily.temperature_2m_min[i] +
                    " °C";

                // Adicionar elementos ao cartão

                dia.appendChild(data);
                dia.appendChild(iconeDia);
                dia.appendChild(maxima);
                dia.appendChild(minima);

                previsaoDias.appendChild(dia);
            }

        })
        .catch(function (erro) {

            campoTemperatura.textContent =
                "Não foi possível consultar a temperatura.";

            campoPrevisao.replaceChildren();
        });
}