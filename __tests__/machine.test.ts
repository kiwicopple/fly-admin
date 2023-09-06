import nock from 'nock'
import { describe, it } from '@jest/globals'
import {
  ConnectionHandler,
  MachineConfig,
  MachineResponse,
  MachineState,
} from '../src/lib/machine'
import { FLY_API_HOSTNAME } from '../src/client'
import { createClient } from '../src/main'

const fly = createClient('test-token')

describe('machine', () => {
  const appId = 'ctwntjgykzxhfncfwrfo'
  const machine: MachineResponse = {
    id: '17811953c92e18',
    name: 'ctwntjgykzxhfncfwrfo',
    state: MachineState.Created,
    region: 'hkg',
    instance_id: '01GSYXD50E7F114CX7SRCT2H41',
    private_ip: 'fdaa:1:698b:a7b:a8:33bd:e6da:2',
    config: {
      env: { PGDATA: '/mnt/postgres/data' },
      init: {},
      image: 'sweatybridge/postgres:all-in-one',
      mounts: [
        {
          encrypted: true,
          path: '/mnt/postgres',
          size_gb: 2,
          volume: 'vol_g67340kqe5pvydxw',
          name: 'ctwntjgykzxhfncfwrfo_pgdata',
        },
      ],
      services: [
        {
          protocol: 'tcp',
          internal_port: 8000,
          ports: [
            {
              port: 443,
              handlers: [ConnectionHandler.TLS, ConnectionHandler.HTTP],
            },
            { port: 80, handlers: [ConnectionHandler.HTTP] },
          ],
        },
        {
          protocol: 'tcp',
          internal_port: 5432,
          ports: [
            {
              port: 5432,
              handlers: [ConnectionHandler.PG_TLS],
            },
          ],
          concurrency: {
            type: 'connections',
            hard_limit: 60,
            soft_limit: 60,
          },
        },
      ],
      size: 'shared-cpu-4x',
      restart: {},
      guest: {
        cpu_kind: 'shared',
        cpus: 4,
        memory_mb: 1024,
      },
      checks: {
        pgrst: {
          port: 3000,
          type: 'http',
          interval: '15s',
          timeout: '10s',
          method: 'HEAD',
          path: '/',
        },
        adminapi: {
          port: 8085,
          type: 'tcp',
          interval: '15s',
          timeout: '10s',
        },
      },
    },
    image_ref: {
      registry: 'registry-1.docker.io',
      repository: 'sweatybridge/postgres',
      tag: 'all-in-one',
      digest:
        'sha256:df2014e5d037bf960a1240e300a913a97ef0d4486d22cbd1b7b92a7cbf487a7c',
      labels: {
        'org.opencontainers.image.ref.name': 'ubuntu',
        'org.opencontainers.image.version': '20.04',
      },
    },
    created_at: '2023-02-23T10:34:20Z',
    updated_at: '0001-01-01T00:00:00Z',
    events: [
      {
        id: '01H28X6YMHE186D9R0BF4CB2ZH',
        type: 'launch',
        status: 'created',
        source: 'user',
        timestamp: 1686073735825,
      },
    ],
    checks: [
      {
        name: 'adminapi',
        status: 'passing',
        output: 'Success',
        updated_at: '2023-08-22T23:54:06.176Z',
      },
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

  it('gets machines', async () => {
    const machineId = machine.id
    nock(FLY_API_HOSTNAME)
      .get(`/v1/apps/${appId}/machines/${machineId}`)
      .reply(200, {
        ...machine,
        state: MachineState.Started,
        events: [
          {
            id: '01H28X7D7GGZFSQPZ7YWVG17RH',
            type: 'start',
            status: 'started',
            source: 'flyd',
            timestamp: 1686073750768,
          },
          ...machine.events,
        ],
      })
    const data = await fly.Machine.getMachine({ appId, machineId })
    console.dir(data, { depth: 10 })
  })
})
