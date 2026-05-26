import { queryDB } from "../db.js";

const selectCarrito = async (req, res) => {
    try {
        const carrito = await queryDB('SELECT C.ID, C.user, C.SKU, C.Cantidad, P.Nombre, C.Cantidad*P.Precio as Total, P.Precio as PrecioUnitario, P.Cantidad as Stock from `global`.carritos C inner join `global`.productos P ON C.SKU = P.SKU where C.`user`  = ? ', [req.user.Username]);
        res.writeHead(200);
        res.end(JSON.stringify(carrito));
    } catch (error) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: "Error" }));
    }
};

const deleteCarrito = async (req, res) => {
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
        const { id } = jsonParsed;
        if (!id) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "ID field is required" }));
        }
        const product = await queryDB('SELECT * FROM carritos WHERE id = ? AND user = ?', [id, req.user.Username]);
        if (product.length === 0) {
            res.writeHead(404);
            return res.end(JSON.stringify({ error: "Product does not exist" }));
        }
        try {
            await queryDB('DELETE FROM carritos WHERE id = ?', [id]);
            res.writeHead(200);
            res.end(JSON.stringify({ message: "Product deleted" }));
        } catch (error) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "ID not found" }));
        }
    });
};

const insertCarrito = async (req, res) => {
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
        const { sku, cantidad } = jsonParsed;
        if (!sku || !cantidad) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "SKU and Cantidad fields are required" }));
        }
        const product = await queryDB('SELECT * FROM productos WHERE SKU = ?', [sku]);
        if (product.length === 0) {
            res.writeHead(404);
            return res.end(JSON.stringify({ error: "Product does not exist" }));
        }

        const stock = await queryDB('SELECT Cantidad FROM productos WHERE SKU = ?', [sku]);
        if (stock[0].Cantidad < cantidad) {
            res.writeHead(406);
            return res.end(JSON.stringify({ error: "Not enough stock" }));
        }
        const carrito = await queryDB('SELECT * FROM carritos WHERE SKU = ? AND user = ?', [sku, req.user.Username]);
        if (carrito.length > 0) {
            const stock = await queryDB('SELECT Cantidad FROM productos WHERE SKU = ?', [sku]);
            if (stock[0].Cantidad < carrito[0].Cantidad + cantidad) {
                res.writeHead(406);
                return res.end(JSON.stringify({ error: "Not enough stock" }));
            }
            try {
                await queryDB('UPDATE carritos SET cantidad = cantidad + ? WHERE SKU = ? AND user = ?', [cantidad, sku, req.user.Username]);
                res.writeHead(200);
                res.end(JSON.stringify({ message: "Product updated" }));
            } catch (error) {
                res.writeHead(400);
                return res.end(JSON.stringify({ error: "Error" }));
            }
            return;
        }
        try {
            await queryDB('INSERT INTO carritos (SKU, cantidad, user) VALUES (?, ?, ?)', [sku, cantidad, req.user.Username]);
            res.writeHead(200);
            res.end(JSON.stringify({ message: "Product added" }));
        } catch (error) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "Error" }));
        }
    });
};
const updateCarrito = async (req, res) => {
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
        const { id, cantidad } = jsonParsed;
        if (!id || !cantidad) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "ID and Cantidad fields are required" }));
        }
        const product = await queryDB('SELECT * FROM carritos WHERE id = ? AND user = ?', [id, req.user.Username]);
        if (product.length === 0) {
            res.writeHead(404);
            return res.end(JSON.stringify({ error: "Product does not exist" }));
        }
        const stock = await queryDB('SELECT Cantidad FROM productos WHERE SKU = ?', [product[0].SKU]);
        if (stock[0].Cantidad < cantidad) {
            res.writeHead(406);
            return res.end(JSON.stringify({ error: "Not enough stock" }));
        }
        try {
            await queryDB('UPDATE carritos SET cantidad = ? WHERE id = ?', [cantidad, id]);
            res.writeHead(200);
            res.end(JSON.stringify({ message: "Product updated" }));
        } catch (error) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "ID not found" }));
        }
    });
};

export { selectCarrito, deleteCarrito, insertCarrito, updateCarrito };