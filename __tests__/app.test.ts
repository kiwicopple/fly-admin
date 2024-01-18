import nock from 'nock'
import { describe, it } from '@jest/globals'
import { FLY_API_HOSTNAME } from '../src/client'
import { createClient } from '../src/main'
import { AppResponse, AppStatus } from '../src/lib/app'

const fly = createClient(process.env.FLY_API_TOKEN || 'test-token')

describe('app', () => {
  const app: AppResponse = {
    name: 'fly-app',
    status: AppStatus.deployed,
    organization: {
      name: 'fly-org',
      slug: 'personal',
    },
    ipAddresses: [
      {
        type: 'v4',
        address: '1.1.1.1'
      },
      {
        type: 'v6',
        address: '2001:db8::1'
      }
    ]
  }

  it('lists apps', async () => {
    const org_slug = app.organization.slug
    nock(FLY_API_HOSTNAME)
      .get('/v1/apps')
      .query({ org_slug })
      .reply(200, {
        total_apps: 1,
        apps: [
          {
            name: app.name,
            machine_count: 1,
            network: 'default',
          },
        ],
      })
    const data = await fly.App.listApps(org_slug)
    console.dir(data, { depth: 10 })
  })

  it('get app', async () => {
    const app_name = app.name
    nock(FLY_API_HOSTNAME).get(`/v1/apps/${app_name}`).reply(200, app)
    const data = await fly.App.getApp(app_name)
    console.dir(data, { depth: 10 })
  })

  it('creates app', async () => {
    const body = {
      org_slug: app.organization.slug,
      app_name: app.name,
    }
    nock(FLY_API_HOSTNAME).post('/v1/apps', body).reply(201)
    const data = await fly.App.createApp(body)
    console.dir(data, { depth: 10 })
  })

  it('deletes app', async () => {
    const app_name = app.name
    nock(FLY_API_HOSTNAME).delete(`/v1/apps/${app_name}`).reply(202)
    const data = await fly.App.deleteApp(app_name)
    console.dir(data, { depth: 10 })
  })
})
