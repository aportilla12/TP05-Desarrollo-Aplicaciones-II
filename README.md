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
