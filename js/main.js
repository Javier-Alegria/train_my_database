/*
*****************************************************************************************************************
CREATOR: Javier Alegría Sobrados
last modified on: 13/03/2026 | 03-13-2026

PROJECT: WEB FOR PRACTICE OF DATABASES

FUNCTION: 
Implements a browser-based MySQL exercise quiz system that loads exercises from localStorage, displays them, and checks the user’s answers.

It also tracks correct/incorrect attempts, allows random or manual exercise selection, and shows images with a lightbox viewer
*****************************************************************************************************************
*/

// ── Clave compartida con ejercicios.js ───────────────────────────────────────
const CLAVE_STORAGE = "ejerciciosMySQL";

// ── Ejercicio activo y su índice en la lista ──────────────────────────────────
let ejercicioActual       = null;
let indiceEjercicioActual = null;

// ── Obtener la lista de ejercicios desde localStorage ─────────────────────────
function obtenerEjercicios() {
    const datos = localStorage.getItem(CLAVE_STORAGE);
    return datos ? JSON.parse(datos) : [];
}

// ── Guardar la lista completa en localStorage ─────────────────────────────────
function guardarEnStorage(lista) {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(lista));
}

// ── Poblar el <select> con títulos y contadores ───────────────────────────────
function poblarSelector() {
    const selector = document.getElementById("selectorEjercicios");
    const lista    = obtenerEjercicios();

    selector.innerHTML = '<option value="">-- Selecciona un ejercicio --</option>';

    lista.forEach(function(ejercicio, indice) {
        const titulo   = ejercicio.titulo   || `Ejercicio ${indice + 1}`;
        const aciertos = ejercicio.aciertos || 0;
        const fallos   = ejercicio.fallos   || 0;

        const opcion       = document.createElement("option");
        opcion.value       = indice;
        opcion.textContent = `${titulo}  —  ✅ ${aciertos}  ❌ ${fallos}`;
        selector.appendChild(opcion);
    });
}

// ── Elegir un ejercicio al azar (distinto al actual si hay más de uno) ────────
function elegirEjercicioAleatorio() {
    const lista = obtenerEjercicios();

    if (lista.length === 0) {
        document.getElementById("enunciado").textContent =
            "No hay ejercicios disponibles. Ve a 'Gestionar ejercicios' para añadir algunos.";
        return null;
    }

    if (lista.length === 1) {
        indiceEjercicioActual = 0;
        return lista[0];
    }

    let indice;
    do {
        indice = Math.floor(Math.random() * lista.length);
    } while (indiceEjercicioActual !== null && indice === indiceEjercicioActual);

    indiceEjercicioActual = indice;
    return lista[indice];
}

// ── Mostrar / ocultar la imagen del ejercicio ─────────────────────────────────
function actualizarImagen(ejercicio) {
    const img = document.getElementById("imagenEjercicio");
    if (!img) return;

    if (ejercicio && ejercicio.imagen) {
        img.src           = ejercicio.imagen;
        img.style.display = "block";
        img.style.cursor  = "zoom-in";
        img.onclick       = function() { abrirLightbox(this.src); };
    } else {
        img.src           = "";
        img.style.display = "none";
        img.onclick       = null;
    }
}

// ── Mostrar un ejercicio concreto en pantalla ─────────────────────────────────
function mostrarEjercicio(ejercicio, indice) {
    if (!ejercicio) return;

    ejercicioActual       = ejercicio;
    indiceEjercicioActual = indice;

    document.getElementById("enunciado").textContent = ejercicio.enunciado;
    actualizarImagen(ejercicio);

    borrarRespuesta();
    document.getElementById("resultado").textContent       = "";
    document.getElementById("btnReintentar").style.display = "none";
    document.getElementById("selectorEjercicios").value    = "";
}

// ── Cargar un nuevo ejercicio al azar ────────────────────────────────────────
function cargarEjercicio() {
    const ejercicio = elegirEjercicioAleatorio();
    mostrarEjercicio(ejercicio, indiceEjercicioActual);
}

// ── Cargar el ejercicio elegido en el <select> ────────────────────────────────
function elegirDeLista() {
    const selector = document.getElementById("selectorEjercicios");
    const indice   = selector.value;

    if (indice === "") {
        alert("Selecciona primero un ejercicio de la lista.");
        return;
    }

    const i     = parseInt(indice);
    const lista = obtenerEjercicios();
    mostrarEjercicio(lista[i], i);
}

// ── Normalizar SQL para comparar por estructura (no por formato literal) ────
function normalizarAlias(alias) {
    return alias
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/gi, "")
        .toLowerCase();
}

function normalizarCondicionWhere(where) {
    let texto = where
        .replace(/\b([a-z_][a-z0-9_]*)\s+between\s+(\d+)\s+and\s+(\d+)\b/gi, "$1 >= $2 and $1 <= $3")
        .replace(/\b([a-z_][a-z0-9_]*)\s*>\s*(\d+)\s+and\s*\1\s*<\s*(\d+)\b/gi, (_, campo, min, max) => {
            const limiteInferior = Number(min) + 1;
            const limiteSuperior = Number(max) - 1;
            return `${campo} >= ${limiteInferior} and ${campo} <= ${limiteSuperior}`;
        })
        .replace(/\s*(<=|>=|<>|!=|=|<|>)\s*/g, " $1 ")
        .replace(/\s+/g, " ")
        .trim();

    if (texto.includes(" and ")) {
        texto = texto
            .split(/\s+and\s+/)
            .map((parte) => parte.trim())
            .filter(Boolean)
            .sort()
            .join(" and ");
    }

    return texto;
}


function normalizarSelect(selectParte) {
    return selectParte
        .split(",")
        .map((campo) => campo
            .replace(/\s+as\s+.+$/gi, "")
            .replace(/\s+/g, " ")
            .trim())
        .join(",");
}
function normalizarSQL(consulta) {
    let normalizada = consulta
        .toLowerCase()
        // Eliminar comentarios de línea y de bloque
        .replace(/--.*$/gm, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        // Unificar aliases escritos con comillas o espacios
        .replace(/\bas\s+(["'`])([^"'`]+)\1/gi, (_, __, alias) => ` as ${normalizarAlias(alias)}`)
        // Eliminar alias de tablas: FROM tabla t / JOIN tabla t
        .replace(/\b(from|join)\s+([a-z_][a-z0-9_]*)(?:\s+as)?\s+[a-z_][a-z0-9_]*/gi, "$1 $2")
        // Quitar prefijos de alias de tabla en columnas (e.campo -> campo)
        .replace(/\b[a-z_][a-z0-9_]*\./g, "")
        // Espacios unificados
        .replace(/[\r\n\t]+/g, " ")
        .replace(/\s+/g, " ")
        // Ignorar ; finales opcionales
        .replace(/;+\s*$/g, "")
        .trim();

    const partes = normalizada.match(/^(select\s+.+?)\s+from\s+(.+?)(?:\s+where\s+(.+))?$/i);
    if (!partes) return normalizada;

    const selectParte = normalizarSelect(partes[1].replace(/^select\s+/i, "").replace(/\s*,\s*/g, ","));
    const fromParte   = partes[2];
    const whereParte  = partes[3] || "";

    const tablas = fromParte
        .split(/\bjoin\b/i)
        .map((p) => p.replace(/\bon\b[\s\S]*$/i, "").trim())
        .filter(Boolean)
        .sort();

    const onPartes = [...fromParte.matchAll(/\bon\b\s+(.+?)(?=\bjoin\b|$)/gi)]
        .map((m) => m[1].replace(/\s*(<=|>=|<>|!=|=|<|>)\s*/g, "$1").replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .sort();

    const whereNormalizado = whereParte ? normalizarCondicionWhere(whereParte) : "";

    let firma = `select ${selectParte} from ${tablas.join(" join ")}`;
    if (onPartes.length) firma += ` on ${onPartes.join(" and ")}`;
    if (whereNormalizado) firma += ` where ${whereNormalizado}`;

    return firma.replace(/\s+/g, " ").trim();
}


// ── Comparación por resultado real (si AlaSQL está disponible) ───────────────
function tokenizarIdentificadores(sql) {
    return (sql.toLowerCase().match(/[a-z_][a-z0-9_]*/g) || []);
}

function extraerTablasYAlias(sql) {
    const regex = /(from|join)\s+([a-z_][a-z0-9_]*)(?:\s+(?:as\s+)?([a-z_][a-z0-9_]*))?/gi;
    const tablas = [];
    let m;

    while ((m = regex.exec(sql)) !== null) {
        const tabla = m[2].toLowerCase();
        const alias = (m[3] || tabla).toLowerCase();
        tablas.push({ tabla, alias });
    }

    return tablas;
}

function extraerColumnasReferenciadas(sql, aliases) {
    const columnasPorTabla = {};
    aliases.forEach(({ tabla }) => { columnasPorTabla[tabla] = new Set(["id"]); });

    const aliasATabla = {};
    aliases.forEach(({ tabla, alias }) => { aliasATabla[alias] = tabla; });

    const cualificadas = [...sql.toLowerCase().matchAll(/([a-z_][a-z0-9_]*)\.([a-z_][a-z0-9_]*)/g)];
    for (const c of cualificadas) {
        const alias = c[1];
        const columna = c[2];
        if (aliasATabla[alias]) columnasPorTabla[aliasATabla[alias]].add(columna);
    }

    const keywords = new Set([
        "select", "from", "join", "on", "where", "and", "or", "as", "between", "like", "in", "is", "null",
        "order", "by", "group", "having", "limit", "distinct", "asc", "desc", "inner", "left", "right", "full"
    ]);
    const tokens = tokenizarIdentificadores(sql);
    const firstTable = aliases[0] ? aliases[0].tabla : null;

    for (let i = 0; i < tokens.length; i++) {
        const tk = tokens[i];
        const prev = tokens[i - 1] || "";
        const next = tokens[i + 1] || "";

        if (keywords.has(tk)) continue;
        if (aliasATabla[tk]) continue;
        if (aliases.some(({ tabla }) => tabla === tk)) continue;
        if (prev === "from" || prev === "join" || prev === "as") continue;
        if (next === "from" || next === "join") continue;
        if (!firstTable) continue;

        columnasPorTabla[firstTable].add(tk);
    }

    return columnasPorTabla;
}

function crearDatasetAleatorio(aliases, columnasPorTabla) {
    const filas = {};
    aliases.forEach(({ tabla }) => { filas[tabla] = []; });

    for (let i = 1; i <= 12; i++) {
        aliases.forEach(({ tabla }) => {
            const row = {};
            columnasPorTabla[tabla].forEach((col) => {
                if (col.includes("nom") || col.includes("name")) {
                    row[col] = `txt_${(i % 5) + 1}`;
                } else {
                    row[col] = (i * 13 + col.length * 7) % 100000;
                }
            });
            row.id = i;
            filas[tabla].push(row);
        });
    }

    return filas;
}

function normalizarResultado(resultado) {
    const filas = resultado.map((fila) => {
        const ordenadas = {};
        Object.keys(fila).sort().forEach((k) => { ordenadas[k] = fila[k]; });
        return JSON.stringify(ordenadas);
    });

    return filas.sort().join("\n");
}

function compararPorResultado(respuestaUsuario, respuestaCorrecta) {
    if (typeof window.alasql === "undefined") {
        return { disponible: false, equivalente: false, errorUsuario: false };
    }

    const qUser = respuestaUsuario.trim().replace(/;+\s*$/g, "");
    const qOk   = respuestaCorrecta.trim().replace(/;+\s*$/g, "");

    const aliases = extraerTablasYAlias(`${qUser} ${qOk}`);
    if (aliases.length === 0) {
        return { disponible: false, equivalente: false, errorUsuario: false };
    }

    const columnasPorTabla = extraerColumnasReferenciadas(`${qUser} ${qOk}`, aliases);

    for (let intento = 0; intento < 4; intento++) {
        const db = new window.alasql.Database();
        const datos = crearDatasetAleatorio(aliases, columnasPorTabla);

        const tablasUnicas = [...new Set(aliases.map((x) => x.tabla))];

        for (const tabla of tablasUnicas) {
            const columnas = [...columnasPorTabla[tabla]];
            const definicion = columnas.map((col) => `[${col}] STRING`).join(", ");
            db.exec(`CREATE TABLE [${tabla}] (${definicion})`);
            for (const fila of datos[tabla]) {
                db.tables[tabla].data.push(fila);
            }
        }

        let rUser;
        let rOk;
        try {
            rUser = db.exec(qUser);
        } catch (e) {
            return { disponible: true, equivalente: false, errorUsuario: true };
        }

        try {
            rOk = db.exec(qOk);
        } catch (e) {
            return { disponible: false, equivalente: false, errorUsuario: false };
        }

        if (normalizarResultado(rUser) !== normalizarResultado(rOk)) {
            return { disponible: true, equivalente: false, errorUsuario: false };
        }
    }

    return { disponible: true, equivalente: true, errorUsuario: false };
}

// ── Enviar respuesta ──────────────────────────────────────────────────────────
function enviarRespuesta() {
    const parrafoResultado = document.getElementById("resultado");
    const btnReintentar    = document.getElementById("btnReintentar");

    if (!ejercicioActual) return;

    const respuestaUsuario = document.getElementById("respuesta").value;

    if (respuestaUsuario.trim() === "") {
        parrafoResultado.textContent = "Por favor, escribe una respuesta antes de enviar.";
        return;
    }

    const comparacionResultado = compararPorResultado(respuestaUsuario, ejercicioActual.respuesta);

    const esCorrecta = comparacionResultado.disponible
        ? comparacionResultado.equivalente
        : normalizarSQL(respuestaUsuario) === normalizarSQL(ejercicioActual.respuesta);

    const lista = obtenerEjercicios();
    if (indiceEjercicioActual !== null && lista[indiceEjercicioActual]) {
        if (esCorrecta) {
            lista[indiceEjercicioActual].aciertos = (lista[indiceEjercicioActual].aciertos || 0) + 1;
        } else {
            lista[indiceEjercicioActual].fallos   = (lista[indiceEjercicioActual].fallos   || 0) + 1;
        }
        guardarEnStorage(lista);
        ejercicioActual = lista[indiceEjercicioActual];
        poblarSelector();
    }

    if (esCorrecta) {
        parrafoResultado.textContent = "✅ ¡Correcto! Muy bien.";
        btnReintentar.style.display  = "none";
    } else if (comparacionResultado.errorUsuario) {
        parrafoResultado.textContent = "❌ Tu consulta tiene error de sintaxis SQL.";
        btnReintentar.style.display  = "inline";
    } else {
        parrafoResultado.textContent = "❌ Incorrecto. Inténtalo de nuevo.";
        btnReintentar.style.display  = "inline";
    }
}

// ── Borrar textarea ───────────────────────────────────────────────────────────
function borrarRespuesta() {
    document.getElementById("respuesta").value = "";
    document.getElementById("respuesta").focus();
}

// ── Reintentar ────────────────────────────────────────────────────────────────
function reintentar() {
    borrarRespuesta();
    document.getElementById("resultado").textContent       = "";
    document.getElementById("btnReintentar").style.display = "none";
}

// ── Nuevo ejercicio al azar ───────────────────────────────────────────────────
function nuevoEjercicio() {
    poblarSelector();
    cargarEjercicio();
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function crearLightbox() {
    if (document.getElementById("lightboxOverlay")) return;

    const style = document.createElement("style");
    style.textContent = `
        @keyframes lbFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes lbZoomIn { from { transform:scale(0.88); opacity:0 } to { transform:scale(1); opacity:1 } }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.id = "lightboxOverlay";
    overlay.style.cssText = `
        display:none; position:fixed; inset:0;
        background:rgba(0,0,0,0.88); backdrop-filter:blur(6px);
        z-index:9999; align-items:center; justify-content:center;
        cursor:zoom-out; animation:lbFadeIn 0.2s ease;
    `;

    const img = document.createElement("img");
    img.id = "lightboxImg";
    img.style.cssText = `
        max-width:90vw; max-height:88vh; object-fit:contain;
        border-radius:10px; box-shadow:0 0 60px rgba(0,0,0,0.8);
        animation:lbZoomIn 0.22s ease;
    `;

    const cerrar = document.createElement("button");
    cerrar.textContent = "✕";
    cerrar.style.cssText = `
        position:fixed; top:1.25rem; right:1.5rem;
        background:transparent; border:1px solid rgba(255,255,255,0.25);
        color:#fff; font-size:1.1rem; width:2.2rem; height:2.2rem;
        border-radius:50%; cursor:pointer; z-index:10000;
        transition:background 0.15s;
    `;
    cerrar.onmouseover = () => cerrar.style.background = "rgba(255,255,255,0.15)";
    cerrar.onmouseout  = () => cerrar.style.background = "transparent";

    overlay.appendChild(img);
    document.body.appendChild(overlay);
    document.body.appendChild(cerrar);

    overlay.onclick = cerrarLightbox;
    cerrar.onclick  = cerrarLightbox;
    document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarLightbox(); });
}

function abrirLightbox(src) {
    const overlay = document.getElementById("lightboxOverlay");
    const img     = document.getElementById("lightboxImg");
    if (!overlay || !img) return;
    img.src               = src;
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function cerrarLightbox() {
    const overlay = document.getElementById("lightboxOverlay");
    if (overlay) overlay.style.display = "none";
    document.body.style.overflow = "";
}

// ── Iniciar al cargar la página ───────────────────────────────────────────────
crearLightbox();
poblarSelector();
cargarEjercicio();
