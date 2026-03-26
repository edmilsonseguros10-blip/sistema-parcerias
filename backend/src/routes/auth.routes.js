const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { User } = require("../models");

// Rota de cadastro (registro)
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, cpf, pix_key, password } = req.body;

    // Verificar se usuário já existe
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }

    // Gerar código de indicação único
    let referral_code;
    let codeExists = true;
    while (codeExists) {
      referral_code = crypto.randomBytes(4).toString("hex").toUpperCase();
      const existing = await User.findOne({ where: { referral_code } });
      codeExists = !!existing;
    }

    // Criar hash da senha
    const password_hash = await bcrypt.hash(password, 10);
    console.log("Hash gerado:", password_hash); // Log para debug

    // Criar usuário no banco
    const user = await User.create({
      name,
      email,
      phone,
      cpf,
      pix_key,
      password_hash,
      referral_code,
    });

    // Retornar usuário criado
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      cpf: user.cpf,
      pix_key: user.pix_key,
      role: user.role,
      level: user.level,
      referral_code: user.referral_code,
      created_at: user.created_at,
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota de login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    if (user.status !== "active") {
      return res.status(401).json({
        error: "Usuário bloqueado. Entre em contato com o administrador.",
      });
    }

    console.log("Hash no banco:", user.password_hash); // Log para debug
    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log("Senha válida?", validPassword); // Log para debug

    if (!validPassword) {
      return res.status(401).json({ error: "Senha inválida" });
    }

    // Atualizar último acesso
    user.last_login = new Date();
    await user.save();

    // Gerar token simples
    const token = crypto.randomBytes(32).toString("hex");

    res.json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        level: user.level,
        referral_code: user.referral_code,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

module.exports = router;
