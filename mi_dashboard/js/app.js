const estado = document.getElementById("estado");

const bateria = document.getElementById("bateria");
const barraBateria = document.getElementById("barra-bateria");

const roll = document.getElementById("roll");
const pitch = document.getElementById("pitch");
const yaw = document.getElementById("yaw");

const tiempo = document.getElementById("tiempo");

const tablaMotores = document.getElementById("tabla-motores");


function conectarWebSocket() {

    const ws = new WebSocket(WS_URL);


    ws.onopen = () => {

        console.log("WebSocket conectado");

        estado.textContent = "Conectado";

        estado.classList.remove("desconectado");
        estado.classList.add("conectado");
    };


    ws.onmessage = (event) => {

        const datos = JSON.parse(event.data);

        actualizarDashboard(datos);
    };


    ws.onerror = (error) => {

        console.error(
            "Error WebSocket:",
            error
        );
    };


    ws.onclose = () => {

        console.log("WebSocket desconectado");

        estado.textContent = "Desconectado";

        estado.classList.remove("conectado");
        estado.classList.add("desconectado");

        // Intentar reconectar después de 2 segundos
        setTimeout(conectarWebSocket, 2000);
    };
}


function actualizarDashboard(datos) {

    // BATERÍA

    bateria.textContent =
        datos.bms.soc;

    barraBateria.style.width =
        `${datos.bms.soc}%`;


    // IMU

    roll.textContent =
        datos.imu.roll.toFixed(2);

    pitch.textContent =
        datos.imu.pitch.toFixed(2);

    yaw.textContent =
        datos.imu.yaw.toFixed(2);


    // TIEMPO DE SIMULACIÓN

    tiempo.textContent =
        datos.ts.toFixed(1);


    // PATAS

    actualizarPata(
        "FL",
        datos.fuerzas.FL
    );

    actualizarPata(
        "FR",
        datos.fuerzas.FR
    );

    actualizarPata(
        "RL",
        datos.fuerzas.RL
    );

    actualizarPata(
        "RR",
        datos.fuerzas.RR
    );


    // MOTORES

    actualizarMotores(
        datos.motores
    );
}


function actualizarPata(nombre, apoyada) {

    const pata =
        document.getElementById(
            `pata-${nombre}`
        );

    if (apoyada === 1) {

        pata.classList.add(
            "apoyada"
        );

    } else {

        pata.classList.remove(
            "apoyada"
        );
    }
}


function actualizarMotores(motores) {

    tablaMotores.innerHTML = "";

    motores.forEach((motor) => {

        const fila =
            document.createElement("tr");

        fila.innerHTML = `
            <td>${motor.nombre}</td>
            <td>${motor.angulo.toFixed(2)}°</td>
            <td>${motor.velocidad.toFixed(2)} rad/s</td>
            <td>${motor.torque.toFixed(2)} Nm</td>
            <td>${motor.temperatura.toFixed(1)} °C</td>
        `;

        tablaMotores.appendChild(
            fila
        );
    });
}


conectarWebSocket();
