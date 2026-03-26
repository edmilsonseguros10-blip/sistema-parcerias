const express = require("express");
const router = express.Router();
const { Lead, User } = require("../models");
const { Op } = require("sequelize");

const adminMiddleware = (req, res, next) => {
  req.userId = 1;
  next();
};

// Dashboard Admin
router.get("/dashboard", adminMiddleware, async (req, res) => {
  try {
    const totalParceiros = await User.count({ where: { role: "partner" } });
    const totalIndicacoes = await Lead.count();

    const indicacoesNovas = await Lead.count({ where: { status: "nova" } });
    const indicacoesEmContato = await Lead.count({
      where: { status: "em_contato" },
    });
    const indicacoesNegociando = await Lead.count({
      where: { status: "negociando" },
    });
    const contratosFechados = await Lead.count({
      where: { status: "contrato_fechado" },
    });
    const comissoesPagas = await Lead.count({
      where: { status: "comissao_paga" },
    });

    const comissoesPendentes =
      (await Lead.sum("commission_value", {
        where: { status: "contrato_fechado" },
      })) || 0;

    const comissoesPagasValor =
      (await Lead.sum("commission_value", {
        where: { status: "comissao_paga" },
      })) || 0;

    res.json({
      resumo: {
        totalParceiros,
        totalIndicacoes,
        indicacoesPorStatus: {
          nova: indicacoesNovas,
          em_contato: indicacoesEmContato,
          negociando: indicacoesNegociando,
          contratos_fechados: contratosFechados,
          comissoes_pagas: comissoesPagas,
        },
        comissoes: {
          pendentes: comissoesPendentes,
          pagas: comissoesPagasValor,
          total: comissoesPendentes + comissoesPagasValor,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao carregar dashboard admin" });
  }
});

// ========== ROTA PARA LISTAR PARCEIROS ==========
router.get("/partners", adminMiddleware, async (req, res) => {
  try {
    const partners = await User.findAll({
      where: { role: "partner" },
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "status",
        "level",
        "total_contracts",
        "total_commission",
        "created_at",
        "last_login",
      ],
    });

    res.json(partners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar parceiros" });
  }
});
// ================================================

// Buscar um parceiro específico
router.get("/partners/:id", adminMiddleware, async (req, res) => {
  try {
    const partner = await User.findByPk(req.params.id, {
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "cpf",
        "pix_key",
        "status",
        "level",
        "total_contracts",
        "total_commission",
        "created_at",
      ],
    });

    if (!partner) {
      return res.status(404).json({ error: "Parceiro não encontrado" });
    }

    const leads = await Lead.findAll({
      where: { user_id: partner.id },
      order: [["created_at", "DESC"]],
    });

    res.json({ partner, leads });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar parceiro" });
  }
});

// Atualizar status do parceiro
router.put("/partners/:id/status", adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const partner = await User.findByPk(req.params.id);

    if (!partner) {
      return res.status(404).json({ error: "Parceiro não encontrado" });
    }

    partner.status = status;
    await partner.save();

    res.json({
      message: `Parceiro ${status === "active" ? "ativado" : "bloqueado"} com sucesso!`,
      partner: {
        id: partner.id,
        name: partner.name,
        status: partner.status,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar status" });
  }
});

// Listar todas as indicações (admin)
router.get("/leads", adminMiddleware, async (req, res) => {
  try {
    const { status, partner_id, start_date, end_date } = req.query;

    const where = {};
    if (status) where.status = status;
    if (partner_id) where.user_id = partner_id;
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at[Op.gte] = new Date(start_date);
      if (end_date) where.created_at[Op.lte] = new Date(end_date);
    }

    const leads = await Lead.findAll({
      where,
      include: [{ model: User, attributes: ["name", "email"] }],
      order: [["created_at", "DESC"]],
    });

    res.json(leads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar indicações" });
  }
});

// Buscar uma indicação específica
router.get("/leads/:id", adminMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id, {
      include: [{ model: User, attributes: ["name", "email"] }],
    });

    if (!lead) {
      return res.status(404).json({ error: "Indicação não encontrada" });
    }

    res.json(lead);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar indicação" });
  }
});

// Fechar contrato
router.put("/leads/:id/close-contract", adminMiddleware, async (req, res) => {
  try {
    const { contract_value, insurance_company, policy_number } = req.body;

    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({ error: "Indicação não encontrada" });
    }

    const commission_value = contract_value * 0.5;

    lead.contract_value = contract_value;
    lead.commission_value = commission_value;
    lead.insurance_company = insurance_company;
    lead.policy_number = policy_number;
    lead.contract_date = new Date();
    lead.status = "contrato_fechado";

    await lead.save();

    const partner = await User.findByPk(lead.user_id);
    if (partner) {
      partner.total_contracts = (partner.total_contracts || 0) + 1;
      partner.total_commission =
        parseFloat(partner.total_commission || 0) +
        parseFloat(commission_value);
      await partner.save();
    }

    res.json({
      message: "✅ Contrato fechado com sucesso!",
      lead: {
        id: lead.id,
        client_name: lead.name,
        contract_value: lead.contract_value,
        commission_value: lead.commission_value,
        status: lead.status,
      },
      partner: partner
        ? {
            name: partner.name,
            total_contracts: partner.total_contracts,
            total_commission: partner.total_commission,
          }
        : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao fechar contrato" });
  }
});

// Listar comissões
router.get("/commissions", adminMiddleware, async (req, res) => {
  try {
    const leads = await Lead.findAll({
      where: {
        status: ["contrato_fechado", "comissao_paga"],
      },
      include: [{ model: User, attributes: ["name", "email", "pix_key"] }],
      order: [["contract_date", "DESC"]],
    });

    const totalPending = leads
      .filter((l) => l.status === "contrato_fechado")
      .reduce((sum, l) => sum + parseFloat(l.commission_value || 0), 0);

    const totalPaid = leads
      .filter((l) => l.status === "comissao_paga")
      .reduce((sum, l) => sum + parseFloat(l.commission_value || 0), 0);

    res.json({
      commissions: leads,
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

// Pagar comissão
router.put("/commissions/:id/pay", adminMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({ error: "Comissão não encontrada" });
    }

    lead.status = "comissao_paga";
    await lead.save();

    res.json({
      message: "✅ Comissão marcada como paga!",
      lead: {
        id: lead.id,
        client_name: lead.name,
        commission_value: lead.commission_value,
        status: lead.status,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao pagar comissão" });
  }
});

module.exports = router;
