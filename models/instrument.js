const mongoose = require("mongoose");

const instrumentSchema = new mongoose.Schema({
  name: String,
  client: String,
  description: String,
  status: String,
  garantiaFim: Date,
  history: [
    {
      status: String,
      date: Date,
    },
  ],
});

module.exports = mongoose.model("Instrument", instrumentSchema);