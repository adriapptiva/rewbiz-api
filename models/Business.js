// Definición de modelos específicos (ejemplo)
const FarmaciasMadridSchema = new mongoose.Schema({
  // Definición de campos específicos para la colección farmacias_madrid
  nombre: String,
  id_negocio: String,
  // Otros campos específicos
}, { strict: false });

const GimnasiosBoxeoSchema = new mongoose.Schema({
  // Definición de campos específicos para la colección gimnasios_boxeo
  nombre: String,
  id_negocio: String,
  // Otros campos específicos
}, { strict: false });

// Creación de modelos específicos
const FarmaciasMadridModel = mongoose.model('farmacias_madrid', FarmaciasMadridSchema);
const GimnasiosBoxeoModel = mongoose.model('gimnasios_boxeo', GimnasiosBoxeoSchema);
