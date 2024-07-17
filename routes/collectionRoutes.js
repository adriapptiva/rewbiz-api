// routes/collectionRoutes.js
const express = require("express");
const router = express.Router();
const collectionController = require("../controllers/collectionController");

// Ruta para obtener un documento por ID en una colección específica
router.get("/:collection/:id", collectionController.getItemById);

// Ruta para obtener negocios cercanos
router.get("/nearby-businesses", collectionController.getNearbyBusinesses);

module.exports = router;
