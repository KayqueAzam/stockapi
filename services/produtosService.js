// services/produtosService.js
// Camada de acesso a dados: é a ÚNICA parte do projeto que sabe escrever SQL.
// Cada função aqui faz uma coisa só (uma query) e devolve o resultado "cru" —
// quem decide o que fazer com esse resultado (status code, formato da
// resposta) é o controller, não o service.

import pool from '../config/db.js';

// Lista de colunas que essa tabela aceita alterar. Usada tanto aqui quanto
// no middleware de validação — é a mesma "lista de permissões" nos dois
// lugares, então mantenha as duas em sincronia se a tabela mudar.
const CAMPOS_PRODUTO = ['nome', 'descricao', 'preco', 'quantidade_estoque', 'categoria_id'];

// Cria um produto novo e devolve o id que o MySQL gerou pra ele.
export async function criar(produto) {
  const { nome, descricao, preco, quantidade_estoque, categoria_id } = produto;

  // Os "?" são placeholders: o mysql2 substitui cada um pelo valor
  // correspondente do array, escapando o conteúdo automaticamente.
  // NUNCA monte a query concatenando strings (`'...' + nome + '...'`) —
  // isso abre brecha pra SQL Injection.
  const [resultado] = await pool.query(
    `INSERT INTO produtos (nome, descricao, preco, quantidade_estoque, categoria_id)
     VALUES (?, ?, ?, ?, ?)`,
    [nome, descricao ?? null, preco, quantidade_estoque ?? 0, categoria_id ?? null]
  );

  // resultado.insertId é o id gerado automaticamente pelo AUTO_INCREMENT
  return resultado.insertId;
}

// Retorna todos os produtos cadastrados.
export async function listarTodos() {
  const [linhas] = await pool.query('SELECT * FROM produtos');
  return linhas;
}

// Busca um produto específico pelo id. Se não existir, devolve undefined
// (é o controller que decide transformar isso em um 404).
export async function buscarPorId(id) {
  const [linhas] = await pool.query('SELECT * FROM produtos WHERE id = ?', [id]);
  return linhas[0];
}

// Atualiza SÓ os campos que vierem em `camposParaAtualizar` — é uma
// atualização PARCIAL (PATCH), não uma substituição completa (PUT).
// Por isso o UPDATE precisa ser montado dinamicamente: não dá pra escrever
// um "SET nome=?, preco=?, ..." fixo, porque nem sempre todos os campos
// vêm preenchidos.
export async function atualizar(id, camposAtualizados) {
  // 1) Filtra: só entram campos que (a) realmente vieram no body e
  //    (b) são colunas de verdade da tabela produtos. Isso é o que torna
  //    seguro usar o nome do campo dentro da string da query mais abaixo —
  //    nunca inserimos um nome de coluna que não esteja nessa lista fixa,
  //    então não existe brecha para o cliente injetar SQL pelo nome do campo.
  const camposParaAtualizar = Object.keys(camposAtualizados).filter((campo) => CAMPOS_PRODUTO.includes(campo));

  // 2) Monta "nome = ?, preco = ?" dinamicamente, um pedaço pra cada campo
  //    que sobrou depois do filtro.
  const setClause = camposParaAtualizar.map((campo) => `${campo} = ?`).join(', ');

  // 3) Os VALORES continuam indo por parâmetro (?), nunca concatenados —
  //    só o NOME da coluna (já filtrado pela whitelist) entra direto na
  //    string. Essa é a diferença entre "dinâmico e seguro" e "vulnerável".
  const valores = camposParaAtualizar.map((campo) => camposAtualizados[campo]);

  const [resultado] = await pool.query(
    `UPDATE produtos SET ${setClause} WHERE id = ?`,
    [...valores, id] // O ... espalha o array de valores e adiciona o id no final, na mesma ordem dos "?" da query
  );

  return resultado.affectedRows;
}

// Remove um produto. Aqui affectedRows É confiável para saber se existia:
// um DELETE ou apaga exatamente 1 linha, ou apaga 0 — nunca fica "no meio".
export async function deletar(id) {
  const [resultado] = await pool.query('DELETE FROM produtos WHERE id = ?', [id]);
  return resultado.affectedRows;
}
