import nock from 'nock'
import { describe, it, expect } from '@jest/globals'
import { FLY_API_GRAPHQL } from '../src/client'
import { createClient } from '../src/main'

const fly = createClient(process.env.FLY_API_TOKEN || 'test-token')

describe('regions', () => {
  it('get nearest regions', async () => {
    nock(FLY_API_GRAPHQL)
      .post('/graphql')
      .reply(200, {
        data: {
          nearestRegion: {
            name: 'Amsterdam, Netherlands',
            code: 'ams',
            latitude: 52.374342,
            longitude: 4.895439,
            gatewayAvailable: true,
            requiresPaidPlan: false,
          },
        },
      })
    const data = await fly.Regions.getNearestRegion()
    console.dir(data, { depth: 5 })
  })
})
