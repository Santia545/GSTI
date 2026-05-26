import dotenv from "dotenv";
import { queryDB } from "../db.js";
dotenv.config();
const base = "https://api-m.sandbox.paypal.com";
const
    {
        PAYPAL_CLIENT_ID,
        PAYPAL_CLIENT_SECRET,
    } = process.env;

const generateAccessToken = async () => {
    try {
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            throw new Error("MISSING_API_CREDENTIALS");
        }
        const auth = Buffer.from(
            PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET,
        ).toString("base64");
        const response = await fetch(`${base}/v1/oauth2/token`,
            {
                method: "POST",
                body: "grant_type=client_credentials",
                headers:
                {
                    Authorization: `Basic ${auth}`,
                },
            });

        const data = await response.json();
        return data.access_token;
    }
    catch (error) {
        console.error("Failed to generate Access Token:", error);
        throw error;
    }
};

async function createOrder(req, res) {
    // create accessToken using your clientID and clientSecret
    // for the full stack example, please see the Standard Integration guide
    // https://developer.paypal.com/docs/multiparty/checkout/standard/integrate/
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
    try {
        const accessToken = await generateAccessToken();
        const purchase_units = carrito.map(item => ({
            amount: {
                currency_code: "MXN",
                value: (item.precio * item.cantidad).toFixed(2)
            },
            reference_id: item.sku,
            description: item.nombre
        }));
        const response = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                "purchase_units": purchase_units,
                "intent": "CAPTURE",
                "payment_source": {
                    "paypal": {
                        "experience_context": {
                            "payment_method_preference": "IMMEDIATE_PAYMENT_REQUIRED",
                            "payment_method_selected": "PAYPAL",
                            "brand_name": "MusicZone INC",
                            "locale": "es-MX", //en-US
                            "landing_page": "LOGIN",
                            "shipping_preference": "GET_FROM_FILE",
                            "user_action": "PAY_NOW",
                            /*"return_url": "https://example.com/returnUrl",
                            "cancel_url": "https://example.com/cancelUrl"*/
                        }
                    }
                }
            })
        });
        const json = await response.json();
        res.writeHead(200);
        res.end(JSON.stringify(json));
    } catch (error) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: "Error" }));
    }
}
const captureOrder = async (orderID) => {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderID}/capture`;
    const response = await fetch(url,
        {
            method: "POST",
            headers:
            {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
                // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
                // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
                //"PayPal-Mock-Response": '{"mock_application_codes": "INSTRUMENT_DECLINED"}'
                // "PayPal-Mock-Response": '{"mock_application_codes": "TRANSACTION_REFUSED"}'
                // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
            },
        });
    const jsonResponse = await response.json();
    return jsonResponse;

};
export { createOrder, captureOrder }