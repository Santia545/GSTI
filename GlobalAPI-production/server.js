import { createServer } from "http";
import handleRequest from "./routes.js";
import cron from 'node-cron';
import { createBackup } from "./db.js";

const PORT = 3000;

const server = createServer((req, res) => {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    handleRequest(req, res);
});
//remove '0.0.0.0' to run only locally 
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
//second, minute, hour, dayofmonth, month, dayofweek || minute, hour, dayofmonth, month, dayofweek
/*cron.schedule('0 0 1 * * ', () => {
    createBackup();
});*/