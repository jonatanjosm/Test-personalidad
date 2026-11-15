# Test grupal Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan.

**Goal:** Participantes dinámicos y una pregunta por ronda para todo el grupo.
**Architecture:** Mantener index.html autónomo y su puntuación. Sustituir los índices persona/página por un índice de pregunta; conservar respuestas por participante.
**Tech Stack:** HTML, CSS, JavaScript; Node test runner y Playwright para verificar.
**Spec:** ../specs/2026-11-15-test-grupal-design.md

## Global Constraints
- Un campo inicial, mínimo una persona y sin máximo artificial.
- Conservar 48 afirmaciones, perfiles, combinaciones y puntuación.
- Sin servicios externos en ejecución.

## Review Focus
- Eliminar una persona intermedia mantiene nombres y respuestas alineados.
- El avance antiguo puede tener varias personas completas y otras sin empezar.
- Nombres con caracteres HTML se muestran como texto.
- Guardado inválido o almacenamiento bloqueado no rompe la evaluación.
- Grupos grandes y pantallas móviles no deben desbordar horizontalmente.

### Task 1: Participantes y rondas
- [x] Escribir y ejecutar pruebas de agregar/quitar, validación, rondas y regreso; comprobar que fallen en el código original.
- [x] Actualizar registro, renderizado y navegación en index.html sin alterar RAW, DETAILS ni COMBOS.
- [x] Hacer dinámicos resultados y exportaciones.

### Task 2: Persistencia y verificación
- [x] Probar recarga, migración del formato anterior, resultados/exportaciones para grupos variables y datos inválidos.
- [x] Implementar carga validada, migración y mensajes de guardado.
- [x] Ejecutar la suite completa, inspeccionar escritorio/móvil y actualizar README con uso y verificación.

## Verificación

Suite ejecutada con npm test: registro desde una persona, grupos de 2, 6, 7, 8 y 25; rondas completas, avance antiguo, almacenamiento bloqueado, exportaciones y vista móvil. Revisión independiente: sin defectos materiales; se corrigió la visibilidad del aviso de guardado en el registro.
