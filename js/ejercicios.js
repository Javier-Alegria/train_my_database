/*
*****************************************************************************************************************
CREATOR: Javier Alegría Sobrados
last modified on: 13/03/2026 | 03-13-2026

PROJECT: WEB FOR PRACTICE OF DATABASES

FUNCTION: 
Implements the exercise management interface of the MySQL quiz system, allowing users to create, preview images, save, delete, and reset exercises stored in localStorage.

It also initializes default exercises, renders the list with statistics, and includes a lightbox viewer for exercise images.
*****************************************************************************************************************
*/

// ── Clave usada en localStorage ───────────────────────────────────────────────
const CLAVE_STORAGE = "ejerciciosMySQL";

// ── Imagen base64 pendiente de guardar ────────────────────────────────────────
let imagenPendiente = null;

// ── Ejercicios por defecto ────────────────────────────────────────────────────
const ejerciciosPorDefecto = [
    {
        titulo:    "SELECT básico",
        enunciado: "Selecciona todos los registros de la tabla 'usuarios'.",
        respuesta: "SELECT * FROM usuarios",
        imagen:    null,
        aciertos:  0,
        fallos:    0
    },
    {
        titulo:    "SELECT con columnas específicas",
        enunciado: "Selecciona solo el nombre y el email de la tabla 'usuarios'.",
        respuesta: "SELECT nombre, email FROM usuarios",
        imagen:    null,
        aciertos:  0,
        fallos:    0
    },
    {
        titulo:    "SELECT con WHERE",
        enunciado: "Selecciona todos los usuarios cuyo campo 'activo' sea igual a 1.",
        respuesta: "SELECT * FROM usuarios WHERE activo = 1",
        imagen:    null,
        aciertos:  0,
        fallos:    0
    }
];

// ── Obtener / guardar ejercicios ──────────────────────────────────────────────
function obtenerEjercicios() {
    const datos = localStorage.getItem(CLAVE_STORAGE);
    return datos ? JSON.parse(datos) : [];
}

function guardarEnStorage(lista) {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(lista));
}

// ── Inicializar ───────────────────────────────────────────────────────────────
function inicializar() {
    const lista = obtenerEjercicios();
    if (lista.length === 0) guardarEnStorage(ejerciciosPorDefecto);
    renderizarLista();
}

// ── Renderizar lista ──────────────────────────────────────────────────────────
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

        // Imagen con estilos inline para garantizar que no se superpone con el texto
        const imagenHtml = ejercicio.imagen
            ? `<img
                src="${ejercicio.imagen}"
                alt="Imagen del ejercicio"
                onclick="abrirLightbox(this.src)"
                style="display:block; width:100%; max-height:200px; object-fit:contain;
                       border-radius:8px; border:1px solid #1e3a5a; background:#060e1b;
                       margin-top:0.75rem; margin-bottom:0.75rem;
                       cursor:zoom-in; transition: opacity 0.15s;"
                onmouseover="this.style.opacity='0.85'"
                onmouseout="this.style.opacity='1'">`
            : "";

        html += `
        <div>
            <strong>
                ${ejercicio.titulo || "Sin título"}
                <span style="color: green;">(${aciertos})</span>
                <span style="color: red;">(${fallos})</span>
            </strong>
            ${imagenHtml}
            <p><em>Enunciado:</em> ${ejercicio.enunciado}</p>
            <p><em>Respuesta correcta:</em> <code>${ejercicio.respuesta}</code></p>
            <div class="ejercicio-buttons">
                <button onclick="eliminarEjercicio(${indice})">Eliminar</button>
                <button onclick="resetearContadores(${indice})">Resetear contadores</button>
            </div>
        </div>
        `;
    });

    contenedor.innerHTML = html;
}

// ── Formulario ────────────────────────────────────────────────────────────────
function mostrarFormulario() {
    document.getElementById("formulario").style.display      = "block";
    document.getElementById("mensajeFormulario").textContent = "";
    document.getElementById("inputTitulo").value             = "";
    document.getElementById("inputEnunciado").value          = "";
    document.getElementById("inputRespuesta").value          = "";
    quitarImagen();
}

function cancelarFormulario() {
    document.getElementById("formulario").style.display = "none";
    quitarImagen();
}

// ── Previsualizar imagen seleccionada ─────────────────────────────────────────
function previsualizarImagen(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    if (archivo.size > 1.5 * 1024 * 1024) {
        document.getElementById("mensajeFormulario").textContent =
            "⚠️ La imagen es grande (+1.5MB). Puede ocupar mucho espacio. Considera usar una más pequeña.";
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        imagenPendiente = e.target.result;

        const preview         = document.getElementById("previsualizacion");
        preview.src           = imagenPendiente;
        preview.style.display = "block";

        document.getElementById("fileLabel").textContent         = "✅ " + archivo.name;
        document.getElementById("btnQuitarImagen").style.display = "inline-block";
    };
    reader.readAsDataURL(archivo);
}

// ── Quitar imagen del formulario ──────────────────────────────────────────────
function quitarImagen() {
    imagenPendiente = null;
    document.getElementById("inputImagen").value              = "";
    document.getElementById("previsualizacion").style.display = "none";
    document.getElementById("previsualizacion").src           = "";
    document.getElementById("fileLabel").textContent          = "📎 Haz clic para adjuntar una imagen";
    document.getElementById("btnQuitarImagen").style.display  = "none";
    document.getElementById("mensajeFormulario").textContent  = "";
}

// ── Guardar ejercicio ─────────────────────────────────────────────────────────
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
    lista.push({ titulo, enunciado, respuesta, imagen: imagenPendiente, aciertos: 0, fallos: 0 });

    try {
        guardarEnStorage(lista);
    } catch (e) {
        mensaje.textContent = "❌ Error: no hay espacio suficiente. Intenta con una imagen más pequeña.";
        return;
    }

    mensaje.textContent = "✅ Ejercicio guardado correctamente.";
    renderizarLista();

    setTimeout(function() {
        cancelarFormulario();
    }, 1000);
}

// ── Eliminar ejercicio ────────────────────────────────────────────────────────
function eliminarEjercicio(indice) {
    const lista = obtenerEjercicios();
    lista.splice(indice, 1);
    guardarEnStorage(lista);
    renderizarLista();
}

// ── Resetear contadores ───────────────────────────────────────────────────────
function resetearContadores(indice) {
    const lista            = obtenerEjercicios();
    lista[indice].aciertos = 0;
    lista[indice].fallos   = 0;
    guardarEnStorage(lista);
    renderizarLista();
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

// ── Iniciar ───────────────────────────────────────────────────────────────────
crearLightbox();
inicializar();
