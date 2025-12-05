const db = require('../database/conexion.js');

class ArtistasController {

    // Método genérico ajustado para el objeto de respuesta de PostgreSQL
    async ejecutarQuery(res, sql, params = [], successCallback) {
        try {
            // EN PG: No se desestructura como [rows]. Se obtiene un objeto 'result'.
            const result = await db.query(sql, params);
            successCallback(result);
        } catch (err) {
            console.error(err); // Es bueno ver el error en la consola de Vercel
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
            (result) => res.status(200).json({ // Recibimos 'result' completo
                message: 'Lista de artistas obtenida correctamente',
                data: result.rows // EN PG: Los datos están en .rows
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
        // CAMBIO: ? por $1
        this.ejecutarQuery(
            res,
            `SELECT * FROM artistas WHERE id = $1`, 
            [id],
            (result) => {
                if (result.rows.length === 0) { // EN PG: .rows.length
                    return res.status(404).json({
                        message: 'Artista no encontrado'
                    });
                }
                res.status(200).json({
                    message: 'Artista encontrado',
                    data: result.rows[0] // EN PG: .rows[0]
                });
            }
        );
    }

    insertar = (req, res) => {
        const { Nombre, Nacionalidad, FechaNacimientos } = req.body;
        
        if (!Nombre || !Nacionalidad || !FechaNacimientos) {
            return res.status(422).json({
                message: 'Faltan datos obligatorios',
                camposNecesarios: ['Nombre', 'Nacionalidad', 'FechaNacimientos', 'Fotografia']
            });
        }

        const Fotografia = this.obtenerFotografia(req);

        // CAMBIO IMPORTANTE:
        // 1. Usamos $1, $2, $3, $4 en orden.
        // 2. Agregamos "RETURNING id" al final para que nos devuelva el ID creado.
        this.ejecutarQuery(
            res,
            `INSERT INTO artistas (Nombre, Nacionalidad, FechaNacimientos, Fotografia)
            VALUES ($1, $2, $3, $4) RETURNING id`,
            [Nombre, Nacionalidad, FechaNacimientos, Fotografia],
            (result) => res.status(201).json({
                message: 'Artista registrado correctamente',
                // EN PG: El ID viene en la primera fila devuelta por "RETURNING id"
                id: result.rows[0].id 
            })
        );
    }

    actualizar = (req, res) => {
        const { id } = req.params;
        const { Nombre, Nacionalidad, FechaNacimientos } = req.body;

        if (!id || isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
        if (!Nombre || !Nacionalidad || !FechaNacimientos) {
            return res.status(422).json({ message: 'Todos los campos son obligatorios' });
        }

        const Fotografia = this.obtenerFotografia(req);

        // CAMBIO: Marcadores numerados $1, $2, $3, $4... y el ID es el $5
        this.ejecutarQuery(
            res,
            `UPDATE artistas 
            SET Nombre = $1, Nacionalidad = $2, FechaNacimientos = $3, Fotografia = $4
            WHERE id = $5`,
            [Nombre, Nacionalidad, FechaNacimientos, Fotografia, id],
            (result) => {
                // EN PG: Se usa .rowCount en lugar de .affectedRows
                if (result.rowCount === 0) {
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
        if (!id || isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        // CAMBIO: ? por $1
        this.ejecutarQuery(
            res,
            `DELETE FROM artistas WHERE id = $1`,
            [id],
            (result) => {
                // EN PG: Se usa .rowCount
                if (result.rowCount === 0) {
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