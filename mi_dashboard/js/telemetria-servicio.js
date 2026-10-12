// Facade: una interfaz para conexión, adaptación, notificación y reconexión.
class ServicioTelemetria {
    constructor(url) {
        this.url = url;
        this.adapter = new TelemetriaAdapter();
        this.muestras = new TelemetriaObservable();
        this.estados = new TelemetriaObservable();
        this.activo = false;
        this.socket = null;
        this.reintento = null;
    }
    suscribir(fn) { return this.muestras.suscribir(fn); }
    suscribirEstado(fn) { return this.estados.suscribir(fn); }
    conectar() {
        if (this.activo) return;
        this.activo = true;
        this.abrir();
    }
    abrir() {
        if (!this.activo) return;
        this.estados.notificar('conectando');
        try { this.socket = new WebSocket(this.url); }
        catch (error) { this.reconectar(); return; }
        const socket = this.socket;
        socket.onopen = () => this.estados.notificar('esperando');
        socket.onmessage = event => {
            try {
                const datos = this.adapter.adaptar(JSON.parse(event.data));
                this.estados.notificar('recibiendo');
                this.muestras.notificar(datos);
            } catch (error) {
                console.error('Telemetría inválida:', error);
                this.estados.notificar('datos-invalidos');
            }
        };
        socket.onerror = () => this.estados.notificar('error');
        socket.onclose = () => { if (this.socket === socket) this.reconectar(); };
    }
    reconectar() {
        this.estados.notificar('desconectado');
        if (this.activo && this.reintento === null) {
            this.reintento = setTimeout(() => { this.reintento = null; this.abrir(); }, 2000);
        }
    }
    desconectar() {
        this.activo = false;
        clearTimeout(this.reintento);
        this.reintento = null;
        const socket = this.socket;
        this.socket = null;
        if (socket) { socket.onclose = null; socket.close(); }
        this.estados.notificar('desconectado');
    }
}
