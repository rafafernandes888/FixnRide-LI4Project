const Funcionario = require('../../models/users/Funcionario');
const { paraFuncionarioDto } = require('../../dtos/userDtos/funcionarioDto');

exports.obterPorNumeroLogin = async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'];

        if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
            console.warn(`[AUTH] Tentativa de acesso não autorizado de: ${req.ip}`);
            return res.status(403).json({ 
                error: "Acesso Negado. Chave de sistema inválida ou ausente." 
            });
        }

        const { numero } = req.params;

        const funcionario = await Funcionario.findById(numero).lean();

        if (!funcionario) {
            return res.status(404).json({ 
                mensagem: "Funcionário não encontrado no sistema de dados." 
            });
        }

        const dto = paraFuncionarioDto(funcionario);

        return res.status(200).json(dto);

    } catch (error) {
        console.error("Erro no obterPorIdSistema:", error);
        return res.status(500).json({ 
            error: "Erro interno no servidor de dados.",
            detalhes: error.message 
        });
    }
};


exports.fetchFuncionario = async (req,res) => {
    try {
        const numero = req.params.numero;

        const funcionario = await Funcionario.findById(numero).lean();
        if (!funcionario) {
            return res.status(404).json({ 
                mensagem: "Funcionário não encontrado no sistema de dados." 
            });
        }

        const dto = paraFuncionarioDto(funcionario);

        return res.status(200).json(dto);

    } catch (error) {
        console.error("Erro a obter Funcionário:", error);
        return res.status(500).json({ 
            error: "Erro interno no servidor de dados.",
            detalhes: error.message 
        });
    }
};


// ==========================================
// 2. LISTAR FUNCIONÁRIOS (COM FILTROS)
// ==========================================
exports.listarFuncionarios = async (req, res) => {
    try {
        // Extraímos os filtros da Query String: ?cargo=X&ativo=Y&nome=Z
        const { cargo, ativo, nome, especialidade } = req.query;
        
        let filtro = {};

        // Filtro por Cargo (Exato)
        if (cargo) filtro.cargo = cargo.toUpperCase();

        // Filtro por Estado Ativo (Conversão de String para Bool)
        if (ativo) filtro.ativo = ativo === 'true';

        // Filtro por Especialidade
        if (especialidade) filtro.especialidade = especialidade.toUpperCase();

        // Pesquisa por Nome (Partial Match / Case Insensitive)
        if (nome) {
            filtro.nome = { $regex: nome, $options: 'i' }; 
        }

        const funcionarios = await Funcionario.find(filtro)
            .sort({ cargo: 1, nome: 1 })
            .lean();

        // Mapeamos o array para o formato DTO
        const listaDtos = funcionarios.map(f => paraFuncionarioDto(f));

        return res.status(200).json(listaDtos);

    } catch (error) {
        console.error("Erro no listarFuncionarios:", error);
        return res.status(500).json({ error: "Erro ao listar funcionários." });
    }
};

// ==========================================
// 3. CRIAR / ATUALIZAR / ELIMINAR
// ==========================================

exports.criarFuncionario = async (req, res) => {
    try {
        const novoFuncionario = new Funcionario({
            _id: req.body.NumeroMecanografico,
            nome: req.body.Nome,
            email: req.body.Email,
            contacto: req.body.Contacto,
            cargo: req.body.Cargo?.toUpperCase(),
            passwordHash: req.body.PasswordHash,
            especialidade: req.body.Especialidade?.toUpperCase(),
            ativo: req.body.Ativo ?? true
        });

        await novoFuncionario.save();

        const funcionarioLimpo = novoFuncionario.toObject();
        
        delete funcionarioLimpo.passwordHash;
        
        return res.status(201).json(paraFuncionarioDto(funcionarioLimpo));
        
    } catch (error) {
        return res.status(400).json({ error: "Erro ao criar funcionário. Verifique se o ID ou Email já existem." });
    }
};

exports.atualizarFuncionario = async (req, res) => {
    try {
        const { numero } = req.params;
        const dadosAtualizados = {
            nome: req.body.Nome,
            email: req.body.Email,
            contacto: req.body.Contacto,
            cargo: req.body.Cargo?.toUpperCase(),
            especialidade: req.body.Especialidade?.toUpperCase(),
            ativo: req.body.Ativo
        };

        const funcionario = await Funcionario.findByIdAndUpdate(numero, dadosAtualizados, { new: true }).lean();
        
        if (!funcionario) return res.status(404).json({ mensagem: "Não encontrado." });
        
        return res.status(200).json(paraFuncionarioDto(funcionario));
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

exports.eliminarFuncionario = async (req, res) => {
    try {
        const { numero } = req.params;
        const resultado = await Funcionario.findByIdAndDelete(numero);
        
        if (!resultado) return res.status(404).json({ mensagem: "Não encontrado." });
        
        return res.status(204).send(); // Sucesso sem conteúdo
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

