// Mouse, toques, teclado y botones
const Controles = {
  iniciar(lienzo) {
    let ultimoX = null;

    // Mover el puntero empuja la llama como viento
    lienzo.addEventListener("pointermove", (e) => {
      if (ultimoX !== null) {
        Estado.ventoExtra = Utilidades.limitar(Estado.ventoExtra + (e.clientX - ultimoX) / 30, -1, 1);
      }
      ultimoX = e.clientX;
    });
    lienzo.addEventListener("pointerleave", () => { ultimoX = null; });
    lienzo.addEventListener("pointerup", () => { ultimoX = null; });

    // Clic o toque: ráfaga de chispas
    lienzo.addEventListener("pointerdown", (e) => {
      ultimoX = e.clientX;
      Chispas.emitir(25);
    });

    window.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "f") this.alternarPantallaCompleta();
    });

    document.getElementById("btnPantalla").addEventListener("click", () => this.alternarPantallaCompleta());
  },

  alternarPantallaCompleta() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
  }
};
