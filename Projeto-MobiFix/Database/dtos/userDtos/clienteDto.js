const paraClienteDto = (c) => {
    if (!c) return null;
    return {
        NIF: c._id.toString(),
        Nome: c.nome,
        Telefone: c.telefone,
        Email: c.email,
        Morada: c.morada || null,
        PasswordHash: c.passwordHash
    };
};

module.exports = { paraClienteDto };
