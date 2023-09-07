import Client from '../client'
import {
  ApiMachineConfig,
  ApiMachineInit,
  ApiMachineService,
  ApiMachineMount,
  ApiMachinePort,
  ApiMachineCheck,
  ApiMachineRestart,
  ApiMachineGuest,
  CheckStatus as ApiCheckStatus,
  CreateMachineRequest as ApiCreateMachineRequest,
  ImageRef as ApiImageRef,
  Machine as ApiMachine,
  StateEnum as ApiMachineState,
  SignalRequestSignalEnum as ApiMachineSignal,
} from './types'

// We override the generated types from openapi spec to mark fields as non-optional
export interface MachineConfig extends ApiMachineConfig {
  // The Docker image to run
  image: string
  // Optionally one of hourly, daily, weekly, monthly. Runs machine at the given interval. Interval starts at time of machine creation
  schedule?: 'hourly' | 'daily' | 'weekly' | 'monthly'
}

export type ListMachineRequest =
  | string
  | {
      app_name: string
      include_deleted?: ''
      region?: string
    }

// Ref: https://fly.io/docs/machines/working-with-machines/#create-a-machine
export interface CreateMachineRequest extends ApiCreateMachineRequest {
  app_name: string
  config: MachineConfig
}

interface BaseEvent {
  id: string
  type: string
  status: string
  source: 'flyd' | 'user'
  timestamp: number
}

interface StartEvent extends BaseEvent {
  type: 'start'
  status: 'started' | 'starting'
}

interface LaunchEvent extends BaseEvent {
  type: 'launch'
  status: 'created'
  source: 'user'
}

interface RestartEvent extends BaseEvent {
  type: 'restart'
  status: 'starting' | 'stopping'
  source: 'flyd' | 'user'
}

interface ExitEvent extends BaseEvent {
  type: 'exit'
  status: 'stopped'
  source: 'flyd'
  request: {
    exit_event: {
      requested_stop: boolean
      restarting: boolean
      guest_exit_code: number
      guest_signal: number
      guest_error: string
      exit_code: number
      signal: number
      error: string
      oom_killed: boolean
      exited_at: string
    }
    restart_count: number
  }
}

export type MachineEvent = LaunchEvent | StartEvent | RestartEvent | ExitEvent

export enum MachineState {
  Created = 'created',
  Starting = 'starting',
  Started = 'started',
  Stopping = 'stopping',
  Stopped = 'stopped',
  Replacing = 'replacing',
  Destroying = 'destroying',
  Destroyed = 'destroyed',
}

interface MachineMount extends ApiMachineMount {
  encrypted: boolean
  // Absolute path on the VM where the volume should be mounted. i.e. /data
  path: string
  size_gb: number
  // The volume ID, visible in fly volumes list, i.e. vol_2n0l3vl60qpv635d
  volume: string
  name: string
}

export enum ConnectionHandler {
  // Convert TLS connection to unencrypted TCP
  TLS = 'tls',
  // Handle TLS for PostgreSQL connections
  PG_TLS = 'pg_tls',
  // Convert TCP connection to HTTP
  HTTP = 'http',
  // Wrap TCP connection in PROXY protocol
  PROXY_PROTO = 'proxy_proto',
}

interface MachinePort extends ApiMachinePort {
  // Public-facing port number
  port: number
  // Array of connection handlers for TCP-based services.
  handlers?: ConnectionHandler[]
}

interface MachineService extends ApiMachineService {
  protocol: 'tcp' | 'udp'
  internal_port: number
  ports: MachinePort[]
  // load balancing concurrency settings
  concurrency?: {
    // connections (TCP) or requests (HTTP). Defaults to connections.
    type: 'connections' | 'requests'
    // "ideal" service concurrency. We will attempt to spread load to keep services at or below this limit
    soft_limit: number
    // maximum allowed concurrency. We will queue or reject when a service is at this limit
    hard_limit: number
  }
}

interface MachineCheck extends ApiMachineCheck {
  // tcp or http
  type: 'tcp' | 'http'
  // The port to connect to, likely should be the same as internal_port
  port: number
  // The time between connectivity checks
  interval: string
  // The maximum time a connection can take before being reported as failing its healthcheck
  timeout: string
}

interface MachineGuest extends ApiMachineGuest {
  cpu_kind: 'shared' | 'performance'
  cpus: number
  memory_mb: number
}

interface CheckStatus extends ApiCheckStatus {
  name: string
  status: 'passing' | 'warning' | 'critical'
  output: string
  updated_at: string
}

interface MachineImageRef extends Omit<ApiImageRef, 'labels'> {
  registry: string
  repository: string
  tag: string
  digest: string
  labels: Record<string, string> | null
}

export interface MachineResponse extends Omit<ApiMachine, 'image_ref'> {
  id: string
  name: string
  state: MachineState
  region: string
  instance_id: string
  private_ip: string
  config: {
    env: Record<string, string>
    init: ApiMachineInit
    mounts: MachineMount[]
    services: MachineService[]
    checks: Record<string, MachineCheck>
    restart: ApiMachineRestart
    guest: MachineGuest
    size: 'shared-cpu-1x' | 'shared-cpu-2x' | 'shared-cpu-4x'
  } & MachineConfig
  image_ref: MachineImageRef
  created_at: string
  updated_at: string
  events: MachineEvent[]
  checks: CheckStatus[]
}

export interface GetMachineRequest {
  app_name: string
  machine_id: string
}

interface OkResponse {
  ok: boolean
}

export interface DeleteMachineRequest extends GetMachineRequest {
  // If true, the machine will be deleted even if it is in any other state than running.
  force?: boolean
}

export interface RestartMachineRequest extends GetMachineRequest {
  timeout?: string
}

export interface SignalMachineRequest extends GetMachineRequest {
  signal: ApiMachineSignal
}

export interface StopMachineRequest extends RestartMachineRequest {
  signal?: ApiMachineSignal
}

export type StartMachineRequest = GetMachineRequest

export interface UpdateMachineRequest extends GetMachineRequest {
  config: MachineConfig
}

export type ListEventsRequest = GetMachineRequest

export type ListVersionsRequest = GetMachineRequest

export interface ListProcessesRequest extends GetMachineRequest {
  sort_by?: string
  order?: string
}

export interface ProcessResponse {
  command: string
  cpu: number
  directory: string
  listen_sockets: [
    {
      address: string
      proto: string
    }
  ]
  pid: number
  rss: number
  rtime: number
  stime: number
}

export interface WaitMachineRequest extends GetMachineRequest {
  instance_id?: string
  // Default timeout is 60s
  timeout?: string
  state?: ApiMachineState
}

export interface MachineVersionResponse {
  user_config: MachineResponse
  version: string
}

export type GetLeaseRequest = GetMachineRequest

export interface LeaseResponse {
  status: 'success'
  data: {
    description: string
    expires_at: number
    nonce: string
    owner: string
  }
}

export interface AcquireLeaseRequest extends GetLeaseRequest {
  description?: string
  ttl: number
}

export interface DeleteLeaseRequest extends GetLeaseRequest {
  nonce: string
}

export type CordonMachineRequest = GetMachineRequest

export type UncordonMachineRequest = GetMachineRequest

export class Machine {
  private client: Client

  constructor(client: Client) {
    this.client = client
  }

  async listMachines(app_name: ListMachineRequest): Promise<MachineResponse[]> {
    let path: string
    if (typeof app_name === 'string') {
      path = `apps/${app_name}/machines`
    } else {
      const { app_name: appId, ...params } = app_name
      path = `apps/${appId}/machines`
      const query = new URLSearchParams(params).toString()
      if (query) path += `?${query}`
    }
    return await this.client.restOrThrow(path)
  }

  async getMachine(payload: GetMachineRequest): Promise<MachineResponse> {
    const { app_name, machine_id } = payload
    const path = `apps/${app_name}/machines/${machine_id}`
    return await this.client.restOrThrow(path)
  }

  async createMachine(payload: CreateMachineRequest): Promise<MachineResponse> {
    const { app_name, ...body } = payload
    const path = `apps/${app_name}/machines`
    return await this.client.restOrThrow(path, 'POST', body)
  }

  async updateMachine(payload: UpdateMachineRequest): Promise<MachineResponse> {
    const { app_name, machine_id, ...body } = payload
    const path = `apps/${app_name}/machines/${machine_id}`
    return await this.client.restOrThrow(path, 'POST', body)
  }

  async deleteMachine(payload: DeleteMachineRequest): Promise<OkResponse> {
    const { app_name, machine_id, force } = payload
    const query = force ? '?kill=true' : ''
    const path = `apps/${app_name}/machines/${machine_id}${query}`
    return await this.client.restOrThrow(path, 'DELETE')
  }

  async startMachine(payload: StartMachineRequest): Promise<OkResponse> {
    const { app_name, machine_id } = payload
    const path = `apps/${app_name}/machines/${machine_id}/start`
    return await this.client.restOrThrow(path, 'POST')
  }

  async stopMachine(payload: StopMachineRequest): Promise<OkResponse> {
    const { app_name, machine_id, ...body } = payload
    const path = `apps/${app_name}/machines/${machine_id}/stop`
    return await this.client.restOrThrow(path, 'POST', {
      signal: ApiMachineSignal.SIGTERM,
      ...body,
    })
  }

  async restartMachine(payload: RestartMachineRequest): Promise<OkResponse> {
    const { app_name, machine_id, ...body } = payload
    const path = `apps/${app_name}/machines/${machine_id}/restart`
    return await this.client.restOrThrow(path, 'POST', body)
  }

  async signalMachine(payload: SignalMachineRequest): Promise<OkResponse> {
    const { app_name, machine_id, ...body } = payload
    const path = `apps/${app_name}/machines/${machine_id}/signal`
    return await this.client.restOrThrow(path, 'POST', body)
  }

  async listEvents(
    payload: ListEventsRequest
  ): Promise<MachineResponse['events']> {
    const { app_name, machine_id } = payload
    const path = `apps/${app_name}/machines/${machine_id}/events`
    return await this.client.restOrThrow(path)
  }

  async listVersions(
    payload: ListVersionsRequest
  ): Promise<MachineVersionResponse[]> {
    const { app_name, machine_id } = payload
    const path = `apps/${app_name}/machines/${machine_id}/versions`
    return await this.client.restOrThrow(path)
  }

  async listProcesses(payload: ListProcessesRequest): Promise<ProcessResponse> {
    const { app_name, machine_id, ...params } = payload
    let path = `apps/${app_name}/machines/${machine_id}/ps`
    const query = new URLSearchParams(params).toString()
    if (query) path += `?${query}`
    return await this.client.restOrThrow(path)
  }

  async waitMachine(payload: WaitMachineRequest): Promise<OkResponse> {
    const { app_name, machine_id, ...params } = payload
    let path = `apps/${app_name}/machines/${machine_id}/wait`
    const query = new URLSearchParams(params).toString()
    if (query) path += `?${query}`
    return await this.client.restOrThrow(path)
  }

  async getLease(payload: GetLeaseRequest): Promise<LeaseResponse> {
    const { app_name, machine_id } = payload
    const path = `apps/${app_name}/machines/${machine_id}/lease`
    return await this.client.restOrThrow(path)
  }

  async acquireLease(payload: AcquireLeaseRequest): Promise<LeaseResponse> {
    const { app_name, machine_id, ...body } = payload
    const path = `apps/${app_name}/machines/${machine_id}/lease`
    return await this.client.restOrThrow(path, 'POST', body)
  }

  async cordonMachine(payload: CordonMachineRequest): Promise<OkResponse> {
    const { app_name, machine_id } = payload
    const path = `apps/${app_name}/machines/${machine_id}/cordon`
    return await this.client.restOrThrow(path, 'POST')
  }

  async uncordonMachine(payload: UncordonMachineRequest): Promise<OkResponse> {
    const { app_name, machine_id } = payload
    const path = `apps/${app_name}/machines/${machine_id}/uncordon`
    return await this.client.restOrThrow(path, 'POST')
  }
}
