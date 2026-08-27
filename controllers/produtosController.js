// controllers/produtosController.js
// Cada função aqui atende UMA rota: lê o que veio na requisição (req),
// chama o service certo, e decide o que devolver (res) — incluindo o
// status code. Nenhuma query SQL aparece neste arquivo; quem faz isso é
// o service.
//
// Reparem que toda função recebe (req, res, next). O "next" só é usado
// dentro do catch: chamar next(erro) manda a execução pro middleware de
// tratamento de erro central, lá no index.js — em vez de cada função
// aqui decidir sozinha como responder um erro 500.

import * as service from '../services/produtosService.js';

// POST /produtos
// Quando essa função é chamada, o corpo da requisição JÁ passou pela
// validação (middlewares/validarProduto.js, aplicado na rota) — não
// precisamos checar de novo se nome/preco vieram certos.
export async function criar(req, res, next) {
  try {
    const id = await service.criar(req.body);
    // 201 Created: convenção HTTP para "algo novo foi criado com sucesso".
    // Devolvemos o produto criado, incluindo o id que o banco gerou.
    res.status(201).json({ id, ...req.body });
  } catch (erro) {
    next(erro);
  }
}

// GET /produtos
export async function listar(req, res, next) {
  try {
    const produtos = await service.listarTodos();
    res.json(produtos); // 200 OK é o status padrão, não precisa escrever
  } catch (erro) {
    next(erro);
  }
}

// GET /produtos/:id
export async function buscarPorId(req, res, next) {
  try {
    const { id } = req.params; // o :id da URL vem aqui
    const produto = await service.buscarPorId(id);

    if (!produto) {
      // 404 Not Found: o id é válido como formato, mas não existe no banco
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    res.json(produto);
  } catch (erro) {
    next(erro);
  }
}

// PATCH /produtos/:id
// Atualização PARCIAL: o corpo da requisição pode trazer só um campo
// (ex: { "preco": 20 }) ou vários — o que não vier permanece como está
// no banco. É por isso que devolvemos o produto buscando ele de novo no
// final, em vez de simplesmente ecoar `req.body`: o body só tem o que
// mudou, não o estado completo do produto.
export async function atualizar(req, res, next) {
  try {
    const { id } = req.params;

    // Buscamos o produto ANTES de tentar atualizar, pra confirmar que ele
    // existe e responder 404 de forma clara — em vez de confiar em
    // affectedRows depois. Isso evita um bug sutil: se o PATCH não muda
    // nenhum valor de verdade (ex: manda o mesmo preço que já estava
    // salvo), o MySQL retorna affectedRows = 0 mesmo com o registro
    // existindo, o que daria um 404 incorreto se a checagem fosse feita
    // só depois do UPDATE.
    const produtoExistente = await service.buscarPorId(id);
    if (!produtoExistente) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    await service.atualizar(id, req.body);

    // Buscamos de novo depois de atualizar, pra devolver o produto como
    // ele está agora no banco — com os campos alterados E os que
    // continuaram os mesmos.
    const produtoAtualizado = await service.buscarPorId(id);
    res.json(produtoAtualizado);
  } catch (erro) {
    next(erro);
  }
}

// DELETE /produtos/:id
export async function deletar(req, res, next) {
  try {
    const { id } = req.params;
    const linhasRemovidas = await service.deletar(id);

    // Aqui SIM dá pra confiar em affectedRows: um DELETE nunca fica
    // "no meio do caminho" — ou apagou 1 linha, ou apagou 0.
    if (linhasRemovidas === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    // 204 No Content: deu certo, mas não há nada útil pra devolver no
    // corpo da resposta (o produto não existe mais).
    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
}
