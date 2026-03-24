const express = require("express");
const router = express.Router();
const { Lead } = require("../models");

// Middleware de autenticação (simulado - ID 2 = Maria)
const authMiddleware = (req, res, next) => {
  req.userId = 2; // ID da Maria (mude conforme necessário)
  next();
};

// Dashboard do parceiro
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Buscar todas as leads do parceiro
    const leads = await Lead.findAll({
      where: { user_id: req.userId },
    });

    // Calcular totais
    const totalLeads = leads.length;

    const totalContratos = leads.filter(
      (l) => l.status === "contrato_fechado" || l.status === "comissao_paga",
    ).length;

    const comissoesPendentes = leads
      .filter((l) => l.status === "contrato_fechado")
      .reduce((sum, l) => sum + parseFloat(l.commission_value || 0), 0);

    const comissoesPagas = leads
      .filter((l) => l.status === "comissao_paga")
      .reduce((sum, l) => sum + parseFloat(l.commission_value || 0), 0);

    // Últimas 5 indicações
    const ultimasLeads = leads
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map((l) => ({
        id: l.id,
        cliente: l.name,
        tipo: l.insurance_type,
        status: l.status,
        data: l.created_at,
        comissao: l.commission_value,
      }));

    res.json({
      resumo: {
        totalIndicacoes: totalLeads,
        contratosFechados: totalContratos,
        comissoesPendentes,
        comissoesPagas,
        totalGanho: comissoesPagas,
      },
      ultimasIndicacoes: ultimasLeads,
      metas: {
        indicacoesMeta: 10,
        contratosMeta: 5,
        comissaoMeta: 5000,
        progressoIndicacoes: Math.min(100, (totalLeads / 10) * 100),
        progressoContratos: Math.min(100, (totalContratos / 5) * 100),
        progressoComissao: Math.min(100, (comissoesPagas / 5000) * 100),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao carregar dashboard" });
  }
});

module.exports = router;
