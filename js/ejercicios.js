// ── Clave usada en localStorage ───────────────────────────────────────────────
const CLAVE_STORAGE = "ejerciciosMySQL";

// ── Ejercicios por defecto (se cargan solo si localStorage está vacío) ────────
const ejerciciosPorDefecto = [
    {
        titulo:    "SELECT básico",
        enunciado: "Selecciona todos los registros de la tabla 'usuarios'.",
        respuesta: "SELECT * FROM usuarios",
        aciertos:  0,
        fallos:    0
    },
    {
        titulo:    "SELECT con columnas específicas",
        enunciado: "Selecciona solo el nombre y el email de la tabla 'usuarios'.",
        respuesta: "SELECT nombre, email FROM usuarios",
        aciertos:  0,
        fallos:    0
    },
    {
        titulo:    "SELECT con WHERE",
        enunciado: "Selecciona todos los usuarios cuyo campo 'activo' sea igual a 1.",
        respuesta: "SELECT * FROM usuarios WHERE activo = 1",
        aciertos:  0,
        fallos:    0
    }
];

// ── Obtener ejercicios desde localStorage ─────────────────────────────────────
function obtenerEjercicios() {
    const datos = localStorage.getItem(CLAVE_STORAGE);
    return datos ? JSON.parse(datos) : [];
}

// ── Guardar ejercicios en localStorage ────────────────────────────────────────
function guardarEnStorage(lista) {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(lista));
}

// ── Cargar ejercicios por defecto si no hay ninguno guardado ──────────────────
function inicializar() {
    const lista = obtenerEjercicios();
    if (lista.length === 0) {
        guardarEnStorage(ejerciciosPorDefecto);
    }
    renderizarLista();
}

// ── Mostrar la lista de ejercicios en el HTML ─────────────────────────────────
function renderizarLista() {
    const contenedor = document.getElementById("listaEjercicios");
    const lista      = obtenerEjercicios();

    if (lista.length === 0) {
        contenedor.innerHTML = "<p>No hay ejercicios guardados todavía.</p>";
        return;
    }

    let html = "";
    lista.forEach(function(ejercicio, indice) {
        const aciertos = ejercicio.aciertos || 0;
        const fallos   = ejercicio.fallos   || 0;

        html += `
        <div>
            <strong>
                ${ejercicio.titulo || "Sin título"}
                <span style="color: green;">(${aciertos})</span>
                <span style="color: red;">(${fallos})</span>
            </strong>
            <p><em>Enunciado:</em> ${ejercicio.enunciado}</p>
            <p><em>Respuesta correcta:</em> <code>${ejercicio.respuesta}</code></p>
            <div class="ejercicio-buttons">
                <button onclick="eliminarEjercicio(${indice})">Eliminar</button>
                <button onclick="resetearContadores(${indice})">Resetear contadores</button>
            </div>
            <hr>
        </div>
        `;
    });

    contenedor.innerHTML = html;
}

// ── Mostrar el formulario de nuevo ejercicio ──────────────────────────────────
function mostrarFormulario() {
    document.getElementById("formulario").style.display      = "block";
    document.getElementById("mensajeFormulario").textContent = "";
    document.getElementById("inputTitulo").value             = "";
    document.getElementById("inputEnunciado").value          = "";
    document.getElementById("inputRespuesta").value          = "";
}

// ── Cancelar y ocultar el formulario ─────────────────────────────────────────
function cancelarFormulario() {
    document.getElementById("formulario").style.display = "none";
}

// ── Guardar un ejercicio nuevo ────────────────────────────────────────────────
function guardarEjercicio() {
    const titulo    = document.getElementById("inputTitulo").value.trim();
    const enunciado = document.getElementById("inputEnunciado").value.trim();
    const respuesta = document.getElementById("inputRespuesta").value.trim();
    const mensaje   = document.getElementById("mensajeFormulario");

    if (titulo === "" || enunciado === "" || respuesta === "") {
        mensaje.textContent = "Por favor, rellena el título, el enunciado y la respuesta.";
        return;
    }

    const lista = obtenerEjercicios();
    lista.push({ titulo, enunciado, respuesta, aciertos: 0, fallos: 0 });
    guardarEnStorage(lista);

    mensaje.textContent = "✅ Ejercicio guardado correctamente.";
    renderizarLista();

    setTimeout(function() {
        cancelarFormulario();
    }, 1000);
}

// ── Eliminar un ejercicio por su índice ───────────────────────────────────────
function eliminarEjercicio(indice) {
    const lista = obtenerEjercicios();
    lista.splice(indice, 1);
    guardarEnStorage(lista);
    renderizarLista();
}

// ── Resetear los contadores de un ejercicio ───────────────────────────────────
function resetearContadores(indice) {
    const lista          = obtenerEjercicios();
    lista[indice].aciertos = 0;
    lista[indice].fallos   = 0;
    guardarEnStorage(lista);
    renderizarLista();
}

// ── Iniciar al cargar la página ───────────────────────────────────────────────
inicializar();