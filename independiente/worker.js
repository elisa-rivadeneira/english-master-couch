// English Master Coach · servidor INDEPENDIENTE (Cloudflare Workers, plan gratis)
// Pega este archivo completo en tu Worker. Solo necesita un secreto: GOOGLE_TTS_API_KEY.
// Opcional (Variables): VOCES = "en-US-Neural2-F,en-US-Neural2-D,en-GB-Neural2-B"  (lista separada por comas)

const VOCES_DEFECTO = "en-US-Neural2-F,en-US-Neural2-D,en-US-Neural2-C,en-US-Neural2-J,en-GB-Neural2-B";
const MAX_CARACTERES = 300;

const TOOLS = [
  {
    name: "generar_audio",
    description:
      "Convierte una frase corta en inglés (máximo 300 caracteres) en audio MP3 para los ejercicios de escucha. " +
      "velocidad entre 0.7 y 1.3.",
    inputSchema: {
      type: "object",
      properties: {
        texto: { type: "string" },
        voz_id: { type: "string", default: "af_heart" },
        velocidad: { type: "number", default: 0.95 },
      },
      required: ["texto"],
    },
  },
  {
    name: "preparar_audios",
    description: "Recibe las frases de la lección nueva. En el modo independiente los audios se piden al abrir la app.",
    inputSchema: { type: "object", properties: { frases: { type: "array", items: { type: "string" } } }, required: ["frases"] },
  },
  ...["registrar_practica", "mi_progreso", "fijar_compromiso", "iniciar_sesion", "tiempo_restante", "registrar_evaluacion"].map((name) => ({
    name,
    description: "No disponible en el modo independiente (sin registro ni reloj de servidor).",
    inputSchema: { type: "object", properties: {}, additionalProperties: true },
  })),
];

const SIN_REGISTRO =
  "Modo independiente: aquí no hay registro de práctica ni reloj de servidor. Sigue sin esta herramienta: " +
  "para la duración de la conversación usa la hora actual si tienes esa herramienta o pregunta cuántos minutos quiere practicar.";

async function elegirVoz(texto, env) {
  const lista = (env.VOCES || VOCES_DEFECTO).split(",").map((s) => s.trim()).filter(Boolean);
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto)));
  let n = 0;
  for (const b of h.slice(0, 4)) n = n * 256 + b;      // misma frase, misma voz siempre
  return lista[n % lista.length];
}

async function audioGoogle(texto, velocidad, env) {
  if (!env.GOOGLE_TTS_API_KEY) throw new Error("Falta el secreto GOOGLE_TTS_API_KEY en el Worker.");
  const nombre = await elegirVoz(texto, env);
  const r = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": env.GOOGLE_TTS_API_KEY },
    body: JSON.stringify({
      input: { text: texto },
      voice: { languageCode: nombre.split("-").slice(0, 2).join("-"), name: nombre },
      audioConfig: { audioEncoding: "MP3", speakingRate: velocidad },
    }),
  });
  if (!r.ok) throw new Error("Google respondió " + r.status + ": " + (await r.text()).slice(0, 200));
  const j = await r.json();
  if (!j.audioContent) throw new Error("Google no devolvió audio.");
  return j.audioContent; // ya viene en base64
}

async function llamar(name, args, env) {
  if (name === "generar_audio") {
    const texto = String(args.texto || "").trim();
    if (!texto) return { content: [{ type: "text", text: "No se pudo generar el audio: texto vacío." }] };
    if (texto.length > MAX_CARACTERES) return { content: [{ type: "text", text: `No se pudo generar el audio: máximo ${MAX_CARACTERES} caracteres.` }] };
    const vel = Math.min(1.3, Math.max(0.7, Number(args.velocidad) || 0.95));
    try {
      return { content: [{ type: "audio", data: await audioGoogle(texto, vel, env), mimeType: "audio/mpeg" }] };
    } catch (e) {
      return { content: [{ type: "text", text: "No se pudo generar el audio: " + e.message }] };
    }
  }
  if (name === "preparar_audios") return { content: [{ type: "text", text: "Listo. En el modo independiente los audios se generan al abrir la app." }] };
  if (TOOLS.some((t) => t.name === name)) return { content: [{ type: "text", text: SIN_REGISTRO }] };
  return null;
}

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS" };
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", ...CORS } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (url.pathname === "/salud") return new Response("ok", { headers: CORS });
    if (url.pathname !== "/mcp") return new Response("English Master Coach · servidor independiente. El conector está en /mcp", { headers: CORS });
    if (request.method === "GET" || request.method === "DELETE") return new Response("Método no permitido", { status: 405, headers: CORS });

    let msg;
    try { msg = await request.json(); } catch { return json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "JSON inválido" } }, 400); }
    const lote = Array.isArray(msg);
    const respuestas = [];
    for (const m of lote ? msg : [msg]) {
      if (m.id === undefined) continue; // notificaciones: sin respuesta
      let result;
      if (m.method === "initialize") {
        result = {
          protocolVersion: (m.params && m.params.protocolVersion) || "2025-03-26",
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: "Registro Ingles", version: "1.0.0" },
        };
      } else if (m.method === "ping") result = {};
      else if (m.method === "tools/list") result = { tools: TOOLS };
      else if (m.method === "tools/call") {
        const out = await llamar(m.params && m.params.name, (m.params && m.params.arguments) || {}, env);
        if (!out) { respuestas.push({ jsonrpc: "2.0", id: m.id, error: { code: -32602, message: "Herramienta desconocida" } }); continue; }
        result = out;
      } else { respuestas.push({ jsonrpc: "2.0", id: m.id, error: { code: -32601, message: "Método no encontrado" } }); continue; }
      respuestas.push({ jsonrpc: "2.0", id: m.id, result });
    }
    if (!respuestas.length) return new Response(null, { status: 202, headers: CORS });
    return json(lote ? respuestas : respuestas[0]);
  },
};
