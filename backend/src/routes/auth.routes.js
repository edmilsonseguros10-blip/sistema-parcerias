const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { User } = require("../models");

// CADASTRO - senha em texto puro
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, cpf, pix_key, password } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }

    let referral_code;
    let codeExists = true;
    while (codeExists) {
      referral_code = crypto.randomBytes(4).toString("hex").toUpperCase();
      const existing = await User.findOne({ where: { referral_code } });
      codeExists = !!existing;
    }

    // SENHA EM TEXTO PURO
    const user = await User.create({
      name, email, phone, cpf, pix_key,
      password_hash: password,
      referral_code,
    });

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
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// LOGIN - comparação direta
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    if (user.status !== "active") {
      return res.status(401).json({ error: "Usuário bloqueado" });
    }

    // COMPARAÇÃO DIRETA
    if (user.password_hash !== password) {
      return res.status(401).json({ error: "Senha inválida" });
    }

    user.last_login = new Date();
    await user.save();

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
