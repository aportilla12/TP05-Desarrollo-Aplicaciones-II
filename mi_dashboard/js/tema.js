const controlTema = document.getElementById('cambiar-tema');
function aplicarTema(tema) {
    document.documentElement.dataset.tema = tema;
    controlTema.textContent = tema === 'oscuro' ? 'Tema claro' : 'Tema oscuro';
    controlTema.setAttribute('aria-label', `Cambiar a ${controlTema.textContent.toLowerCase()}`);
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
