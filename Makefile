# Variables
STACK_NAME = diguiseppe-recipe-service-dev
TEMPLATE = infra/template.yml
REGION = us-east-1
BUCKET_NAME = com.diguiseppe.recipe.dev
SOURCE_KEY = source.zip

# Stack Parameters
TABLE_NAME = DiGuiseppe-RecipeTable-Dev
FUNCTION_NAME = diguiseppe-recipe-service-dev
FUNCTION_RUNTIME = nodejs10.x

# build source code for the lambda
build:
	npm run build

# delete the stack
delete:
	aws cloudformation delete-stack --stack-name ${STACK_NAME}

# deploy the stack
deploy:
	npm ci

	npm run build	
	
	aws s3 mb s3://${BUCKET_NAME}

	aws s3 cp build/${SOURCE_KEY} s3://${BUCKET_NAME}

	aws cloudformation deploy \
		--stack-name ${STACK_NAME} \
		--template-file ./${TEMPLATE} \
		--region ${REGION} \
		--capabilities CAPABILITY_IAM \
		--no-fail-on-empty-changeset \
		--parameter-overrides \
			TableName=${TABLE_NAME} \
			FunctionName=${FUNCTION_NAME} \
			FunctionRuntime=${FUNCTION_RUNTIME} \
			SourceBucket=${BUCKET_NAME} \
			SourceKey=${SOURCE_KEY} 

	aws lambda update-function-code \
		--function-name ${FUNCTION_NAME} \
		--s3-bucket ${BUCKET_NAME} \
		--s3-key ${SOURCE_KEY}