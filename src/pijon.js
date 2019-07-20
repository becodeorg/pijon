/* becodeorg/pijon
 *
 * /src/pijon.js - AWS lambda function to handle file upload and send them to S3
 *
 * coded by leny@BeCode
 * started at 20/07/2019
 */

import sls from "serverless-http";
import Koa from "koa";
import cors from "koa2-cors";

const app = new Koa();

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        ctx.body = {
            message: err.message,
        };
    }
});

app.use(
    cors({
        origin: "*",
        allowMethods: ["GET", "HEAD", "OPTIONS"],
    }),
);

app.use(ctx => {
    ctx.body = "Hello, world!";
});

export const handler = sls(app);
