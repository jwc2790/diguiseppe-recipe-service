const AWS = require('aws-sdk')
const client = new AWS.DynamoDB.DocumentClient()

const getTableName = () => {
  const { TABLE_NAME } = process.env
  if (!TABLE_NAME) throw Error('missing env variable TABLE_NAME')
  return TABLE_NAME
}

exports.lambda_handler = (event, context, callback) => {
  try {
    const { httpMethod, queryStringParameters, body } = event

    const tableName = getTableName()
    const params = { TableName: tableName }

    // Callback to finish response
    const done = (err, res) => callback(null, {
      statusCode: err ? 400 : 200,
      body: JSON.stringify(err ? { error: err.message } : res),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    let id, json
    switch (httpMethod) {
      case 'DELETE':
        id = queryStringParameters.id
        if (!id) throw Error('id is a required query parameter')
        client.delete({ ...params, Key: { id } }, done)
        return
      case 'GET':
        id = queryStringParameters.id
        if (id) {
          client.get({ ...params, Key: { id } }, done)
        } else {
          client.scan(params, done)
        }
        return
      case 'POST':
        json = JSON.parse(body)
        client.put({ ...params, Item: json }, done)
        return
      case 'PUT':
        json = JSON.parse(body)
        client.put({ ...params, Item: json }, done)
        return
      default:
        done(new Error(`Unsupported method "${event.httpMethod}"`))
    }
  } catch (err) {
    throw Error(err.message)
  }
}
