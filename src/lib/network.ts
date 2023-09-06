import Client from '../client'

export enum AddressType {
  v4 = 'v4',
  v6 = 'v6',
  private_v6 = 'private_v6',
  shared_v4 = 'shared_v4',
}

export interface AllocateIPAddressInput {
  appId: string
  type: AddressType
  organizationId?: string
  region?: string
  network?: string
}

export interface AllocateIPAddressOutput {
  allocateIpAddress: {
    ipAddress: {
      id: string
      address: string
      type: AddressType
      region: string
      createdAt: string
    } | null
  }
}

const allocateIpAddressQuery = `mutation($input: AllocateIPAddressInput!) {
  allocateIpAddress(input: $input) {
    ipAddress {
      id
      address
      type
      region
      createdAt
    }
  }
}`

export interface ReleaseIPAddressInput {
  appId?: string
  ipAddressId?: string
  ip?: string
}

export interface ReleaseIPAddressOutput {
  releaseIpAddress: {
    app: {
      name: string
    }
  }
}

const releaseIpAddressQuery = `mutation($input: ReleaseIPAddressInput!) {
  releaseIpAddress(input: $input) {
    app {
      name
    }
  }
}`

export class Network {
  private client: Client

  constructor(client: Client) {
    this.client = client
  }

  // Ref: https://github.com/superfly/flyctl/blob/master/api/resource_ip_addresses.go#L79
  async allocateIpAddress(
    input: AllocateIPAddressInput
  ): Promise<AllocateIPAddressOutput> {
    return this.client.gqlPostOrThrow({
      query: allocateIpAddressQuery,
      variables: { input },
    })
  }

  async releaseIpAddress(
    input: ReleaseIPAddressInput
  ): Promise<ReleaseIPAddressOutput> {
    return this.client.gqlPostOrThrow({
      query: releaseIpAddressQuery,
      variables: { input },
    })
  }
}
