import { queryDB } from "../db.js";
const insertProduct = async (req, res) => {
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
        const { nombre, descripcion, precio, sku, base64Image, cantidad } = jsonParsed;
        if (!nombre || !descripcion || !precio || !sku || !base64Image || !cantidad) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "SKU, Nombre, Precio, Imagen, Descripcion and Cantidad fields are required" }));
        }
        try {
            await queryDB('SET @admin_username = ?; INSERT INTO productos (SKU, Nombre, Precio, Imagen, Descripcion, Cantidad) VALUES (?, ?, ?, ?, ?, ?)', [req.user.Username, sku, nombre, precio, base64Image, descripcion, cantidad]);
        } catch (error) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "SKU already in use" }));
        }
        res.writeHead(201);
        res.end(JSON.stringify({ message: "Product created" }));
    });
}

const updateProduct = async (req, res) => {
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
        const { nombre, descripcion, precio, sku, base64Image, cantidad, oldSku } = jsonParsed;
        if (!nombre || !descripcion || !precio || !sku || !base64Image || !cantidad || !oldSku) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "SKU, Nombre, Precio, Imagen, Descripcion, Cantidad and old SKU fields are required" }));
        }
        const product = await queryDB('SELECT * FROM productos WHERE SKU = ?', [oldSku]);
        if (product.length === 0) {
            res.writeHead(404);
            return res.end(JSON.stringify({ error: "Product does not exist" }));
        }
        try {
            await queryDB('SET @admin_username = ?; UPDATE productos SET SKU = ?, Nombre = ?, Precio = ?, Imagen = ?, Descripcion = ?, Cantidad = ? WHERE SKU = ?', [req.user.Username, sku, nombre, precio, base64Image, descripcion, cantidad, oldSku]);
            res.writeHead(200);
            res.end(JSON.stringify({ message: "Product updated" }));
        } catch (error) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "SKU already in use" }));
        }
    });
}

const deleteProduct = async (req, res) => {
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
        const { sku } = jsonParsed;
        if (!sku) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "SKU field is required" }));
        }
        const product = await queryDB('SELECT * FROM productos WHERE SKU = ?', [sku]);
        if (product.length === 0) {
            res.writeHead(404);
            return res.end(JSON.stringify({ error: "Product does not exist" }));
        }
        try {
            await queryDB('SET @admin_username = ?; DELETE FROM productos WHERE SKU = ?', [req.user.Username, sku]);
            res.writeHead(200);
            res.end(JSON.stringify({ message: "Product deleted" }));
        } catch (error) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "SKU not found" }));
        }
    });
}
const selectProduct = async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const sku = url.searchParams.get("sku");

    if (!sku) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: "SKU field is required" }));
    }

    try {
        const product = await queryDB('SELECT SKU, Nombre, Descripcion, Precio, Cantidad as Stock, CAST(Imagen AS CHAR) AS ImagenBase64 FROM productos WHERE SKU = ?', [sku]);
        if (product.length === 0) {
            res.writeHead(404);
            return res.end(JSON.stringify({ error: "Product does not exist" }));
        }
        res.writeHead(200);
        res.end(JSON.stringify(product));
    } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Error" }));
    }
};

const selectProducts = async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 10;
    const order = url.searchParams.get("order") || 'ASC';
    const validOrders = ['ASC', 'DESC'];
    const orderBy = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

    try {
        const products = await queryDB(
            `SELECT SKU, Nombre, Precio, Descripcion, Cantidad, CAST(Imagen AS CHAR) AS ImagenBase64 FROM productos ORDER BY Precio ${orderBy} LIMIT ?, ?`,
            [(page - 1) * limit, limit]
        );
        res.writeHead(200);
        res.end(JSON.stringify(products));
    } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Error" }));
    }
};

export { insertProduct, updateProduct, deleteProduct, selectProduct, selectProducts };