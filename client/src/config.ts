// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'rq6scjy01j'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: 'dev-yszpc087f4mdf0se.us.auth0.com', // Auth0 domain
  clientId: 's43ugz4SdbAYVHsPMrAyAA0EPuDulJxI', // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
