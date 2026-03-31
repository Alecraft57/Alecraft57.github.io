// 1. Inicializar la WebApp de Telegram
const tg = window.Telegram.WebApp;

// Expandir la app para que use toda la pantalla disponible
tg.expand();

// Personalizar el botón principal de Telegram (el de abajo)
tg.MainButton.text = "ENVIAR PEDIDO";
tg.MainButton.textColor = "#FFFFFF";
tg.MainButton.color = "#2cab37"; // Un color verde para el botón

// Mostrar el nombre del usuario
if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
    document.getElementById('username').innerText = tg.initDataUnsafe.user.first_name;
}

let carrito = [];

function vaciarCarrito() {
    // 1. Preguntar al usuario antes de borrar (opcional pero recomendado)
    if (confirm("¿Seguro que quieres vaciar el carrito?")) {
        carrito = []; // Limpiamos el array
        
        // 2. Feedback táctil (vibración de aviso)
        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('warning');
        }

        // 3. Ocultamos el botón de vaciar y el MainButton de Telegram
        document.getElementById('btn-vaciar').style.display = 'none';
        tg.MainButton.hide();
        
        alert("Carrito vaciado");
    }
}

// MODIFICACIÓN: Actualiza tu función agregarAlCarrito para que muestre el botón de vaciar
function agregarAlCarrito(nombre, precio) {
    carrito.push({ nombre, precio });
    
    // Mostramos el botón de "Vaciar" solo si hay algo en el carrito
    document.getElementById('btn-vaciar').style.display = 'block';

    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }

    actualizarInterfaz();
}

function actualizarInterfaz() {
    if (carrito.length === 0) {
        tg.MainButton.hide();
        return;
    }

    const total = carrito.reduce((sum, item) => sum + item.precio, 0);
    
    // Actualizamos el texto del botón con el número de productos
    tg.MainButton.setText(`VER PEDIDO (${carrito.length}) - $${total.toFixed(2)}`);
    
    if (!tg.MainButton.isVisible) {
        tg.MainButton.show();
    }
}

// Evento al hacer clic en el botón verde de abajo
tg.onEvent('mainButtonClicked', function() {
    // 3. Agrupar productos para que el mensaje sea legible
    // Ejemplo: { "Combo Simple": 2, "Patatas": 1 }
    const conteo = {};
    carrito.forEach(item => {
        conteo[item.nombre] = (conteo[item.nombre] || 0) + 1;
    });

    // Convertir el objeto a un texto bonito: "2x Combo Simple, 1x Patatas"
    const resumenTexto = Object.entries(conteo)
        .map(([nombre, cantidad]) => `${cantidad}x ${nombre}`)
        .join(", ");

    const totalPedido = carrito.reduce((sum, item) => sum + item.precio, 0);
    
    const datosParaElBot = {
        resumen: resumenTexto,
        total: totalPedido.toFixed(2),
        cantidad_items: carrito.length
    };

    // 4. Enviar y cerrar
    tg.sendData(JSON.stringify(datosParaElBot));
});
