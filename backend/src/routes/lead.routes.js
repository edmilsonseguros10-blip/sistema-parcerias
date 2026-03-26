const express = require("express");
const router = express.Router();
const { Lead } = require("../models");

const authMiddleware = (req, res, next) => {
  req.userId = 2; // ← AGORA É A MARIA (ID 2)
  next();
};

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, phone, whatsapp, email, insurance_type, observations } =
      req.body;
    const lead = await Lead.create({
      user_id: req.userId,
      name,
      phone,
      whatsapp,
      email,
      insurance_type,
      observations,
      status: "nova",
    });
    res.status(201).json(lead);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar indicação" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const leads = await Lead.findAll({
      where: { user_id: req.userId },
      order: [["created_at", "DESC"]],
    });
    res.json(leads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar indicações" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findOne({
      where: { id: req.params.id, user_id: req.userId },
    });
    if (!lead)
      return res.status(404).json({ error: "Indicação não encontrada" });
    res.json(lead);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar indicação" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findOne({
      where: { id: req.params.id, user_id: req.userId },
    });
    if (!lead)
      return res.status(404).json({ error: "Indicação não encontrada" });
    lead.status = status;
    await lead.save();
    res.json(lead);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar indicação" });
  }
});

module.exports = router;
