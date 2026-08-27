// routes/produtosRoutes.js
// Define as URLs da API de produtos e liga cada uma ao seu controller —
// e, quando necessário, ao middleware de validação antes dele.
//
// Cada linha abaixo é lida assim:
//   router.<verbo>(<caminho>, [middlewares...], controller)
// Os middlewares rodam na ordem em que aparecem, da esquerda pra direita,
// e só passam a vez com next(). O controller é sempre o último da lista.

import express from 'express';
import * as controller from '../controllers/produtosController.js';
import { validarProduto, validarAtualizacaoProduto } from '../middlewares/validarProduto.js';

const router = express.Router();

// Criar recebe todos os dados obrigatórios no corpo, então passa pela
// validação "cheia" (nome e preco obrigatórios).
router.post('/produtos', validarProduto, controller.criar);

router.get('/produtos', controller.listar);
router.get('/produtos/:id', controller.buscarPorId);

// PATCH, não PUT: essa rota aceita atualização PARCIAL — o cliente manda
// só os campos que quer mudar, não o produto inteiro. Por isso usa a
// validação "parcial" (validarAtualizacaoProduto), que só checa o tipo
// dos campos que realmente vierem.
router.patch('/produtos/:id', validarAtualizacaoProduto, controller.atualizar);

// Deletar não recebe corpo, então não precisa de validação.
router.delete('/produtos/:id', controller.deletar);

// Esse router é importado e "plugado" no app principal, em index.js
// (app.use('/api', produtosRoutes)) — é lá que o prefixo /api é somado
// na frente de cada rota definida aqui.
export default router;
