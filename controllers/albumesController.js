const db = require('../database/conexion.js');
const { promisify } = require('util');

class AlbumesController {
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
            `SELECT * FROM albumes`,
            [],
            (rows) => res.status(200).json({ message: 'Todos los albumes', rows })
        );
    }

    consultarDetalle = (req, res) => {
        const { id } = req.params; 
        this.ejecutarQuery(
            res,
            `SELECT * FROM albumes WHERE id = ?`,
            [id],
            (rows) => {
                if (rows.length === 0)
                    return res.status(404).json({ message: 'Album no encontrado' });

                res.status(200).json({ message: 'Album encontrado', rows });
            }
        );
    }

insertar = (req, res) => {
    const { Titulo, FechaLanzamiento, IdArtista} = req.body;
    this.ejecutarQuery(
        res,
        `SELECT Id FROM artistas WHERE Id = ?`,
        [IdArtista],
        (rows) => {
            if (rows.length === 0) {
                return res.status(404).json({
                    message: "El artista especificado no existe"
                });
            }
            this.ejecutarQuery(
                res,
                `INSERT INTO albumes (Titulo, FechaLanzamiento, IdArtista)
                VALUES (?, ?, ?)`,
                [Titulo, FechaLanzamiento, IdArtista],
                (result) => res.status(201).json({
                    message: 'Álbum insertado correctamente',
                    id: result.insertId
                })
            );
        }
    );
}

    // Recoremos que este metodo se ejecuta mediante el el metodo PUT lo que quiere decir que actualizara TODO el objeto, no se debe dejar espacios en blanco.
    actualizar = (req, res) => {
        const { id } = req.params;
        const { Titulo, FechaLanzamiento, IdArtista} = req.body;
        this.ejecutarQuery(
            res,
            `UPDATE albumes 
            SET Titulo = ?, FechaLanzamiento = ?, IdArtista = ?
            WHERE id = ?`,
            [Titulo, FechaLanzamiento, IdArtista, id],
            (result) => {
                if (result.affectedRows === 0)
                    return res.status(404).json({ message: 'Album no encontrado' });
                    res.status(200).json({ message: 'Album actualizado correctamente' });
            }
        );
    }

    eliminar = (req, res) => {
        const { id } = req.params;
        this.ejecutarQuery(
            res,
            `DELETE FROM albumes WHERE id = ?`,
            [id],
            (result) => {
                if (result.affectedRows === 0)
                    return res.status(404).json({ message: 'ArtisAlbumta no encontrado' });
                res.status(200).json({ message: 'Album eliminado correctamente' });
            }
        );
    }
}

module.exports = new AlbumesController();