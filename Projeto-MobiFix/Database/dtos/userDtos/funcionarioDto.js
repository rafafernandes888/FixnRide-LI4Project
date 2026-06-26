const paraFuncionarioDto = (f) => {
    if (!f) return null;
    return {
        NumeroMecanografico: f._id.toString(),
        Nome: f.nome,
        Email: f.email,
        Contacto: f.contacto || "",
        Cargo: f.cargo,
        PasswordHash: f.passwordHash,
        Especialidade: f.especialidade || null,
        Ativo: !!f.ativo
    };
};

module.exports = { paraFuncionarioDto };
