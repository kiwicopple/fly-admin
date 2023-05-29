import Client from './client'

function createClient(API_TOKEN: string): Client {
  return new Client(API_TOKEN)
}

export { createClient }
