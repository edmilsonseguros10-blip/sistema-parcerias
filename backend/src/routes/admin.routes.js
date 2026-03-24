const express = require("express");
const router = express.Router();
const { Lead, User } = require("../models");
const { Op } = require("sequelize");

const adminMiddleware = (req, res, next) => {
  req.userId = 1;
  next();
};

router.get("/dashboard", adminMiddleware, async (req, res) => {
  // ... mantenha seu código existente aqui
});

router.get("/partners", adminMiddleware, async (req, res) => {
  // ... mantenha seu código existente aqui
});

router.get("/partners/:id", adminMiddleware, async (req, res) => {
  // ... mantenha seu código existente aqui
});

router.put("/partners/:id/status", adminMiddleware, async (req, res) => {
  // ... mantenha seu código existente aqui
});

router.get("/leads", adminMiddleware, async (req, res) => {
  // ... mantenha seu código existente aqui
});

// ATENÇÃO: ESTA ROTA ESTÁ CORRETA – NÃO ALTERE
router.get("/leads/:id", adminMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id, {
      include: [{ model: User, attributes: ["name", "email"] }],
    });
    if (!lead)
      return res.status(404).json({ error: "Indicação não encontrada" });
    res.json(lead);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar indicação" });
  }
});

router.put("/leads/:id/close-contract", adminMiddleware, async (req, res) => {
  // ... mantenha seu código existente aqui
});

router.get("/commissions", adminMiddleware, async (req, res) => {
  // ... mantenha seu código existente aqui
});

router.put("/commissions/:id/pay", adminMiddleware, async (req, res) => {
  // ... mantenha seu código existente aqui
});

module.exports = router;
