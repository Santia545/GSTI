import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import path, { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Go back one folder in the directory URL
const parentDir = path.resolve(__dirname, '..');

dotenv.config();
const PASS = process.env.PASSWORD;

async function queryDB(query, params = []) {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.HOST || 'localhost',
            port: process.env.PORT || '3306',
            user: 'root',
            password: PASS,
            database: 'global',
            multipleStatements: true
        });

        if (!Array.isArray(params)) {
            params = [params];
        }
        const [rows] = await connection.query(query, params);
        console.log(rows);
        return rows;
    } catch (error) {
        console.error('Database Error:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

function createBackup() {
    const backupDir = path.join(parentDir, 'backups');
    //const backupDir = "C:\\Users\\cors9\\OneDrive\\Escritorio\\dump";
    const date = new Date().toISOString().replaceAll(':', '-').split('.')[0]; // Format: YYYY-MM-DD
    const backupFile = path.join(backupDir, `backup-${date}.sql`);
    const dbConfig = {
        host: process.env.HOST || 'localhost',
        port: process.env.PORT || '3306',
        user: 'root',
        password: PASS,
        database: 'global',
    };
    const command = `mysqldump -u ${dbConfig.user} -p${dbConfig.password} -h ${dbConfig.host} ${dbConfig.database} > "${backupFile}"`;

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const backups = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('backup-') && file.endsWith('.sql'))
        .map(file => ({
            file,
            time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
        }))
        .sort((a, b) => a.time - b.time);

    if (backups.length >= 2) {
        const oldestBackup = backups[0].file;
        fs.unlinkSync(path.join(backupDir, oldestBackup));
        console.log(`Deleted oldest backup: ${oldestBackup}`);
    }

    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error('Backup failed:', stderr);
            return;
        }
        console.log(`Backup completed: ${backupFile}`);
    });
}
export { queryDB, createBackup };
//Uso:
//queryDB('SELECT * FROM newtable WHERE Column1 like ? LIMIT ?', ['test%', 1]);
