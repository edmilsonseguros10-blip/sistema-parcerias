const express = require("express");
const router = express.Router();
const { Lead } = require("../models");

// Middleware de autenticação
const authMiddleware = (req, res, next) => {
  req.userId = 1;
  next();
};

// Listar comissões do parceiro logado
router.get("/", authMiddleware, async (req, res) => {
  try {
    const commissions = await Lead.findAll({
      where: {
        user_id: req.userId,
        status: ["contrato_fechado", "comissao_paga"],
      },
      order: [["contract_date", "DESC"]],
    });

    const totalPending = commissions
      .filter((c) => c.status === "contrato_fechado")
      .reduce((sum, c) => sum + parseFloat(c.commission_value || 0), 0);

    const totalPaid = commissions
      .filter((c) => c.status === "comissao_paga")
      .reduce((sum, c) => sum + parseFloat(c.commission_value || 0), 0);

    res.json({
      commissions,
      summary: {
        total_pending: totalPending,
        total_paid: totalPaid,
        total: totalPending + totalPaid,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar comissões" });
  }
});

module.exports = router;
