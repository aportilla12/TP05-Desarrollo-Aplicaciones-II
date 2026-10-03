// ==============================
// ELEMENTOS DEL HTML
// ==============================

const estado =
    document.getElementById("estado");

const tituloRobot =
    document.getElementById("titulo-robot");

const cantidadMotores =
    document.getElementById("cantidad-motores");


const bateria =
    document.getElementById("bateria");

const barraBateria =
    document.getElementById("barra-bateria");


const roll =
    document.getElementById("roll");

const pitch =
    document.getElementById("pitch");

const yaw =
    document.getElementById("yaw");

const flechaYaw =
    document.getElementById("flecha-yaw");


const ax =
    document.getElementById("ax");

const ay =
    document.getElementById("ay");

const az =
    document.getElementById("az");


const tiempo =
    document.getElementById("tiempo");


const seccionPatas =
    document.getElementById("seccion-patas");


const tablaMotores =
    document.getElementById("tabla-motores");


const selectorMotor =
    document.getElementById("selector-motor");

const anguloActual =
    document.getElementById("angulo-actual");


const canvas =
    document.getElementById("grafico-motor");

const ctx =
    canvas.getContext("2d");


// ==============================
// VARIABLES
// ==============================

let motorSeleccionado = null;

let historialAngulos = [];

const MAX_PUNTOS = 100;


// ==============================
// INFORMACIÓN DEL ROBOT
// ==============================

async function cargarInfoRobot() {

    try {

        const respuesta =
            await fetch(`${API_URL}/info`);

        const info =
            await respuesta.json();


        console.log(
            "Información del robot:",
            info
        );


        const modelo =
            info.modelo ||
            info.robot ||
            "Unitree";


        tituloRobot.textContent =
            `Unitree ${modelo.toUpperCase()}`;


        // El G1 no informa patas
        // en este TP.

        if (
            modelo.toLowerCase() === "g1"
        ) {

            seccionPatas.style.display =
                "none";
        }

    } catch (error) {

        console.error(
            "No se pudo obtener /info:",
            error
        );
    }
}


// ==============================
// WEBSOCKET
// ==============================

function conectarWebSocket() {

    console.log(
        "Conectando a:",
        WS_URL
    );


    const ws =
        new WebSocket(WS_URL);


    ws.onopen = () => {

        console.log(
            "WebSocket conectado"
        );


        estado.textContent =
            "Conectado";


        estado.classList.remove(
            "desconectado"
        );


        estado.classList.add(
            "conectado"
        );
    };


    ws.onmessage = (event) => {

        const datos =
            JSON.parse(event.data);


        actualizarDashboard(
            datos
        );
    };


    ws.onerror = (error) => {

        console.error(
            "Error WebSocket:",
            error
        );
    };


    ws.onclose = () => {

        console.log(
            "WebSocket desconectado"
        );


        estado.textContent =
            "Desconectado";


        estado.classList.remove(
            "conectado"
        );


        estado.classList.add(
            "desconectado"
        );


        setTimeout(
            conectarWebSocket,
            2000
        );
    };
}


// ==============================
// ACTUALIZAR DASHBOARD
// ==============================

function actualizarDashboard(datos) {

    // BATERÍA

    bateria.textContent =
        datos.bms.soc;


    barraBateria.style.width =
        `${datos.bms.soc}%`;


    // ORIENTACIÓN

    roll.textContent =
        datos.imu.roll.toFixed(2);


    pitch.textContent =
        datos.imu.pitch.toFixed(2);


    yaw.textContent =
        datos.imu.yaw.toFixed(2);


    flechaYaw.style.transform =
        `rotate(${datos.imu.yaw}deg)`;


    // ACELERACIÓN

    ax.textContent =
        datos.imu.ax.toFixed(2);


    ay.textContent =
        datos.imu.ay.toFixed(2);


    az.textContent =
        datos.imu.az.toFixed(2);


    // TIEMPO

    tiempo.textContent =
        datos.ts.toFixed(1);


    // CANTIDAD DE MOTORES

    cantidadMotores.textContent =
        datos.motores.length;


    // PATAS

    if (datos.fuerzas) {

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
    }


    // TABLA

    actualizarMotores(
        datos.motores
    );


    // SELECTOR

    if (
        selectorMotor.options.length === 0
    ) {

        cargarSelectorMotores(
            datos.motores
        );
    }


    // GRÁFICO

    actualizarGrafico(
        datos.motores
    );
}


// ==============================
// PATAS
// ==============================

function actualizarPata(
    nombre,
    apoyada
) {

    const pata =
        document.getElementById(
            `pata-${nombre}`
        );


    if (!pata) {
        return;
    }


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


// ==============================
// MOTORES
// ==============================

function actualizarMotores(
    motores
) {

    tablaMotores.innerHTML = "";


    motores.forEach(
        (motor) => {

            const fila =
                document.createElement(
                    "tr"
                );


            const claseTemperatura =
                obtenerClaseTemperatura(
                    motor.temperatura
                );


            fila.innerHTML = `

                <td>
                    ${motor.nombre}
                </td>

                <td>
                    ${motor.angulo.toFixed(2)}°
                </td>

                <td>
                    ${motor.velocidad.toFixed(2)}
                    rad/s
                </td>

                <td>
                    ${motor.torque.toFixed(2)}
                    Nm
                </td>

                <td>

                    <span
                        class="
                            temperatura
                            ${claseTemperatura}
                        ">

                        ${motor.temperatura.toFixed(1)}
                        °C

                    </span>

                </td>

            `;


            tablaMotores.appendChild(
                fila
            );
        }
    );
}


// ==============================
// TEMPERATURA
// ==============================

function obtenerClaseTemperatura(
    temperatura
) {

    /*
        Estos límites son únicamente
        indicadores visuales del dashboard.

        No representan límites oficiales
        de seguridad del robot.
    */

    if (temperatura >= 60) {

        return "temp-alta";
    }


    if (temperatura >= 45) {

        return "temp-media";
    }


    return "temp-normal";
}


// ==============================
// SELECTOR DE MOTOR
// ==============================

function cargarSelectorMotores(
    motores
) {

    motores.forEach(
        (motor) => {

            const opcion =
                document.createElement(
                    "option"
                );


            opcion.value =
                motor.id;


            opcion.textContent =
                motor.nombre;


            selectorMotor.appendChild(
                opcion
            );
        }
    );


    if (motores.length > 0) {

        motorSeleccionado =
            motores[0].id;
    }
}


selectorMotor.addEventListener(
    "change",
    () => {

        motorSeleccionado =
            Number(
                selectorMotor.value
            );


        historialAngulos = [];
    }
);


// ==============================
// ACTUALIZAR GRÁFICO
// ==============================

function actualizarGrafico(
    motores
) {

    if (
        motorSeleccionado === null
    ) {
        return;
    }


    const motor =
        motores.find(
            (m) =>
                m.id ===
                motorSeleccionado
        );


    if (!motor) {
        return;
    }


    historialAngulos.push(
        motor.angulo
    );


    if (
        historialAngulos.length >
        MAX_PUNTOS
    ) {

        historialAngulos.shift();
    }


    anguloActual.textContent =
        motor.angulo.toFixed(2);


    dibujarGrafico();
}


// ==============================
// DIBUJAR GRÁFICO
// ==============================

function dibujarGrafico() {

    const ancho =
        canvas.width;

    const alto =
        canvas.height;


    ctx.clearRect(
        0,
        0,
        ancho,
        alto
    );


    ctx.fillStyle =
        "#f9fafb";


    ctx.fillRect(
        0,
        0,
        ancho,
        alto
    );


    const margenIzquierdo = 55;
    const margenDerecho = 20;
    const margenSuperior = 15;
    const margenInferior = 30;


    const anchoGrafico =
        ancho -
        margenIzquierdo -
        margenDerecho;


    const altoGrafico =
        alto -
        margenSuperior -
        margenInferior;


    const minimo = -180;
    const maximo = 180;


    const niveles = [
        -180,
        -90,
        0,
        90,
        180
    ];


    ctx.font =
        "12px Arial";


    niveles.forEach(
        (nivel) => {

            const proporcion =
                (nivel - minimo) /
                (maximo - minimo);


            const y =
                margenSuperior +
                altoGrafico -
                proporcion *
                altoGrafico;


            ctx.beginPath();


            ctx.strokeStyle =
                "#e5e7eb";


            ctx.lineWidth = 1;


            ctx.moveTo(
                margenIzquierdo,
                y
            );


            ctx.lineTo(
                ancho -
                margenDerecho,
                y
            );


            ctx.stroke();


            ctx.fillStyle =
                "#6b7280";


            ctx.fillText(
                `${nivel}°`,
                8,
                y + 4
            );
        }
    );


    if (
        historialAngulos.length <
        2
    ) {
        return;
    }


    ctx.beginPath();


    ctx.strokeStyle =
        "#2563eb";


    ctx.lineWidth = 3;


    historialAngulos.forEach(
        (valor, indice) => {

            const x =
                margenIzquierdo +
                (
                    indice /
                    (MAX_PUNTOS - 1)
                ) *
                anchoGrafico;


            const valorLimitado =
                Math.max(
                    minimo,
                    Math.min(
                        maximo,
                        valor
                    )
                );


            const proporcion =
                (
                    valorLimitado -
                    minimo
                ) /
                (
                    maximo -
                    minimo
                );


            const y =
                margenSuperior +
                altoGrafico -
                proporcion *
                altoGrafico;


            if (indice === 0) {

                ctx.moveTo(
                    x,
                    y
                );

            } else {

                ctx.lineTo(
                    x,
                    y
                );
            }
        }
    );


    ctx.stroke();


    ctx.fillStyle =
        "#6b7280";


    ctx.fillText(
        "← historial",
        margenIzquierdo,
        alto - 7
    );


    ctx.fillText(
        "ahora →",
        ancho - 75,
        alto - 7
    );
}


// ==============================
// INICIO
// ==============================

cargarInfoRobot();

conectarWebSocket();
