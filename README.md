# Test de personalidad: los cuatro temperamentos

Autoevaluación educativa grupal de 48 afirmaciones, con resultados individuales para los cuatro temperamentos y sus doce combinaciones.

## Uso

Abre `index.html` en un navegador; funciona como archivo autónomo, sin instalar dependencias ni conectar un servidor.

1. Pulsa **Registrar participantes**. El registro empieza con una persona.
2. Usa **Agregar persona** o **Quitar** para ajustar el grupo (mínimo una persona). Escribe un nombre, apodo o código distinto para cada participante.
3. Inicia la evaluación. Cada pantalla contiene **una pregunta para todas las personas**, con una escala individual de 1 a 5. Cada afirmación incluye una descripción detallada y un escenario cotidiano de ejemplo para ayudar a comprenderla.
4. Cuando todos hayan respondido, pulsa **Siguiente pregunta**. Puedes regresar con **Anterior** sin perder respuestas.
5. Tras la pregunta 48, consulta los resultados individuales y la comparación grupal. Puedes imprimirlos, descargar respuestas y resultados en JSON o exportar el resumen en CSV.

El avance se guarda automáticamente en el navegador. Al volver a abrirlo, pulsa **Continuar donde quedamos**. También se recuperan avances de la versión anterior de seis personas: se conservan las respuestas y se retoma la primera pregunta pendiente del grupo. Para borrar los datos, usa **Borrar datos y reiniciar** en resultados.

Las respuestas no se envían a un servidor. Si el navegador bloquea el almacenamiento local, la aplicación lo indica; conserva la pestaña abierta para continuar con las respuestas de esa sesión.

## Contexto

Basado en el contexto de *Los 4 temperamentos* (páginas 18–24) y *Las 12 combinaciones temperamentales* (páginas 27–39). Esta adaptación conserva las 48 afirmaciones, las descripciones y la puntuación del proyecto original. El cuestionario es una actividad educativa; no es una prueba psicométrica validada ni un diagnóstico.

## Verificación para desarrollo

Requiere Node.js 20 o superior y Google Chrome instalado. Las dependencias son solo para las pruebas, no para usar la aplicación.

```sh
npm ci
npm test
```

Las pruebas abren Chrome sin interfaz y comprueban el registro variable, las rondas completas, la validación, la navegación, la persistencia y su migración, los resultados, las exportaciones y el diseño móvil.

Para capturar la pantalla de pregunta en escritorio y móvil:

```sh
CAPTURE_SCREENSHOTS=1 npm test
```

Las capturas se escriben en `test-results/` (excluido de Git).
