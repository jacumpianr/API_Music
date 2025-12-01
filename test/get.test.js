const request = require('supertest');
const app = require('../app');
const db = require('../database/conexion.js');

// Mock DB
jest.mock('../database/conexion.js', () => ({
    query: jest.fn()
}));

describe("GET /artistas", () => {

    test("Debe devolver lista de artistas con status 200", async () => {
        const fakeRows = [
            { id: 1, Nombre: "Bad Bunny" },
            { id: 2, Nombre: "Feid" }
        ];

        db.query.mockResolvedValue([fakeRows]);

        const res = await request(app).get('/artistas');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual(fakeRows);
    });

    test("Debe manejar error en base de datos", async () => {

        db.query.mockRejectedValue(new Error("Fallo DB"));

        const res = await request(app).get('/artistas');

        expect(res.status).toBe(500);
        expect(res.body.error).toBe("Ocurrió un error en la base de datos");
    });

});


