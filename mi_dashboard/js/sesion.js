// Capturas independientes: conservan el mensaje completo sin perder campos del servidor.
let ultimaMuestra = null;
const muestrasCapturadas = [];
const historialIMU = [];
const graficoIMUInteractivo = new GraficoInteractivo(document.getElementById('grafico-imu'), [
    {campo:'roll',nombre:'Roll',unidad:'°',color:'#3b82f6'},
    {campo:'pitch',nombre:'Pitch',unidad:'°',color:'#22c55e'},
    {campo:'yaw',nombre:'Yaw',unidad:'°',color:'#f87171'}
]);
const botonCapturar = document.getElementById('capturar');
const botonExportar = document.getElementById('exportar');

function actualizarSesion(datos) {
    ultimaMuestra = JSON.parse(JSON.stringify(datos));
    botonCapturar.disabled = false;
    historialIMU.push({ ...datos.imu, ts:datos.ts });
    if (historialIMU.length > 100) historialIMU.shift();
    dibujarIMU();
    // Campos provisionales: confirmar nombres y unidades con el backend de la cátedra.
    const bms = datos.bms || {};
    document.getElementById('corriente-bms').textContent = bms.corriente ?? '--';
    document.getElementById('temperatura-bms').textContent = bms.temperatura ?? '--';
    const contenedor = document.getElementById('celdas-bms');
    contenedor.replaceChildren();
    if (Array.isArray(bms.voltajes) && bms.voltajes.length) {
        bms.voltajes.forEach((voltaje, i) => {
            const celda = document.createElement('div');
            celda.className = 'celda-bms';
            const etiqueta = document.createElement('span');
            etiqueta.textContent = `Celda ${i + 1}`;
            const valor = document.createElement('strong');
            valor.textContent = Number.isFinite(voltaje) ? voltaje.toFixed(3) + ' V' : '--';
            celda.append(etiqueta, valor);
            contenedor.appendChild(celda);
        });
    } else contenedor.textContent = 'Voltajes de celdas: sin datos';
}

function dibujarIMU() {
    graficoIMUInteractivo.renderizar(historialIMU);
}

function aplanarMuestra(valor, prefijo = '', resultado = {}) {
    if (valor !== null && typeof valor === 'object') {
        Object.entries(valor).forEach(([clave, dato]) => {
            aplanarMuestra(dato, prefijo ? `${prefijo}.${clave}` : clave, resultado);
        });
    } else resultado[prefijo] = valor;
    return resultado;
}

function generarCSV(muestras) {
    const filas = muestras.map(m => aplanarMuestra(m));
    const columnas = [...new Set(filas.flatMap(f => Object.keys(f)))];
    const escapar = valor => {
        let texto = String(valor ?? '');
        // Evita interpretar texto del servidor como fórmula al abrirlo en una planilla.
        if (/^[=+@-]/.test(texto) && typeof valor !== 'number') texto = "'" + texto;
        return '"' + texto.replace(/"/g, '""') + '"';
    };
    return [columnas, ...filas.map(f => columnas.map(c => f[c]))]
        .map(f => f.map(escapar).join(',')).join('\r\n');
}

botonCapturar.addEventListener('click', () => {
    if (!ultimaMuestra) return;
    muestrasCapturadas.push({ capturada_en: new Date().toISOString(), ...JSON.parse(JSON.stringify(ultimaMuestra)) });
    botonExportar.disabled = false;
    document.getElementById('estado-capturas').textContent = `${muestrasCapturadas.length} muestras capturadas`;
});
botonExportar.addEventListener('click', () => {
    if (!muestrasCapturadas.length) return;
    const url = URL.createObjectURL(new Blob(['\uFEFF' + generarCSV(muestrasCapturadas)], { type: 'text/csv;charset=utf-8' }));
    const enlace = document.createElement('a');
    enlace.href = url; enlace.download = 'telemetria.csv';
    document.body.appendChild(enlace); enlace.click(); enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
});
