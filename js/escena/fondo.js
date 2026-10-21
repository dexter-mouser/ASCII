// Escenario medieval: cielo con luna, castillo y montañas; muro con nicho, pendón y aspilleras; suelo con objetos
// Tipos de celda: 0 vacío, 1 estrella, 2 luna, 3 montaña/castillo, 4 piedra, 5 junta, 6 suelo, 7 nicho/aspillera,
// 8 nube, 9 ventana encendida, 11 hierba/musgo, 12 guijarro, 13 gallardete, 14 pendón, 15 emblema, 16 madera/hierro
const Fondo = {
  // Se genera una sola vez (y al cambiar el tamaño de la ventana)
  generar(columnas, filas) {
    const total = columnas * filas;
    this.columnas = columnas;
    this.tipo = new Uint8Array(total);
    this.textura = new Float32Array(total);  // brillo propio de cada celda
    this.material = new Float32Array(total);
    this.fase = new Float32Array(total);
    this.familia = new Uint8Array(total);    // color: 0 muro, 1 pilar azul, 2 suelo, 3 madera, 4 hierro
    this.colores = [PALETA.piedra, PALETA.piedraAzul, PALETA.suelo, PALETA.madera, PALETA.acero];
    this.temporal = [0, 0, 0];

    const ruido = Utilidades.ruido, fbm = Utilidades.fbm;
    const u = Iluminacion.unidad, pies = Iluminacion.fy + 1;
    const sueloY = Math.floor(filas * 0.80);
    const lunaX = columnas * 0.82, lunaY = filas * 0.12, lunaR = filas * 0.06;
    this.nichoX = Iluminacion.fx + Math.floor(columnas * 0.30);        // centro del nicho del caballero
    const nichoR = 11 * u / 0.6, centroNicho = pies - 10 * u, altoArco = 5.5 * u;
    const pilarX = columnas * 0.15, pilarY = Math.floor(filas * 0.58);  // pilar tallado en primer plano
    const baseCastillo = filas * 0.36, castX = Math.floor(columnas * 0.24);
    const murallaFin = castX + Math.floor(columnas * 0.18);
    // Torres del castillo: [posición, ancho, altura] como fracciones de la pantalla
    const torres = [[0, 0.035, 0.27], [0.045, 0.05, 0.34], [0.105, 0.03, 0.22], [0.14, 0.04, 0.30]].map((t) => {
      const ancho = Math.max(4, Math.floor(t[1] * columnas));
      return { x0: castX + Math.floor(t[0] * columnas), ancho: ancho, tope: Math.floor(baseCastillo - t[2] * filas * 0.7), tejado: Math.max(3, Math.round(ancho * 0.7)) };
    });
    // Barril y caja junto al pilar
    const bx = Math.floor(pilarX + columnas * 0.03), bAncho = Math.max(6, Math.floor(columnas * 0.03));
    const bAlto = Math.max(5, Math.floor(filas * 0.07)), base = sueloY + Math.floor(filas * 0.06);
    const cx = bx + bAncho + 2, cAncho = Math.max(7, Math.floor(columnas * 0.035)), cAlto = Math.max(4, Math.floor(filas * 0.055));
    // Pendón colgado en el muro
    const pendX = Math.floor(columnas * 0.475), pendAncho = Math.max(5, Math.floor(columnas * 0.035));
    const pendY = Math.floor(filas * 0.44), pendAlto = Math.floor(filas * 0.15);
    const aspilleraY = Math.floor(filas * 0.52);

    // Antorchas (con su propia luz sobre el muro)
    this.antorchas = [[0.26, 0.55], [0.93, 0.55]].map((p) => {
      const a = { x: Math.floor(columnas * p[0]), y: Math.floor(filas * p[1]), luz: { x: 0, y: 0, radio: filas * 0.11, fuerza: 0.6 } };
      a.luz.x = a.x; a.luz.y = a.y - 1;
      Iluminacion.extra.push(a.luz);
      return a;
    });

    for (let y = 0; y < filas; y++) {
      for (let x = 0; x < columnas; x++) {
        const i = y * columnas + x;
        const r = ruido(x, y);
        const fijar = (t, m, tx, fam) => { this.tipo[i] = t; this.material[i] = m; this.textura[i] = tx; this.familia[i] = fam || 0; };
        this.fase[i] = r * 6.28;

        if (x >= bx && x < bx + bAncho && y > base - bAlto && y <= base) {  // barril con aros de hierro
          const j = y - (base - bAlto) - 1, lado = x === bx || x === bx + bAncho - 1, aro = j === 1 || j === bAlto - 2;
          if (!(lado && (j === 0 || j === bAlto - 1))) fijar(16, 0.95, aro ? 0.9 : 0.55 + 0.35 * ((x - bx) % 2), aro ? 4 : 3);
          continue;
        }
        if (x >= cx && x < cx + cAncho && y > base - cAlto && y <= base) {  // caja de tablones
          const rx = x - cx, ry = y - (base - cAlto) - 1;
          const marco = rx === 0 || rx === cAncho - 1 || ry === 0 || ry === cAlto - 1;
          fijar(16, 0.95, marco ? 1 : Math.abs(rx - ry * cAncho / cAlto) < 1 ? 0.85 : 0.5, 3);
          continue;
        }

        if (y >= sueloY) {  // suelo de losas alternadas
          const fila = Math.floor((y - sueloY) / 3), desfase = (fila % 2) * 6;
          if ((y - sueloY) % 3 === 0 || (x + desfase) % 12 === 0) fijar(5, 0.7, 0.6, 2);
          else if (r > 0.985) fijar(11, 0, 1);  // hierba entre las losas
          else if (r > 0.97) fijar(12, 0, 1);   // guijarros
          else fijar(6, 0.9, 0.5 + 0.5 * ruido(Math.floor((x + desfase) / 12), fila) * (0.8 + 0.2 * r), 2);
          continue;
        }

        if (y >= pilarY - 1 && x < pilarX + (y < pilarY ? 3 : 0)) {  // pilar de bloques con relieve
          if (y < pilarY) fijar(5, 0.9, 0.9, 1);                                    // remate
          else if ((y - pilarY) % 4 === 0 || x % 17 === 0) fijar(5, 0.55, 0.6, 1);  // juntas
          else fijar(4, 0.95, Math.abs((x % 17) - 8.5) + Math.abs((y - pilarY) % 4 - 2) * 2.2 < 4 ? 1 : 0.6 + 0.3 * r, 1);  // rombo tallado
          continue;
        }

        const techo = filas * 0.36 + filas * 0.09 * fbm(x * 0.05, 1);  // borde irregular (ruinas)
        if (y >= techo) {
          const dx = (x - this.nichoX) / nichoR;
          const enNicho = Math.abs(dx) < 1 && (y >= centroNicho || dx * dx + Math.pow((centroNicho - y) / altoArco, 2) < 1);
          if (enNicho) { if (r > 0.55) fijar(7, 0.3, 0.3 + 0.4 * r); continue; }

          const rel = x - pendX;  // pendón con corte en V y emblema dorado
          const corte = Math.floor(pendAlto * 0.25 * (1 - Math.abs(rel - (pendAncho - 1) / 2) / ((pendAncho - 1) / 2)));
          if (y === pendY - 1 && rel >= -1 && rel <= pendAncho) { fijar(16, 0.9, 0.8, 3); continue; }  // barra
          if (rel >= 0 && rel < pendAncho && y >= pendY && y < pendY + pendAlto - corte) {
            const cruz = (rel === Math.floor(pendAncho / 2) && y - pendY >= 2 && y - pendY < 2 + Math.floor(pendAlto * 0.4)) ||
                         (y === pendY + Math.floor(pendAlto * 0.2) && Math.abs(rel - Math.floor(pendAncho / 2)) <= 1);
            fijar(cruz ? 15 : 14, 1, 0.75 + 0.25 * r);
            continue;
          }
          if (x % 31 === 12 && y >= aspilleraY && y < aspilleraY + 5) { fijar(7, 0.2, 0.5); continue; }  // aspillera

          const fila = Math.floor(y / 3), desfase = (fila % 2) * 5;  // ladrillos alternados
          if (y % 3 === 0 || (x + desfase) % 10 === 0 || r > 0.97) fijar(5, 0.5, 0.6);
          else if (r > 0.93 || (y > sueloY - 3 && r > 0.8)) fijar(11, 0, 1);  // musgo y hierba al pie del muro
          else fijar(4, 0.75, 0.55 + 0.45 * ruido(Math.floor((x + desfase) / 10), fila) * (0.85 + 0.15 * r));
          continue;
        }

        // Castillo lejano: torres con almenas, tejados cónicos, ventanas y gallardetes
        let castillo = 0;
        for (const t of torres) {
          const centro = t.x0 + t.ancho / 2, sobre = t.tope - 1 - y;
          if (x >= t.x0 && x < t.x0 + t.ancho && y >= t.tope + ((x - t.x0) % 4 < 2 ? 0 : 1)) {
            castillo = x === Math.floor(centro) && (y - t.tope === 4 || y - t.tope === 9) ? 2 : 1;
            break;
          }
          if (sobre >= 0 && sobre < t.tejado && Math.abs(x + 0.5 - centro) < (t.ancho / 2 + 1) * (1 - sobre / t.tejado)) { castillo = 1; break; }
          if (Math.abs(x - centro) < 0.6 && y < t.tope - t.tejado && y >= t.tope - t.tejado - 3) { castillo = 1; break; }
          if (y === t.tope - t.tejado - 2 && x > centro + 0.6 && x <= centro + 5) { castillo = 3; break; }
        }
        if (!castillo && x >= castX && x < murallaFin && y >= baseCastillo - filas * 0.07 + (x % 4 < 2 ? 0 : 1)) castillo = 1;  // muralla
        if (castillo) { fijar(castillo === 2 ? 9 : castillo === 3 ? 13 : 3, 0, castillo === 1 ? 0.9 : 1); continue; }

        if (y >= filas * 0.30 + filas * 0.10 * fbm(x * 0.025, 5)) {  // montañas cercanas
          fijar(3, 0, 0.35 + 0.3 * fbm(x * 0.08, y * 0.2));
          continue;
        }
        if (y >= filas * 0.22 + filas * 0.10 * fbm(x * 0.018, 11)) {  // montañas lejanas
          fijar(3, 0, 0.15 + 0.2 * fbm(x * 0.06, y * 0.15));
          continue;
        }

        const d = Math.hypot((x - lunaX) * 0.6, y - lunaY) / lunaR;  // luna con cráteres
        if (d < 1) { fijar(2, 0, Math.min(1, 0.8 + 0.2 * (1 - d) - 0.35 * Math.max(0, fbm(x * 0.3, y * 0.5) - 0.55))); continue; }
        const nube = fbm(x * 0.035, y * 0.09 + 3);
        if (nube > 0.6 || (d < 2.4 && r > 0.7)) { fijar(8, 0, d < 2.4 ? 0.25 : (nube - 0.6) * 1.6); continue; }
        if (r > 0.985) fijar(1, 0, 1);
      }
    }
  },

  // Dibuja solo las filas pares (0) o impares (1); el resto de la capa conserva el fotograma anterior
  dibujar(cuadricula, tiempo, paridad) {
    const rampa = CONFIG.rampa, tope = rampa.length - 1;
    const e = PALETA.estrella, nb = PALETA.nube, mt = PALETA.montana;
    for (let i = 0; i < this.tipo.length; i++) {
      const tipo = this.tipo[i], y = Math.floor(i / this.columnas);
      if (!tipo || (y & 1) !== paridad) continue;
      const x = i % this.columnas, tx = this.textura[i];

      if (tipo === 1) {  // estrellas parpadeantes
        const b = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(tiempo * 1.5 + this.fase[i]));
        cuadricula.poner(x, y, this.fase[i] > 4 ? "*" : ".", e[0] * b, e[1] * b, e[2] * b);
      } else if (tipo === 2) {  // luna
        cuadricula.poner(x, y, rampa[Math.floor(tx * tope)], e[0], e[1], e[2]);
      } else if (tipo === 8) {  // nubes y halo
        const f = 0.45 + 0.9 * tx;
        cuadricula.poner(x, y, rampa[Math.floor(tx * 0.6 * tope)], nb[0] * f, nb[1] * f, nb[2] * f);
      } else if (tipo === 3) {  // montañas y castillo
        const f = 0.7 + 0.8 * tx;
        cuadricula.poner(x, y, rampa[Math.floor(tx * 0.5 * tope)], mt[0] * f, mt[1] * f, mt[2] * f);
      } else if (tipo === 9) {  // ventanas encendidas
        const f = 0.7 + 0.3 * Math.sin(tiempo * 5 + this.fase[i] * 3);
        cuadricula.poner(x, y, "#", 255 * f, 190 * f, 90 * f);
      } else if (tipo === 13) {  // gallardetes que ondean
        cuadricula.poner(x, y, "~-="[Math.floor(x * 0.7 + tiempo * 5) % 3], PALETA.tela[0] * 1.6, PALETA.tela[1] * 1.6, PALETA.tela[2] * 1.6);
      } else if (tipo === 11) {  // hierba y musgo
        Iluminacion.poner(cuadricula, x, y, this.fase[i] > 4.7 ? '"' : this.fase[i] > 3.1 ? "'" : "^", PALETA.hierba, 1.2);
      } else if (tipo === 12) {  // guijarros
        Iluminacion.poner(cuadricula, x, y, this.fase[i] > 3.5 ? "O" : "o", PALETA.suelo, 0.9);
      } else if (tipo === 14) {  // pendón de tela
        Iluminacion.ponerRampa(cuadricula, x, y, PALETA.tela, 1, tx, 1.5);
      } else if (tipo === 15) {  // emblema dorado
        Iluminacion.poner(cuadricula, x, y, "#", PALETA.oro, 1.1);
      } else {  // piedra, juntas, suelo, nicho y madera: reciben luz del fuego
        Iluminacion.ponerRampa(cuadricula, x, y, this.colores[this.familia[i]], this.material[i], tx, tipo === 5 ? 0.45 : tipo === 16 ? 1.25 : 1.1);
      }
    }

  },

  // Antorchas: soporte de madera y llama que parpadea (se dibujan en cada fotograma)
  dibujarAntorchas(cuadricula, tiempo) {
    const rampa = CONFIG.rampa, tope = rampa.length - 1;
    for (const a of this.antorchas) {
      const f = 0.75 + 0.25 * Math.sin(tiempo * 11 + a.x) * Math.sin(tiempo * 7.3 + a.x * 2);
      a.luz.fuerza = 0.6 * f;
      Iluminacion.poner(cuadricula, a.x, a.y + 1, "|", PALETA.madera, 1.3);
      Iluminacion.poner(cuadricula, a.x, a.y + 2, "|", PALETA.madera, 1.3);
      for (let j = 0; j < 3; j++) {
        const v = (1 - j / 3) * f;
        const c = Utilidades.colorLlama(v, PALETA.llama, this.temporal);
        cuadricula.poner(a.x, a.y - j, rampa[Math.floor(Utilidades.limitar(v, 0, 1) * 0.9 * tope)], c[0], c[1], c[2]);
      }
    }
  }
};
