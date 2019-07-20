# BeCode: pijon

> ⚙️ Pijon, the delivery man - File upload lambda

* * *

## About

Uploading file from a SPA needs a server to handling file.  
But what to do when you are working on a _static_ SPA?

**pijon** is a lambda serverless function, handling uploads and saving files to AWS S3 bucket.

## Installation

Firstly, run the classic `npm install` to install dependencies.

You will also need to create the file `env/sls.env.json`, following this structure:

```json
{
	"dev": {
		"AWS_ACCESS_KEY_ID": "xxxxxxxx",
		"AWS_SECRET_ACCESS_KEY": "xxxxxxxx",
		"AWS_S3_BUCKET_NAME": "xxxxxxxx"
	}
}
```

## Usage

Run `npm run build` to build the code, or `npm run work` to watch the changes and rebuild.

Run `npm run dev` to create a local host serving the lambda, on port `6060`.

### Deployment

You need to have [setup](https://serverless.com/framework/docs/providers/aws/guide/credentials/) the appropriate user from AWS and stored it in your `~/.aws/credentials`.

#### Dev deployment

	npm run deploy:dev --aws-profile=<your-aws-profile>

#### Production deployment

	npm run deploy:prod --aws-profile=<your-aws-profile>

* * *

July 2019, leny.