const {
  WorkoutSession,
  ExerciseLog,
  WorkoutExercise,
  ExerciseCatalog,
  Workout,
} = require("../models");

// Helper: resolve o nome "exibido" de um WorkoutExercise (custom_name > catalog.name)
const displayName = (we) => {
  if (!we) return "Exercício desconhecido";
  if (we.custom_name) return we.custom_name;
  return we.exercise_catalog_id?.name || "Exercício desconhecido";
};

const callAnthropic = async (prompt, maxTokens = 512) => {
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
  return response;
};

/**
 * POST /api/ai/analyze/:sessionId
 */
const analyzeSession = async (req, res) => {
  try {
    const session = await WorkoutSession.findOne({
      _id: req.params.sessionId,
      user_id: req.user._id,
    }).populate("workout_id", "name");

    if (!session)
      return res.status(404).json({ message: "Sessão não encontrada" });
    if (session.status !== "completed") {
      return res
        .status(400)
        .json({ message: "A sessão precisa estar finalizada para análise" });
    }

    const logs = await ExerciseLog.find({ session_id: session._id }).populate({
      path: "workout_exercise_id",
      select: "custom_name exercise_catalog_id",
      populate: { path: "exercise_catalog_id", select: "name muscle_group" },
    });

    if (!logs.length) {
      return res
        .status(400)
        .json({ message: "Nenhum registro encontrado nesta sessão" });
    }

    const grouped = {};
    for (const log of logs) {
      const name = displayName(log.workout_exercise_id);
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

    const response = await callAnthropic(prompt, 512);
    if (!response.ok) {
      const err = await response.json();
      console.error("Erro na API Anthropic:", err);
      return res
        .status(502)
        .json({ message: "Erro ao chamar a IA. Tente novamente." });
    }

    const data = await response.json();
    const ai_summary =
      data.content?.[0]?.text || "Não foi possível gerar a análise.";

    session.ai_summary = ai_summary;
    await session.save({ validateBeforeSave: false });

    res.json({ ai_summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/ai/progress/:catalogId
 * Analisa evolução do usuário para um exercício do catálogo (em todos os treinos)
 */
const analyzeProgress = async (req, res) => {
  try {
    const { catalogId } = req.params;

    const catalog = await ExerciseCatalog.findOne({
      _id: catalogId,
      $or: [{ is_system: true }, { created_by_user_id: req.user._id }],
    });
    if (!catalog)
      return res
        .status(404)
        .json({ message: "Exercício do catálogo não encontrado" });

    const userWorkouts = await Workout.find({ user_id: req.user._id }).select(
      "_id",
    );
    const workoutIds = userWorkouts.map((w) => w._id);

    const workoutExercises = await WorkoutExercise.find({
      exercise_catalog_id: catalogId,
      workout_id: { $in: workoutIds },
    }).select("_id");
    const weIds = workoutExercises.map((we) => we._id);

    if (!weIds.length) {
      return res.status(400).json({
        message: "Nenhum treino do usuário usa este exercício",
      });
    }

    const logs = await ExerciseLog.find({
      workout_exercise_id: { $in: weIds },
    })
      .populate({
        path: "session_id",
        match: { user_id: req.user._id, status: "completed" },
        select: "started_at",
      })
      .sort({ logged_at: -1 })
      .limit(30);

    const filtered = logs.filter((l) => l.session_id !== null);

    if (filtered.length < 2) {
      return res.status(400).json({
        message:
          "São necessários ao menos 2 registros para análise de progresso",
      });
    }

    const historyText = filtered
      .map((l) => {
        const date = new Date(l.session_id.started_at).toLocaleDateString(
          "pt-BR",
        );
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

    const response = await callAnthropic(prompt, 400);
    if (!response.ok) {
      return res
        .status(502)
        .json({ message: "Erro ao chamar a IA. Tente novamente." });
    }

    const data = await response.json();
    const analysis =
      data.content?.[0]?.text || "Não foi possível gerar a análise.";

    res.json({ exercise: catalog.name, analysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { analyzeSession, analyzeProgress };
