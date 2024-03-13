import Client from '../client'
import { RegionResponse } from './regions'

interface PlatformResponse {
  requestRegion: string
  regions: RegionResponse[]
}

export interface GetRegionsOutput {
  platform: PlatformResponse
}

// Ref: https://github.com/superfly/flyctl/blob/master/api/resource_platform.go
const getRegionsQuery = `query {
  platform {
    requestRegion
    regions {
      name
      code
      latitude
      longitude
      gatewayAvailable
      requiresPaidPlan
    }
  }
}`

export class Platform {
  private client: Client

  constructor(client: Client) {
    this.client = client
  }

  async getRegions(): Promise<GetRegionsOutput> {
    return this.client.gqlPostOrThrow({
      query: getRegionsQuery,
      variables: {},
    })
  }
}
