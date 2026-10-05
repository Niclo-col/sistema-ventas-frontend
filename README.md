# IMPRESIONES LUIPE C.A. - Sistema de Ventas & Inventario

Sistema de punto de venta (POS), inventario y analítica desarrollado en **React** con **TypeScript**, **Tailwind CSS**, **Recharts** y **Lucide Icons**, replicando fielmente los mockups de FlutterFlow y desacoplado mediante variables de entorno para conectarse con la API de backend en Render.

---

## 🌐 Configuración Desacoplada de la API (.env)

El proyecto utiliza una variable de entorno en el archivo [`.env`](file:///c:/Users/JuanCamilo.Gonzalez/Documents/impresiones%20luipe/.env) para comunicarse con la API:

```env
VITE_API_URL=https://sistema-ventas-backend-8j2f.onrender.com
```

---

## 🔐 Credenciales del Sistema

El sistema cuenta con validación de roles diferenciando **Administrador** y **Vendedor**:

| Rol | Usuario / Correo | Contraseña / PIN |
| :--- | :--- | :--- |
| **Administrador** | `ADMIN` / `admin@impresionesluipe.com` | `changeme123` |
| **Vendedor** | `SELLER` / `vendedor@impresionesluipe.com` | `changeme123` |

> En la pantalla de login también dispones de botones de **Acceso Rápido Autorizado** para alternar con un solo clic.

---

## 🚀 Funcionalidades Desarrolladas

### 1. Autenticación & Control de Acceso
- Pantalla de login según el diseño del mockup con degradado púrpura/índigo, logo de **Impresiones LUIPE C.A.**, campo de usuario/correo, PIN/clave con botón para mostrar/ocultar contraseña, y recuperación de clave.
- Manejo de tokens JWT (`Bearer`) con soporte de rotación mediante `/api/auth/refresh`.
- Conmutador rápido de roles en la barra superior para evaluar fácilmente ambas interfaces.

---

### 2. Tablero de Operaciones del Vendedor
Acceso a 3 opciones principales:

1. **Registrar una venta (Punto de Venta / POS):**
   - Catálogo de productos scroleable clasificado por categorías (*Bebidas, Postres, Sándwiches & Comida, Golosinas, Quincallería*).
   - Buscador rápido por nombre o código de barras (SKU).
   - Carrito de compras (*Pedido*) con control de cantidades (+ / -), subtotal y total en USD y Bolívares (Bs) a tasa BCV.
   - **Checkout Completo:**
     - Selección de pago en **Efectivo** o **Tarjeta / Punto**.
     - En efectivo: selector de divisa de pago ($ o Bs), atajos de billetes ($5, $10, $20, $50, $100), botón "Monto exacto", y cálculo automático en tiempo real del **Vuelto / Cambio a devolver** en ambas monedas.
     - En tarjeta: registro de número de referencia de la transacción.
   - **Ventana de Venta Exitosa:**
     - Confirmación visual con animación de confeti y resumen de la venta.
     - Botón **"Hacer otra venta"** (reinicia el carrito y continúa en el POS).
     - Botón **"Volver al menú de opciones del vendedor"** (regresa al menú principal).
     - Botón **"Ver e imprimir recibo"** (abre el ticket fiscal térmico imprimible).

2. **Ver registro / Historial de ventas:**
   - Visualización de órdenes completadas con fecha, hora, cliente, método de pago e importe.
   - Botón para ver y reimprimir el ticket/recibo de venta.
   - Botón flotante `+ Nueva venta`.

3. **Ver listado de precios (Inventario):**
   - Vista de solo lectura para el vendedor (no permite crear, editar ni borrar).
   - Filtros por categoría, conteo de stock disponible y precios en USD y Bs.

---

### 3. Tablero de Administrador
Acceso a las 4 áreas de gestión:

1. **Dashboard (Panel de Analítica):**
   - Filtros de tiempo: *Hoy*, *Ayer*, *Últimos 7 días*, *Mensual*.
   - Tarjetas de métricas: Ingresos totales con % de crecimiento, cantidad de ventas/transacciones, ticket promedio y artículos totales vendidos.
   - **Gráfico de Histórico de Ingresos:** Comparativa temporal con curva de área (`AreaChart`).
   - **Gráfico de Ventas por Categorías:** Gráfico de dona (`PieChart`) con porcentajes de distribución y leyenda.
   - **Top de Productos Vendidos:** Lista ranqueada con unidades vendidas, ingresos y barras de progreso proporcionales.

2. **Inventario (CRUD Completo):**
   - Visualización con buscador y filtros.
   - Botón **"+ Agregar producto"** con modal para registrar nombre, categoría, precio en USD (con equivalente en Bs), código de barras / SKU, unidades en stock y descripción.
   - Edición de productos existentes.
   - Eliminación lógica (*soft delete*) con confirmación.

3. **Historial de ventas:**
   - Auditoría de todas las ventas realizadas en el negocio con buscador y reimpresión de recibos.

4. **Configuración:**
   - Gestión de **Impresores y scanners** (Star TSP100, Epson TM-T88VI, Zebra ZD421) con opción de agregar nuevos dispositivos en red, bluetooth o USB.
   - **Tasa de cambio oficial BCV:** sincronización con el endpoint `/api/exchange-rates/sync` y ajuste manual de tasa.
   - Opciones activables: *Imprimir automáticamente los recibos*, *Duplicar pantalla para clientes*, *Sonidos de escáner*.
   - **Registro de conectividad:** monitoreo de estado y medición de latencia en vivo contra el backend en Render.

---

## 🛠️ Comandos de Ejecución

```bash
# Iniciar servidor de desarrollo en http://localhost:5173
npm run dev

# Compilar para producción (TypeScript + Vite)
npm run build

# Previsualizar compilación de producción
npm run preview
```
