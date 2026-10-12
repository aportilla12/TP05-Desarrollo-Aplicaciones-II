const controlTema = document.getElementById('cambiar-tema');
function aplicarTema(tema) {
    document.documentElement.dataset.tema = tema;
    const etiqueta = tema === 'oscuro' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
    const figura = tema === 'oscuro'
        ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>'
        : '<path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z"/>';
    controlTema.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${figura}</svg>`;
    controlTema.setAttribute('aria-label', etiqueta);
    controlTema.setAttribute('title', etiqueta);
    controlTema.setAttribute('aria-pressed', String(tema === 'oscuro'));
    dibujarGrafico();
    dibujarIMU();
}
let temaGuardado;
try { temaGuardado = localStorage.getItem('unitree-tema'); } catch (_) {}
aplicarTema(['claro', 'oscuro'].includes(temaGuardado) ? temaGuardado : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'));
controlTema.addEventListener('click', () => {
    const tema = document.documentElement.dataset.tema === 'oscuro' ? 'claro' : 'oscuro';
    aplicarTema(tema);
    try { localStorage.setItem('unitree-tema', tema); } catch (_) {}
});
