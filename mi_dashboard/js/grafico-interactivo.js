// Gráfico Canvas sin dependencias: inspección por puntero, pausa y series visibles.
class GraficoInteractivo {
    constructor(canvas, series) {
        this.canvas = canvas;
        this.series = series;
        this.datos = [];
        this.pausado = false;
        this.indice = null;
        this.visibles = new Set(series.map(s => s.campo));
        const panel = document.createElement('div'); panel.className = 'controles-grafico';
        this.pausa = document.createElement('button'); this.pausa.type = 'button';
        this.pausa.textContent = 'Pausar gráfico'; this.pausa.setAttribute('aria-pressed', 'false');
        this.pausa.addEventListener('click', () => {
            this.pausado = !this.pausado;
            this.pausa.textContent = this.pausado ? 'Reanudar gráfico' : 'Pausar gráfico';
            this.pausa.setAttribute('aria-pressed', String(this.pausado));
            this.indice = null;
            this.renderizar(this.ultimos ?? []);
        });
        panel.appendChild(this.pausa);
        this.etiquetas = new Map();
        for (const serie of series) {
            const label = document.createElement('label');
            const check = document.createElement('input'); check.type = 'checkbox'; check.checked = true;
            check.addEventListener('change', () => {
                if(check.checked) this.visibles.add(serie.campo); else this.visibles.delete(serie.campo);
                this.dibujar();
            });
            const nombre = document.createElement('span'); nombre.textContent = serie.nombre;
            this.etiquetas.set(serie.campo, nombre);
            label.append(check, nombre); panel.appendChild(label);
        }
        canvas.parentNode.insertBefore(panel, canvas);
        this.detalle = document.createElement('p'); this.detalle.className = 'detalle-grafico';
        this.detalle.textContent = 'Pasá el cursor o tocá una muestra para ver su medición.';
        canvas.insertAdjacentElement('afterend', this.detalle);
        this.resumen = document.createElement('p'); this.resumen.className = 'resumen-grafico';
        this.detalle.insertAdjacentElement('afterend', this.resumen);
        canvas.setAttribute('tabindex', '0');
        canvas.setAttribute('aria-label', 'Gráfico interactivo. Usá las flechas para recorrer las muestras.');
        canvas.addEventListener('pointermove', e => this.inspeccionar(e));
        canvas.addEventListener('pointerdown', e => this.inspeccionar(e));
        canvas.addEventListener('pointerleave', () => { this.indice = null; this.dibujar(); });
        canvas.addEventListener('keydown', e => {
            if (!['ArrowLeft','ArrowRight'].includes(e.key) || !this.datos.length) return;
            e.preventDefault();
            this.indice = Math.max(0, Math.min(this.datos.length - 1, (this.indice ?? this.datos.length - 1) + (e.key === 'ArrowLeft' ? -1 : 1)));
            this.dibujar();
        });
    }
    renderizar(datos) {
        this.ultimos = datos;
        if (!this.pausado) this.datos = datos.map(d => ({...d}));
        this.dibujar();
    }
    reiniciar() { this.pausado = false; this.pausa.textContent = 'Pausar gráfico'; this.pausa.setAttribute('aria-pressed','false'); this.indice = null; this.datos = []; this.ultimos = []; }
    inspeccionar(e) {
        if (!this.datos.length) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * this.canvas.width;
        this.indice = Math.max(0, Math.min(this.datos.length - 1, Math.round((x - 75) / (this.canvas.width - 95) * Math.max(1, this.datos.length - 1))));
        this.dibujar();
    }
    dibujar() {
        const c = this.canvas, ctx = c.getContext('2d');
        const css = getComputedStyle(document.documentElement);
        for (const s of this.series) { const etiqueta = this.etiquetas.get(s.campo); if (etiqueta) etiqueta.textContent = s.nombre; }
        const series = this.series.filter(s => this.visibles.has(s.campo));
        const valores = this.datos.flatMap(d => series.map(s => d[s.campo])).filter(Number.isFinite);
        const minimo = Math.min(0, ...valores), maximo = Math.max(1, ...valores);
        const margen = (maximo - minimo) * .08;
        const bajo = minimo - margen, alto = maximo + margen;
        const x = i => 75 + i / Math.max(1, this.datos.length - 1) * (c.width - 95);
        const y = v => 20 + (alto - v) / (alto - bajo) * (c.height - 60);
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.fillStyle = css.getPropertyValue('--suave');ctx.fillRect(0,0,c.width,c.height);
        ctx.font = '12px system-ui';ctx.lineWidth=1;
        for(let i=0;i<=4;i++) {
            const v = bajo + (alto-bajo)*i/4;
            ctx.strokeStyle=css.getPropertyValue('--rejilla');ctx.beginPath();ctx.moveTo(75,y(v));ctx.lineTo(c.width-20,y(v));ctx.stroke();
            ctx.fillStyle=css.getPropertyValue('--muted');ctx.fillText(v.toFixed(1),5,y(v)+4);
        }
        for(const s of series) {
            ctx.beginPath();ctx.strokeStyle=s.color;ctx.lineWidth=2;let iniciado=false;
            this.datos.forEach((d,i)=>{const v=d[s.campo];if(!Number.isFinite(v)){iniciado=false;return;}if(iniciado)ctx.lineTo(x(i),y(v));else ctx.moveTo(x(i),y(v));iniciado=true;});ctx.stroke();
        }
        ctx.fillStyle=css.getPropertyValue('--muted');
        if(this.datos.length) {
            const tiempo=d=>Number.isFinite(d.ts)?`${d.ts.toFixed(1)} s`:'Sin tiempo';
            ctx.fillText(tiempo(this.datos[0]),75,c.height-10);ctx.fillText(tiempo(this.datos.at(-1)),c.width-95,c.height-10);
        }
        if(this.indice!==null && this.datos[this.indice]) {
            const d=this.datos[this.indice];ctx.strokeStyle=css.getPropertyValue('--accent');ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x(this.indice),15);ctx.lineTo(x(this.indice),c.height-35);ctx.stroke();
            this.detalle.textContent = `${Number.isFinite(d.ts)?d.ts.toFixed(2)+' s':'Tiempo no disponible'} · ` + series.map(s=>`${s.nombre}: ${Number.isFinite(d[s.campo])?d[s.campo].toFixed(2)+' '+s.unidad:'--'}`).join(' · ');
        } else this.detalle.textContent=this.pausado?'Gráfico pausado. La recepción de telemetría continúa.':'Pasá el cursor o tocá una muestra. También podés recorrerla con las flechas.';
        this.resumen.textContent = series.map(s=>{
            const vals=this.datos.map(d=>d[s.campo]).filter(Number.isFinite);
            return vals.length?`${s.nombre}: mín. ${Math.min(...vals).toFixed(2)} · máx. ${Math.max(...vals).toFixed(2)} · prom. ${(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2)} ${s.unidad}`:`${s.nombre}: sin muestras`;
        }).join(' | ');
    }
}
