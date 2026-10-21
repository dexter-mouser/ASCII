// Escenario visto desde una ventana: mar, acantilado con castillo, bosque con cabaña, pueblo con taberna de neón,
// calle mojada y, en primer plano, el marco de la ventana con una taza y una vela.
// Tipos de celda: 0 cielo, 2 roca, 3 castillo, 4 ventana del castillo, 8 pared/tejado, 9 ventana de casa,
// 10 calle, 11 neón, 12 marco, 13 mar, 14 gallardete, 16 ventana de la cabaña
const Escenario = {
  generar(C, F) {
    const total = C * F;
    this.C = C;
    this.F = F;
    this.tipo = new Uint8Array(total);
    this.textura = new Float32Array(total);
    this.material = new Float32Array(total);
    this.fase = new Float32Array(total);
    this.familia = new Uint8Array(total);   // color: 0 roca, 1 piedra, 2 madera, 3 tejado, 4 pared, 5 calle
    this.charco = new Uint8Array(total);
    this.letra = new Array(total).fill("");
    this.marco = [];
    this.nubes = new Float32Array(total);  // densidad de las nubes (se renueva por franjas)
    this.cuadro = 0;
    this.arboles = [];
    this.cimaColina = [];
    this.reflejo = new Float32Array(C * 3);  // color que se refleja en los charcos, por columna
    const P = PALETA_LLUVIA;
    this.colores = [P.roca, P.piedra, P.madera, P.tejado, P.pared, P.calle];
    Luz.luces = [];

    const ruido = Utilidades.ruido, fbm = Utilidades.fbm, lim = Utilidades.limitar;
    // Escribe una celda (con comprobación de límites); "fa" fija la fase para agrupar ventanas
    const pon = (x, y, t, m, tx, fam, fa) => {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= C || y >= F) return;
      const i = y * C + x;
      this.tipo[i] = t; this.material[i] = m; this.textura[i] = tx; this.familia[i] = fam || 0;
      this.fase[i] = fa === undefined ? ruido(x * 1.7, y * 2.3) * 6.28 : fa;
    };

    const horizonte = Math.floor(F * 0.56), calleY = Math.floor(F * 0.76), repisa = Math.floor(F * 0.84);
    this.horizonte = horizonte;
    this.repisa = repisa;

    // Mar
    for (let y = horizonte; y < F; y++) for (let x = 0; x < C; x++) pon(x, y, 13, 1, 1, 0);

    // Colina del bosque (izquierda)
    for (let x = 0; x < C * 0.36; x++) {
      const sube = Math.pow(1 - x / (C * 0.36), 1.2);
      const cima = Math.floor(horizonte - F * 0.12 * sube + F * 0.025 * fbm(x * 0.05, 3));
      this.cimaColina[x] = cima;
      for (let y = cima; y < F; y++) pon(x, y, 2, 0.6, 0.45 + 0.35 * fbm(x * 0.1, y * 0.2), 0);
    }

    // Acantilado (derecha)
    for (let x = Math.floor(C * 0.5); x < C; x++) {
      const t = lim((x - C * 0.5) / (C * 0.10), 0, 1), suave = t * t * (3 - 2 * t);
      const cima = Math.floor(horizonte - suave * (horizonte - F * 0.37) + F * 0.02 * fbm(x * 0.05, 7) * suave);
      for (let y = cima; y < F; y++) pon(x, y, 2, 0.85, 0.45 + 0.55 * fbm(x * 0.12, y * 0.25), 0);
    }

    // Castillo: muralla, torres con almenas, tejados cónicos, ventanas y gallardetes
    const base = Math.floor(F * 0.37) + 2;
    for (let x = Math.floor(C * 0.60); x < C * 0.91; x++) {
      for (let y = base - Math.floor(F * 0.06) + (x % 4 < 2 ? 0 : 1); y <= base + 4; y++) pon(x, y, 3, 0.85, 0.7 + 0.2 * ruido(x, y), 1);
    }
    [[0.60, 0.04, 0.20], [0.655, 0.06, 0.28], [0.735, 0.04, 0.17], [0.795, 0.055, 0.25], [0.875, 0.035, 0.15]].forEach((t) => {
      const ancho = Math.max(4, Math.floor(t[1] * C)), x0 = Math.floor(t[0] * C);
      const tope = Math.floor(base - t[2] * F), tejado = Math.max(3, Math.round(ancho * 0.7)), centro = x0 + ancho / 2;
      for (let x = x0; x < x0 + ancho; x++) for (let y = tope + ((x - x0) % 4 < 2 ? 0 : 1); y <= base + 4; y++) pon(x, y, 3, 0.9, 0.75 + 0.25 * ruido(x, y), 1);
      for (let k = 0; k < tejado; k++) {
        const mitad = (ancho / 2 + 1) * (1 - k / tejado);
        for (let x = Math.floor(centro - mitad); x <= Math.ceil(centro + mitad); x++) if (Math.abs(x + 0.5 - centro) < mitad) pon(x, tope - 1 - k, 3, 0.8, 0.55 + 0.2 * (k % 2), 3);
      }
      for (let k = 0; k < 3; k++) pon(centro, tope - tejado - 1 - k, 3, 0.8, 0.8, 1);          // asta
      for (let d = 1; d <= 5; d++) pon(centro + d, tope - tejado - 2, 14, 1, 1, 0);           // gallardete
      [4, 9].forEach((d) => { if (tope + d < base) pon(centro, tope + d, 4, 1, 1, 0, ruido(x0, d) * 6.28); });
    });

    // Cabaña en el bosque, con ventana encendida y chimenea
    const cabX = Math.floor(C * 0.10), cabAncho = Math.max(12, Math.floor(C * 0.05)), cabAlto = Math.max(5, Math.floor(F * 0.06));
    const cabBase = this.cimaColina[cabX + Math.floor(cabAncho / 2)] + 3, cabTecho = Math.ceil(cabAncho * 0.35);
    for (let x = cabX; x < cabX + cabAncho; x++) for (let y = cabBase - cabAlto; y < cabBase; y++) pon(x, y, 8, 0.85, 0.6 + 0.4 * (y % 2), 2);
    for (let k = 0; k < cabTecho; k++) {
      const mitad = (cabAncho / 2 + 0.5) * (1 - k / cabTecho);
      for (let x = Math.floor(cabX + cabAncho / 2 - mitad); x <= Math.ceil(cabX + cabAncho / 2 + mitad); x++) pon(x, cabBase - cabAlto - 1 - k, 8, 0.85, 0.5 + 0.3 * (k % 2), 3);
    }
    for (let dx = 0; dx < 3; dx++) for (let dy = 0; dy < 2; dy++) pon(cabX + 2 + dx, cabBase - cabAlto + 1 + dy, 16, 1, 1, 0, 1.3);
    for (let dy = 0; dy < 3; dy++) { pon(cabX + cabAncho - 3, cabBase - cabAlto - cabTecho + dy, 3, 0.8, 0.7, 1); pon(cabX + cabAncho - 2, cabBase - cabAlto - cabTecho + dy, 3, 0.8, 0.7, 1); }
    this.chimenea = { x: cabX + cabAncho - 2, y: cabBase - cabAlto - cabTecho - 1 };

    // Pueblo: casas con ventanas, puertas y la taberna con letrero de neón
    const letrero = AJUSTES.letrero, paso = Math.max(2, Math.round(C / 110));
    let x = 0, n = 0;
    while (x < C) {
      let ancho = Math.max(10, Math.floor(C * 0.065)) + Math.floor(ruido(n, 1) * C * 0.04);
      if (n === 2) ancho = Math.max(ancho, letrero.length * paso + 8);
      const alto = Math.max(5, Math.floor(F * (0.07 + 0.05 * ruido(n, 2)))), techo = Math.max(3, Math.floor(ancho * 0.3)), centro = x + ancho / 2;
      for (let xx = x; xx < x + ancho; xx++) for (let y = calleY - alto; y < calleY; y++) pon(xx, y, 8, 0.85, 0.6 + 0.4 * ruido(xx, y), 4);
      for (let k = 0; k < techo; k++) {
        const mitad = (ancho / 2 + 0.5) * (1 - k / techo);
        for (let xx = Math.floor(centro - mitad); xx <= Math.ceil(centro + mitad); xx++) if (Math.abs(xx + 0.5 - centro) < mitad) pon(xx, calleY - alto - 1 - k, 8, 0.85, 0.5 + 0.3 * (k % 2), 3);
      }
      for (let wx = x + 3; wx < x + ancho - 3; wx += 6) {
        for (let wy = calleY - alto + (n === 2 ? 3 : 1); wy < calleY - 3; wy += 4) {
          const fa = ruido(wx, wy) * 6.28;
          for (let dx = 0; dx < 2; dx++) for (let dy = 0; dy < 2; dy++) pon(wx + dx, wy + dy, 9, 1, 1, 0, fa);
        }
      }
      for (let dx = 0; dx < 2; dx++) for (let dy = 1; dy <= 3; dy++) pon(Math.floor(centro) + dx, calleY - dy, 8, 0.7, 0.5, 2);
      if (n === 2) {  // letrero de neón con luz propia
        const fila = calleY - alto + 1, x0 = Math.floor(centro - (letrero.length * paso) / 2);
        [...letrero].forEach((c, k) => { pon(x0 + k * paso, fila, 11, 1, 1, 0, k); this.letra[fila * C + x0 + k * paso] = c; });
        this.neon = { x: Math.floor(centro), y: fila, radio: F * 0.12, fuerza: 0.8, color: [1, 0.3, 0.7] };
        Luz.luces.push(this.neon);
      }
      x += ancho + Math.floor(1 + ruido(n, 3) * 2);
      n++;
    }

    // Calle mojada con charcos
    for (let y = calleY; y < repisa; y++) {
      for (let xx = 0; xx < C; xx++) {
        pon(xx, y, 10, 0.8, 0.5 + 0.5 * ruido(xx, y), 5);
        if (fbm(xx * 0.06, y * 0.5) > 0.5) this.charco[y * C + xx] = 1;
      }
    }
    // Color que reflejan los charcos: ámbar bajo las ventanas, rosa o cian bajo el neón
    for (let i = 0; i < total; i++) {
      const col = i % C;
      if (this.tipo[i] === 9) { this.reflejo[col * 3] = 255; this.reflejo[col * 3 + 1] = 176; this.reflejo[col * 3 + 2] = 72; }
      if (this.tipo[i] === 11) { const c = Math.floor(this.fase[i]) % 2 ? P.cian : P.rosa; this.reflejo.set(c, col * 3); }
    }

    // Pinos del bosque (se dibujan cada fotograma para que se mezan con el viento)
    for (let xp = Math.floor(C * 0.035) + 3; xp < C * 0.34; xp += Math.floor(4 + ruido(xp, 9) * 5)) {
      if (xp > cabX - 4 && xp < cabX + cabAncho + 4) continue;  // deja libre la cabaña
      const alto = Math.floor(F * (0.10 + 0.10 * ruido(xp, 6)));
      this.arboles.push({ x: xp, base: Math.floor(this.cimaColina[xp] + 3 + ruido(xp, 5) * F * 0.07), alto: alto, ancho: alto * 0.9, fase: ruido(xp, 4) * 6.28 });
    }
    this.arboles.sort((a, b) => a.base - b.base);

    // Marco de la ventana: postes, dintel, travesaños y repisa
    const pa = Math.max(5, Math.floor(C * 0.035)), dintel = Math.max(3, Math.floor(F * 0.05));
    const mw = Math.max(2, Math.floor(C * 0.008)), mullY = Math.floor(F * 0.40);
    this.pa = pa;
    for (let y = 0; y < F; y++) {
      for (let xx = 0; xx < C; xx++) {
        const vertical = xx < pa || xx >= C - pa || Math.abs(xx - C / 2) < mw;
        if (!(vertical || y < dintel || y >= repisa || (y >= mullY && y < mullY + 2))) continue;
        const veta = vertical ? ruido(xx * 3, y * 0.15) : ruido(xx * 0.15, y * 3);
        pon(xx, y, 12, 0.9, y === repisa ? 1 : 0.55 + 0.4 * veta, 2);
        this.marco.push(y * C + xx);
      }
    }

    // Objetos sobre la repisa y luz de la vela
    this.taza = { x: Math.floor(C * 0.18), y: repisa - 1 };
    this.vela = { x: Math.floor(C * 0.82), y: repisa - 4, radio: F * 0.2, fuerza: 1, color: [1, 0.62, 0.28] };
    Luz.luces.push(this.vela);
  },

  // Redibuja en la capa de fondo solo la mitad de las filas (pares o impares, alternando) para ahorrar trabajo.
  // El resto de la capa conserva lo del fotograma anterior.
  actualizarCapa(capa, t, viento) {
    const paridad = this.cuadro & 1, franja = this.cuadro & 3;
    capa.limpiarFilas(paridad);
    this.pintarFondo(capa, t, viento, paridad, franja);
    this.pintarMarco(capa, paridad);
    this.cuadro++;
  },

  // ¿La celda es cristal (y no marco)? La lluvia y los rayos solo se ven en el cristal
  libre(x, y) {
    x = Math.round(x); y = Math.round(y);
    return x >= 0 && y >= 0 && x < this.C && y < this.F && this.tipo[y * this.C + x] !== 12;
  },

  // Cielo con nubes, mar, castillo, cabaña, pueblo y calle + pinos
  pintarFondo(cuadricula, t, viento, paridad, franja) {
    const C = this.C, tope = CONFIG.rampa.length - 1, P = PALETA_LLUVIA, lim = Utilidades.limitar;
    for (let i = 0; i < this.tipo.length; i++) {
      const tipo = this.tipo[i], y = Math.floor(i / C);
      if (tipo === 12 || (y & 1) !== paridad) continue;  // el marco se dibuja aparte
      const x = i % C, tx = this.textura[i];

      if (tipo === 0) {  // nubes de tormenta que avanzan
        if (y >= this.horizonte) continue;
        if (y % 4 === franja) {
          const nube = Utilidades.fbm(x * 0.035 + t * 0.15, y * 0.12 + t * 0.03);
          this.nubes[i] = lim((nube - 0.5) * 2.6, 0, 1) * (1 - 0.5 * y / this.horizonte);
        }
        const indice = Math.floor(this.nubes[i] * 0.75 * tope);
        if (indice >= 1) Luz.poner(cuadricula, x, y, CONFIG.rampa[indice], P.nube, 1);
      } else if (tipo === 13) {  // olas
        const o = Math.sin(x * 0.35 + t * 1.6 + y * 0.9) + 0.5 * Math.sin(x * 0.13 - t * 0.9 + y * 2.1);
        Luz.poner(cuadricula, x, y, o > 0.9 ? "~" : o > 0.2 ? "-" : o > -0.5 ? "." : "`", P.mar, 0.6 + 0.3 * o);
      } else if (tipo === 2 || tipo === 3) {  // roca y castillo
        Luz.ponerRampa(cuadricula, x, y, this.colores[this.familia[i]], this.material[i], tx, 1.1, false);
      } else if (tipo === 4 || tipo === 9 || tipo === 16) {  // ventanas con luz que titila y a veces se apaga
        const f = 0.75 + 0.25 * Math.sin(t * (3 + this.fase[i] * 0.3) + this.fase[i] * 5);
        if (Math.sin(t * 0.08 + this.fase[i] * 7) > -0.7) cuadricula.poner(x, y, "#", P.ambar[0] * f, P.ambar[1] * f, P.ambar[2] * f);
        else Luz.poner(cuadricula, x, y, "#", P.ambar, 0.12);
      } else if (tipo === 8) {  // paredes y tejados: reciben el neón y la vela
        Luz.ponerRampa(cuadricula, x, y, this.colores[this.familia[i]], this.material[i], tx, 1.1, true);
      } else if (tipo === 10) {  // calle: adoquines y charcos que reflejan las luces
        if (!this.charco[i]) { Luz.ponerRampa(cuadricula, x, y, P.calle, this.material[i], tx, 1.1, true); continue; }
        const brillo = 0.35 + 0.25 * Math.sin(t * 3 + x * 0.7), r = this.reflejo, d = Luz.destello * 120;
        cuadricula.poner(x, y, "~-"[(x + Math.floor(t * 2)) % 2],
          (r[x * 3] || 70) * brillo + d, (r[x * 3 + 1] || 90) * brillo + d, (r[x * 3 + 2] || 130) * brillo + d);
      } else if (tipo === 11) {  // neón: parpadea y a veces zumba
        const k = (Math.sin(t * 2 + this.fase[i]) > -0.8 ? 1 : 0.15) * (Utilidades.ruido(Math.floor(t * 12), this.fase[i]) > 0.93 ? 0.3 : 1);
        const c = Math.floor(this.fase[i]) % 2 ? P.cian : P.rosa;
        cuadricula.poner(x, y, this.letra[i], c[0] * k, c[1] * k, c[2] * k);
      } else if (tipo === 14) {  // gallardetes agitados por el viento
        Luz.poner(cuadricula, x, y, "~-="[Math.floor(x * 0.7 + t * (6 + Math.abs(viento) * 0.15)) % 3], P.tela, 1.3);
      }
    }
    this.neon.fuerza = 0.8 * (Math.sin(t * 2) > -0.8 ? 1 : 0.2);

    // Pinos que se mecen
    for (const a of this.arboles) {
      for (let r = 0; r < a.alto; r++) {
        const y = a.base - a.alto + r;
        if ((y & 1) !== paridad) continue;
        const semi = (r / a.alto) * a.ancho / 2 * (0.7 + 0.3 * ((r % 4) / 3));
        const desvio = Math.round(Math.sin(t * 1.8 + a.fase) * (1.2 + Math.abs(viento) * 0.04) * (1 - r / a.alto));
        for (let dx = -Math.round(semi); dx <= Math.round(semi); dx++) {
          Luz.ponerRampa(cuadricula, a.x + dx + desvio, y, P.pino, 0.9, 0.55 + 0.45 * Utilidades.ruido(a.x + dx, y), 1.2, false);
        }
      }
      for (let k = 0; k < 2; k++) if (((a.base + k) & 1) === paridad) Luz.poner(cuadricula, a.x, a.base + k, "|", P.madera, 0.5);
    }
  },

  // Marco de madera (parte del fondo; se pinta por mitades)
  pintarMarco(cuadricula, paridad) {
    const C = this.C;
    for (const i of this.marco) {
      const y = Math.floor(i / C);
      if ((y & 1) === paridad) Luz.ponerRampa(cuadricula, i % C, y, PALETA_LLUVIA.madera, this.material[i], this.textura[i], 1.3, true);
    }
  },

  // Taza y vela sobre la repisa, con la llama que parpadea (se dibuja entera en cada fotograma)
  dibujarObjetos(cuadricula, t) {
    const P = PALETA_LLUVIA, v = this.vela;
    const llama = 0.8 + 0.2 * Math.sin(t * 14) * Math.sin(t * 9);
    v.fuerza = 0.9 * llama;
    [" .---. ", "|     |]", " \\___/ "].forEach((linea, j) => {
      for (let k = 0; k < linea.length; k++) if (linea[k] !== " ") Luz.poner(cuadricula, this.taza.x - 3 + k, this.taza.y - 2 + j, linea[k], P.taza, 1.1, Luz.local(this.taza.x - 3 + k, this.taza.y - 2 + j));
    });
    for (let k = -2; k <= 2; k++) Luz.poner(cuadricula, v.x + k, this.repisa - 1, k === 0 ? "=" : "_", P.taza, 1.1, Luz.local(v.x + k, this.repisa - 1));
    for (let y = this.repisa - 3; y < this.repisa - 1; y++) Luz.poner(cuadricula, v.x, y, "#", P.cera, 1.2, Luz.local(v.x, y));
    cuadricula.poner(v.x, v.y, ")", P.ambar[0] * 1.4 * llama, P.ambar[1] * 1.4 * llama, P.ambar[2] * 1.2 * llama);
    cuadricula.poner(v.x, v.y - 1, llama > 0.9 ? "'" : ",", P.ambar[0] * llama, P.ambar[1] * 0.8 * llama, P.ambar[2] * 0.5);
  }
};
