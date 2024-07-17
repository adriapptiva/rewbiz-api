// controllers/businessController.js
const Business = require("../models/Business");

// Obtener todos los negocios
const getAllBusinesses = async (req, res) => {
  try {
    console.log("GET ALL BUSINESS")
    const businesses = await Business.find();
    res.json(businesses);
  } catch (error) {
    console.error("Error al obtener los negocios:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener un negocio por ID
const getBusinessById = async (req, res) => {
  const { id } = req.params;
  try {
    console.log("GET BUSINESS BY ID", id)
    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ message: "Negocio no encontrado" });
    }
    res.json(business);
  } catch (error) {
    console.error("Error al obtener el negocio:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  getAllBusinesses,
  getBusinessById,
};
