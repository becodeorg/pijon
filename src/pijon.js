/* becodeorg/pijon
 *
 * /src/pijon.js - AWS lambda function to handle file upload and send them to S3
 *
 * coded by leny@BeCode
 * started at 20/07/2019
 */

import sls from "serverless-http";
import Koa from "koa";
import koaBody from "koa-body";
import cors from "koa2-cors";
import * as AWS from "aws-sdk";
import uuid from "uuid/v4";
import * as Sentry from "@sentry/node";

const {AWS_REGION, AWS_LAMBDA_FUNCTION_NAME, SENTRY_DSN} = process.env;

const STAGE = AWS_LAMBDA_FUNCTION_NAME.includes("production") ? "prod" : "dev";

if (SENTRY_DSN) {
    Sentry.init({dsn: SENTRY_DSN, environment: STAGE});
}

const app = new Koa();

app.use(koaBody());
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        if (SENTRY_DSN) {
            Sentry.withScope(scope => {
                scope.addEventProcessor(event =>
                    Sentry.Handlers.parseRequest(event, ctx.request),
                );
                Sentry.captureException(err);
            });
            await Sentry.flush(2000);
        }
        ctx.status = err.status || 500;
        ctx.body = {
            message: err.message,
        };
    }
});

app.use(
    cors({
        origin: "*",
        allowMethods: ["POST", "HEAD", "OPTIONS"],
    }),
);

app.use(async ctx => {
    const {service, name, type} = ctx.request.body;

    if (!service) {
        throw new Error("No service id given!");
    }

    if (!name) {
        throw new Error("No name given!");
    }

    if (!type) {
        throw new Error("No type given!");
    }

    const BUCKET_NAME = process.env[`SERVICE_${service}_BUCKET`];
    const ORIGIN = process.env[`SERVICE_${service}_ORIGIN`].split(",");

    if (!(BUCKET_NAME || ORIGIN.length)) {
        throw new Error("Unknown service!");
    }

    const {hostname} = new URL(ctx.request.headers.origin);

    if (!ORIGIN.includes(hostname)) {
        throw new Error("Invalid origin!");
    }

    const client = new AWS.S3({
        // from inside a lambda, no need for accessKeys
        region: AWS_REGION,
    });

    const key = `${uuid()}-${name.toLowerCase()}`;

    const uploadUrl = await new Promise((resolve, reject) => {
        client.getSignedUrl(
            "putObject",
            {
                Bucket: BUCKET_NAME,
                Key: key,
                ContentType: type,
                ACL: "public-read",
            },
            (err, url) => {
                if (err) {
                    return reject(err);
                }
                return resolve(url);
            },
        );
    });

    // eslint-disable-next-line require-atomic-updates
    ctx.body = {
        uploadUrl,
        objectUrl: `https://${BUCKET_NAME}.s3-${AWS_REGION}.amazonaws.com/${key}`,
    };
});

export const handler = sls(app);
