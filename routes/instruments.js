const express = require("express");
const router = express.Router();
const path = require("path");
const Instrument = require(path.join(__dirname, "../models/Instrument"));

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// GET: Retorna todos os instrumentos, atualizando automaticamente os que passaram dos 90 dias de garantia
router.get("/", async (req, res) => {
  try {
    let instruments = await Instrument.find();
    const now = new Date();
    const updates = [];

    instruments.forEach((inst) => {
      if (
        inst.status === "em-garantia" &&
        inst.garantiaFim &&
        now >= new Date(inst.garantiaFim)
      ) {
        inst.status = "crm";
        inst.history.push({ status: "crm", date: now });
        updates.push(inst.save());
      }
    });

    if (updates.length > 0) {
      await Promise.all(updates);
      instruments = await Instrument.find();
    }

    res.json(instruments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Cria um novo instrumento
router.post("/", async (req, res) => {
  try {
    const instrument = new Instrument(req.body);
    await instrument.save();
    res.status(201).json(instrument);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Avança o status do instrumento (fluxo padronizado)
router.put("/:id/advance", async (req, res) => {
  try {
    const instrument = await Instrument.findById(req.params.id);
    if (!instrument)
      return res.status(404).json({ error: "Not found" });

    const now = new Date();

    if (instrument.status === "aguardando") {
      instrument.status = "em-servico";
    } else if (instrument.status === "em-servico") {
      instrument.status = "em-garantia";
      instrument.garantiaFim = addDays(now, 90);
    } else if (instrument.status === "em-garantia") {
      instrument.status = "crm";
    } else {
      return res
        .status(400)
        .json({ error: "Invalid status transition" });
    }

    instrument.history.push({ status: instrument.status, date: now });
    await instrument.save();
    res.json(instrument);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Atualiza o status do instrumento com o valor informado (para mudança manual arbitrária)
router.put("/:id/status", async (req, res) => {
  try {
    const { status: newStatus } = req.body;
    const validStatuses = ["aguardando", "em-servico", "em-garantia", "crm"];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const instrument = await Instrument.findById(req.params.id);
    if (!instrument) return res.status(404).json({ error: "Not found" });

    const now = new Date();
    instrument.status = newStatus;
    if (newStatus === "em-garantia") {
      instrument.garantiaFim = addDays(now, 90);
    } else {
      instrument.garantiaFim = null;
    }
    instrument.history.push({ status: newStatus, date: now });
    await instrument.save();
    res.json(instrument);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove um instrumento
router.delete("/:id", async (req, res) => {
  try {
    const instrument = await Instrument.findByIdAndDelete(req.params.id);
    if (!instrument)
      return res.status(404).json({ error: "Instrument not found" });

    res.json({ message: "Instrument deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;