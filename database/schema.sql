-- database/schema.sql
-- StockAPI — Desenvolvimento Back-end II
-- Ordem das tabelas respeita as dependências de FOREIGN KEY.

CREATE DATABASE IF NOT EXISTS stockapi;
USE stockapi;

-- ------------------------------------------------------
-- categorias
-- ------------------------------------------------------
CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(60) NOT NULL
);

-- ------------------------------------------------------
-- clientes
-- ------------------------------------------------------
CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(120),
  telefone VARCHAR(20)
);

-- ------------------------------------------------------
-- usuarios (autenticação — independente por enquanto)
-- ------------------------------------------------------
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------
-- produtos (depende de categorias)
-- ------------------------------------------------------
CREATE TABLE produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  quantidade_estoque INT NOT NULL DEFAULT 0,
  categoria_id INT,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- ------------------------------------------------------
-- pedidos (depende de clientes)
-- ------------------------------------------------------
CREATE TABLE pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT,
  data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pendente',
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- ------------------------------------------------------
-- itens_pedido (tabela associativa — resolve o N:N entre
-- pedidos e produtos; depende de ambas)
-- ------------------------------------------------------
CREATE TABLE itens_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT,
  produto_id INT,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);
