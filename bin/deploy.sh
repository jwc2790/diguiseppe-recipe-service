sam validate

sam package --profile cuffney --template-file template.yml --output-template-file packaged.yml --s3-bucket com.diguisepperecipes.api --s3-prefix lambda 

sam deploy --profile cuffney --template-file packaged.yml --stack-name diguiseppe-recipes-recipe-service --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM
