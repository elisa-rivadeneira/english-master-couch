# Servidor independiente (Cloudflare, plan gratis)

Para quien quiere su propio conector de audio, sin depender de nadie.
Hace solo una cosa: convertir las frases de los ejercicios en audio con voces Neural2 de Google, usando TU cuenta de Google.

Estado: probado en local con Google simulado. Pendiente probar en un Worker real, con Google real y conectado desde Claude.

## Pasos (borrador para la clase)
1. Google Cloud: crear proyecto, activar la API «Cloud Text-to-Speech», crear una clave de API (restringida a esa API). Puede pedir tarjeta para la cuenta de facturación.
2. Cloudflare: crear cuenta gratis, Workers y Pages → Crear → Worker → pegar `worker.js` → Implementar.
3. En el Worker: Configuración → Variables y secretos → agregar el SECRETO `GOOGLE_TTS_API_KEY` con tu clave.
4. Probar: abrir `https://TU-WORKER.workers.dev/salud` (debe decir «ok»).
5. Claude: Conectores → agregar conector personalizado → nombre exacto `Registro Ingles`, URL `https://TU-WORKER.workers.dev/mcp`.
6. Abrir la app, crear una lección y escuchar un ejercicio.

## Notas
- Voces: variable opcional `VOCES` con nombres separados por coma (ver la lista de voces de Google). Solo Neural2 entra en el millón gratis mensual de Google (a confirmar en la página de precios).
- No hay registro de práctica, panel ni reloj: esas herramientas responden con un aviso y el coach sigue sin ellas.
- Plan gratis de Cloudflare: 100,000 pedidos por día y 10 ms de CPU por pedido (según su documentación). Falta medir el CPU real de este Worker.
