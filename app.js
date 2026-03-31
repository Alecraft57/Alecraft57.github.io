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

let carrito = {};

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

// Funciones para el Modal (Sumar/Restar)
function cambiarCantidad(nombre, delta) {
    if (!carrito[nombre]) return;

    carrito[nombre].cantidad += delta;

    if (carrito[nombre].cantidad <= 0) {
        delete carrito[nombre];
    }

    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    
    mostrarResumen(); // Refrescar el modal
    actualizarInterfaz(); // Refrescar el botón de Telegram
}

function mostrarResumen() {
    const listaDiv = document.getElementById('lista-resumen');
    const totalSpan = document.getElementById('total-modal');
    listaDiv.innerHTML = "";

    const items = Object.entries(carrito);
    
    if (items.length === 0) {
        cerrarModal();
        return;
    }

    items.forEach(([nombre, datos]) => {
        listaDiv.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span>${nombre} ($${datos.precio.toFixed(2)})</span>
                <div>
                    <button onclick="cambiarCantidad('${nombre}', -1)" style="padding: 5px 10px;">-</button>
                    <span style="margin: 0 10px; font-weight: bold;">${datos.cantidad}</span>
                    <button onclick="cambiarCantidad('${nombre}', 1)" style="padding: 5px 10px;">+</button>
                </div>
            </div>
        `;
    });

    const total = items.reduce((sum, [_, d]) => sum + (d.precio * d.cantidad), 0);
    totalSpan.innerText = `$${total.toFixed(2)}`;

    document.getElementById('modal-confirmacion').style.display = 'flex';
    tg.MainButton.hide();
}

// Actualizamos la función de envío para que use la nueva estructura
function confirmarYEnviar() {
    const items = Object.entries(carrito);
    const resumenTexto = items.map(([nombre, d]) => `${d.cantidad}x ${nombre}`).join(", ");
    const totalPedido = items.reduce((sum, [_, d]) => sum + (d.precio * d.cantidad), 0);
    
    const datosParaElBot = {
        resumen: resumenTexto,
        total: totalPedido.toFixed(2)
    };

    tg.sendData(JSON.stringify(datosParaElBot));
}
