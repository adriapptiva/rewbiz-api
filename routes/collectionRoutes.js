// routes/collectionRoutes.js
const express = require("express");
const router = express.Router();
const collectionController = require("../controllers/collectionController");

// Ruta para guardar usuarios
router.post('/save-user', collectionController.saveUser);

// Ruta para update del usuario
router.post('/update-user', collectionController.updateUser);

// Ruta para get user
router.get('/user/:uid', collectionController.getUserByEmail);

// Ruta para generar informe básico
router.post('/generate-report', collectionController.generateReportWithOpenAI);

// Ruta para validar el ID de negocio
router.get('/validate-id-negocio/:id', collectionController.validateIdNegocio);

// Ruta para obtener los reportes solicitados por id_negocio
router.get('/get-reports/:id_negocio', collectionController.getReportsByBusinessId);

// Ruta para obtener un documento por ID en una colección específica
router.get("/:collection/:id", collectionController.getItemById);

// Ruta para obtener negocios cercanos
router.get("/nearby-businesses", collectionController.getNearbyBusinesses);

// Ruta para guardar informes
router.post('/save-report', collectionController.saveReport);

// Ruta para manejar la autenticación con LinkedIn
router.post('/linkedin-auth', collectionController.linkedinAuth);


module.exports = router;
