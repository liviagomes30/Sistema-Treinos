require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;

mongoose
  .connect(uri)
  .then(() => {
    console.log("Conexão com o MongoDB estabelecida com sucesso!");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("Erro ao conectar ao MongoDB:", err);
    process.exit(1);
  });
