import chalk from "chalk";
import cors from "cors";
import express, { Request, Response } from "express";
import helmet from "helmet";
import path from 'path';
import { connectToDB } from "./lib/database";
import { authMiddleware, refreshTokenMiddleware } from "./lib/middleware";
import authRouter from "./routes/auth";
import playlistRouter from "./routes/playlists";
import songRouter from "./routes/songs";
import usersRouter from "./routes/users";
import { formatDateToPST } from "./util/index";

const REQUEST_BODY_SIZE_LIMIT = "50mb";
const __dirname = import.meta.dirname;
const port = process.env.PORT || 3000;
const app = express();

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "img-src": ["'self'", "data:", "https:"],
            },
        },
    })
);

app.use(
    cors({
        origin: "*", // TODO: Change this to the frontend deployment URL
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


app.use("/v2/users", usersRouter);
app.use("/v2/auth", authRouter);
app.use("/v2/api", playlistRouter);
app.use("/v2", authMiddleware, songRouter);
app.use("/v2/refresh-token", refreshTokenMiddleware);

app.get("/v2/health", (_, res) => {
    res.status(200).send("OK");
});

app.listen(port, async () => {
    await connectToDB();
    console.log(`The server is running at http://localhost:${port}`);
});
