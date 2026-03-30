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

function agregarAlCarrito(nombre, precio) {
    carrito.push({ nombre, precio });
    
    // Calcular el total
    const total = carrito.reduce((sum, item) => sum + item.precio, 0);
    
    // Actualizar y mostrar el botón principal de Telegram
    tg.MainButton.setText(`PEDIR TOTAL: $${total.toFixed(2)}`);
    if (!tg.MainButton.isVisible) {
        tg.MainButton.show();
    }
}

// 2. Escuchar el evento de clic en el Botón Principal de Telegram
tg.onEvent('mainButtonClicked', function() {
    // Crear un resumen del pedido
    const nombresProductos = carrito.map(item => item.nombre).join(", ");
    const totalPedido = carrito.reduce((sum, item) => sum + item.precio, 0);
    
    const datosParaElBot = {
        productos: nombresProductos,
        total: totalPedido,
        timestamp: new Date().getTime()
    };

    // 3. Enviar los datos al Bot y cerrar la Mini App
    // IMPORTANTE: stringify convierte el objeto en texto para que el bot lo lea
    tg.sendData(JSON.stringify(datosParaElBot));
});

// Opcional: Avisar a Telegram que la app está lista para mostrarse
tg.ready();