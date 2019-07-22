# BeCode: pijon

> ⚙️ Pijon, the delivery man - File upload lambda preparator

* * *

## About

Uploading file from a SPA needs a server to handling file.  
But what to do when you are working on a _static_ SPA?

**pijon** is a lambda serverless function, preparing requests for uploading files to AWS S3 bucket.

Calling **pijon** with a *file name* and a *mime type*, it will generates two URLs: the first is your *endpoint* to upload the file to your S3 bucket, and the second will be the final public URL of your file when the upload is done.

## Installation

Firstly, run the classic `npm install` to install dependencies.

You will also need to create the file `env/sls.env.json`, following this structure:

```json
{
	"dev": {
		"SERVICE_XXXXXXXXXXXX_BUCKET": "my-s3-bucket-name",
		"SERVICE_XXXXXXXXXXXX_ORIGIN": "www.my-site.me,api.my-site.me"
	}
}
```

The `XXXXXXXXXXXX` in the keys are your *pijon service id*, that will be used to know to which bucket send files, and verify the origin of the request.

## Usage

Simply call the URL on of the lambda with `POST` request with three properties:

- `service`: your *pijon service id* as explained
- `name`: the name of the file that will be uploaded
- `type`: the *mime type* of the file that will be uploaded

The call will respond a `json object` with two properties:

- `uploadUrl`: the URL to make a `PUT` request to with your file
- `objectUrl`: the final, public URL of your file on your S3 bucket, after the upload is done

> ⚠️ when you upload your file to the `uploadUrl`, don't forget to add a `Content-Type` header to your request, matching the *mime type* of your file! 

### Development

Run `npm run build` to build the code.

#### Deployment

You need to have [setup](https://serverless.com/framework/docs/providers/aws/guide/credentials/) the appropriate user from AWS and stored it in your `~/.aws/credentials`.

##### Dev deployment

	npm run deploy:dev --aws-profile=<your-aws-profile>

##### Production deployment

	npm run deploy:prod --aws-profile=<your-aws-profile>

* * *

July 2019, leny.