import { authorize } from "./auth.js";
import { selectBitacoras } from "./endpoints/bitacora.js";
import { deleteCarrito, insertCarrito, selectCarrito, updateCarrito } from "./endpoints/carrito.js";
import { deleteDireccion, insertDireccion, selectDireccion, selectDirecciones } from "./endpoints/direcciones.js";
import { deleteProduct, insertProduct, selectProduct, selectProducts, updateProduct } from "./endpoints/producto.js";
import { changeUserDetails, deleteUser, login, modifyUser, register, registerAdmin, selectUsers } from "./endpoints/user.js";
import { comprar, selectVentas } from "./endpoints/ventas.js";
import { createOrder } from "./services/paypal.js";

const handleRequest = (req, res) => {
    res.setHeader("Content-Type", "application/json");

    if (req.method === "GET" && req.url === "/") {
        res.writeHead(200);
        res.end(JSON.stringify({ message: "Welcome to our API!" }));
    }
    else if (req.method === "GET" && req.url.startsWith("/login")) {
        login(req, res);
    }
    else if (req.method === "POST" && req.url === "/register") {
        register(req, res);
    }
    else if (req.method === "POST" && req.url === "/registerAdmin") {
        authorize("1")(req, res, () => registerAdmin(req, res));
    }
    else if (req.method === "DELETE" && req.url === "/deleteUser") {
        authorize("1")(req, res, () => deleteUser(req, res));
    }
    else if (req.method === "PUT" && req.url === "/modifyUser") {
        authorize("1")(req, res, () => modifyUser(req, res));
    }
    else if (req.method === "PUT" && req.url === "/changeUserDetails") {
        authorize()(req, res, () => changeUserDetails(req, res));
    }
    else if (req.method === "GET" && req.url.startsWith("/selectUsers")) {
        authorize("1")(req, res, () => selectUsers(req, res));
    }
    else if (req.method === "GET" && req.url.startsWith("/selectBitacoras")) {
        authorize("1")(req, res, () => selectBitacoras(req, res));
    }
    else if (req.method === "POST" && req.url === "/insertProduct") {
        authorize("1")(req, res, () => insertProduct(req, res));
    }
    else if (req.method === "PUT" && req.url === "/updateProduct") {
        authorize("1")(req, res, () => updateProduct(req, res));
    }
    else if (req.method === "DELETE" && req.url === "/deleteProduct") {
        authorize("1")(req, res, () => deleteProduct(req, res));
    }
    else if (req.method === "GET" && req.url.startsWith("/selectProducts")) {
        selectProducts(req, res);
    }
    else if (req.method === "GET" && req.url.startsWith("/selectProduct")) {
        selectProduct(req, res);
    }
    else if (req.method === "GET" && req.url.startsWith("/selectCarrito")) {
        authorize()(req, res, () => selectCarrito(req, res));
    }
    else if (req.method === "DELETE" && req.url === "/deleteCarrito") {
        authorize()(req, res, () => deleteCarrito(req, res));
    }
    else if (req.method === "POST" && req.url === "/insertCarrito") {
        authorize()(req, res, () => insertCarrito(req, res));
    }
    else if (req.method === "PUT" && req.url.startsWith("/updateCarrito")) {
        authorize()(req, res, () => updateCarrito(req, res));
    }
    else if (req.method === "POST" && req.url === "/comprar") {
        authorize()(req, res, () => comprar(req, res));
    }
    else if (req.method === "POST" && req.url === "/create-paypal-order") {
        authorize()(req, res, () => createOrder(req, res));
    }
    else if (req.method === "GET" && req.url.startsWith("/selectVentas")) {
        authorize("1")(req, res, () => selectVentas(req, res));
    }
    else if (req.method === "GET" && req.url.startsWith("/selectDirecciones")) {
        authorize()(req, res, () => selectDirecciones(req, res));
    }
    else if (req.method === "GET" && req.url.startsWith("/selectDireccion")) {
        authorize()(req, res, () => selectDireccion(req, res));
    }
    else if (req.method === "POST" && req.url === "/insertDireccion") {
        authorize()(req, res, () => insertDireccion(req, res));
    } else if (req.method === "DELETE" && req.url === "/deleteDireccion") {
        authorize()(req, res, () => deleteDireccion(req, res));
    }
    else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Not Found" }));
    }
};

export default handleRequest;
