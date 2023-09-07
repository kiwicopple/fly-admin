import nock from 'nock'
import { describe, it } from '@jest/globals'
import { AddressType } from '../src/lib/network'
import { FLY_API_GRAPHQL } from '../src/client'
import { createClient } from '../src/main'

const fly = createClient(process.env.FLY_API_TOKEN || 'test-token')

describe('network', () => {
  it('allocates ip address', async () => {
    nock(FLY_API_GRAPHQL)
      .post('/graphql')
      .reply(200, {
        data: {
          allocateIpAddress: {
            ipAddress: {
              id: 'ip_lm6k9x4qw0g1qp7r',
              address: '2a09:8280:1::a:e929',
              type: 'v6',
              region: 'global',
              createdAt: '2023-02-23T11:01:36Z',
            },
          },
        },
      })
    const data = await fly.Network.allocateIpAddress({
      appId: 'ctwntjgykzxhfncfwrfo',
      type: AddressType.v6,
    })
    console.dir(data, { depth: 5 })
  })

  it('releases ip address', async () => {
    nock(FLY_API_GRAPHQL)
      .post('/graphql')
      .reply(200, {
        data: {
          releaseIpAddress: {
            app: {
              name: 'ctwntjgykzxhfncfwrfo',
            },
          },
        },
      })
    const data = await fly.Network.releaseIpAddress({
      appId: 'ctwntjgykzxhfncfwrfo',
      ip: '2a09:8280:1::1:e80d',
    })
    console.dir(data, { depth: 5 })
  })
})
