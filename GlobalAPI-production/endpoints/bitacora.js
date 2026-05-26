import { queryDB } from "../db.js";

const selectBitacoras = async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 10;
    const order = url.searchParams.get("order") || 'ASC';
    const validOrders = ['ASC', 'DESC'];
    const orderBy = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

    try {
        const bitacora = await queryDB(`SELECT * FROM bitacora ORDER BY Fecha ${orderBy} LIMIT ?, ?`, [(page - 1) * limit, limit]);
        res.writeHead(200);
        res.end(JSON.stringify(bitacora));
    } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Error" }));
    }
};

export { selectBitacoras };