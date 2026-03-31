// 1. Inicializar la WebApp de Telegram
const tg = window.Telegram.WebApp;
tg.expand();

// Personalizar el botón principal de Telegram
tg.MainButton.text = "VER PEDIDO";
tg.MainButton.textColor = "#FFFFFF";
tg.MainButton.color = "#2cab37";

// Mostrar el nombre del usuario
if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
    document.getElementById('username').innerText = tg.initDataUnsafe.user.first_name;
}

let carrito = {};

// --- VINCULACIÓN CRÍTICA ---
// Esta línea es la que hace que al pulsar el botón verde se abra el resumen
tg.onEvent('mainButtonClicked', function() {
    mostrarResumen();
});

function agregarAlCarrito(nombre, precio) {
    if (carrito[nombre]) {
        carrito[nombre].cantidad += 1;
    } else {
        carrito[nombre] = { precio: precio, cantidad: 1 };
    }
    
    document.getElementById('btn-vaciar').style.display = 'block';
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    actualizarInterfaz();
}

function actualizarInterfaz() {
    const items = Object.values(carrito);
    const totalCantidad = items.reduce((sum, i) => sum + i.cantidad, 0);
    const totalDinero = items.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);

    if (totalCantidad === 0) {
        tg.MainButton.hide();
        document.getElementById('btn-vaciar').style.display = 'none';
        return;
    }

    tg.MainButton.setText(`VER PEDIDO (${totalCantidad}) - $${totalDinero.toFixed(2)}`);
    if (!tg.MainButton.isVisible) tg.MainButton.show();
}

function cambiarCantidad(nombre, delta) {
    if (!carrito[nombre]) return;
    carrito[nombre].cantidad += delta;

    if (carrito[nombre].cantidad <= 0) {
        delete carrito[nombre];
    }

    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    
    // Si borramos todo desde el modal, lo cerramos
    if (Object.keys(carrito).length === 0) {
        cerrarModal();
    } else {
        mostrarResumen(); 
    }
    actualizarInterfaz(); 
}

function mostrarResumen() {
    const listaDiv = document.getElementById('lista-resumen');
    const totalSpan = document.getElementById('total-modal');
    
    if (!listaDiv || !totalSpan) {
        console.error("No se encontraron los elementos del modal en el HTML");
        return;
    }

    listaDiv.innerHTML = "";
    const items = Object.entries(carrito);
    
    items.forEach(([nombre, datos]) => {
        listaDiv.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                <span style="color: #333;">${nombre}</span>
                <div style="display: flex; align-items: center;">
                    <button onclick="cambiarCantidad('${nombre}', -1)" style="width:30px; height:30px; background:#eee; border:none; border-radius:5px;">-</button>
                    <span style="margin: 0 10px; font-weight: bold; min-width: 20px; text-align: center;">${datos.cantidad}</span>
                    <button onclick="cambiarCantidad('${nombre}', 1)" style="width:30px; height:30px; background:#eee; border:none; border-radius:5px;">+</button>
                </div>
            </div>
        `;
    });

    const total = items.reduce((sum, [_, d]) => sum + (d.precio * d.cantidad), 0);
    totalSpan.innerText = `$${total.toFixed(2)}`;

    document.getElementById('modal-confirmacion').style.display = 'flex';
    tg.MainButton.hide(); // Ocultamos el botón de Telegram mientras el modal está abierto
}

// Función para cerrar el modal y volver al menú
function cerrarModal() {
    document.getElementById('modal-confirmacion').style.display = 'none';
    if (Object.keys(carrito).length > 0) {
        tg.MainButton.show();
    }
}

function confirmarYEnviar() {
    const items = Object.entries(carrito);
    if (items.length === 0) return;

    const resumenTexto = items.map(([nombre, d]) => `${d.cantidad}x ${nombre}`).join(", ");
    const totalPedido = items.reduce((sum, [_, d]) => sum + (d.precio * d.cantidad), 0);
    
    const datosParaElBot = {
        resumen: resumenTexto,
        total: totalPedido.toFixed(2)
    };

    tg.sendData(JSON.stringify(datosParaElBot));
}

function vaciarCarrito() {
    if (confirm("¿Seguro que quieres vaciar el carrito?")) {
        carrito = {};
        document.getElementById('btn-vaciar').style.display = 'none';
        tg.MainButton.hide();
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('warning');
        actualizarInterfaz();
    }
}
