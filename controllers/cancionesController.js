const db = require('../database/conexion.js');

class CancionesController {

    async ejecutarQuery(res, sql, params = [], successCallback) {
        try {
            // EN PG: Obtenemos el objeto 'result' completo, sin desestructurar [result]
            const result = await db.query(sql, params); 
            successCallback(result);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error en la base de datos', detalle: err.message });
        }
    }

    consultar = (req, res) => {
        this.ejecutarQuery(
            res,
            `SELECT * FROM canciones`,
            [],
            // EN PG: Los datos están en result.rows
            (result) => res.status(200).json({ 
                message: 'Todas las canciones', 
                rows: result.rows 
            })
        );
    }

    consultarDetalle = (req, res) => {
        const { id } = req.params; 
        // CAMBIO: ? por $1
        this.ejecutarQuery(
            res,
            `SELECT * FROM canciones WHERE id = $1`,
            [id],
            (result) => {
                // EN PG: Verificamos result.rows.length
                if (result.rows.length === 0)
                    return res.status(404).json({ message: 'Cancion no encontrada' });

                res.status(200).json({ 
                    message: 'Cancion encontrada', 
                    rows: result.rows 
                });
            }
        );
    }

    insertar = (req, res) => {
        const { Titulo, Duracion, Genero, IdAlbum, IdArtista } = req.body;
        
        // Validación básica (opcional pero recomendada)
        if (!Titulo || !Duracion) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        // CAMBIO: 
        // 1. Usamos $1, $2, $3, $4, $5
        // 2. Agregamos "RETURNING id" al final
        this.ejecutarQuery(
            res,
            `INSERT INTO canciones (Titulo, Duracion, Genero, IdAlbum, IdArtista) 
            VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [Titulo, Duracion, Genero, IdAlbum, IdArtista],
            (result) => res.status(201).json({
                message: 'Cancion insertada correctamente',
                // EN PG: El ID viene en result.rows[0].id
                id: result.rows[0].id
            })
        );
    }

    actualizar = (req, res) => {
        const { id } = req.params;
        const { Titulo, Duracion, Genero, IdAlbum, IdArtista } = req.body;

        // CAMBIO: Debemos llevar la cuenta de los $ en orden
        // Titulo=$1, Duracion=$2, Genero=$3, IdAlbum=$4, IdArtista=$5, id=$6
        this.ejecutarQuery(
            res,
            `UPDATE canciones 
            SET Titulo = $1, Duracion = $2, Genero = $3, IdAlbum = $4, IdArtista = $5
            WHERE id = $6`,
            [Titulo, Duracion, Genero, IdAlbum, IdArtista, id],
            (result) => {
                // EN PG: Usamos rowCount en lugar de affectedRows
                if (result.rowCount === 0)
                    return res.status(404).json({ message: 'Cancion no encontrada' });
                
                res.status(200).json({ message: 'Cancion actualizada correctamente' });
            }
        );
    }

    // Método PATCH: Actualización parcial para Canciones
    actualizarPatch = (req, res) => {
        const { id } = req.params;
        const updates = req.body;

        const allowedFields = ['Titulo', 'Duracion', 'Genero', 'IdAlbum', 'IdArtista'];

        const keys = Object.keys(updates).filter(key => allowedFields.includes(key));
        const values = keys.map(key => updates[key]);

        if (keys.length === 0) {
            return res.status(400).json({
                message: 'No se enviaron campos válidos para actualizar',
                camposPermitidos: allowedFields
            });
        }

        const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

        values.push(id);

        const sql = `UPDATE canciones SET ${setClause} WHERE id = $${values.length}`;

        this.ejecutarQuery(
            res,
            sql,
            values,
            (result) => {
                if (result.rowCount === 0) {
                    return res.status(404).json({ message: 'Canción no encontrada' });
                }
                res.status(200).json({
                    message: 'Canción actualizada parcialmente correctamente',
                    camposActualizados: keys
                });
            }
        );
    }

    eliminar = (req, res) => {
        const { id } = req.params;
        // CAMBIO: ? por $1
        this.ejecutarQuery(
            res,
            `DELETE FROM canciones WHERE id = $1`,
            [id],
            (result) => {
                // EN PG: Usamos rowCount
                if (result.rowCount === 0)
                    return res.status(404).json({ message: 'Cancion no encontrada' });
                
                res.status(200).json({ message: 'Cancion eliminada correctamente' });
            }
        );
    }
}

module.exports = new CancionesController();