# Job Stories — MVP Demo Funcional

> **"El portfolio que muestra cómo creces, no solo qué has construido."**

Esta es una **demo funcional e interactiva** del MVP de **Job Stories**, construida siguiendo las especificaciones, decisiones de arquitectura y flujos de negocio definidos en la documentación técnica del proyecto.

La aplicación es una Single Page Application (SPA) con un diseño oscuro premium, micro-animaciones fluidas y persistencia de datos en `localStorage`, lo que permite probar todas sus características en tiempo real de forma autónoma.

---

## 🚀 Características Clave Implementadas

1. **Autenticación SSO Simulada (GitHub / Google)**:
   - Pantalla de inicio con propuesta de valor.
   - Flujo animado e interactivo de autorización OAuth de GitHub/Google mediante popups modales realistas.
2. **Formulario de Registro de Aprendizaje**:
   - Campos estructurados basados en la narrativa de crecimiento: *¿Qué intenté hacer?*, *¿Qué falló/salió mal?*, y *¿Qué aprendí o qué cambiaría?*.
   - Sistema dinámico de etiquetas de habilidades y stack tecnológico (pills autocompletables por entrada).
   - Control granular de visibilidad por entrada (*Público*, *Privado*, *Enlace compartido*).
3. **Línea de Tiempo Visual Interactiva**:
   - Representación visual del crecimiento técnico del desarrollador.
   - Buscador por texto libre y chips de filtrado dinámico por habilidades (skills).
   - Nodos clasificados automáticamente con colores e iconos adaptados al stack tecnológico.
4. **Registro de Auditoría Inmutable (ACID Ledger)**:
   - Panel de control de integridad que muestra en tiempo real un log criptográfico simulado (SHA-256) de transacciones.
   - Cualquier creación, modificación o borrado se registra y calcula un nuevo hash.
   - Las Job Stories muestran distintivos de auditoría (*"Creado (Verificado)"* o *"Editado N veces"*) para garantizar la credibilidad del portfolio ante los reclutadores (evitando manipulaciones de historial).
5. **Vista de Reclutador (Perfil Público)**:
   - Alternancia de vista para simular la experiencia de un reclutador externo.
   - Oculta entradas privadas del editor.
   - Permite filtrar la línea de tiempo para ver la velocidad de aprendizaje y evolución en tecnologías específicas.
6. **Exportación a PDF**:
   - Botón de exportación integrado que utiliza una hoja de estilos CSS optimizada para impresión (`@media print`), transformando la timeline web en un currículum físico limpio, libre de menús de control o botones interactivos.

---

## 🛠️ Cómo Ejecutar la Demo Localmente

Dado que es una Single Page Application pura de cliente (HTML5, CSS3, Javascript Vanilla), **no requiere compilación ni instalación de dependencias pesadas**. Se puede ejecutar directamente levantando cualquier servidor estático local.

### Opción 1: Usando Python (Recomendada)
Si tienes Python instalado, ejecuta este comando en la raíz del proyecto:
```bash
python3 -m http.server 8080
```
Luego abre en tu navegador: [http://localhost:8080](http://localhost:8080)

### Opción 2: Usando Node/NPM (Live Server)
Puedes iniciar la demo usando `npx`:
```bash
npx live-server
```
Se abrirá automáticamente el navegador en la dirección del servidor estático.

---

## 📐 Trade-offs del MVP Representados en la Demo

- **SSO Externo vs Auth Propia**: La demo simula el registro directo delegando la identidad en GitHub/Google, acelerando el onboarding del usuario tech sin almacenar contraseñas.
- **Integridad y Credibilidad vs Libertad de Edición**: Para mitigar el riesgo de que los reclutadores desconfíen de portfolios fabricados (R-02), la app implementa el log inmutable. El usuario puede editar, pero se registra en el ledger público de la entrada indicando cuántas modificaciones ha sufrido.