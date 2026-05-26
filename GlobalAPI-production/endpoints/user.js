import { generateToken } from "../auth.js";
import { queryDB } from "../db.js";
import bcrypt from "bcrypt";

const login = async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const username = url.searchParams.get("username");
    const password = url.searchParams.get("password");

    if (!username || !password) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: "Username and password fields are required" }));
    }

    const user = await queryDB('SELECT * FROM users WHERE username = ?', [username]);
    if (user.length === 0) {
        res.writeHead(401);
        return res.end(JSON.stringify({ error: "Invalid credentials" }));
    }
    const match = await bcrypt.compare(password, user[0].Password);
    if (!match) {
        res.writeHead(401);
        return res.end(JSON.stringify({ error: "Invalid credentials" }));
    }
    const token = generateToken(user[0]);
    res.writeHead(200);
    res.end(JSON.stringify({ token }));

};

const register = (req, res) => {
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
        const { username, email, password } = jsonParsed;
        if (!username || !email || !password) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "Username, email and password fields are required" }));
        }
        const hashedPassword = await bcrypt.hash(password, 11);
        try {
            await queryDB('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
            res.writeHead(201);
            res.end(JSON.stringify({ message: "User created successfully" }));
        } catch (error) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Username already in use" }));
        }
    });
};

const registerAdmin = (req, res) => {
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
        const { username, email, password, role } = jsonParsed;
        if (!username || !email || !password || !role) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "Username, role, email and password fields are required" }));
        }
        const hashedPassword = await bcrypt.hash(password, 11);
        try {
            await queryDB('SET @admin_username = ?; INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?);', [req.user.Username, username, email, hashedPassword, role]);
            res.writeHead(201);
            res.end(JSON.stringify({ message: "User created successfully" }));
        } catch (error) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Username already in use" }));
        }
    });
};

const deleteUser = (req, res) => {
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
        const { username } = jsonParsed;
        if (!username) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "Username field is required" }));
        }
        try {
            const user = await queryDB('SELECT * FROM users WHERE username = ?', [username]);
            if (user.length === 0) {
                res.writeHead(404);
                return res.end(JSON.stringify({ error: "user does not exist" }));
            }
            await queryDB('SET @admin_username = ?; DELETE FROM users WHERE username = ?', [req.user.Username, username]);
            res.writeHead(200);
            res.end(JSON.stringify({ message: "User deleted successfully" }));
        } catch (error) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "User not found" }));
        }
    });
};

const modifyUser = (req, res) => {
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
        const { username, email, password, role, oldUsername } = jsonParsed;
        if (!username || !email || !role || !oldUsername) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "Username, role, and email fields are required" }));
        }
        const user = await queryDB('SELECT * FROM users WHERE username = ?', [oldUsername]);
        if (user.length === 0) {
            res.writeHead(404);
            return res.end(JSON.stringify({ error: "user does not exist" }));
        }
        let hashedPassword = user[0].Password;
        if (password) {
            const match = await bcrypt.compare(password, user[0].Password);
            hashedPassword = user[0].Password;
            if (!match) {
                hashedPassword = await bcrypt.hash(password, 11);
            }
        }
        try {
            await queryDB('SET @admin_username = ?; UPDATE users SET username=?, email=?, password=?, role=? WHERE username=?', [req.user.Username, username, email, hashedPassword, role, oldUsername]);
            res.writeHead(200);
            res.end(JSON.stringify({ message: "User modified successfully" }));
        } catch (error) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Username already in use" }));
        }

    });
};

const selectUsers = async (req, res) => {
    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const page = parseInt(url.searchParams.get("page")) || 1;
        const limit = parseInt(url.searchParams.get("limit")) || 10;
        const order = url.searchParams.get("order") || 'ASC';
        const validOrders = ['ASC', 'DESC'];
        const orderBy = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

        const users = await queryDB(`SELECT username, role, email FROM users ORDER BY username ${orderBy} LIMIT ?, ?`, [(page - 1) * limit, limit]);
        res.writeHead(200);
        res.end(JSON.stringify(users));
    } catch (error) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: "Error" }));
    }
}

const changeUserDetails = (req, res) => {
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
        const { password } = jsonParsed;
        let { email } = jsonParsed;

        const user = await queryDB('SELECT * FROM users WHERE username = ?', [req.user.Username]);
        if (user.length === 0) {
            res.writeHead(404);
            return res.end(JSON.stringify({ error: "user does not exist" }));
        }
        if (!email) {
            email = user[0].Email;
        }
        let hashedPassword = user[0].Password;
        if (password) {
            const match = await bcrypt.compare(password, user[0].Password);
            hashedPassword = user[0].Password;
            if (!match) {
                hashedPassword = await bcrypt.hash(password, 11);
            }
        }
        try {
            await queryDB('SET @admin_username = ?; UPDATE users SET email=?, password=? WHERE username=?', [req.user.Username, email, hashedPassword, req.user.Username]);
            res.writeHead(200);
            res.end(JSON.stringify({ message: "User modified successfully" }));
        } catch (error) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Username does not exist" }));
        }

    });
};
export { login, register, registerAdmin, deleteUser, modifyUser, selectUsers, changeUserDetails };