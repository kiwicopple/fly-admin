import nock from 'nock'
import { describe, it } from '@jest/globals'
import { FLY_API_HOSTNAME } from '../src/client'
import { createClient } from '../src/main'
import { VolumeResponse } from '../src/lib/volume'

const fly = createClient('test-token')

describe('volume', () => {
  const appId = 'ctwntjgykzxhfncfwrfo'
  const volume: VolumeResponse = {
    id: 'vol_0vdyzpeqgpzl383v',
    name: 'pgdata',
    state: 'created',
    size_gb: 2,
    region: 'hkg',
    zone: '553e',
    encrypted: true,
    attached_machine_id: null,
    attached_alloc_id: null,
    created_at: '2023-09-06T10:04:03.905Z',
    blocks: 0,
    block_size: 0,
    blocks_free: 0,
    blocks_avail: 0,
    fstype: '',
    host_dedication_key: '',
  }

  it('lists volumes', async () => {
    nock(FLY_API_HOSTNAME)
      .get(`/v1/apps/${appId}/volumes`)
      .reply(200, [
        {
          ...volume,
          attached_machine_id: '17811953c92e18',
          blocks: 252918,
          block_size: 4096,
          blocks_free: 234544,
          blocks_avail: 217392,
          fstype: 'ext4',
        },
      ])
    const data = await fly.Volume.listVolumes(appId)
    console.dir(data, { depth: 5 })
  })

  it('creates volume', async () => {
    const body = {
      name: 'pgdata',
      region: 'hkg',
      size_gb: 2,
    }
    nock(FLY_API_HOSTNAME)
      .post(`/v1/apps/${appId}/volumes`, body)
      .reply(200, volume)
    const data = await fly.Volume.createVolume({
      appId,
      ...body,
    })
    console.dir(data, { depth: 5 })
  })

  it('deletes volume', async () => {
    const volumeId = volume.id
    nock(FLY_API_HOSTNAME)
      .delete(`/v1/apps/${appId}/volumes/${volumeId}`)
      .reply(200, {
        ...volume,
        state: 'destroyed',
      })
    const data = await fly.Volume.deleteVolume({
      appId,
      volumeId,
    })
    console.dir(data, { depth: 5 })
  })

  it('forks volume', async () => {
    const body = {
      name: 'forked',
      region: '',
      source_volume_id: volume.id,
    }
    nock(FLY_API_HOSTNAME)
      .post(`/v1/apps/${appId}/volumes`, body)
      .reply(200, {
        ...volume,
        id: 'vol_5456e1j33p16378r',
        name: 'forked',
        state: 'hydrating',
      })
    const data = await fly.Volume.createVolume({
      appId,
      ...body,
    })
    console.dir(data, { depth: 5 })
  })

  it('extends volume', async () => {
    const body = { size_gb: 4 }
    const volumeId = volume.id
    nock(FLY_API_HOSTNAME)
      .put(`/v1/apps/${appId}/volumes/${volumeId}/extend`, body)
      .reply(200, {
        needs_restart: true,
        volume: {
          ...volume,
          ...body,
        },
      })
    const data = await fly.Volume.extendVolume({
      appId,
      volumeId,
      ...body,
    })
    console.dir(data, { depth: 5 })
  })
})
