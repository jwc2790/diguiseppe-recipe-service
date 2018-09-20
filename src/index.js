const AWS = require('aws-sdk')
const client = new AWS.DynamoDB.DocumentClient()
const schema = require('./RecipieModel.json');

var Ajv = require('ajv');
var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
var validate = ajv.compile(schema);


const getTableName = () => {
  const { TABLE_NAME } = process.env
  if (!TABLE_NAME) throw Error('missing env variable TABLE_NAME')
  return TABLE_NAME
}

const now = () => {
  return new Date().toISOString();
}

const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
  const rand = Math.random() * 16 | 0;
  const val = char === 'x'
    ? rand
    : (rand & 0x3 | 0x8);
  return val.toString(16);
});


exports.lambda_handler = async (event, context, callback) => {
  try {
    const { httpMethod, queryStringParameters, body } = event

    const tableName = getTableName()
    const params = { TableName: tableName }

    // Callback to finish response
    const done = (err, res) => callback(null, {
      statusCode: err ? 400 : 200,
      body: JSON.stringify(err ? { error: err.message } : res),
      headers: {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE",
        "Access-Control-Allow-Origin": "*"
      }
    })

    let id, json, res
    switch (httpMethod) {
      case 'DELETE':
        id = queryStringParameters.id
        if (!id) throw Error('id is a required query parameter')
        res = await client.delete({ ...params, Key: { id } }).promise()
        done(null, res);
        return
      case 'GET':
        if (queryStringParameters && queryStringParameters.id) {
          const { Item  } = await client.get({ ...params, Key: { id: queryStringParameters.id } }).promise()
          done(null, Item)
        } else {
          const { Items } = await client.scan(params).promise()
          done(null, Items)
        }
        return
      case 'POST':
        json = { ...JSON.parse(body), id: uuid(), createdDate: now() }
        var valid = validate(json);
        if (!valid) { 
          done(validate.errors, null)
        } else {
          await client.put({ ...params, Item: json }).promise();
          done(null, json);
        }
        return
      case 'PUT':
        json = { ...JSON.parse(body), editedDate: now() }
        var valid = validate(json);
        if (!valid) { 
          done(validate.errors, null)
        } else {
          res = await client.put({ ...params, Item: json }).promise();
          done(null, json);
        }
      default:
        done(new Error(`Unsupported method "${event.httpMethod}"`))
    }
  } catch (err) {
    throw Error(err.message)
  }
}
