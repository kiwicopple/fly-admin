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
import { SignalRequestSignalEnum, StateEnum } from '../src/lib/types'

const fly = createClient(process.env.FLY_API_TOKEN || 'test-token')

describe('machine', () => {
  const app_name = 'ctwntjgykzxhfncfwrfo'
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
      .post(`/v1/apps/${app_name}/machines`, {
        name: machine.name,
        config: config as any,
      })
      .reply(200, machine)
    const data = await fly.Machine.createMachine({
      app_name,
      name: machine.name,
      config,
    })
    console.dir(data, { depth: 10 })
  })

  it('updates machine', async () => {
    const machine_id = machine.id
    const config = {
      image: 'sweatybridge/postgres:all-in-one',
      services: [],
    }
    nock(FLY_API_HOSTNAME)
      .post(`/v1/apps/${app_name}/machines/${machine_id}`, { config })
      .reply(200, machine)
    const data = await fly.Machine.updateMachine({
      app_name,
      machine_id,
      config,
    })
    console.dir(data, { depth: 5 })
  })

  it('deletes machine', async () => {
    const machine_id = machine.id
    nock(FLY_API_HOSTNAME)
      .delete(`/v1/apps/${app_name}/machines/${machine_id}`)
      .reply(200, { ok: true })
    const data = await fly.Machine.deleteMachine({
      app_name,
      machine_id,
    })
    console.dir(data, { depth: 5 })
  })

  it('stops machine', async () => {
    const machine_id = machine.id
    nock(FLY_API_HOSTNAME)
      .post(`/v1/apps/${app_name}/machines/${machine_id}/stop`, {
        signal: 'SIGTERM',
      })
      .reply(200, { ok: true })
    const data = await fly.Machine.stopMachine({
      app_name,
      machine_id,
    })
    console.dir(data, { depth: 5 })
  })

  it('starts machine', async () => {
    const machine_id = machine.id
    nock(FLY_API_HOSTNAME)
      .post(`/v1/apps/${app_name}/machines/${machine_id}/start`)
      .reply(200, { ok: true })
    const data = await fly.Machine.startMachine({
      app_name,
      machine_id,
    })
    console.dir(data, { depth: 5 })
  })

  it('lists machines', async () => {
    nock(FLY_API_HOSTNAME)
      .get(`/v1/apps/${app_name}/machines`)
      .reply(200, [machine])
    const data = await fly.Machine.listMachines(app_name)
    console.dir(data, { depth: 10 })
  })

  it('gets machine', async () => {
    const machine_id = machine.id
    nock(FLY_API_HOSTNAME)
      .get(`/v1/apps/${app_name}/machines/${machine_id}`)
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
    const data = await fly.Machine.getMachine({
      app_name,
      machine_id,
    })
    console.dir(data, { depth: 10 })
  })

  it('restarts machine', async () => {
    const machine_id = machine.id
    nock(FLY_API_HOSTNAME)
      .post(`/v1/apps/${app_name}/machines/${machine_id}/restart`)
      .reply(200, { ok: true })
    const data = await fly.Machine.restartMachine({
      app_name,
      machine_id,
    })
    console.dir(data, { depth: 10 })
  })

  it('signals machine', async () => {
    const machine_id = machine.id
    const signal = SignalRequestSignalEnum.SIGHUP
    nock(FLY_API_HOSTNAME)
      .post(`/v1/apps/${app_name}/machines/${machine_id}/signal`, { signal })
      .reply(200, { ok: true })
    const data = await fly.Machine.signalMachine({
      app_name,
      machine_id,
      signal,
    })
    console.dir(data, { depth: 10 })
  })

  it('waits machine', async () => {
    const machine_id = machine.id
    const state = StateEnum.Started
    nock(FLY_API_HOSTNAME)
      .get(`/v1/apps/${app_name}/machines/${machine_id}/wait`)
      .query({ state })
      .reply(200, { ok: true })
    const data = await fly.Machine.waitMachine({
      app_name,
      machine_id,
      state,
    })
    console.dir(data, { depth: 10 })
  })

  it('lists events', async () => {
    const machine_id = machine.id
    nock(FLY_API_HOSTNAME)
      .get(`/v1/apps/${app_name}/machines/${machine_id}/events`)
      .reply(200, [
        {
          id: '01H9QFJCZ03MEGZKYPYY4ZSTTS',
          type: 'exit',
          status: 'stopped',
          request: {
            exit_event: {
              requested_stop: true,
              restarting: false,
              guest_exit_code: 0,
              guest_signal: -1,
              guest_error: '',
              exit_code: 143,
              signal: -1,
              error: '',
              oom_killed: false,
              exited_at: '2023-09-07T09:28:59.832Z',
            },
            restart_count: 0,
          },
          source: 'flyd',
          timestamp: 1694078940128,
        },
      ])
    const data = await fly.Machine.listEvents({
      app_name,
      machine_id,
    })
    console.dir(data, { depth: 10 })
  })

  it('lists versions', async () => {
    const machine_id = machine.id
    nock(FLY_API_HOSTNAME)
      .get(`/v1/apps/${app_name}/machines/${machine_id}/versions`)
      .reply(200, [
        {
          version: '01H28X6YK062GWVQHQ6CF8FG5S',
          user_config: machine.config,
        },
      ])
    const data = await fly.Machine.listVersions({
      app_name,
      machine_id,
    })
    console.dir(data, { depth: 10 })
  })

  it('lists processes', async () => {
    const machine_id = machine.id
    nock(FLY_API_HOSTNAME)
      .get(`/v1/apps/${app_name}/machines/${machine_id}/ps`)
      .reply(200, [
        {
          pid: 713,
          stime: 2,
          rtime: 847,
          command: 'nginx: worker process',
          directory: '/',
          cpu: 0,
          rss: 97005568,
          listen_sockets: [
            { proto: 'tcp', address: '0.0.0.0:8000' },
            { proto: 'tcp', address: '0.0.0.0:8443' },
          ],
        },
      ])
    const data = await fly.Machine.listProcesses({
      app_name,
      machine_id,
    })
    console.dir(data, { depth: 10 })
  })

  it('gets lease', async () => {
    const machine_id = machine.id
    nock(FLY_API_HOSTNAME)
      .get(`/v1/apps/${app_name}/machines/${machine_id}/lease`)
      .reply(200, {
        status: 'success',
        data: {
          nonce: '45b8f9200c72',
          expires_at: 1694080223,
          owner: 'example@fly.io',
          description: '',
        },
      })
    const data = await fly.Machine.getLease({
      app_name,
      machine_id,
    })
    console.dir(data, { depth: 10 })
  })

  it('acquires lease', async () => {
    const body = { ttl: 60 }
    const machine_id = machine.id
    nock(FLY_API_HOSTNAME)
      .post(`/v1/apps/${app_name}/machines/${machine_id}/lease`, body)
      .reply(200, {
        status: 'success',
        data: {
          nonce: '45b8f9200c72',
          expires_at: 1694080223,
          owner: 'example@fly.io',
          description: '',
        },
      })
    const data = await fly.Machine.acquireLease({
      app_name,
      machine_id,
      ...body,
    })
    console.dir(data, { depth: 10 })
  })

  it('cordons machine', async () => {
    const machine_id = machine.id
    nock(FLY_API_HOSTNAME)
      .post(`/v1/apps/${app_name}/machines/${machine_id}/cordon`)
      .reply(200, {
        status: 'success',
        data: {
          nonce: '45b8f9200c72',
          expires_at: 1694080223,
          owner: 'example@fly.io',
          description: '',
        },
      })
    const data = await fly.Machine.cordonMachine({
      app_name,
      machine_id,
    })
    console.dir(data, { depth: 10 })
  })

  it('uncordons machine', async () => {
    const machine_id = machine.id
    nock(FLY_API_HOSTNAME)
      .post(`/v1/apps/${app_name}/machines/${machine_id}/uncordon`)
      .reply(200, { ok: true })
    const data = await fly.Machine.uncordonMachine({
      app_name,
      machine_id,
    })
    console.dir(data, { depth: 10 })
  })
})
