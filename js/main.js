/*
// ── Clave compartida con ejercicios.js ───────────────────────────────────────
const CLAVE_STORAGE = "ejerciciosMySQL";

// ── Ejercicio activo y su índice en la lista ──────────────────────────────────
let ejercicioActual      = null;
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

// ── Poblar el <select> con los títulos de todos los ejercicios ────────────────
function poblarSelector() {
    const selector = document.getElementById("selectorEjercicios");
    const lista    = obtenerEjercicios();

    selector.innerHTML = '<option value="">-- Selecciona un ejercicio --</option>';

    lista.forEach(function(ejercicio, indice) {
        const opcion       = document.createElement("option");
        opcion.value       = indice;
        opcion.textContent = ejercicio.titulo || `Ejercicio ${indice + 1}`;
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

// ── Mostrar un ejercicio concreto en pantalla ─────────────────────────────────
function mostrarEjercicio(ejercicio, indice) {
    if (!ejercicio) return;

    ejercicioActual       = ejercicio;
    indiceEjercicioActual = indice;

    document.getElementById("enunciado").textContent = ejercicio.enunciado;

    borrarRespuesta();
    document.getElementById("resultado").textContent       = "";
    document.getElementById("btnReintentar").style.display = "none";
    document.getElementById("selectorEjercicios").value    = "";
}

// ── Cargar un nuevo ejercicio al azar ────────────────────────────────────────
function cargarEjercicio() {
    const ejercicio = elegirEjercicioAleatorio();
    // elegirEjercicioAleatorio ya actualiza indiceEjercicioActual internamente
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

// ── Normaliza un string para compararlo ──────────────────────────────────────
function normalizar(texto) {
    return texto
        .toLowerCase()
        .replace(/[\r\n\t]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
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

    const esCorrecta =
        normalizar(respuestaUsuario) === normalizar(ejercicioActual.respuesta);

    // ── Actualizar el contador correspondiente en localStorage ────────────────
    const lista = obtenerEjercicios();
    if (indiceEjercicioActual !== null && lista[indiceEjercicioActual]) {
        if (esCorrecta) {
            lista[indiceEjercicioActual].aciertos = (lista[indiceEjercicioActual].aciertos || 0) + 1;
        } else {
            lista[indiceEjercicioActual].fallos   = (lista[indiceEjercicioActual].fallos   || 0) + 1;
        }
        guardarEnStorage(lista);
        // Actualiza el objeto local también
        ejercicioActual = lista[indiceEjercicioActual];
    }

    if (esCorrecta) {
        parrafoResultado.textContent = "✅ ¡Correcto! Muy bien.";
        btnReintentar.style.display  = "none";
    } else {
        parrafoResultado.textContent = "❌ Incorrecto. Inténtalo de nuevo.";
        btnReintentar.style.display  = "inline";
    }
}

// ── Borrar el textarea de respuesta ──────────────────────────────────────────
function borrarRespuesta() {
    document.getElementById("respuesta").value = "";
    document.getElementById("respuesta").focus();
}

// ── Reintentar: limpia resultado pero mantiene el mismo ejercicio ─────────────
function reintentar() {
    borrarRespuesta();
    document.getElementById("resultado").textContent       = "";
    document.getElementById("btnReintentar").style.display = "none";
}

// ── Nuevo ejercicio al azar ───────────────────────────────────────────────────
function nuevoEjercicio() {
    poblarSelector();   // refresca el selector por si cambió algo
    cargarEjercicio();
}

// ── Iniciar al cargar la página ───────────────────────────────────────────────
poblarSelector();
cargarEjercicio();
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

// ── Poblar el <select> con títulos y contadores de todos los ejercicios ───────
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

// ── Mostrar un ejercicio concreto en pantalla ─────────────────────────────────
function mostrarEjercicio(ejercicio, indice) {
    if (!ejercicio) return;

    ejercicioActual       = ejercicio;
    indiceEjercicioActual = indice;

    document.getElementById("enunciado").textContent = ejercicio.enunciado;

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

// ── Normaliza un string para compararlo ──────────────────────────────────────
function normalizar(texto) {
    return texto
        .toLowerCase()
        .replace(/[\r\n\t]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
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

    const esCorrecta =
        normalizar(respuestaUsuario) === normalizar(ejercicioActual.respuesta);

    // ── Actualizar el contador en localStorage ────────────────────────────────
    const lista = obtenerEjercicios();
    if (indiceEjercicioActual !== null && lista[indiceEjercicioActual]) {
        if (esCorrecta) {
            lista[indiceEjercicioActual].aciertos = (lista[indiceEjercicioActual].aciertos || 0) + 1;
        } else {
            lista[indiceEjercicioActual].fallos   = (lista[indiceEjercicioActual].fallos   || 0) + 1;
        }
        guardarEnStorage(lista);
        ejercicioActual = lista[indiceEjercicioActual];
        poblarSelector(); // refresca el selector con los nuevos contadores
    }

    if (esCorrecta) {
        parrafoResultado.textContent = "✅ ¡Correcto! Muy bien.";
        btnReintentar.style.display  = "none";
    } else {
        parrafoResultado.textContent = "❌ Incorrecto. Inténtalo de nuevo.";
        btnReintentar.style.display  = "inline";
    }
}

// ── Borrar el textarea de respuesta ──────────────────────────────────────────
function borrarRespuesta() {
    document.getElementById("respuesta").value = "";
    document.getElementById("respuesta").focus();
}

// ── Reintentar: limpia resultado pero mantiene el mismo ejercicio ─────────────
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

// ── Iniciar al cargar la página ───────────────────────────────────────────────
poblarSelector();
cargarEjercicio();