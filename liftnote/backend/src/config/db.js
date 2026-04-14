const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Erro ao conectar no MongoDB: ${err.message}`);
    process.exit(1);
  }
};

// Eventos de conexão
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB desconectado");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconectado");
});

// Fecha a conexão ao encerrar o processo
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Conexão com MongoDB encerrada");
  process.exit(0);
});

module.exports = connectDB;
