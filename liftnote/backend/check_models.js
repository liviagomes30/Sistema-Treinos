/**
 * Cole sua GEMINI_API_KEY abaixo e rode:  node check_models.js
 * Vai listar todos os modelos disponíveis para sua chave.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "COLE_SUA_CHAVE_AQUI";

async function listModels(version) {
  const url = `https://generativelanguage.googleapis.com/${version}/models?key=${GEMINI_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    console.log(`[${version}] ERRO ${res.status}:`, data.error?.message);
    return [];
  }

  const models = data.models || [];
  console.log(`\n[${version}] ${models.length} modelos encontrados:`);
  models.forEach((m) => {
    const supports = (m.supportedGenerationMethods || []).join(", ");
    console.log(`  • ${m.name.replace("models/", "")}  →  ${supports}`);
  });
  return models;
}

async function testModel(version, model, apiKey) {
  const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Diga apenas: OK" }] }],
      generationConfig: { maxOutputTokens: 10 },
    }),
  });
  const data = await res.json();
  if (res.ok) {
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "sem resposta";
    console.log(`  ✅ ${model} (${version}): ${text.trim()}`);
    return true;
  } else {
    console.log(
      `  ❌ ${model} (${version}): ${res.status} — ${data.error?.message?.slice(0, 60)}`,
    );
    return false;
  }
}

async function main() {
  if (GEMINI_API_KEY === "COLE_SUA_CHAVE_AQUI") {
    console.error("⚠️  Defina GEMINI_API_KEY no ambiente:");
    console.error("    GEMINI_API_KEY=sua_chave node check_models.js");
    process.exit(1);
  }

  console.log("🔍 Listando modelos disponíveis para sua chave...\n");

  const v1Models = await listModels("v1");
  const betaModels = await listModels("v1beta");

  // Filtra modelos que suportam generateContent
  const allGenerative = [...v1Models, ...betaModels]
    .filter((m) =>
      (m.supportedGenerationMethods || []).includes("generateContent"),
    )
    .map((m) => ({
      name: m.name.replace("models/", ""),
      version: m.name.startsWith("models/") ? "v1" : "v1beta",
    }));

  if (!allGenerative.length) {
    console.log("\n⚠️  Nenhum modelo com generateContent encontrado.");
    return;
  }

  console.log("\n🧪 Testando modelos com generateContent...");
  for (const { name } of allGenerative.slice(0, 5)) {
    for (const ver of ["v1", "v1beta"]) {
      const ok = await testModel(ver, name, GEMINI_API_KEY);
      if (ok) break;
    }
  }
}

main().catch(console.error);
