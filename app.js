// 1. Inicializar la WebApp de Telegram
const tg = window.Telegram.WebApp;

// Expandir la app para que use toda la pantalla disponible
tg.expand();

// Personalizar el botón principal de Telegram
tg.MainButton.text = "VER PEDIDO";
tg.MainButton.textColor = "#FFFFFF";
tg.MainButton.color = "#2cab37";

// Mostrar el nombre del usuario
if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
    document.getElementById('username').innerText = tg.initDataUnsafe.user.first_name;
}

let carrito = [];

// --- FUNCIONES DE CARRITO ---

function agregarAlCarrito(nombre, precio) {
    carrito.push({ nombre, precio });
    
    // Mostramos el botón de "Vaciar" en el menú
    document.getElementById('btn-vaciar').style.display = 'block';

    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }

    actualizarInterfaz();
}

function vaciarCarrito() {
    if (confirm("¿Seguro que quieres vaciar el carrito?")) {
        carrito = [];
        
        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('warning');
        }

        document.getElementById('btn-vaciar').style.display = 'none';
        tg.MainButton.hide();
        cerrarModal(); // Por si acaso estuviera abierto
    }
}

function actualizarInterfaz() {
    if (carrito.length === 0) {
        tg.MainButton.hide();
        return;
    }

    const total = carrito.reduce((sum, item) => sum + item.precio, 0);
    tg.MainButton.setText(`VER PEDIDO (${carrito.length}) - $${total.toFixed(2)}`);
    
    if (!tg.MainButton.isVisible) {
        tg.MainButton.show();
    }
}

// --- LÓGICA DEL MODAL (RESUMEN) ---

// Al pulsar el botón verde de Telegram, abrimos el resumen
tg.onEvent('mainButtonClicked', function() {
    mostrarResumen();
});

function mostrarResumen() {
    const listaDiv = document.getElementById('lista-resumen');
    const totalSpan = document.getElementById('total-modal');
    listaDiv.innerHTML = ""; // Limpiar antes de rellenar

    // Agrupar productos: "2x Combo Simple"
    const conteo = {};
    carrito.forEach(item => {
        conteo[item.nombre] = (conteo[item.nombre] || 0) + 1;
    });

    // Rellenar la lista del modal
    for (const [nombre, cantidad] of Object.entries(conteo)) {
        listaDiv.innerHTML += `<p style="margin: 5px 0;">✅ <strong>${cantidad}x</strong> ${nombre}</p>`;
    }

    const total = carrito.reduce((sum, item) => sum + item.precio, 0);
    totalSpan.innerText = `$${total.toFixed(2)}`;

    // Mostrar modal y ocultar el botón de abajo para que no se superponga
    document.getElementById('modal-confirmacion').style.display = 'flex';
    tg.MainButton.hide();
}

function cerrarModal() {
    document.getElementById('modal-confirmacion').style.display = 'none';
    // Si todavía hay cosas en el carrito, volvemos a mostrar el botón de ver pedido
    if (carrito.length > 0) {
        tg.MainButton.show();
    }
}

// --- ENVÍO FINAL ---

function confirmarYEnviar() {
    // Agrupamos los datos una última vez para el bot
    const conteo = {};
    carrito.forEach(item => {
        conteo[item.nombre] = (conteo[item.nombre] || 0) + 1;
    });

    const resumenTexto = Object.entries(conteo)
        .map(([nombre, cantidad]) => `${cantidad}x ${nombre}`)
        .join(", ");

    const totalPedido = carrito.reduce((sum, item) => sum + item.precio, 0);
    
    const datosParaElBot = {
        resumen: resumenTexto,
        total: totalPedido.toFixed(2),
        cantidad_items: carrito.length
    };

    // Esto cierra la Mini App y manda los datos al servidor de Telegram
    tg.sendData(JSON.stringify(datosParaElBot));
}

// Avisar a Telegram que la app está lista
tg.ready();
