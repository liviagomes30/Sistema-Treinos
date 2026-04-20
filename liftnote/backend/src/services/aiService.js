const sessionRepository = require("../repositories/sessionRepository");
const logRepository = require("../repositories/logRepository");
const workoutExerciseRepository = require("../repositories/workoutExerciseRepository");
const workoutRepository = require("../repositories/workoutRepository");
const exerciseCatalogRepository = require("../repositories/exerciseCatalogRepository");
const AppError = require("../utils/AppError");
const logger = require("../config/logger");

class AIService {
  async _callAnthropic(prompt, maxTokens = 512) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      logger.error({ err }, "Erro na API Anthropic");
      throw new AppError("Erro ao chamar a IA. Tente novamente.", 502);
    }

    const data = await response.json();
    return data.content?.[0]?.text || "Não foi possível gerar a análise.";
  }

  _displayName(we) {
    if (!we) return "Exercício desconhecido";
    if (we.custom_name) return we.custom_name;
    return we.exercise_catalog_id?.name || "Exercício desconhecido";
  }

  async analyzeSession(sessionId, userId) {
    const session = await sessionRepository.findOneWithDetails(sessionId, userId);

    if (!session) {
      throw new AppError("Sessão não encontrada", 404);
    }
    if (session.status !== "completed") {
      throw new AppError("A sessão precisa estar finalizada para análise", 400);
    }

    const logs = await logRepository.getLogsBySessionId(sessionId);

    if (!logs.length) {
      throw new AppError("Nenhum registro encontrado nesta sessão", 400);
    }

    const grouped = {};
    for (const log of logs) {
      const name = this._displayName(log.workout_exercise_id);
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push({
        serie: log.set_number,
        reps: log.reps_done,
        peso: log.weight_used_kg,
      });
    }

    const workoutName = session.workout_id?.name || "Treino";
    const duration = session.duration_seconds
      ? `${Math.floor(session.duration_seconds / 60)} minutos`
      : "duração não registrada";

    let exerciseSummary = "";
    for (const [name, sets] of Object.entries(grouped)) {
      const setsText = sets
        .map((s) => `    Série ${s.serie}: ${s.reps} reps × ${s.peso}kg`)
        .join("\n");
      exerciseSummary += `\n  ${name}:\n${setsText}`;
    }

    const prompt = `Você é um personal trainer experiente analisando o desempenho de um aluno.

Treino realizado: ${workoutName}
Duração: ${duration}

Exercícios e séries executados:
${exerciseSummary}

Com base nesses dados, forneça uma análise motivadora e objetiva em português com:
1. Pontos positivos do treino
2. Sugestões de melhoria (carga, volume ou técnica)
3. Recomendação para o próximo treino

Seja direto, use no máximo 200 palavras e mantenha um tom encorajador.`;

    const aiSummary = await this._callAnthropic(prompt, 512);

    session.ai_summary = aiSummary;
    // Usamos validateBeforeSave: false pois estamos apenas atualizando o resumo da IA
    await session.save({ validateBeforeSave: false });

    return { ai_summary: aiSummary };
  }

  async analyzeProgress(catalogId, userId) {
    const catalog = await exerciseCatalogRepository.findOne({
      _id: catalogId,
      $or: [{ is_system: true }, { created_by_user_id: userId }],
    });

    if (!catalog) {
      throw new AppError("Exercício do catálogo não encontrado", 404);
    }

    const workoutIds = await workoutRepository.findByUserId(userId).then(ws => ws.map(w => w._id));
    
    // Simplificando a busca de workoutExerciseIds usando o repositório de logs que já tem essa lógica
    const workoutExerciseIds = await logRepository.getWorkoutExerciseIdsByCatalogId(catalogId, workoutIds);

    if (!workoutExerciseIds.length) {
      throw new AppError("Nenhum treino do usuário usa este exercício", 400);
    }

    // Buscamos apenas logs de sessões completadas
    const logs = await logRepository.getLogsHistory(workoutExerciseIds, userId);
    const filtered = logs.filter(l => l.session_id.status === "completed");

    if (filtered.length < 2) {
      throw new AppError("São necessários ao menos 2 registros para análise de progresso", 400);
    }

    const historyText = filtered
      .map((l) => {
        const date = new Date(l.session_id.started_at).toLocaleDateString("pt-BR");
        return `  ${date} — Série ${l.set_number}: ${l.reps_done} reps × ${l.weight_used_kg}kg`;
      })
      .join("\n");

    const prompt = `Você é um personal trainer analisando a evolução de um aluno no exercício "${catalog.name}" (${catalog.muscle_group}).

Histórico de execuções (mais recente primeiro):
${historyText}

Forneça uma análise de progressão em português com:
1. Tendência de evolução (carga, volume, consistência)
2. Se o aluno está progredindo adequadamente
3. Sugestão de carga para a próxima sessão

Seja objetivo, use no máximo 150 palavras.`;

    const analysis = await this._callAnthropic(prompt, 400);

    return { exercise: catalog.name, analysis };
  }
}

module.exports = new AIService();
