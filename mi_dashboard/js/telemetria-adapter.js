// Adapter: normaliza mensajes del backend y LowState del simulador.
class TelemetriaAdapter {
    static numero(valor) {
        return typeof valor === 'number' && Number.isFinite(valor) ? valor : null;
    }
    adaptar(mensaje) {
        const d = mensaje?.telemetria ?? mensaje;
        if (!d || typeof d !== 'object' || Array.isArray(d) ||
            (!d.imu && !d.bms && !d.motores && !d.motor_state)) {
            throw new Error('Mensaje sin telemetría reconocible');
        }
        const n = TelemetriaAdapter.numero;
        const grados = v => n(v) === null ? null : v * 180 / Math.PI;
        const crudo = Array.isArray(d.motor_state);
        const motores = crudo ? d.motor_state : (Array.isArray(d.motores) ? d.motores : []);
        const imu = d.imu ?? {}, bms = d.bms ?? {};
        const rpy = Array.isArray(imu.rpy) ? imu.rpy : null;
        const aceleracion = imu.accelerometer ?? [];
        const celdas = bms.voltajes ?? bms.celdas ?? bms.cell_vol;
        const fuerzas = {};
        ['FR', 'FL', 'RR', 'RL'].forEach((pata, i) => {
            const valor = d.fuerzas?.[pata] ?? d.foot_force?.[i];
            fuerzas[pata] = valor === true ? 1 : valor === false ? 0 : n(valor) === null ? null : (valor > 0 ? 1 : 0);
        });
        return {
            ...d,
            ts: n(d.ts),
            motores: motores.map((m, i) => ({
                ...m, id: String(m.id ?? i), nombre: String(m.nombre ?? `Motor ${i + 1}`),
                angulo: crudo ? grados(m.q) : n(m.angulo),
                velocidad: n(crudo ? m.dq : m.velocidad),
                torque: n(crudo ? m.tau_est : m.torque),
                temperatura: n(crudo ? m.temperature : m.temperatura)
            })),
            imu: {...imu,
                roll: rpy ? grados(rpy[0]) : n(imu.roll),
                pitch: rpy ? grados(rpy[1]) : n(imu.pitch),
                yaw: rpy ? grados(rpy[2]) : n(imu.yaw),
                ax: n(imu.ax ?? aceleracion[0]), ay: n(imu.ay ?? aceleracion[1]), az: n(imu.az ?? aceleracion[2])},
            bms: {...bms, soc: n(bms.soc), corriente: n(bms.corriente ?? bms.current),
                temperatura: n(bms.temperatura ?? bms.temperature),
                voltajes: Array.isArray(celdas) ? celdas.map(v => n(v) === null ? null : (bms.voltajes !== undefined || bms.celdas !== undefined ? v : v / 1000)) : []},
            fuerzas
        };
    }
}
