
let campoCidade = document.querySelector("#cidade");
let campoTemperatura = document.querySelector("#temperatura");
let listaSugestoes = document.querySelector("#sugestoes-cidades");

let temporizador;
let cidadeSelecionada = null;


campoCidade.addEventListener("input", function () {
    clearTimeout(temporizador);

    cidadeSelecionada = null;
    listaSugestoes.replaceChildren();

    let nomeCidade = campoCidade.value.trim();

    if (nomeCidade.length < 2) {
        return;
    }

    campoTemperatura.textContent = "Buscando a sua cidade...";

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

                if (!dados.results) {
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

                        let latitude = cidadeSelecionada.latitude;
                        let longitude = cidadeSelecionada.longitude;

                        let urlClima = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;

                        campoTemperatura.textContent = "Buscando a previsão do tempo...";

                        fetch(urlClima, { method: "GET" })
                            .then(function (respostaClima) {
                                if (!respostaClima.ok) {
                                    throw new Error(`Erro HTTP: ${respostaClima.status}`);
                                }

                                return respostaClima.json();
                            })
                            .then(function (dadosClima) {

                                campoTemperatura.replaceChildren();

                                let temperaturaAtual = document.createElement("p");

                                temperaturaAtual.textContent =
                                    "Temperatura atual: " +
                                    dadosClima.current.temperature_2m +
                                    " °C";

                                campoTemperatura.appendChild(temperaturaAtual);

                                let tituloPrevisao = document.createElement("h2");
                                tituloPrevisao.textContent = "Próximos dias";

                                let previsaoDias = document.createElement("div");
                                previsaoDias.classList.add("previsao-dias");

                                campoTemperatura.appendChild(tituloPrevisao);
                                campoTemperatura.appendChild(previsaoDias);

                                campoTemperatura.appendChild(tituloPrevisao);

                                for (let i = 0; i < dadosClima.daily.time.length; i++) {
                                    let dia = document.createElement("div");
                                    dia.classList.add("cartao-dia");

                                    let data = document.createElement("h3");
                                    data.textContent = new Date(
                                        dadosClima.daily.time[i] + "T12:00:00"
                                    ).toLocaleDateString("pt-BR", {
                                        weekday: "long",
                                        day: "2-digit",
                                        month: "2-digit"
                                    });

                                    let maxima = document.createElement("p");
                                    maxima.textContent =
                                        "Máxima: " +
                                        dadosClima.daily.temperature_2m_max[i] +
                                        " °C";

                                    let minima = document.createElement("p");
                                    minima.textContent =
                                        "Mínima: " +
                                        dadosClima.daily.temperature_2m_min[i] +
                                        " °C";

                                    dia.appendChild(data);
                                    dia.appendChild(maxima);
                                    dia.appendChild(minima);

                                    previsaoDias.appendChild(dia);
                                }

                            })
                            .catch(function (erro) {
                                campoTemperatura.textContent =
                                    "Não foi possível consultar a temperatura.";
                            });
                    });

                    listaSugestoes.appendChild(opcao);
                });
            })
            .catch(function (erro) {
                listaSugestoes.replaceChildren();
            });
    }, 300);
});
