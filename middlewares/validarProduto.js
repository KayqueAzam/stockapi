// middlewares/validarProduto.js
// Um middleware é uma função que roda ANTES do controller, no meio do
// caminho entre a rota e a lógica de negócio. Ela recebe os mesmos
// (req, res, next) de sempre, e tem duas escolhas:
//
//   1. Encontrou um problema → responde direto (res.status(...).json(...))
//      e NÃO chama next(). A requisição para aqui; o controller nunca roda.
//   2. Está tudo certo → chama next(), e o Express segue pro próximo
//      middleware (ou pro controller, se não houver mais nenhum).
//
// Este arquivo tem DOIS middlewares parecidos, mas com regras diferentes:
// validarProduto (para criar — POST) exige nome e preco sempre.
// validarAtualizacaoProduto (para atualizar — PATCH) só valida o que veio,
// porque em uma atualização parcial nem todo campo é obrigatório.

const CAMPOS_PRODUTO = ['nome', 'descricao', 'preco', 'quantidade_estoque', 'categoria_id'];

// Usado na criação (POST /produtos): aqui faz sentido exigir os campos
// principais, porque um produto novo precisa nascer com nome e preço.
export function validarProduto(req, res, next) {
  const { nome, preco, quantidade_estoque, categoria_id } = req.body;
  const erros = [];

  if (!nome || typeof nome !== 'string' || !nome.trim()) {
    erros.push('nome é obrigatório e deve ser um texto');
  }

  if (preco === undefined || preco === null || typeof preco !== 'number' || preco <= 0) {
    erros.push('preco é obrigatório e deve ser um número maior que zero');
  }

  if (quantidade_estoque !== undefined && (typeof quantidade_estoque !== 'number' || quantidade_estoque < 0)) {
    erros.push('quantidade_estoque deve ser um número maior ou igual a zero');
  }

  if (categoria_id !== undefined && categoria_id !== null && typeof categoria_id !== 'number') {
    erros.push('categoria_id deve ser um número');
  }

  if (erros.length > 0) {
    return res.status(400).json({ erros });
  }

  next();
}

// Usado na atualização parcial (PATCH /produtos/:id): NENHUM campo é
// obrigatório sozinho, mas pelo menos um precisa vir — e cada campo que
// vier precisa ter o tipo certo. Repare o padrão "só valida se veio":
// `if (nome !== undefined && ...)`, em vez de `if (!nome ...)` como na
// criação. Isso é o que diferencia "obrigatório" de "opcional, mas
// validado quando presente".
export function validarAtualizacaoProduto(req, res, next) {
  const { nome, preco, quantidade_estoque, categoria_id } = req.body;
  const erros = [];

  const camposEnviados = Object.keys(req.body).filter((campo) => CAMPOS_PRODUTO.includes(campo));
  if (camposEnviados.length === 0) {
    erros.push('envie pelo menos um campo para atualizar (nome, descricao, preco, quantidade_estoque ou categoria_id)');
  }

  if (nome !== undefined && (typeof nome !== 'string' || !nome.trim())) {
    erros.push('nome, se enviado, deve ser um texto não vazio');
  }

  if (preco !== undefined && (typeof preco !== 'number' || preco <= 0)) {
    erros.push('preco, se enviado, deve ser um número maior que zero');
  }

  if (quantidade_estoque !== undefined && (typeof quantidade_estoque !== 'number' || quantidade_estoque < 0)) {
    erros.push('quantidade_estoque, se enviado, deve ser um número maior ou igual a zero');
  }

  if (categoria_id !== undefined && categoria_id !== null && typeof categoria_id !== 'number') {
    erros.push('categoria_id, se enviado, deve ser um número');
  }

  if (erros.length > 0) {
    return res.status(400).json({ erros });
  }

  next();
}
