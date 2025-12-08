const db = require('../database/conexion.js');

class AlbumesController {

    async ejecutarQuery(res, sql, params = [], successCallback) {
        try {
            // EN PG: No desestructuramos [result], tomamos el objeto entero
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
            `SELECT * FROM albumes`,
            [],
            // EN PG: Los datos viven en result.rows
            (result) => res.status(200).json({ 
                message: 'Todos los albumes', 
                rows: result.rows 
            })
        );
    }

    consultarDetalle = (req, res) => {
        const { id } = req.params; 
        // CAMBIO: ? por $1
        this.ejecutarQuery(
            res,
            `SELECT * FROM albumes WHERE id = $1`,
            [id],
            (result) => {
                if (result.rows.length === 0)
                    return res.status(404).json({ message: 'Album no encontrado' });

                res.status(200).json({ 
                    message: 'Album encontrado', 
                    rows: result.rows 
                });
            }
        );
    }

    insertar = (req, res) => {
        const { Titulo, FechaLanzamiento, IdArtista} = req.body;
        
        // 1. Primero verificamos que el artista exista (Query anidado)
        this.ejecutarQuery(
            res,
            `SELECT Id FROM artistas WHERE Id = $1`, // CAMBIO: ? por $1
            [IdArtista],
            (resultArtista) => {
                // Si no hay filas, el artista no existe
                if (resultArtista.rows.length === 0) {
                    return res.status(404).json({
                        message: "El artista especificado no existe"
                    });
                }

                // 2. Si existe, procedemos a insertar el álbum
                this.ejecutarQuery(
                    res,
                    `INSERT INTO albumes (Titulo, FechaLanzamiento, IdArtista)
                    VALUES ($1, $2, $3) RETURNING id`, // CAMBIO: placeholders y RETURNING
                    [Titulo, FechaLanzamiento, IdArtista],
                    (resultInsert) => res.status(201).json({
                        message: 'Álbum insertado correctamente',
                        // EN PG: El ID está en la primera fila devuelta
                        id: resultInsert.rows[0].id
                    })
                );
            }
        );
    }

    actualizar = (req, res) => {
        const { id } = req.params;
        const { Titulo, FechaLanzamiento, IdArtista} = req.body;
        
        // CAMBIO: Mantenemos el orden estricto de los $
        // Titulo=$1, Fecha=$2, IdArtista=$3, id(del WHERE)=$4
        this.ejecutarQuery(
            res,
            `UPDATE albumes 
            SET Titulo = $1, FechaLanzamiento = $2, IdArtista = $3
            WHERE id = $4`,
            [Titulo, FechaLanzamiento, IdArtista, id],
            (result) => {
                // EN PG: Usamos rowCount
                if (result.rowCount === 0)
                    return res.status(404).json({ message: 'Album no encontrado' });
                    
                res.status(200).json({ message: 'Album actualizado correctamente' });
            }
        );
    }

    eliminar = (req, res) => {
        const { id } = req.params;
        // CAMBIO: ? por $1
        this.ejecutarQuery(
            res,
            `DELETE FROM albumes WHERE id = $1`,
            [id],
            (result) => {
                if (result.rowCount === 0)
                    return res.status(404).json({ message: 'Album no encontrado' });
                
                res.status(200).json({ message: 'Album eliminado correctamente' });
            }
        );
    }
}

module.exports = new AlbumesController();