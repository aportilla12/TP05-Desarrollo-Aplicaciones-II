# TP05 - Desarrollo de Aplicaciones II

Dashboard web para visualizar en tiempo real la telemetría de robots Unitree.

El proyecto fue desarrollado para la materia **Desarrollo de Aplicaciones II**.

El dashboard funciona utilizando el simulador provisto por la universidad y está preparado para utilizar la misma API con un robot Unitree real, modificando únicamente la dirección IP del backend.

---

## Funcionalidades

El dashboard muestra en tiempo real:

- Estado de conexión con el robot.
- Nivel de batería.
- Orientación mediante Roll, Pitch y Yaw.
- Indicador visual de Yaw.
- Aceleración en los ejes X, Y y Z.
- Ángulo, velocidad, torque y temperatura de cada motor.
- Indicadores de temperatura mediante colores.
- Gráfico histórico del ángulo del motor seleccionado.
- Selector para visualizar los distintos motores.
- Estado de apoyo de las cuatro patas del Go2.
- Tiempo de simulación.
- Cantidad de motores detectados.

La información se actualiza mediante **WebSocket**, permitiendo recibir telemetría continuamente sin tener que consultar manualmente la API.

También se implementó reconexión automática en caso de que se interrumpa la conexión WebSocket.

---

## Robots soportados

El dashboard está preparado para trabajar con los dos robots disponibles:

### Unitree Go2

- 12 motores.
- Visualización del estado de las cuatro patas.
- Telemetría de motores, IMU y batería.

### Unitree G1

- 29 motores.
- Telemetría de motores, IMU y batería.
- La sección de apoyo de patas se oculta automáticamente.

El modelo del robot se obtiene mediante el endpoint `/info`.

---

## Estructura del proyecto

```text
TP05-Desarrollo-Aplicaciones-II/
│
├── README.md
│
└── mi_dashboard/
    │
    ├── index.html
    │
    ├── css/
    │   └── styles.css
    │
    └── js/
        ├── config.js
        └── app.js
```

### `index.html`

Contiene la estructura del dashboard y los componentes utilizados para mostrar la telemetría.

### `styles.css`

Contiene los estilos y la distribución visual del dashboard.

### `config.js`

Contiene la configuración de conexión con el backend.

### `app.js`

Contiene la lógica principal:

- conexión WebSocket;
- recepción de telemetría;
- actualización de la interfaz;
- gráfico de motores;
- detección del modelo;
- actualización del estado de las patas;
- reconexión automática.

---

## Configuración

La dirección del backend se configura en:

```text
mi_dashboard/js/config.js
```

Ejemplo:

```javascript
const ROBOT_IP = "10.0.2.15";
const ROBOT_PORT = "8001";

const API_URL = `http://${ROBOT_IP}:${ROBOT_PORT}`;

const WS_URL = `ws://${ROBOT_IP}:${ROBOT_PORT}/ws`;
```

La IP debe coincidir con la dirección indicada por el backend al iniciar el simulador.

Por ejemplo:

```text
TU DASHBOARD tiene que pegarle a:

http://10.0.2.15:8001
```

Para utilizar otra instancia del simulador o el robot real, solamente es necesario modificar `ROBOT_IP`.

---

## Ejecución (en LINUX)

### 1. Iniciar el simulador

Desde el TP05 del repositorio provisto por la universidad:

```bash
./INICIAR_TP05.sh
```

Seleccionar el robot:

```text
1 - Unitree G1
2 - Unitree Go2
```

El simulador iniciará el backend y mostrará su dirección IP.

La ventana del simulador debe permanecer abierta mientras se utiliza el dashboard.

---

### 2. Configurar la IP

Editar:

```text
mi_dashboard/js/config.js
```

y colocar la IP indicada por el backend:

```javascript
const ROBOT_IP = "10.0.2.15";
```

---

### 3. Iniciar el dashboard

Desde la carpeta `mi_dashboard`:

```bash
cd mi_dashboard
python3 -m http.server 8080
```

Luego abrir en el navegador:

```text
http://localhost:8080
```

---

## API utilizada

El backend del TP expone los siguientes endpoints:

| Endpoint | Descripción |
|---|---|
| `GET /telemetria` | Telemetría completa |
| `GET /motores` | Información de los motores |
| `GET /imu` | Orientación y aceleración |
| `GET /bms` | Información de batería |
| `GET /fuerzas` | Estado de apoyo de las patas |
| `GET /info` | Información del robot |
| `WS /ws` | Telemetría en tiempo real |

El dashboard utiliza principalmente el WebSocket `/ws`, que permite recibir actualizaciones aproximadamente 10 veces por segundo.

---

## Visualización de motores

Para cada motor se muestran:

- nombre;
- ángulo en grados;
- velocidad en rad/s;
- torque en Nm;
- temperatura en °C.

También se incluye un gráfico que mantiene un historial reciente del ángulo del motor seleccionado.

Las temperaturas se representan visualmente mediante diferentes colores para facilitar su lectura.

Los umbrales de color utilizados son únicamente indicadores visuales del dashboard y no representan límites oficiales de seguridad del robot.

---

## Datos del simulador

El simulador utilizado en el TP genera tanto datos directos como datos derivados.

Entre los datos utilizados se encuentran:

- ángulo y velocidad de los motores;
- torque;
- temperatura;
- Roll, Pitch y Yaw;
- aceleración;
- batería;
- estado de apoyo de las patas.

Algunos valores del simulador son derivados o simulados y pueden diferir de las mediciones obtenidas al utilizar un robot real.

---

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- WebSocket
- Canvas API
- API REST
- Python HTTP Server para levantar el frontend

No se utilizaron frameworks ni librerías externas para la construcción del dashboard.

---


TP05 - Desarrollo de Aplicaciones II  
UADE

## Captura y exportación

El botón Capturar muestra guarda una copia completa de la última telemetría recibida.
Exportar CSV descarga las capturas con campos anidados como columnas y fecha de captura.
Las capturas permanecen en memoria durante la sesión; recargar la página las elimina.
El gráfico IMU conserva las últimas 100 muestras de roll, pitch y yaw.
El semáforo usa verde por debajo de 40 °C, amarillo de 40 a 60 °C inclusive y rojo por encima de 60 °C.

### Validación pendiente con el servidor de la cátedra

El Adapter acepta el formato del dashboard y el LowState de los archivos del simulador.
Convierte `bms.current` a corriente en mA, `bms.temperature` a temperatura en °C
 y `bms.cell_vol` de mV a V. Para `imu.rpy` y `motor_state.q` convierte radianes a grados.
La integración completa requiere el puente FastAPI y una prueba con el simulador.
El orden de `foot_force` se interpreta como FR, FL, RR, RL; verificarlo con el backend de la cátedra.

## Apariencia del dashboard

El botón con luna (activar oscuro) o sol (activar claro) cambia la paleta de la interfaz y de los gráficos.
La elección se guarda en el navegador; sin elección previa se usa el tema del sistema.
La interfaz adapta tarjetas, controles y tablas a pantallas pequeñas.
El aviso superior distingue espera, recepción de datos y reconexión.

## Patrones de integración

- **Adapter — `telemetria-adapter.js`:** convierte mensajes del backend o LowState a un contrato uniforme. Los valores ausentes quedan como `null`; la interfaz muestra `--`.
- **Observer — `telemetria-observable.js`:** administra suscriptores y devuelve una función para cancelar la suscripción. Aísla errores de cada observador.
- **Facade — `telemetria-servicio.js`:** ofrece `conectar()`, `desconectar()`, `suscribir()` y `suscribirEstado()`. Gestiona WebSocket, reconexión, validación y distribución de datos.

Flujo: WebSocket → ServicioTelemetria → TelemetriaAdapter → TelemetriaObservable → dashboard y capturas.
El navegador sigue necesitando un puente HTTP/WebSocket; estos patrones no convierten el socket TCP del simulador en WebSocket.
Las fuerzas ausentes se indican sin datos y los valores positivos representan contacto.
Las capturas conservan tanto los campos originales como los normalizados.

El panel de apoyos se adapta al modelo: G1 muestra `L_foot` y `R_foot`;
Go2 muestra FR, FL, RR y RL. Los datos ausentes se indican como sin datos.

## Gráficos interactivos

Los gráficos permiten inspeccionar una muestra pasando el cursor o tocando el área de trazado.
La medición aparece debajo del gráfico con el tiempo del backend y la unidad.
También se pueden recorrer muestras con las flechas del teclado al enfocar el gráfico.
Cada gráfico tiene una pausa independiente: congela la visualización, pero no detiene
la recepción de telemetría ni la captura de muestras. Al reanudar muestra las últimas 100 muestras.
El selector del motor permite elegir ángulo, velocidad, torque o temperatura.
Al cambiar de variable se reanuda el gráfico; al cambiar de motor se inicia un historial nuevo.
Las casillas permiten ocultar o mostrar series IMU, ajustando la escala a las visibles.
Se muestran mínimo, máximo y promedio de los datos visibles; los valores ausentes se excluyen.
La implementación usa Canvas y no requiere librerías externas.

## Nombres de motores en la interfaz

La tabla y el selector muestran descripciones en español de las articulaciones G1 y Go2.
El identificador técnico original se conserva en la ayuda al pasar el cursor y en los datos exportados.
Los nombres no reconocidos se muestran sin cambios. Histórico IMU, Roll, Pitch y Yaw mantienen sus nombres.

## Integrantes

- Agustina Altea Portilla
- Wanda Schafer