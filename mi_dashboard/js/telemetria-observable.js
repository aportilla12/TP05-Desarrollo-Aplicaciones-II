// Observer: cada panel se suscribe sin conocer la conexión ni los otros paneles.
class TelemetriaObservable {
    constructor() { this.observadores = new Set(); }
    suscribir(observador) {
        this.observadores.add(observador);
        return () => this.observadores.delete(observador);
    }
    notificar(datos) {
        for (const observador of this.observadores) {
            try { observador(datos); }
            catch (error) { console.error('Error en un observador de telemetría:', error); }
        }
    }
}
