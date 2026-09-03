export function validarCategorias(req,res,next){
    const {nome} = req.body;
    if(!nome || typeof nome !== 'string' || !nome.trim()){
        return res.status(400).json({erro: 'nome é obrigatório e deve ser um texto'})
    }
    next();
}