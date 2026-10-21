// Menú de inicio. Para añadir una escena nueva, agrega una entrada con su "destino".
// Las entradas con destino null se muestran como "próximamente".
const OPCIONES = [
  { nombre: "Entrar a la hoguera", destino: "hoguera.html" },
  { nombre: "Lluvia nocturna", destino: "lluvia.html" },
  { nombre: "Galaxia", destino: "galaxia.html" }
];

const Menu = {
  seleccion: 0,
  saliendo: false,

  iniciar(raiz, contenedor) {
    this.raiz = raiz;
    this.elementos = OPCIONES.map((opcion, i) => {
      const elemento = document.createElement(opcion.destino ? "a" : "span");
      elemento.className = "opcion" + (opcion.destino ? "" : " bloqueada");
      elemento.textContent = opcion.nombre;
      if (opcion.destino) {
        elemento.href = opcion.destino;
        elemento.addEventListener("click", (e) => { e.preventDefault(); this.ir(i); });
        elemento.addEventListener("mouseenter", () => this.elegir(i));
        elemento.addEventListener("focus", () => this.elegir(i));
      } else {
        elemento.setAttribute("aria-disabled", "true");
        const aviso = document.createElement("small");
        aviso.textContent = "próximamente";
        elemento.appendChild(aviso);
      }
      contenedor.appendChild(elemento);
      return elemento;
    });
    this.elegir(0);

    window.addEventListener("keydown", (e) => {
      if (!this.raiz.getClientRects().length) return;  // la página de inicio no está visible
      if (e.key === "ArrowDown") { e.preventDefault(); this.mover(1); }
      if (e.key === "ArrowUp") { e.preventDefault(); this.mover(-1); }
      if (e.key === "Enter") { e.preventDefault(); this.ir(this.seleccion); }
    });
  },

  elegir(indice) {
    this.seleccion = indice;
    this.elementos.forEach((el, j) => el.classList.toggle("activa", j === indice));
  },

  // Mueve la selección saltando las opciones que aún no están disponibles
  mover(paso) {
    const total = OPCIONES.length;
    let indice = this.seleccion;
    do { indice = (indice + paso + total) % total; } while (!OPCIONES[indice].destino && indice !== this.seleccion);
    this.elegir(indice);
    this.elementos[indice].focus();
  },

  // Apaga la pantalla un instante y abre la escena elegida
  ir(indice) {
    const destino = OPCIONES[indice].destino;
    if (!destino || this.saliendo) return;
    this.saliendo = true;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!quieto) this.raiz.classList.add("saliendo");
    setTimeout(() => { window.location.href = destino; }, quieto ? 0 : 500);
  }
};
