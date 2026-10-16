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
const muestrasMotor = [];
let campoMotor = 'angulo';
const variablesMotor = {
    angulo: {nombre:'Ángulo', unidad:'°'}, velocidad:{nombre:'Velocidad', unidad:'rad/s'},
    torque:{nombre:'Torque', unidad:'Nm'}, temperatura:{nombre:'Temperatura', unidad:'°C'}
};
const selectorVariable = document.createElement('select');
selectorVariable.setAttribute('aria-label', 'Variable del motor');
for (const [campo, info] of Object.entries(variablesMotor)) {
    const opcion = document.createElement('option'); opcion.value = campo; opcion.textContent = info.nombre;
    selectorVariable.appendChild(opcion);
}
selectorMotor.parentNode.appendChild(selectorVariable);
const graficoMotorInteractivo = new GraficoInteractivo(canvas, [{campo:'valor', nombre:'Ángulo', unidad:'°', color:'#3b82f6'}]);
selectorVariable.addEventListener('change', () => { campoMotor = selectorVariable.value; graficoMotorInteractivo.reiniciar(); dibujarGrafico(); });

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


        configurarApoyos(modelo);

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

function mostrarEstadoConexion(valor) {
    const recibiendo = valor === 'recibiendo';
    const conectado = recibiendo || valor === 'esperando';
    estado.textContent = conectado ? 'Conectado' : 'Desconectado';
    estado.classList.toggle('conectado', conectado);
    estado.classList.toggle('desconectado', !conectado);
    const avisos = {
        conectando: 'Conectando con el servidor de telemetría…',
        esperando: 'Conexión abierta. Esperando telemetría…',
        recibiendo: 'Recibiendo telemetría en tiempo real.',
        'datos-invalidos': 'La última muestra es inválida. Esperando nuevos datos.',
        error: 'Error de conexión con el servidor.',
        desconectado: 'Sin conexión. Reintentando automáticamente…'
    };
    document.getElementById('aviso-conexion').textContent = avisos[valor];
    if (!recibiendo) document.getElementById('capturar').disabled = true;
}

function formatearDato(valor, decimales = 2) {
    return Number.isFinite(valor) ? valor.toFixed(decimales) : '--';
}

// ==============================
// ACTUALIZAR DASHBOARD
// ==============================

function configurarApoyos(modelo) {
    const humanoide = String(modelo).toLowerCase() === 'g1';
    const clave = humanoide ? 'g1' : 'go2';
    if (seccionPatas.dataset.modelo === clave) return;
    seccionPatas.dataset.modelo = clave;
    seccionPatas.style.display = '';
    seccionPatas.querySelector('h2').textContent = humanoide ? 'Apoyo de pies' : 'Apoyo de patas';
    const cuerpo = seccionPatas.querySelector('.cuerpo-robot');
    cuerpo.classList.toggle('humanoide', humanoide);
    const apoyos = humanoide
        ? [['L_foot', 'Pie izquierdo'], ['R_foot', 'Pie derecho']]
        : [['FL', 'FL · Delantera izquierda'], ['FR', 'FR · Delantera derecha'], ['RL', 'RL · Trasera izquierda'], ['RR', 'RR · Trasera derecha']];
    cuerpo.replaceChildren();
    apoyos.forEach(([id, nombre]) => {
        const grupo = document.createElement('div'); grupo.className = 'grupo-pata';
        const etiqueta = document.createElement('span'); etiqueta.textContent = nombre;
        const indicador = document.createElement('div'); indicador.id = `pata-${id}`;
        indicador.className = 'pata sin-datos'; indicador.title = 'Sin datos';
        grupo.append(etiqueta, indicador); cuerpo.appendChild(grupo);
    });
}

function actualizarDashboard(datos) {
    if (datos.modelo) configurarApoyos(datos.modelo);

    // BATERÍA

    bateria.textContent =
        formatearDato(datos.bms.soc, 0);


    barraBateria.style.width =
        `${Number.isFinite(datos.bms.soc) ? Math.max(0, Math.min(100, datos.bms.soc)) : 0}%`;


    // ORIENTACIÓN

    roll.textContent =
        formatearDato(datos.imu.roll, 2);


    pitch.textContent =
        formatearDato(datos.imu.pitch, 2);


    yaw.textContent =
        formatearDato(datos.imu.yaw, 2);


    flechaYaw.style.transform =
        `rotate(${datos.imu.yaw ?? 0}deg)`;


    // ACELERACIÓN

    ax.textContent =
        formatearDato(datos.imu.ax, 2);


    ay.textContent =
        formatearDato(datos.imu.ay, 2);


    az.textContent =
        formatearDato(datos.imu.az, 2);


    // TIEMPO

    tiempo.textContent =
        formatearDato(datos.ts, 1);


    // CANTIDAD DE MOTORES

    cantidadMotores.textContent =
        datos.motores.length;


    // El backend G1 publica dos pies; Go2 publica cuatro patas.
    if (seccionPatas.dataset.modelo === 'g1') {
        actualizarPata('L_foot', datos.fuerzas?.L_foot ?? null);
        actualizarPata('R_foot', datos.fuerzas?.R_foot ?? null);
    } else {
        ['FR', 'FL', 'RR', 'RL'].forEach(pata => actualizarPata(pata, datos.fuerzas?.[pata] ?? null));
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
        datos.motores, datos.ts
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


    pata.classList.toggle('sin-datos', apoyada === null);
    pata.title = apoyada === null ? 'Sin datos' : apoyada === 1 ? 'Apoyada' : 'En el aire';
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
                    ${escaparHTML(motor.nombre)}
                </td>

                <td>
                    ${formatearDato(motor.angulo, 2)}°
                </td>

                <td>
                    ${formatearDato(motor.velocidad, 2)}
                    rad/s
                </td>

                <td>
                    ${formatearDato(motor.torque, 2)}
                    Nm
                </td>

                <td>

                    <span
                        class="
                            temperatura
                            ${claseTemperatura}
                        ">

                        ${formatearDato(motor.temperatura, 1)}
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

    if (!Number.isFinite(temperatura)) return 'temp-sin-datos';
    if (temperatura > 60) {

        return "temp-alta";
    }


    if (temperatura >= 40) {

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
            selectorMotor.value;


        historialAngulos = [];
        muestrasMotor.length = 0;
        graficoMotorInteractivo.reiniciar();
    }
);


// ==============================
// ACTUALIZAR GRÁFICO
// ==============================

function actualizarGrafico(motores, ts) {
    const motor = motores.find(m => m.id === motorSeleccionado);
    if (!motor) return;
    muestrasMotor.push({...motor, ts});
    if (muestrasMotor.length > MAX_PUNTOS) muestrasMotor.shift();
    dibujarGrafico();
}

function dibujarGrafico() {
    const info = variablesMotor[campoMotor];
    graficoMotorInteractivo.series = [{campo:'valor', nombre:info.nombre, unidad:info.unidad, color:'#3b82f6'}];
    const muestras = muestrasMotor.map(m => ({ts:m.ts, valor:m[campoMotor]}));
    graficoMotorInteractivo.renderizar(muestras);
    const ultima = graficoMotorInteractivo.datos.at(-1);
    anguloActual.textContent = formatearDato(ultima?.valor);
    document.getElementById('unidad-motor').textContent = info.unidad;
}

// ==============================
// INICIO
// ==============================

cargarInfoRobot();

const servicioTelemetria = new ServicioTelemetria(WS_URL);
servicioTelemetria.suscribirEstado(mostrarEstadoConexion);
servicioTelemetria.suscribir(actualizarDashboard);
servicioTelemetria.suscribir(actualizarSesion);
servicioTelemetria.conectar();
window.addEventListener('pagehide', () => servicioTelemetria.desconectar());
window.addEventListener('pageshow', () => servicioTelemetria.conectar());

function escaparHTML(texto) {
    return String(texto).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
}
