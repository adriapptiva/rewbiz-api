const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // define aquí los campos que tiene cada documento en la colección "informes"
  id_negocio: String,
  // Otros campos que tiene tu colección
  titulo: String,
  fechaSolicitud: Date,
  fechaEntrega: Date,
  status: String,
  downloadLink: String,
});

const Report = mongoose.model('Informe', reportSchema, 'informes');

module.exports = Report;