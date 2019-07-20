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
const {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET_NAME,
} = process.env;

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
    const client = new AWS.S3(
        IS_OFFLINE
            ? {
                  accessKeyId: "S3RVER",
                  secretAccessKey: "S3RVER",
                  s3ForcePathStyle: true,
                  endpoint: new AWS.Endpoint(LOCAL_S3_ENDPOINT),
              }
            : {
                  accessKeyId: AWS_ACCESS_KEY_ID,
                  secretAccessKey: AWS_SECRET_ACCESS_KEY,
                  region: AWS_REGION,
              },
    );

    const {file} = ctx.request.files;

    const {Location} = await client
        .upload({
            Bucket: IS_OFFLINE ? "local-bucket" : AWS_S3_BUCKET_NAME,
            Key: `${uuid(
                AWS_S3_BUCKET_NAME,
                uuid.URL,
            )}-${file.name.toLowerCase()}`,
            Body: createReadStream(file.path),
            ContentType: getType(file.name),
            ACL: "public-read",
        })
        .promise();

    // eslint-disable-next-line require-atomic-updates
    ctx.body = {location: Location};
});

export const handler = sls(app);
