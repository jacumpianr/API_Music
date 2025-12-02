const db = require('../database/conexion.js');
const { promisify } = require('util');
const query = promisify(db.query).bind(db); 

class ArtistasController {
    async ejecutarQuery(res, sql, params = [], successCallback) {
        try {
            const [rows] = await db.query(sql, params);
            successCallback(rows);
        } catch (err) {
            res.status(500).json({
                error: 'Ocurrió un error en la base de datos',
                detalle: err.message
            });
        }
    }

    obtenerFotografia(req) {
        return req.file?.filename || null;
    }

    consultar = (req, res) => {
        this.ejecutarQuery(
            res,
            `SELECT * FROM artistas`,
            [],
            (rows) => res.status(200).json({
                message: 'Lista de artistas obtenida correctamente',
                data: rows
            })
        );
    }

    consultarDetalle = (req, res) => {
        const { id } = req.params;
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: 'El ID proporcionado no es válido'
            });
        }
        this.ejecutarQuery(
            res,
            `SELECT * FROM artistas WHERE id = ?`,
            [id],
            (rows) => {
                if (rows.length === 0) {
                    return res.status(404).json({
                        message: 'Artista no encontrado'
                    });
                }
                res.status(200).json({
                    message: 'Artista encontrado',
                    data: rows[0]
                });
            }
        );
    }

    insertar = (req, res) => {
        const { Nombre, Nacionalidad, FechaNacimientos } = req.body;
        if (!Nombre || !Nacionalidad || !FechaNacimientos) {
            return res.status(422).json({
                message: 'Faltan datos obligatorios para registrar al artista',
                camposNecesarios: ['Nombre', 'Nacionalidad', 'FechaNacimientos', 'Fotografia']
            });
        }
        const Fotografia = this.obtenerFotografia(req);
        this.ejecutarQuery(
            res,
            `INSERT INTO artistas (Nombre, Nacionalidad, FechaNacimientos, Fotografia)
            VALUES (?, ?, ?, ?)`,
            [Nombre, Nacionalidad, FechaNacimientos, Fotografia],
            (result) => res.status(201).json({
                message: 'Artista registrado correctamente',
                id: result.insertId
            })
        );
    }

    actualizar = (req, res) => {
        const { id } = req.params;
        const { Nombre, Nacionalidad, FechaNacimientos } = req.body;
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: 'El ID proporcionado no es válido'
            });
        }
        if (!Nombre || !Nacionalidad || !FechaNacimientos) {
            return res.status(422).json({
                message: 'Todos los campos son obligatorios para actualizar el artista'
            });
        }
        const Fotografia = this.obtenerFotografia(req);
        this.ejecutarQuery(
            res,
            `UPDATE artistas 
            SET Nombre = ?, Nacionalidad = ?, FechaNacimientos = ?, Fotografia = ?
            WHERE id = ?`,
            [Nombre, Nacionalidad, FechaNacimientos, Fotografia, id],
            (result) => {
                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        message: 'No se encontró el artista que desea actualizar'
                    });
                }
                res.status(200).json({
                    message: 'Artista actualizado correctamente'
                });
            }
        );
    }

    eliminar = (req, res) => {
        const { id } = req.params;
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: 'El ID proporcionado no es válido'
            });
        }
        this.ejecutarQuery(
            res,
            `DELETE FROM artistas WHERE id = ?`,
            [id],
            (result) => {
                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        message: 'El artista que intenta eliminar no existe'
                    });
                }
                res.status(200).json({
                    message: 'Artista eliminado correctamente'
                });
            }
        );
    }
}

module.exports = new ArtistasController();