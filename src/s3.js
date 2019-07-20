/* becodeorg/pijon
 *
 * /src/s3.js - Local S3 Hook
 *
 * coded by leny@BeCode
 * started at 20/07/2019
 */

export const handler = (event, context) => {
    console.log(JSON.stringify(event));
    console.log(JSON.stringify(context));
    console.log(JSON.stringify(process.env));
};
