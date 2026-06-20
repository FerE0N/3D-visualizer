# Guía Definitiva: Tecnologías, Configuración y Hosting (Túnel)

Este documento explica las tecnologías detrás del Visor 3D y los pasos exactos para configurarlo, encenderlo y compartirlo en internet directamente desde tu propia computadora.

---

## 🛠️ 1. Tecnologías Utilizadas

Esta aplicación fue construida utilizando un ecosistema moderno enfocado en la web y los gráficos 3D:

- **Frontend (Interfaz):** 
  - **Next.js (React):** Framework principal para renderizar la página, generar rutas y optimizar cargas.
  - **Tailwind CSS / Vanilla CSS:** Para los estilos visuales, efectos "Glassmorphism" y el diseño responsivo en móviles.
- **Gráficos 3D:**
  - **Three.js:** Motor base para renderizar gráficos WebGL en el navegador.
  - **React Three Fiber (R3F) & Drei:** Librerías que nos permiten usar Three.js dentro de componentes de React, manejando cámaras, mallas, luces y controles orbitales de manera declarativa.
- **Backend (API interna):**
  - **Next.js API Routes:** Crea los puentes (`/api/convert`) para procesar las peticiones del usuario.
  - **Python & Blender (Headless):** Se usa un script de Python ejecutado en el fondo mediante el ejecutable oculto de tu Blender local. Transforma formatos pesados como `.blend`, `.stl` u `.obj` a `.glb` para la web.
- **Redes y Hosting:**
  - **LocalTunnel:** Herramienta Node.js para crear un túnel seguro que expone nuestro puerto local a una URL pública de internet sin necesidad de abrir puertos en el router o modificar el Firewall.

---

## ⚙️ 2. Configuración Previa de Seguridad (Importante)

Por defecto, Next.js en modo desarrollo bloquea las pantallas (mostrando una pantalla estática en blanco o un error en consola) si detecta que la URL no es `localhost`. Para permitir que el dominio del túnel funcione, siempre debe existir un archivo llamado `next.config.mjs` en la raíz del proyecto.

**Contenido de `next.config.mjs`:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lista blanca de dominios permitidos para saltarse la seguridad
  allowedDevOrigins: ['visor-eon.loca.lt', 'localhost:3000', 'localhost:3001']
};
export default nextConfig;
```
*Asegúrate de que la URL que vayas a pedir en LocalTunnel esté en esa lista.*

---

## 🚀 3. Pasos para Mostrar tu Proyecto (Encender el Túnel)

Necesitarás abrir **dos terminales/consolas** diferentes en VS Code o en tu computadora.

### Paso A: Encender el Servidor de Producción (Consola 1)
Para que la página cargue súper rápido en los teléfonos, debes encenderla en su versión optimizada.

1. Abre una terminal en VS Code (`Ctrl + ñ`).
2. Ejecuta el comando de compilación (Solo es necesario si modificaste el código recientemente):
   ```bash
   npm run build
   ```
3. Enciende el servidor definitivo:
   ```bash
   npm run start
   ```
*(Asegúrate de ver en qué puerto inició. Normalmente será el `3000`. Si hay conflicto con otras apps como Grafana, podría iniciar en el `3001`).*

### Paso B: Encender el Túnel (Consola 2)
1. Abre una **nueva pestaña** de terminal (botón `+` en la consola de VS Code).
2. Ejecuta el comando de LocalTunnel apuntando al puerto donde arrancó el paso anterior (Ej. 3000) y tu subdominio:
   ```bash
   npx -y localtunnel --port 3000 --subdomain visor-eon
   ```
3. Espera a que la consola te responda con:
   `your url is: https://visor-eon.loca.lt`

### Paso C: ¡Mostrarlo!
El enlace ya es público y funcional en todo el mundo. 
- Tu computadora debe mantenerse **encendida** y **conectada a internet**.
- No debes cerrar ni detener ninguna de las dos terminales.
- La primera vez que alguien abra el enlace desde otra red, LocalTunnel le pedirá confirmar seguridad; indícales que presionen el botón azul **"Click to Continue"**.

---

## 🩹 Solución de Problemas (Troubleshooting)

- **"El puerto 3000 me dice Bad Gateway"**: Asegúrate de que tu `npm start` realmente se ejecutó en el puerto 3000. Si tienes aplicaciones como **Grafana** instaladas, estas secuestran el puerto 3000 en segundo plano. En ese caso, `npm start` abrirá en el `3001` y deberás usar `--port 3001` en tu comando de LocalTunnel.
- **"Quiero liberar el puerto 3000 y da Acceso Denegado"**: Si Grafana tiene bloqueado tu puerto, abre la aplicación **Servicios (Services)** de Windows, busca "Grafana" en la lista, haz clic derecho y dale a **Detener**.
- **La página carga en el teléfono pero no puedo mover el modelo**: Significa que el JavaScript no cargó por seguridad. Revisa que el dominio que te dio LocalTunnel esté exactamente escrito dentro del archivo `next.config.mjs`.
