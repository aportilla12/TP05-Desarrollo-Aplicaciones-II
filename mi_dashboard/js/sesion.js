// Capturas independientes: conservan el mensaje completo sin perder campos del servidor.
let ultimaMuestra = null;
const muestrasCapturadas = [];
const historialIMU = [];
const botonCapturar = document.getElementById('capturar');
const botonExportar = document.getElementById('exportar');

function actualizarSesion(datos) {
    ultimaMuestra = JSON.parse(JSON.stringify(datos));
    botonCapturar.disabled = false;
    historialIMU.push({ ...datos.imu });
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
    const canvas = document.getElementById('grafico-imu');
    const ctx = canvas.getContext('2d');
    const valores = historialIMU.flatMap(m => [m.roll, m.pitch, m.yaw]).filter(Number.isFinite);
    const minimo = Math.min(-1, ...valores);
    const maximo = Math.max(1, ...valores);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '12px Arial';
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted');
    for (let i = 0; i <= 4; i++) {
        const y = 20 + i * 45;
        ctx.fillText(`${(maximo - (maximo - minimo) * i / 4).toFixed(1)}°`, 2, y + 4);
        ctx.beginPath(); ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--rejilla');
        ctx.moveTo(65, y); ctx.lineTo(980, y); ctx.stroke();
    }
    [['roll', '#2563eb'], ['pitch', '#16a34a'], ['yaw', '#dc2626']].forEach(([campo, color]) => {
        ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2;
        let iniciado = false;
        historialIMU.forEach((m, i) => {
            if (!Number.isFinite(m[campo])) { iniciado = false; return; }
            const x = 65 + i / 99 * 915;
            const y = 200 - (m[campo] - minimo) / (maximo - minimo) * 180;
            if (iniciado) ctx.lineTo(x, y); else ctx.moveTo(x, y);
            iniciado = true;
        });
        ctx.stroke();
    });
    ctx.fillText('Muestras en orden de recepción', 65, 230);
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
