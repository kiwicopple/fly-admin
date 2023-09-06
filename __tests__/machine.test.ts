import nock from 'nock'
import { describe, it } from '@jest/globals'
import { ConnectionHandler, MachineConfig } from '../src/lib/machine'

import { FLY_API_HOSTNAME } from '../src/client'
import { createClient } from '../src/main'

const fly = createClient('test-token')

describe('machine', () => {
  const appId = 'ctwntjgykzxhfncfwrfo'
  const machine = {
    id: '9080e966ae7487',
    name: 'ctwntjgykzxhfncfwrfo',
    state: 'created',
    region: 'hkg',
    instance_id: '01GSYXD50E7F114CX7SRCT2H41',
    private_ip: 'fdaa:1:698b:a7b:a8:33bd:e6da:2',
    config: {
      env: { PGDATA: '/mnt/postgres/data' },
      init: {},
      image: 'sweatybridge/postgres:all-in-one',
      mounts: [
        {
          path: '/mnt/postgres',
          size_gb: 2,
          volume: 'vol_g67340kqe5pvydxw',
          name: 'ctwntjgykzxhfncfwrfo_pgdata',
        },
      ],
      restart: {},
      services: [
        {
          protocol: 'tcp',
          internal_port: 8000,
          ports: [
            { port: 443, handlers: ['tls', 'http'] },
            { port: 80, handlers: ['http'] },
          ],
        },
        {
          protocol: 'tcp',
          internal_port: 5432,
          ports: [{ port: 5432, handlers: ['pg_tls'] }],
        },
      ],
      size: 'shared-cpu-4x',
      guest: { cpu_kind: 'shared', cpus: 4, memory_mb: 1024 },
      checks: {
        pgrst: {
          port: 3000,
          type: 'http',
          interval: '15s',
          timeout: '10s',
          method: 'HEAD',
          path: '/',
        },
      },
    },
    image_ref: {
      registry: 'registry-1.docker.io',
      repository: 'sweatybridge/postgres',
      tag: 'all-in-one',
      digest:
        'sha256:df2014e5d037bf960a1240e300a913a97ef0d4486d22cbd1b7b92a7cbf487a7c',
      labels: null,
    },
    created_at: '2023-02-23T10:34:20Z',
    updated_at: '0001-01-01T00:00:00Z',
    checks: [
      {
        name: 'pgrst',
        status: 'warning',
        output: 'the machine is created',
        updated_at: '2023-02-23T10:34:20.084624847Z',
      },
    ],
  }

  it('creates machine', async () => {
    const config: MachineConfig = {
      image: 'sweatybridge/postgres:all-in-one',
      size: 'shared-cpu-4x',
      env: {
        PGDATA: '/mnt/postgres/data',
      },
      services: [
        {
          ports: [
            {
              port: 443,
              handlers: [ConnectionHandler.TLS, ConnectionHandler.HTTP],
            },
            {
              port: 80,
              handlers: [ConnectionHandler.HTTP],
            },
          ],
          protocol: 'tcp',
          internal_port: 8000,
        },
        {
          ports: [
            {
              port: 5432,
              handlers: [ConnectionHandler.PG_TLS],
            },
          ],
          protocol: 'tcp',
          internal_port: 5432,
        },
      ],
      mounts: [
        {
          volume: 'vol_g67340kqe5pvydxw',
          path: '/mnt/postgres',
        },
      ],
      checks: {
        pgrst: {
          type: 'http',
          port: 3000,
          method: 'HEAD',
          path: '/',
          interval: '15s',
          timeout: '10s',
        },
      },
    }
    nock(FLY_API_HOSTNAME)
      .post(`/v1/apps/${appId}/machines`, {
        name: machine.name,
        config: config as any,
      })
      .reply(200, machine)
    const data = await fly.Machine.createMachine({
      appId,
      name: machine.name,
      config,
    })
    console.dir(data, { depth: 10 })
  })

  it('deletes machine', async () => {
    const machineId = machine.id
    nock(FLY_API_HOSTNAME)
      .delete(`/v1/apps/${appId}/machines/${machineId}`)
      .reply(200, { ok: true })
    const data = await fly.Machine.deleteMachine({
      appId,
      machineId,
    })
    console.dir(data, { depth: 5 })
  })

  it('stops machine', async () => {
    const machineId = machine.id
    nock(FLY_API_HOSTNAME)
      .post(`/v1/apps/${appId}/machines/${machineId}/stop`, {
        signal: 'SIGTERM',
      })
      .reply(200, { ok: true })
    const data = await fly.Machine.stopMachine({
      appId,
      machineId,
    })
    console.dir(data, { depth: 5 })
  })

  it('starts machine', async () => {
    const machineId = machine.id
    nock(FLY_API_HOSTNAME)
      .post(`/v1/apps/${appId}/machines/${machineId}/start`)
      .reply(200, { ok: true })
    const data = await fly.Machine.startMachine({
      appId,
      machineId,
    })
    console.dir(data, { depth: 5 })
  })

  it('lists machines', async () => {
    nock(FLY_API_HOSTNAME)
      .get(`/v1/apps/${appId}/machines`)
      .reply(200, [machine])
    const data = await fly.Machine.listMachines(appId)
    console.dir(data, { depth: 10 })
  })
})
