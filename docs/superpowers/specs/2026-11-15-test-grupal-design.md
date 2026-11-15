# Test grupal de temperamentos

Adaptar el HTML existente para registrar un número variable de personas y responder las 48 afirmaciones por rondas: cada pregunta aparece una vez y todas las personas responden antes de continuar.

Se conserva la identidad visual, las afirmaciones, los cuatro perfiles, las doce combinaciones, el cálculo individual y las exportaciones. Los PDF aportan el contexto de perfiles primarios y secundarios; no se convierte el ejercicio educativo en un instrumento validado.

Se empieza con un participante, según la aclaración del usuario. Agregar persona amplía el grupo sin un máximo artificial; Quitar permite reducirlo hasta una persona. Los nombres deben estar completos y ser distintos. Los participantes se registran antes de comenzar.

Una pantalla muestra la pregunta, la escala, una fila por persona, el contador de respuestas y Anterior/Siguiente. Se bloquea avanzar si falta alguien. Volver conserva respuestas. La última ronda conduce a resultados individuales y grupales para todos los registrados.

Se guarda el progreso localmente y se recuperan avances antiguos de seis personas sin perder respuestas, comenzando por la primera pregunta pendiente del grupo. Se validan datos recuperados y se comunica un fallo de almacenamiento.

Enfoque: conservar el archivo autónomo en vez de introducir un framework o servidor. Una tabla de todo el cuestionario exigiría desplazamientos innecesarios; la ronda por pregunta coincide con la dinámica solicitada.
