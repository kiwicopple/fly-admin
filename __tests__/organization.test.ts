import nock from 'nock'
import { describe, it } from '@jest/globals'
import { FLY_API_GRAPHQL } from '../src/client'
import { createClient } from '../src/main'

const fly = createClient(process.env.FLY_API_TOKEN || 'test-token')

describe('organization', () => {
  it('get personal', async () => {
    nock(FLY_API_GRAPHQL)
      .post('/graphql')
      .reply(200, {
        data: {
          organization: {
            id: 'D307G6NwgR0z2u4vPG23jYy8a3cg3xbYR',
            slug: 'personal',
            name: 'Test User',
            type: 'PERSONAL',
            viewerRole: 'admin',
          },
        },
      })
    const data = await fly.Organization.getOrganization('personal')
    console.dir(data, { depth: 5 })
  })
})
