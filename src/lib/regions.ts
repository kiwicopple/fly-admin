import Client from '../client'

export interface RegionResponse {
  name: string
  code: string
  latitude: number
  longitude: number
  gatewayAvailable: boolean
  requiresPaidPlan: boolean
}

export interface GetNearestRegionsOutput {
  nearestRegion: RegionResponse
}

// Ref: https://github.com/superfly/flyctl/blob/master/api/resource_regions.go
const getNearestRegionsQuery = `
query {
  nearestRegion {
    name
    code
    latitude
    longitude
    gatewayAvailable
    requiresPaidPlan
  }
}
`

export class Regions {
  private client: Client

  constructor(client: Client) {
    this.client = client
  }

  async getNearestRegion(): Promise<GetNearestRegionsOutput> {
    return this.client.gqlPostOrThrow({
      query: getNearestRegionsQuery,
      variables: {},
    })
  }
}
