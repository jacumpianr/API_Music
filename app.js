const express = require("express");
const cors = require("cors");
const path = require("path");
const redoc = require('redoc-express');

const artistasRoutes = require('./routes/artistasRoutes.js');
const albumesRoutes = require('./routes/albumesRoutes.js');
const cancionesRoutes = require('./routes/cancionesRoutes.js');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/artistas', artistasRoutes);
app.use('/albumes', albumesRoutes);
app.use('/canciones', cancionesRoutes);

app.get('/openapi.yaml', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'openapi.yaml'));
});

app.get('/docs', redoc({
    title: "Documentación de Music_API",
    specUrl: "/openapi.yaml"
}));

module.exports = app;
