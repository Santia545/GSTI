import { queryDB } from "../db.js";
import { captureOrder } from "../services/paypal.js";
import { sendEmail } from "../services/smtp.js";
//TODO: SEND EMAIL WHEN BUYING WITHOUT PAYPAL
const comprar = async (req, res) => {
    let body = "";

    req.on("data", chunk => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        let jsonParsed;
        let paypalResponse;
        try {
            jsonParsed = JSON.parse(body);
        } catch (error) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
        let { payMethod, idDireccion } = jsonParsed;
        if (!payMethod || !idDireccion) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "Metodo de pago y direccion requeridos" }));
        }
        const direccion = await queryDB('SELECT id, direccion FROM direcciones WHERE id=? AND user = ?', [idDireccion, req.user.Username]);
        if (direccion.length === 0) {
            res.writeHead(406);
            return res.end(JSON.stringify({ error: "direccion no existe" }));
        }
        const carrito = await queryDB('SELECT c.sku, c.cantidad, p.precio, p.nombre FROM carritos c JOIN productos p ON c.sku = p.sku WHERE c.user = ?', [req.user.Username]);
        if (carrito.length === 0) {
            res.writeHead(406);
            return res.end(JSON.stringify({ error: "Carrito vacio" }));
        }

        const carritoInvalido = await queryDB(`
            SELECT c.id, c.sku 
            FROM carritos c
            JOIN productos p ON c.sku = p.sku
            WHERE c.user = ? 
            AND c.cantidad > p.cantidad
        `, [req.user.Username]);
        if (carritoInvalido.length > 0) {
            res.writeHead(406);
            return res.end(JSON.stringify({ error: "Out of stock products", productos: JSON.stringify(carritoInvalido) }));
        }
        const total = carrito.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);
        const content = `
            <p>Productos:</p>
            <table>
                <tr>
                    <th>Nombre</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                </tr>
                ${carrito.map(item => `
                <tr>
                    <td>${item.nombre}</td>
                    <td>${item.cantidad}</td>
                    <td>$${item.precio}</td>
                </tr>`).join('')}
            </table>
            <p>Precio Total: $${total}</p>
            <p>Dirección de Envío: ${direccion[0].direccion}</p>
        `;
        if (payMethod != 1) {
            const { orderID } = jsonParsed;
            if (!orderID) {
                res.writeHead(400);
                return res.end(JSON.stringify({ error: "OrderID field is required" }));
            }
            paypalResponse = await captureOrder(orderID);
            let errorDetail = Array.isArray(paypalResponse.details) && paypalResponse.details[0];
            if (errorDetail) {
                res.writeHead(200);
                res.end(JSON.stringify(paypalResponse));
            }
            sendEmail(req.user.Email, content, true);
        } else {
            sendEmail(req.user.Email, content);
        }
        try {
            await queryDB(`
            INSERT INTO ventas (TOTAL, SKU, cantidad, user, MetodoPago, direccion)
            SELECT (c.cantidad * p.precio) AS TOTAL, c.SKU, c.cantidad, c.user, ?, ?
            FROM carritos c
            JOIN productos p ON c.SKU = p.SKU
            WHERE c.user = ?;
        `, [payMethod, idDireccion, req.user.Username]);
        } catch (error) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "Error" }));
        }
        try {
            await queryDB(`
                UPDATE productos p
                JOIN carritos c ON p.SKU = c.SKU
                SET p.Cantidad = p.Cantidad - c.Cantidad
                WHERE c.user = ?;
            `, [req.user.Username]);
        } catch (error) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "Error" }));
        }

        try {
            await queryDB('DELETE FROM carritos WHERE user = ?', [req.user.Username]);
            res.writeHead(200);
            let responseMesage = JSON.stringify({ message: "Compra realizada" });
            if (paypalResponse) {
                responseMesage = JSON.stringify(paypalResponse);
            }
            res.end(responseMesage);
        } catch (error) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "Error" }));
        }
    });
}

const selectVentas = async (req, res) => {
    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const page = parseInt(url.searchParams.get("page")) || 1;
        const limit = parseInt(url.searchParams.get("limit")) || 10;
        const order = url.searchParams.get("order") || 'ASC';
        const validOrders = ['ASC', 'DESC'];
        const orderBy = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

        const ventas = await queryDB(`
            SELECT 
                CONCAT(YEAR(fecha), '-', MONTH(fecha)) as mes,
                SUM(total) as total
            FROM ventas
            GROUP BY YEAR(fecha), MONTH(fecha)  ORDER BY mes ${orderBy} LIMIT ?, ?`, [(page - 1) * limit, limit]
        );
        res.writeHead(200);
        res.end(JSON.stringify(ventas));
    } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Error" }));
    }
}

export { comprar, selectVentas };