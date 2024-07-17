// routes/businessRoutes.js
const express = require("express");
const router = express.Router();
const businessController = require("../controllers/businessController");

// Ruta para obtener todos los negocios
router.get("/", businessController.getAllBusinesses);

// Ruta para obtener un negocio por ID
router.get("/:id", businessController.getBusinessById);

module.exports = router;
