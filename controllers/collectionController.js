const { MongoClient, ObjectId } = require('mongodb');
const axios = require('axios');
const url = process.env.MONGODB_URI;
const Report = require('../models/Report');


// Guardar el usuario
const saveUser = async (req, res) => {
  const userData = req.body;
  let client;

  if (!userData.username) {
    userData.username = userData.email || userData.displayName;  // Manejo de username opcional
  }

  try {
    client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    await client.connect();
    const db = client.db();
    const usersCollection = db.collection('users');

    // Verificar si el usuario ya existe
    const existingUser = await usersCollection.findOne({ uid: userData.uid });

    if (existingUser) {
      // Actualizar el usuario existente
      await usersCollection.updateOne(
        { uid: userData.uid },
        { $set: userData }
      );
      res.status(200).json({ message: 'Usuario actualizado con éxito' });
    } else {
      // Insertar nuevo usuario
      await usersCollection.insertOne(userData);
      res.status(201).json({ message: 'Usuario guardado con éxito' });
    }
  } catch (error) {
    console.error('Error al guardar el usuario:', error.message);
    res.status(500).json({ error: 'Internal Server Error', message: 'Error al guardar el usuario' });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

// Get user by Email
const getUserByEmail = async (req, res) => {
  const { uid } = req.params;
  let client;

  try {
    client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    await client.connect();
    const db = client.db();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ uid: uid });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Buscar el documento correspondiente en todo_restaurantes_españa
    const restaurantesCollection = db.collection('todo_restaurantes_españa');
    const business = await restaurantesCollection.findOne({ id_negocio: user.id_negocio });

    res.status(200).json({
      ...user,
      businessId: business ? business._id.toString() : null
    });
  } catch (error) {
    console.error('Error al obtener el usuario:', error.message);
    res.status(500).json({ error: 'Internal Server Error', message: 'Error al obtener el usuario' });
  } finally {
    if (client) {
      await client.close();
    }
  }
};


// Update user
const updateUser = async (req, res) => {
  const { email, id_negocio, nombre_usuario, telefono, mail_contacto, direccion } = req.body;
  let client;

  try {
    client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection('users');

    // Construir el objeto $set dinámicamente
    const updateFields = { id_negocio: id_negocio };

    if (nombre_usuario) {
      updateFields.nombre_usuario = nombre_usuario;
    }
    if (telefono) {
      updateFields.telefono = telefono;
    }
    if (mail_contacto) {
      updateFields.mail_contacto = mail_contacto;
    }
    if (direccion) {
      updateFields.direccion = direccion;
    }

    const result = await usersCollection.updateOne(
      { email: email },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error.message);
    res.status(500).json({ error: 'Internal Server Error', message: 'Error al actualizar el usuario' });
  } finally {
    if (client) {
      await client.close();
    }
  }
};


// Función para generar un informe con OpenAI
const openaiApiKey = process.env.OPENAI_API_KEY;

const generateReportWithOpenAI = async (req, res) => {
  try {
    const data = req.body; // Obtén los datos del cuerpo de la solicitud

    // Llamada a la API de OpenAI
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'text-davinci-003', // Asegúrate de que el modelo sea válido
      prompt: `Genera un informe detallado sobre el siguiente negocio:\n${JSON.stringify(data)}`,
      max_tokens: 150
    }, {
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Devuelve el informe generado como respuesta
    res.status(200).json({ report: response.data.choices[0].text });
  } catch (error) {
    console.error('Error al generar el informe:', error.message); // Imprime el mensaje de error
    res.status(500).json({ message: 'Error al generar el informe', error: error.message });
  }
};

// Función para obtener un documento por ID en una colección específica
const getItemById = async (req, res) => {
  const { collection, id } = req.params;
  let client;

  try {
    client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    await client.connect();
    const db = client.db();

    const collectionNames = await db.listCollections().toArray();
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
    console.error("Error al obtener el documento:", error.message); // Imprime el mensaje de error
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

    const nearbyBusinesses = await collectionRef.find({
      coordinatesGeoJSON: {
        $geoWithin: {
          $centerSphere: [[parseFloat(lat), parseFloat(lng)], radiusInMeters / 6378100],
        },
      },
    }).toArray();

    res.json(nearbyBusinesses);
  } catch (error) {
    console.error("Error al obtener los comercios cercanos:", error.message); // Imprime el mensaje de error
    res.status(500).json({ error: "Internal Server Error", message: "Error interno del servidor" });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

// Función para validar el ID de negocio
const validateIdNegocio = async (req, res) => {
  let { id } = req.params;
  id = decodeURIComponent(id);
  let client;

  try {
    client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    await client.connect();
    const db = client.db();

    // Asumiendo que 'todo_restaurantes_españa' es el nombre correcto de tu colección
    const collection = db.collection('todo_restaurantes_españa');

    const business = await collection.findOne({ id_negocio: id });

    if (business) {
      res.status(200).json({ isValid: true, message: 'ID de negocio válido' });
    } else {
      res.status(200).json({ isValid: false, message: 'ID de negocio no encontrado' });
    }
  } catch (error) {
    console.error('Error al validar el ID de negocio:', error.message);
    res.status(500).json({ error: 'Internal Server Error', message: 'Error al validar el ID de negocio' });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

// Guardar un informe en mongo
// controllers/collectionController.js

const saveReport = async (req, res) => {
  const { id_negocio, id_informe, fecha_informe, texto } = req.body;
  let client;

  try {
    client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    await client.connect();
    const db = client.db();
    const informesCollection = db.collection('informes');

    // Crea el objeto del informe con el estado inicial en "processing"
    const newReport = {
      id_negocio: id_negocio,
      id_informe: id_informe,
      fecha_informe: fecha_informe,
      texto: texto,
      status: 'processing'
    };

    // Inserta el nuevo informe en la colección
    const result = await informesCollection.insertOne(newReport);

    // Devuelve el ID del documento insertado
    res.status(201).json({ message: 'Informe guardado con éxito', _id: result.insertedId });
  } catch (error) {
    console.error('Error al guardar el informe:', error.message);
    res.status(500).json({ error: 'Internal Server Error', message: 'Error al guardar el informe' });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

const linkedinClientId = process.env.LINKEDIN_CLIENT_ID;
const linkedinClientSecret = process.env.LINKEDIN_CLIENT_SECRET;

// Manejar la autenticación con LinkedIn
const linkedinAuth = async (req, res) => {
  const { code, redirectUri } = req.body;
  let client;

  try {
    // Intercambiar el código de autorización por un token de acceso
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token } = tokenResponse.data;

    // Obtener información del usuario de LinkedIn
    const userInfoResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userInfo = userInfoResponse.data;
    const email = emailResponse.data.elements[0]['handle~'].emailAddress;

    // Guardar o actualizar el usuario en la base de datos
    client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection('users');

    const user = {
      uid: userInfo.id,
      email: email || `${userInfo.id}@linkedin.temp`,
      displayName: `${userInfo.localizedFirstName} ${userInfo.localizedLastName}`,
      photoURL: userInfo.profilePicture ? userInfo.profilePicture['displayImage~'].elements[0].identifiers[0].identifier : null,
    };

    // Verificar si el usuario ya existe
    const existingUser = await usersCollection.findOne({ uid: user.uid });

    if (existingUser) {
      await usersCollection.updateOne({ uid: user.uid }, { $set: user });
    } else {
      await usersCollection.insertOne(user);
    }

    // Devolver el token y la información del usuario al cliente
    res.status(200).json({ accessToken: access_token, user });
  } catch (error) {
    console.error('Error al autenticar con LinkedIn:', error.message);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

const getReportsByBusinessId = async (req, res) => {
  const { id_negocio } = req.params;
  const decodedIdNegocio = decodeURIComponent(id_negocio);
  let client;

  try {
    client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db();
    const informesCollection = db.collection('informes');

    const reports = await informesCollection.find({ id_negocio: decodedIdNegocio }).toArray();

    if (reports.length === 0) {
      console.log("No se encontraron informes para este id_negocio.");
      return res.status(404).json({ message: "No se encontraron informes para este id_negocio." });
    }
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error al obtener los informes solicitados:', error.message);
    res.status(500).json({ error: 'Internal Server Error', message: 'Error al obtener los informes solicitados' });
  } finally {
    await client.close();
  }
};


module.exports = {
  saveUser,
  getUserByEmail,
  updateUser,
  generateReportWithOpenAI,
  getItemById,
  getNearbyBusinesses,
  validateIdNegocio,
  saveReport,
  linkedinAuth,
  getReportsByBusinessId
};
