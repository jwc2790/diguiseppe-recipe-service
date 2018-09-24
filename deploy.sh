sam validate

sam package --profile cuffney --template-file template.yml --output-template-file packaged.yml --s3-bucket recipes-service

sam deploy --profile cuffney --template-file packaged.yml --stack-name recipes-service --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM