import { queryDB } from "../db.js";

const insertDireccion = async (req, res) => {
    let body = "";

    req.on("data", chunk => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        let jsonParsed;
        try {
            jsonParsed = JSON.parse(body);
        } catch (error) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
        const { direccion, cp, nombre } = jsonParsed;
        if (!direccion || !cp || !nombre) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "Direccion, nombre and cp fiels are required" }));
        }
        try {
            await queryDB(`
                INSERT INTO direcciones (direccion, cp, user, nombre)
                VALUES (?, ?, ?, ?);
            `, [direccion, cp, req.user.Username, nombre]);
            res.writeHead(200);
            res.end(JSON.stringify({ message: "Direccion insertada" }));
        } catch (error) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Error" }));
        }
    });
};

const selectDirecciones = async (req, res) => {
    try {
        const direcciones = await queryDB('SELECT id, nombre FROM direcciones WHERE user = ? AND Eliminado=FALSE', [req.user.Username]);
        res.writeHead(200);
        res.end(JSON.stringify(direcciones));
    } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Error" }));
    }
};

const selectDireccion = async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = parseInt(url.searchParams.get("id"));
    if (!id) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: "id field is required" }));
    }
    try {
        const direcciones = await queryDB('SELECT * FROM direcciones WHERE user = ? AND Eliminado=FALSE AND id = ?', [req.user.Username, id]);
        res.writeHead(200);
        res.end(JSON.stringify(direcciones));
    } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Error" }));
    }
};

const deleteDireccion = async (req, res) => {
    let body = "";

    req.on("data", chunk => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        let jsonParsed;
        try {
            jsonParsed = JSON.parse(body);
        } catch (error) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
        let { id } = jsonParsed;
        if (!id) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "id field is required" }));
        }
        const direccion = await queryDB('SELECT id FROM direcciones WHERE id = ? AND user = ?', [id, req.user.Username]);
        if (direccion.length === 0) {
            res.writeHead(406);
            return res.end(JSON.stringify({ error: "Direccion no existe" }));
        }
        try {
            await queryDB('update direcciones set eliminado=true WHERE id = ? AND user = ?', [id, req.user.Username]);
            res.writeHead(200);
            res.end(JSON.stringify({ message: "Direccion eliminada" }));
        } catch (error) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Error" }));
        }
    });
};

export { insertDireccion, selectDirecciones, deleteDireccion, selectDireccion };