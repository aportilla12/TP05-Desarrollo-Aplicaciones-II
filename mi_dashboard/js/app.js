const estado = document.getElementById("estado");
const telemetria = document.getElementById("telemetria");

function conectarWebSocket() {

    estado.textContent = "Conectando...";

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
        console.log("WebSocket conectado");

        estado.textContent = "Conectado";
    };

    ws.onmessage = (event) => {

        const datos = JSON.parse(event.data);

        console.log(datos);

        telemetria.textContent =
            JSON.stringify(datos, null, 2);
    };

    ws.onerror = (error) => {
        console.error("Error en WebSocket:", error);

        estado.textContent = "Error";
    };

    ws.onclose = () => {
        console.log("WebSocket desconectado");

        estado.textContent = "Desconectado";
    };
}

conectarWebSocket();
