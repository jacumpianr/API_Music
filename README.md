#  Music_API  
API REST para gestionar **artistas, álbumes y canciones**, incluyendo relaciones entre entidades.  
Desarrollada con **Node.js + Express + MySQL**.

---

##  Características principales

- CRUD completo de Artistas, Álbumes y Canciones  
- Subida de imágenes para artistas (Multer)  
- Validación de datos básicos  
- Relaciones:
  - Un artista → muchos álbumes  
  - Un álbum → muchas canciones  
- Documentación con **OpenAPI (Swagger)** y visualización con **Redoc**
- Código modular (rutas, controladores, middlewares)

---

##  Estructura del proyecto
Music_API/
├── controllers/
│ ├── artistasController.js
│ ├── albumesController.js
│ └── cancionesController.js
├── routes/
│ ├── artistasRoutes.js
│ ├── albumesRoutes.js
│ └── cancionesRoutes.js
├── uploads/
│ └── (imágenes de artistas)
├── openapi.yaml
├── index.js
├── db.js
└── package.json

---

##  Instalación

### 1️⃣ Clonar el repositorio  
```bash
git clone https://github.com/tuusuario/Music_API.git
cd Music_API