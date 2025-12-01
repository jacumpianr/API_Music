const db = require('../database/conexion.js');
const { promisify } = require('util');

class CancionesController {
    async ejecutarQuery(res, sql, params = [], successCallback) {
        try {
            const [result] = await db.query(sql, params); 
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
            (rows) => res.status(200).json({ message: 'Todos las canciones', rows })
        );
    }

    consultarDetalle = (req, res) => {
        const { id } = req.params; 
        this.ejecutarQuery(
            res,
            `SELECT * FROM canciones WHERE id = ?`,
            [id],
            (rows) => {
                if (rows.length === 0)
                    return res.status(404).json({ message: 'Cancion no encontrada' });

                res.status(200).json({ message: 'Cancion encontrada', rows });
            }
        );
    }

    insertar = (req, res) => {
        const { Titulo, Duracion, Genero, IdAlbum, IdArtista } = req.body;
        this.ejecutarQuery(
            res,
            `INSERT INTO canciones (Titulo, Duracion, Genero, IdAlbum, IdArtista) 
            VALUES (?, ?, ?, ?, ?)`,
            [Titulo, Duracion, Genero, IdAlbum, IdArtista],
            (result) => res.status(201).json({
                message: 'Cancion insertada correctamente',
                id: result.insertId
            })
        );
    }

    // Recoremos que este metodo se ejecuta mediante el el metodo PUT lo que quiere decir que actualizara TODO el objeto, no se debe dejar espacios en blanco.
    actualizar = (req, res) => {
        const { id } = req.params;
        const { Titulo, Duracion, Genero, IdAlbum, IdArtista } = req.body;
        this.ejecutarQuery(
            res,
            `UPDATE canciones 
            SET Titulo = ?, Duracion = ?, Genero = ?, IdAlbum = ?, IdArtista = ?
            WHERE id = ?`,
            [Titulo, Duracion, Genero, IdAlbum, IdArtista, id],
            (result) => {
                if (result.affectedRows === 0)
                    return res.status(404).json({ message: 'Cancion no encontrada' });
                    res.status(200).json({ message: 'Cancion actualizada correctamente' });
            }
        );
    }

    eliminar = (req, res) => {
        const { id } = req.params;
        this.ejecutarQuery(
            res,
            `DELETE FROM canciones WHERE id = ?`,
            [id],
            (result) => {
                if (result.affectedRows === 0)
                    return res.status(404).json({ message: 'Cancion no encontrada' });
                res.status(200).json({ message: 'Cancion eliminada correctamente' });
            }
        );
    }
}

module.exports = new CancionesController();