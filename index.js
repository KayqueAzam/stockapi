import express from "express";
import cors from "cors";
import "dotenv/config";
import produtosRoutes from "./routes/produtosRoutes.js";
import categoriasRoutes from "./routes/categoriasRoutes.js";
const app = express();

app.use(cors()); // permite que outras origens (ex: um front-end) chamem a API
app.use(express.json()); // permite ler JSON enviado no corpo (req.body)

app.get("/health", (req, res) =>
  res.json({ status: "OK", message: "StockAPI no ar" }),);
app.use("/api/v1/stockapi", produtosRoutes);
app.use("/api/v1/stockapi", categoriasRoutes);

app.use((req, res) => {
  res.status(404).json({
    erro: `Rota ${req.method} ${req.originalUrl} não encontrada`,
  });
});

app.use((erro, req, res, next) => {
  console.error(erro); // sempre bom logar o erro real no terminal, pra debugar

  if (erro.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({ erro: "categoria_id informado não existe" });
  }

  res.status(500).json({ erro: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
