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
import {createReadStream} from "fs";
import {getType} from "mime/lite";
import uuid from "uuid/v5";

const IS_OFFLINE = process.env.IS_OFFLINE === "true";
const LOCAL_S3_ENDPOINT = "http://localhost:6071";
const AWS_REGION = "eu-west-1";

const app = new Koa();

app.use(koaBody({multipart: true}));
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
        allowMethods: ["POST", "HEAD", "OPTIONS"],
    }),
);

app.use(async ctx => {
    const {service} = ctx.request.query;

    if (!service) {
        throw new Error("No service id given!");
    }

    const BUCKET_NAME = IS_OFFLINE
        ? "local-bucket"
        : process.env[`SERVICE_${service}_BUCKET`];
    const ORIGIN = (IS_OFFLINE
        ? "localhost"
        : process.env[`SERVICE_${service}_ORIGIN`]
    ).split(",");

    if (!(BUCKET_NAME || ORIGIN.length)) {
        throw new Error("Unknown service!");
    }

    const {hostname} = new URL(ctx.request.headers.origin);

    if (!ORIGIN.includes(hostname)) {
        throw new Error("Invalid origin!");
    }

    const client = new AWS.S3(
        IS_OFFLINE
            ? {
                  accessKeyId: "S3RVER",
                  secretAccessKey: "S3RVER",
                  s3ForcePathStyle: true,
                  endpoint: new AWS.Endpoint(LOCAL_S3_ENDPOINT),
              }
            : {
                  // from inside a lambda, no need accessKeys
                  region: AWS_REGION,
              },
    );

    const {file} = ctx.request.files;

    const {Location} = await client
        .upload({
            Bucket: BUCKET_NAME,
            Key: `${uuid(BUCKET_NAME, uuid.URL)}-${file.name.toLowerCase()}`,
            Body: createReadStream(file.path),
            ContentType: getType(file.name),
            ACL: "public-read",
        })
        .promise();

    // eslint-disable-next-line require-atomic-updates
    ctx.body = {location: Location};
});

export const handler = sls(app);
