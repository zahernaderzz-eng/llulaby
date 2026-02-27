import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import chalk from 'chalk';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const start = Date.now();

        // store original send
        const originalSend = res.send.bind(res);
        let responseBody: any;

        res.send = (body: any) => {
            responseBody = body;
            return originalSend(body);
        };

        res.on('finish', () => {
            const duration = Date.now() - start;
            const date = new Date();

            const pad = (n: number) => n.toString().padStart(2, '0');

            const timestamp =
                `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
                    date.getDate(),
                )} ` +
                `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
                    date.getSeconds(),
                )}`;

            console.log(
                chalk.blue.bold(
                    '\n================= 📦 REQUEST LOG =================',
                ),
            );
            console.log(chalk.gray(`🕒 Timestamp: ${timestamp}`));

            console.log(chalk.cyan('➡  Method:'), chalk.yellow(req.method));
            console.log(
                chalk.cyan('➡  URL:   '),
                chalk.green(req.originalUrl),
            );

            if (Object.keys(req.query || {}).length > 0)
                console.log(chalk.cyan('➡  Query:'), req.query);

            if (req.body && Object.keys(req.body).length > 0)
                console.log(chalk.cyan('➡  Body: '), req.body);

            console.log(
                chalk.cyan('➡  Status:'),
                res.statusCode >= 400
                    ? chalk.red(res.statusCode)
                    : chalk.green(res.statusCode),
            );

            console.log(
                chalk.cyan('➡  Response:'),
                this.tryParseJson(responseBody),
            );

            console.log(
                chalk.cyan('➡  Time:'),
                chalk.magenta(`${duration}ms`),
            );

            console.log(
                chalk.blue.bold(
                    '==================================================\n',
                ),
            );
        });

        next();
    }

    private tryParseJson(data: any) {
        try {
            if (typeof data === 'string') {
                return JSON.parse(data);
            }
            return data;
        } catch {
            return data;
        }
    }
}
