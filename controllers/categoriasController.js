import * as service from "../services/categoriasService.js";

export async function criar(req, res, next) {
  try {
    const id = await service.criar(req.body);
    res.status(201).json({ id, ...req.body });
  } catch (error) {
    next(error);
  }
}

export async function listar(req, res, nex) {
  try {
    const categorias = await service.listar();
    res.json(categorias);
  } catch (error) {
    next(error);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const { id } = req.params;
    const categoria = await service.buscarPorId(id);
    if (!categoria) {
      return res.status(404).json({ erro: "Categoria não encontrada " });
    }
    res.json(categoria);
  } catch (error) {
    next(error);
  }
}

export async function atualizar(req, res, next) {
  try {
    const { id } = req.params;
    const categoriaExistente = await service.buscarPorId(id);
    if (!categoriaExistente) {
      return res.status(404).json({ erro: "Categoria não encontrada" });
    }
    await service.atualizar(id, req.body);
    res.json({ id, ...req.body });
  } catch (error) {
    next(error);
  }
}

export async function deletar(req, res, next) {
  try {
    const { id } = req.params;
    const linhasRemovidas = await service.deletar(id);
    if (linhasRemovidas === 0) {
      return res.status(404).json({ erro: "Categoria não encontrada" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
