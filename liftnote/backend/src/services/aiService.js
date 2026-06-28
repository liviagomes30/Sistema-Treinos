const sessionRepository = require("../repositories/sessionRepository");
const logRepository = require("../repositories/logRepository");
const workoutRepository = require("../repositories/workoutRepository");
const exerciseCatalogRepository = require("../repositories/exerciseCatalogRepository");
const AppError = require("../utils/AppError");
const logger = require("../config/logger");

class AIService {
  static MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
  ];

  async callGeminiWithFallback(prompt, maxTokens = 512) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new AppError("GEMINI_API_KEY não configurada no .env", 500);
    }

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    for (const model of AIService.MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

      for (let attempt = 1; attempt <= 2; attempt++) {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const parts = data.candidates?.[0]?.content?.parts || [];
          const text = parts.map((p) => p.text || "").join("").trim();
          if (text) {
            logger.info({ model, parts: parts.length }, "Gemini respondeu com sucesso");
            return text;
          }
        }

        const errBody = await response.json().catch(() => ({}));
        const status = response.status;

        if (status === 429) {
          const retryDelay = errBody?.error?.details?.find((d) => d.retryDelay)?.retryDelay;
          const waitMs = retryDelay
            ? parseInt(retryDelay) * 1000
            : attempt === 1 ? 5000 : 0;

          logger.warn(
            { model, attempt, waitMs },
            `Gemini 429 — ${attempt === 1 ? `aguardando ${waitMs / 1000}s` : "trocando modelo"}`,
          );

          if (attempt === 1 && waitMs > 0 && waitMs <= 10000) {
            await sleep(waitMs);
            continue;
          }
          break;
        }

        logger.error({ errBody, model, status }, "Erro na API Gemini");
        break;
      }
    }

    throw new AppError(
      "Serviço de IA temporariamente indisponível. Tente novamente em alguns minutos.",
      503,
    );
  }

  getExerciseDisplayName(we) {
    if (!we) return "Exercício desconhecido";
    if (we.custom_name) return we.custom_name;
    return we.exercise_catalog_id?.name || "Exercício desconhecido";
  }

  formatDurationToMinutes(seconds) {
    if (!seconds) return "duração não registrada";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}min${s > 0 ? ` ${s}s` : ""}`;
  }

  aggregateSessionLogs(logs) {
    const grouped = {};
    let totalVolume = 0;
    for (const log of logs) {
      const name = this.getExerciseDisplayName(log.workout_exercise_id);
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push({ serie: log.set_number, reps: log.reps_done, peso: log.weight_used_kg });
      totalVolume += log.reps_done * log.weight_used_kg;
    }
    return { grouped, totalVolume };
  }

  buildExerciseSummaryText(grouped) {
    let summary = "";
    for (const [name, sets] of Object.entries(grouped)) {
      const setsText = sets
        .map((s) => `    Série ${s.serie}: ${s.reps} reps × ${s.peso}kg`)
        .join("\n");
      summary += `\n  ${name}:\n${setsText}`;
    }
    return summary;
  }

  buildSessionAnalysisPrompt(workoutName, duration, totalVolume, exerciseSummary) {
    return `Você é um personal trainer experiente analisando o desempenho de um aluno.

Treino: ${workoutName}
Duração: ${duration}
Volume total: ${Math.round(totalVolume)}kg

Exercícios realizados:${exerciseSummary}

Faça uma análise COMPLETA em português com 3 seções bem definidas:

**✅ Pontos positivos**
(O que o aluno fez bem neste treino — seja específico com os números)

**📈 Sugestões de melhoria**
(Carga, volume, execução — baseie-se nos dados reais acima)

**🎯 Recomendação para o próximo treino**
(O que focar, possível progressão de carga)

Seja direto, motivador e técnico. Use os dados reais dos exercícios. Máximo 200 palavras.`;
  }

  groupLogsBySession(logs) {
    const bySession = {};
    for (const log of logs) {
      const sid = log.session_id._id.toString();
      const date = new Date(log.session_id.started_at).toLocaleDateString("pt-BR");
      if (!bySession[sid]) bySession[sid] = { date, sets: [], maxWeight: 0, totalVolume: 0 };
      bySession[sid].sets.push({ set: log.set_number, reps: log.reps_done, weight: log.weight_used_kg });
      bySession[sid].maxWeight = Math.max(bySession[sid].maxWeight, log.weight_used_kg);
      bySession[sid].totalVolume += log.reps_done * log.weight_used_kg;
    }
    return bySession;
  }

  buildProgressHistoryText(bySession) {
    return Object.values(bySession)
      .map((s) => {
        const setsText = s.sets.map((st) => `${st.reps}×${st.weight}kg`).join(", ");
        return `  ${s.date}: [${setsText}] — Volume: ${Math.round(s.totalVolume)}kg, Carga máx: ${s.maxWeight}kg`;
      })
      .join("\n");
  }

  buildProgressAnalysisPrompt(exerciseName, muscleGroup, historyText) {
    return `Você é um personal trainer analisando a evolução de um aluno no exercício "${exerciseName}" (grupo muscular: ${muscleGroup}).

Histórico de execuções (mais recente primeiro):
${historyText}

Faça uma análise de progressão em português com 3 seções:

**📊 Tendência de evolução**
(Como carga, volume e consistência evoluíram ao longo do tempo)

**🔍 Diagnóstico**
(O aluno está progredindo bem? Há estagnação? Sobrecarga progressiva está acontecendo?)

**💡 Sugestão para próxima sessão**
(Carga ideal, número de séries/reps recomendado baseado no histórico)

Seja técnico e use os números reais. Máximo 150 palavras.`;
  }

  calculateWeeklySessionCounts(sessions, weeks) {
    const weekCounts = Array.from({ length: weeks }, () => 0);
    const now = new Date();
    for (const s of sessions) {
      const daysAgo = Math.floor((now - new Date(s.started_at)) / (1000 * 60 * 60 * 24));
      const weekIdx = Math.min(Math.floor(daysAgo / 7), weeks - 1);
      weekCounts[weekIdx]++;
    }
    return weekCounts;
  }

  getTopExercisesByFrequency(logs, limit = 5) {
    const exerciseCount = {};
    let totalVolume = 0;
    for (const log of logs) {
      const name = this.getExerciseDisplayName(log.workout_exercise_id);
      exerciseCount[name] = (exerciseCount[name] || 0) + 1;
      totalVolume += log.reps_done * log.weight_used_kg;
    }
    const topExercises = Object.entries(exerciseCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => `${name} (${count}x)`)
      .join(", ");
    return { topExercises, totalVolume };
  }

  buildWeeklyCoachPrompt(weeks, totalSessions, avgSessionsPerWeek, weeksBreakdown, avgDuration, totalVolumeAll, topExercises) {
    return `Você é um coach de performance física fazendo uma análise de ${weeks} semanas de um atleta.

Dados das últimas ${weeks} semanas:
- Total de treinos: ${totalSessions}
- Média de treinos/semana: ${avgSessionsPerWeek}
- Treinos por semana (mais recente → mais antigo): ${weeksBreakdown}
- Duração média por sessão: ${avgDuration}
- Volume total acumulado: ${Math.round(totalVolumeAll)}kg
- Exercícios mais realizados: ${topExercises}

Gere um relatório de coach em português com 4 seções:

**🏆 Resumo do período**
(Performance geral, consistência, destaques)

**📉 Pontos de atenção**
(Semanas com menos treinos, possível fadiga ou inconsistência)

**💪 Seus destaques**
(O que o aluno mais evoluiu, exercícios mais consistentes)

**🗓️ Plano para as próximas 2 semanas**
(Recomendações de frequência, foco muscular e progressão de carga)

Tom motivador mas honesto. Baseie-se 100% nos dados fornecidos. Máximo 300 palavras.`;
  }

  async analyzeSession(sessionId, userId) {
    const session = await sessionRepository.findOneWithDetails(sessionId, userId);

    if (!session) throw new AppError("Sessão não encontrada", 404);
    if (session.status !== "completed")
      throw new AppError("A sessão precisa estar finalizada para análise", 400);

    const logs = await logRepository.getLogsBySessionId(sessionId);
    if (!logs.length) throw new AppError("Nenhuma série registrada nesta sessão", 400);

    const { grouped, totalVolume } = this.aggregateSessionLogs(logs);
    const workoutName = session.workout_id?.name || "Treino";
    const duration = this.formatDurationToMinutes(session.duration_seconds);
    const exerciseSummary = this.buildExerciseSummaryText(grouped);
    const prompt = this.buildSessionAnalysisPrompt(workoutName, duration, totalVolume, exerciseSummary);

    const aiSummary = await this.callGeminiWithFallback(prompt, 1000);

    session.ai_summary = aiSummary;
    await session.save({ validateBeforeSave: false });

    return { ai_summary: aiSummary };
  }

  async analyzeProgress(catalogId, userId) {
    const catalog = await exerciseCatalogRepository.findOne({
      _id: catalogId,
      $or: [{ is_system: true }, { created_by_user_id: userId }],
    });

    if (!catalog) throw new AppError("Exercício não encontrado no catálogo", 404);

    const workoutIds = await workoutRepository
      .findByUserId(userId)
      .then((ws) => ws.map((w) => w._id));

    const workoutExerciseIds = await logRepository.getWorkoutExerciseIdsByCatalogId(
      catalogId,
      workoutIds,
    );

    if (!workoutExerciseIds.length)
      throw new AppError("Nenhum treino do usuário usa este exercício", 400);

    const logs = await logRepository.getLogsHistory(workoutExerciseIds, userId);
    const filtered = logs.filter((l) => l.session_id?.status === "completed");

    if (filtered.length < 2)
      throw new AppError("São necessários ao menos 2 registros para análise de progresso", 400);

    const bySession = this.groupLogsBySession(filtered);
    const historyText = this.buildProgressHistoryText(bySession);
    const prompt = this.buildProgressAnalysisPrompt(catalog.name, catalog.muscle_group, historyText);
    const analysis = await this.callGeminiWithFallback(prompt, 900);

    return {
      exercise: catalog.name,
      muscle_group: catalog.muscle_group,
      sessions_analyzed: Object.keys(bySession).length,
      analysis,
    };
  }

  async weeklyCoach(userId, weeks = 4) {
    const days = weeks * 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const allSessions = await sessionRepository.find(
      { user_id: userId, status: "completed", started_at: { $gte: since } },
      0,
      100,
    );

    if (!allSessions.length)
      throw new AppError(`Sem sessões nas últimas ${weeks} semanas para análise`, 400);

    const weekCounts = this.calculateWeeklySessionCounts(allSessions, weeks);

    const allLogs = await Promise.all(
      allSessions.slice(0, 30).map((s) => logRepository.getLogsBySessionId(s._id)),
    );
    const { topExercises, totalVolume: totalVolumeAll } = this.getTopExercisesByFrequency(allLogs.flat());

    const avgSessionsPerWeek = (allSessions.length / weeks).toFixed(1);
    const totalDuration = allSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
    const avgDuration = this.formatDurationToMinutes(Math.round(totalDuration / allSessions.length));
    const weeksBreakdown = weekCounts.map((c, i) => `Sem${i + 1}: ${c}`).join(", ");

    const prompt = this.buildWeeklyCoachPrompt(
      weeks, allSessions.length, avgSessionsPerWeek,
      weeksBreakdown, avgDuration, totalVolumeAll, topExercises,
    );
    const coachReport = await this.callGeminiWithFallback(prompt, 1800);

    return {
      period_weeks: weeks,
      total_sessions: allSessions.length,
      avg_sessions_per_week: parseFloat(avgSessionsPerWeek),
      total_volume_kg: Math.round(totalVolumeAll),
      top_exercises: topExercises,
      coach_report: coachReport,
    };
  }
}

module.exports = new AIService();
