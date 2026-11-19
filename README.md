# NutriCore
Tienda académica en Node.js. Ejecutar `node server.cjs` y abrir http://127.0.0.1:8025.

Microkernel: server.cjs contiene catálogo, registro, validación y suma de importes. plugins/*.js implementan las promociones. La UI presenta combos y el panel técnico está plegado al pie.

Contrato: id, name, description, bundle (IDs del catálogo), badge, apply({items,subtotal}) → {discounts:{id:importe},reason}. Una promoción por carrito. El registro descubre archivos .js sin editar el núcleo. Extensiones de confianza en el mismo proceso, sin sandbox.

El carrito conserva su selección en localStorage. El servidor es la autoridad del cálculo; los precios por línea muestran importes originales y finales. Las imágenes externas son referenciales, pueden diferir del catálogo y requieren conexión. Fuentes y referencias enlazadas al pie de la tienda. Sin pagos reales.

Pruebas HTTP: shaker con proteína y 2 shakers = S/154; proteína+creatina+vitaminas con combo = S/232.04; dos aisladas con 15% = S/423.30; proteína sola sin alcanzar umbral = S/129; proteína+shaker sin promoción = S/154. Totales coinciden con la suma de líneas.
# Mejoras de la demostración

Abre http://127.0.0.1:8025/ y el panel http://127.0.0.1:8025/admin.
Arranque desde esta carpeta: `node server.cjs`.

- **Núcleo:** `quote()` en `server.cjs` valida catálogo, cantidades, descuentos y costo de entrega. Suma productos menos descuentos más envío.
- **Contrato:** promociones usan `apply({items,subtotal})` y devuelven `{discounts,reason}`. Entregas declaran `type:'shipping'`, reciben `{items,subtotal,total}` y devuelven `{cost,reason}`. Los módulos necesitan un ID y una función `apply`.
- **Registro:** `registry()` descubre archivos de `plugins/`, carga sus exportaciones y consulta `plugin-state.json`. Los módulos anteriores sin `type` pertenecen a `promotion`.
- **Plugins:** combo, shaker y volumen calculan descuentos. Estándar cobra S/12, exprés S/22 y recojo S/0. Son tarifas y plazos ficticios.

El panel guarda la activación por ID en `plugin-state.json`. Al volver a la ventana de la tienda se actualiza el catálogo. Una selección desactivada se limpia. El servidor rechaza invocar un plugin inactivo aunque el cliente envíe su ID directamente.

La sección técnica bajo la tienda muestra ocho pasos de la última cotización. Es una traza explicativa generada por el núcleo, no un historial persistente ni una medición de rendimiento. Las cotizaciones comparativas de promociones no reemplazan esa traza visible.

## Demo recomendada
1. Agrega el combo proteína + creatina: S/208 menos S/24.96 = S/183.04.
2. Selecciona exprés: total S/205.04.
3. Abre `/admin` y desactiva exprés.
4. Vuelve a la tienda: exprés desaparece y la selección se limpia. Productos y promoción permanecen. Sin entrega seleccionada el total representa solo productos.
5. Selecciona estándar: total S/195.04.
6. Abre el recorrido técnico y explica la resolución de ambos plugins.
7. Reactiva exprés al terminar para dejar la demo lista.

El panel es exclusivamente local, sin autenticación. No exponer a Internet como administración de producción. No se procesan pedidos, pagos ni entregas reales. Los plugins comparten proceso y requieren confianza.

