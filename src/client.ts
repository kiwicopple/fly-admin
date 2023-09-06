import crossFetch from 'cross-fetch'
import { App } from './lib/app'
import { Machine } from './lib/machine'
import { Network } from './lib/network'
import { Organization } from './lib/organization'
import { Secret } from './lib/secret'
import { Volume } from './lib/volume'

export const FLY_API_GRAPHQL = 'https://api.fly.io'
export const FLY_API_HOSTNAME = 'https://api.machines.dev'

interface GraphQLRequest<T> {
  query: string
  variables?: Record<string, T>
}

interface GraphQLResponse<T> {
  data: T
  errors?: {
    message: string
    locations: {
      line: number
      column: number
    }[]
  }[]
}

interface PathParams {
  appId?: string
  machineId?: string
  volumeId?: string
  action?: 'start' | 'stop'
}

class Client {
  private graphqlUrl: string
  private apiUrl: string
  private apiKey: string
  App: App
  Machine: Machine
  Network: Network
  Organization: Organization
  Secret: Secret
  Volume: Volume

  constructor(
    apiKey: string,
    { graphqlUrl, apiUrl }: { graphqlUrl?: string; apiUrl?: string } = {}
  ) {
    if (!apiKey) {
      throw new Error('Fly API Key is required')
    }
    this.graphqlUrl = graphqlUrl || FLY_API_GRAPHQL
    this.apiUrl = apiUrl || FLY_API_HOSTNAME
    this.apiKey = apiKey
    this.App = new App(this)
    this.Machine = new Machine(this)
    this.Network = new Network(this)
    this.Organization = new Organization(this)
    this.Secret = new Secret(this)
    this.Volume = new Volume(this)
  }

  getApiKey(): string {
    return this.apiKey
  }

  getApiUrl(): string {
    return this.apiUrl
  }

  getGraphqlUrl(): string {
    return this.graphqlUrl
  }

  async gqlPostOrThrow<U, V>(payload: GraphQLRequest<U>): Promise<V> {
    const token = process.env.FLY_API_TOKEN
    const resp = await crossFetch(`${FLY_API_GRAPHQL}/graphql`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    const text = await resp.text()
    if (!resp.ok) {
      throw new Error(`${resp.status}: ${text}`)
    }
    const { data, errors }: GraphQLResponse<V> = JSON.parse(text)
    if (errors) {
      throw new Error(JSON.stringify(errors))
    }
    return data
  }

  async restOrThrow<U, V>(
    params: PathParams,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: U
  ): Promise<V> {
    const { appId, machineId, volumeId, action } = params
    let url = `${this.apiUrl}/v1`
    if (appId !== undefined) url += '/apps'
    if (appId) url += `/${appId}`
    if (machineId !== undefined) url += '/machines'
    if (machineId) url += `/${machineId}`
    if (volumeId !== undefined) url += '/volumes'
    if (volumeId) url += `/${volumeId}`
    if (action) url += `/${action}`
    const resp = await crossFetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const text = await resp.text()
    if (!resp.ok) {
      throw new Error(`${resp.status}: ${text}`)
    }
    return JSON.parse(text)
  }
}

export default Client
