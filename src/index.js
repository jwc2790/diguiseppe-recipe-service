const AWS = require('aws-sdk')
const client = new AWS.DynamoDB.DocumentClient()

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


exports.handler = async (event, context, callback) => {
  // Callback to finish response
  const done = (err, res) => callback(null, {
    statusCode: err ? 500 : 200,
    body: JSON.stringify(err ? { error: err.message } : res),
    headers: {
      'Content-Type': 'application/json',
    }
  })

  // console.log(event);
  
  try {
    const { httpMethod, pathParameters, body } = event

    const tableName = getTableName()
    const params = { TableName: tableName }

    let id, json, res
    switch (httpMethod) {
      case 'DELETE':
        res = await client.delete({ ...params, Key: { id: pathParameters.id } }).promise()
        done(null, res);
        return
      
      case 'GET':
        if (pathParameters && pathParameters.id) {
          const { Item  } = await client.get({ ...params, Key: { id: pathParameters.id } }).promise()
          done(null, Item)
        } else {
          const { Items } = await client.scan(params).promise()
          done(null, Items)
        }
        return
      
      case 'POST':
        json = { ...JSON.parse(body), id: uuid(), createdDate: now() }
          res = await client.put({ ...params, Item: json }).promise();
          done(null, json);
        return
      
      case 'PUT':
          json = { ...JSON.parse(body), editedDate: now() }
            res = await client.put({ ...params, Item: json }).promise();
            done(null, json);
        return
      
      default:
        done(new Error(`Unsupported method "${event.httpMethod}"`))
    }
  } catch (err) {
    done(err.message, null);
  }
}
