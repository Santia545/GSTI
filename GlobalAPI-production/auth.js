import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

// Generate JWT token
const generateToken = (user) => {
    const { Username, Email, Role } = user;
    return jwt.sign({ Username, Email, Role }, SECRET_KEY, { expiresIn: "1h", algorithm: "HS256" });
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, SECRET_KEY, { algorithms: ["HS256"], maxAge: "1h" });
    } catch (error) {
        return null;
    }
};

const authorize = (requiredRole = "") => (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        res.writeHead(401);
        return res.end(JSON.stringify({ error: "Unauthorized: No token provided" }));
    }

    const token = authHeader.split(" ")[1];
    const user = verifyToken(token);

    if (!user) {
        res.writeHead(401);
        return res.end(JSON.stringify({ error: "Unauthorized: Invalid token" }));
    }

    if (requiredRole !== "" && user.Role != requiredRole) {
        res.writeHead(403);
        return res.end(JSON.stringify({ error: "Forbidden: Insufficient permissions" }));
    }

    req.user = user;
    next();
};

export { generateToken, verifyToken, authorize };
