# Guía Definitiva: Cómo iniciar tu Visor 3D y el Túnel

Para mostrar tu proyecto a otras personas en el futuro y que funcione de manera rápida y sin errores, debes seguir estos pasos. Necesitarás abrir **dos terminales/consolas** diferentes en VS Code o en tu computadora.

---

### Paso 1: Encender el Servidor de Producción (Consola 1)
Como quieres que la página cargue súper rápido en los teléfonos, debes encenderla en su versión optimizada (no en modo desarrollador).

1. Abre una terminal en VS Code (`Ctrl + ñ`).
2. Asegúrate de estar en la carpeta del proyecto (`act/blenderVisualizer`).
3. Ejecuta el siguiente comando para encender el servidor rápido:
   ```bash
   npm run start
   ```
*(Nota: Si hiciste cambios recientes en el código, antes de correr ese comando debes ejecutar `npm run build` una sola vez para actualizar la versión final).*

---

### Paso 2: Encender el Túnel (Consola 2)
Una vez que veas que el servidor dice "Ready in...", debes conectar ese servidor a internet.

1. Abre una **nueva pestaña** de terminal (dándole al botón de `+` en la consola de VS Code).
2. Ejecuta el comando mágico de LocalTunnel. Asegúrate de usar el puerto `3000` (que es el puerto donde arranca `npm start` por defecto) y tu nombre personalizado:
   ```bash
   npx -y localtunnel --port 3000 --subdomain visor-eon
   ```
3. Espera a que la consola te responda con:
   `your url is: https://visor-eon.loca.lt`

---

### Paso 3: ¡Mostrarlo!
Listo, ya puedes darle ese enlace a cualquier persona o abrirlo en tu teléfono.

**Consideraciones importantes:**
- Tu computadora debe mantenerse **encendida** y **conectada a internet**.
- No debes cerrar ni detener ninguna de las dos terminales mientras la gente esté viendo la página.
- Cuando termines de mostrarlo, simplemente ve a cada consola y presiona `Ctrl + C` para apagar todo.
- La primera vez que alguien entre al enlace, le aparecerá la página de seguridad de LocalTunnel, solo diles que hagan clic en el botón **"Click to Continue"**.
