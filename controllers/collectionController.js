// controllers/collectionController.js
const { MongoClient, ObjectId } = require('mongodb');
const url = process.env.MONGODB_URI; // URL de conexión a MongoDB desde tu archivo .env

// Función para obtener un documento por ID en una colección específica
const getItemById = async (req, res) => {
  console.log("GET ITEM BY ID");
  const { collection, id } = req.params;
  let client;

  try {
    client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    await client.connect();
    const db = client.db();

    const collectionNames = await db.listCollections().toArray();
    console.log("collectionNames: ", collectionNames);
    const collectionExists = collectionNames.some(col => col.name === collection);

    if (!collectionExists) {
      return res.status(404).json({ error: "Not Found", message: "Colección no encontrada" });
    }

    const collectionRef = db.collection(collection);
    const item = await collectionRef.findOne({ _id: new ObjectId(id) });

    if (!item) {
      return res.status(404).json({ error: "Not Found", message: `Documento con ID ${id} no encontrado en la colección ${collection}` });
    }

    res.json(item);
  } catch (error) {
    console.error("Error al obtener el documento:", error);
    res.status(500).json({ error: "Internal Server Error", message: "Error interno del servidor" });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

// Función para obtener los comercios cercanos
const getNearbyBusinesses = async (req, res) => {
  const { lat, lng, radius, collection } = req.query;
  const radiusInMeters = parseFloat(radius) * 1000; // Convertimos km a metros
  let client;

  try {
    client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    await client.connect();
    const db = client.db();

    const collectionRef = db.collection(collection); // Usar el nombre de la colección del parámetro
    console.log(`Consulta con parámetros: lat=${lat}, lng=${lng}, radius=${radiusInMeters}, collection=${collection}`);

    const nearbyBusinesses = await collectionRef.find({
      coordinatesGeoJSON: {
        $geoWithin: {
          $centerSphere: [[parseFloat(lat), parseFloat(lng)], radiusInMeters / 6378100],
        },
      },
    }).toArray();

    console.log(`Negocios encontrados: ${nearbyBusinesses.length}`);
    res.json(nearbyBusinesses);
  } catch (error) {
    console.error("Error al obtener los comercios cercanos:", error);
    res.status(500).json({ error: "Internal Server Error", message: "Error interno del servidor" });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

module.exports = {
  getItemById,
  getNearbyBusinesses,
};
