import chalk from "chalk";
import cors from "cors";
import express, { Request, Response } from "express";
import helmet from "helmet";
import path from 'path';
import { connectToDB } from "./lib/database";
import { refreshTokenMiddleware } from "./lib/middleware";
import authRouter from "./routes/auth";
import playlistRouter from "./routes/playlists";
import songRouter from "./routes/songs";
import usersRouter from "./routes/users";
import { formatDateToPST } from "./util/index";

const REQUEST_BODY_SIZE_LIMIT = "50mb";
const __dirname = import.meta.dirname;
const port = process.env.PORT || 3000;
const app = express();

const runtimeEnvVars = {
    PORT: process.env.PORT,
}

function validateRuntimeEnvVars() {
    const missingVars = Object.entries(runtimeEnvVars).filter(([key, value]) => !value);
    if (missingVars.length > 0) {
        console.error("Missing required environment variables:", missingVars);
        process.exit(1);
    } else {
        console.log("All required environment variables are set, starting server...");
    }
}

validateRuntimeEnvVars();
app.options("*", cors());

app.use(
    cors({
        origin: ["https://museisfun.com", "http://localhost:3000", "http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        maxAge: 86400, // 24 hours
    })
);

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "img-src": ["'self'", "data:", "https:", "blob:"],
                "media-src": ["'self'", "https:", "blob:"],
                "connect-src": ["'self'", "https:", "wss:", "blob:"],
            },
        },
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginOpenerPolicy: { policy: "same-origin" },
    })
);

app.use(express.json({ limit: REQUEST_BODY_SIZE_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: REQUEST_BODY_SIZE_LIMIT }));

app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
        if (path.extname(filePath) === '.svg') {
            res.setHeader('Content-Type', 'image/svg+xml');
        }
    }
}));

app.get('/', (_: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const colorfulLogger = (req: Request, res: Response, next: Function) => {
    const startTime = Date.now();
    const oldEnd = res.end;
    // @ts-expect-error - ts doesn't like me overriding res.end
    res.end = function(chunk?: any, encoding?: BufferEncoding, cb?: () => void) {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode;

        const statusColor = statusCode >= 500 ? chalk.red
                         : statusCode >= 400 ? chalk.yellow
                         : statusCode >= 300 ? chalk.cyan
                         : chalk.green;

        console.log(
            chalk.blue(`[${formatDateToPST(new Date())}]`),
            chalk.green(req.method.padEnd(7)),
            chalk.yellow(req.url),
            statusColor(`${statusCode}`),
            chalk.magenta(`${responseTime}ms`)
        );

        return oldEnd.call(res, chunk, encoding as BufferEncoding, cb);
    };
    next();
};

app.use(colorfulLogger);

app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/api", playlistRouter);
app.use("/", songRouter);
app.use("/refresh-token", refreshTokenMiddleware);
app.get("/health", (_, res) => {
    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const formatCpuUsage = (cpuUsage: NodeJS.CpuUsage) => {
        const userCpuPercentage = (cpuUsage.user / 10000).toFixed(2) + '%';
        const systemCpuPercentage = (cpuUsage.system / 10000).toFixed(2) + '%';
        return { user: userCpuPercentage, system: systemCpuPercentage };
    };

    const healthCheck = {
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date(),
        memoryUsage: {
            rss: formatBytes(process.memoryUsage().rss),
            heapTotal: formatBytes(process.memoryUsage().heapTotal),
            heapUsed: formatBytes(process.memoryUsage().heapUsed),
            external: formatBytes(process.memoryUsage().external),
        },
        cpuUsage: formatCpuUsage(process.cpuUsage()),
    };

    const htmlResponse = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Health Check</title>
            <style>
                body { font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif; margin: 20px; background-color: #f2f2f2; color: #000; }
                h1 { color: #4CAF50; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 10px; border: 2px solid #000; text-align: left; }
                th { background: #e0e0e0; }
            </style>
        </head>
        <body>
            <h1>Health Check</h1>
            <table>
                <tr>
                    <th>Status</th>
                    <td>${healthCheck.status}</td>
                </tr>
                <tr>
                    <th>Uptime (seconds)</th>
                    <td>${healthCheck.uptime.toFixed(2)}</td>
                </tr>
                <tr>
                    <th>Timestamp</th>
                    <td>${healthCheck.timestamp}</td>
                </tr>
                <tr>
                    <th>Memory Usage</th>
                    <td>${JSON.stringify(healthCheck.memoryUsage)}</td>
                </tr>
                <tr>
                    <th>CPU Usage</th>
                    <td>${JSON.stringify(healthCheck.cpuUsage)}</td>
                </tr>
            </table>
        </body>
        </html>
    `;

    res.status(200).send(htmlResponse);
});

app.listen(port, async () => {
    await connectToDB();
    console.log(`The server is running at http://localhost:${port}`);
});
