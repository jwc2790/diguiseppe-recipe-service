sam validate

sam package --profile cuffney --template-file template.yaml --output-template-file packaged.yaml --s3-bucket recipies-service

sam deploy --profile cuffney --template-file packaged.yaml --stack-name recipies-service --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM