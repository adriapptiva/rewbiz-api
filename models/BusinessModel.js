const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  id_negocio: String,
  code1: String,
  code2: String,
  coordenadas: Array,
  dateSaved: Date,
  direccion: Array,
  horario: Array,
  id_tipo: String,
  id_tipo_nombre_direccion: String,
  imagen: String,
  logo: String,
  nombre: String,
  opcionesServicio: Array,
  reseñas_precio: Array,
  reviews: Array,
  telefono: String,
  url: String,
  localidad: String,
  provincia: String,
});

module.exports = mongoose.model('gimnasios_boxeo', businessSchema);
