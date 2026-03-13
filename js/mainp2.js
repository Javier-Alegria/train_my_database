/*
*****************************************************************************************************************
CREATOR: Javier Alegría Sobrados
last modified on: 13/03/2026 | 03-13-2026

PROJECT: WEB FOR PRACTICE OF DATABASES

FUNCTION:
Implements the MySQL practice page where the student receives only the exercise statement and writes a query.

It validates that the query is not empty and, when AlaSQL is available, checks SQL syntax before counting the attempt.
*****************************************************************************************************************
*/

// ── Clave compartida con ejercicios.js ───────────────────────────────────────
const CLAVE_STORAGE = "ejerciciosMySQL";

// ── Ejercicio activo y su índice en la lista ──────────────────────────────────
let ejercicioActual       = null;
let indiceEjercicioActual = null;

function obtenerEjercicios() {
    const datos = localStorage.getItem(CLAVE_STORAGE);
    return datos ? JSON.parse(datos) : [];
}

function guardarEnStorage(lista) {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(lista));
}

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

function cargarEjercicio() {
    const ejercicio = elegirEjercicioAleatorio();
    mostrarEjercicio(ejercicio, indiceEjercicioActual);
}

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

function consultaTieneSintaxisValida(sql) {
    if (typeof window.alasql === "undefined" || typeof window.alasql.parse !== "function") {
        return true;
    }

    try {
        window.alasql.parse(sql);
        return true;
    } catch (e) {
        return false;
    }
}

function enviarRespuesta() {
    const parrafoResultado = document.getElementById("resultado");
    const btnReintentar    = document.getElementById("btnReintentar");

    if (!ejercicioActual) return;

    const respuestaUsuario = document.getElementById("respuesta").value;

    if (respuestaUsuario.trim() === "") {
        parrafoResultado.textContent = "Por favor, escribe una consulta antes de enviar.";
        return;
    }

    const sintaxisValida = consultaTieneSintaxisValida(respuestaUsuario);

    const lista = obtenerEjercicios();
    if (indiceEjercicioActual !== null && lista[indiceEjercicioActual]) {
        if (sintaxisValida) {
            lista[indiceEjercicioActual].aciertos = (lista[indiceEjercicioActual].aciertos || 0) + 1;
        } else {
            lista[indiceEjercicioActual].fallos   = (lista[indiceEjercicioActual].fallos   || 0) + 1;
        }
        guardarEnStorage(lista);
        ejercicioActual = lista[indiceEjercicioActual];
        poblarSelector();
    }

    if (sintaxisValida) {
        parrafoResultado.textContent = "✅ Consulta enviada correctamente (sintaxis válida).";
        btnReintentar.style.display  = "none";
    } else {
        parrafoResultado.textContent = "❌ Tu consulta tiene un error de sintaxis SQL.";
        btnReintentar.style.display  = "inline";
    }
}

function borrarRespuesta() {
    document.getElementById("respuesta").value = "";
    document.getElementById("respuesta").focus();
}

function reintentar() {
    borrarRespuesta();
    document.getElementById("resultado").textContent       = "";
    document.getElementById("btnReintentar").style.display = "none";
}

function nuevoEjercicio() {
    poblarSelector();
    cargarEjercicio();
}

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

crearLightbox();
poblarSelector();
cargarEjercicio();
