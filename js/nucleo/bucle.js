// Bucle de animación con límite de fotogramas por segundo (menos trabajo = menos lag)
const Bucle = {
  iniciar(fotogramas, cuadro) {
    const paso = 1 / fotogramas - 0.002;
    let previo = 0, acumulado = 0;
    const ciclo = (ahora) => {
      requestAnimationFrame(ciclo);
      acumulado += Math.min((ahora - previo) / 1000, 0.1);
      previo = ahora;
      if (acumulado < paso) return;  // se salta el fotograma
      const dt = acumulado;
      acumulado = 0;
      cuadro(dt);
    };
    requestAnimationFrame((t) => { previo = t; ciclo(t); });
  }
};
