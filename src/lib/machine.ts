import Client from '../client'

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

interface ServiceConfig {
  // tcp or udp. Learn more about running raw TCP/UDP services.
  protocol: 'tcp' | 'udp'
  // load balancing concurrency settings
  concurrency?: {
    // connections (TCP) or requests (HTTP). Defaults to connections.
    type: 'connections' | 'requests'
    // "ideal" service concurrency. We will attempt to spread load to keep services at or below this limit
    soft_limit: number
    // maximum allowed concurrency. We will queue or reject when a service is at this limit
    hard_limit: number
  }
  // Port the machine VM listens on
  internal_port: number
  // An array of objects defining the service's ports and associated handlers. Options:
  ports: {
    // Public-facing port number
    port: number
    // Array of connection handlers for TCP-based services.
    handlers?: ConnectionHandler[]
  }[]
}

interface HealthCheckConfig {
  // tcp or http
  type: 'tcp' | 'http'
  // The port to connect to, likely should be the same as internal_port
  port: number
  // The time between connectivity checks
  interval: string
  // The maximum time a connection can take before being reported as failing its healthcheck
  timeout: string
  // For http checks, the HTTP method to use to when making the request
  method?: string
  // For http checks, the path to send the request to
  path?: string
}

export interface MachineConfig {
  // The Docker image to run
  image: string
  // An object with the following options:
  guest?: {
    // Number of vCPUs (default 1)
    cpus?: number
    // Memory in megabytes as multiples of 256 (default 256)
    memory_mb?: number
    // Optional array of strings. Arguments passed to the kernel
    kernel_args?: string[]
  }
  // A named size for the VM, e.g. performance-2x or shared-cpu-2x. Note: guest and size are mutually exclusive.
  size?: string
  // An object filled with key/value pairs to be set as environment variables
  env?: Record<string, string>
  // An array of objects that define a single network service. Check the machines networking section for more information. Options:
  services: ServiceConfig[]
  // An optional array of objects defining multiple processes to run within a VM. The Machine will stop if any process exits without error.
  processes?: {
    // Process name
    name: string
    // An array of strings. The process that will run
    entrypoint: string[]
    // An array of strings. The arguments passed to the entrypoint
    cmd: string[]
    // An object filled with key/value pairs to be set as environment variables
    env: Record<string, string>
    // An optional user that the process runs under
    user?: string
  }[]
  // Optionally one of hourly, daily, weekly, monthly. Runs machine at the given interval. Interval starts at time of machine creation
  schedule?: 'hourly' | 'daily' | 'weekly' | 'monthly'
  // An array of objects that reference previously created persistent volumes. Currently, you may only mount one volume per VM.
  mounts?: {
    // The volume ID, visible in fly volumes list, i.e. vol_2n0l3vl60qpv635d
    volume: string
    // Absolute path on the VM where the volume should be mounted. i.e. /data
    path: string
  }[]
  // An optional object that defines one or more named checks
  // the key for each check is the check name
  // the value for each check supports:
  checks?: Record<string, HealthCheckConfig>
}

export type ListMachineRequest = string

// Ref: https://fly.io/docs/machines/working-with-machines/#create-a-machine
export interface CreateMachineRequest {
  appId: string
  // Unique name for this machine. If omitted, one is generated for you.
  name?: string
  // The target region. Omitting this param launches in the same region as your WireGuard peer connection (somewhere near you).
  region?: string
  // An object defining the machine configuration. Options
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
  status: 'started'
  source: 'flyd'
}

interface LaunchEvent extends BaseEvent {
  type: 'launch'
  status: 'created'
  source: 'user'
}

export interface MachineResponse {
  id: string
  name: string
  state: 'started' | 'stopped' | 'destroyed'
  region: string
  instance_id: string
  private_ip: string
  config: {
    env: Record<string, string>
    init: {}
    mounts: {
      encrypted: boolean
      path: string
      size_gb: number
      volume: string
      name: string
    }[]
    services: ServiceConfig[]
    checks: Record<string, HealthCheckConfig>
    image: string
    restart: {}
    guest: {
      cpu_kind: 'shared'
      cpus: number
      memory_mb: number
    }
    size: 'shared-cpu-1x' | 'shared-cpu-2x' | 'shared-cpu-4x'
  }
  image_ref: {
    registry: string
    repository: string
    tag: string
    digest: string
    labels?: string[]
  }
  created_at: string
  updated_at: string
  events: (StartEvent | LaunchEvent)[]
  checks: {
    name: string
    status: 'passing' | 'warning' | 'critical'
    output: string
    updated_at: string
  }[]
}

export const FLY_API_HOSTNAME =
  process.env.FLY_API_HOSTNAME || 'https://api.machines.dev'

interface MachineRequest {
  appId: string
  machineId: string
}

interface OkResponse {
  ok: boolean
}

export type DeleteMachineRequest = MachineRequest

export interface StopMachineRequest extends MachineRequest {
  signal?:
    | 'SIGABRT'
    | 'SIGALRM'
    | 'SIGFPE'
    | 'SIGILL'
    | 'SIGINT'
    | 'SIGKILL'
    | 'SIGPIPE'
    | 'SIGQUIT'
    | 'SIGSEGV'
    | 'SIGTERM'
    | 'SIGTRAP'
    | 'SIGUSR1'
}

export type StartMachineRequest = MachineRequest

export class Machine {
  private client: Client

  constructor(client: Client) {
    this.client = client
  }

  async listMachines(appId: ListMachineRequest): Promise<MachineResponse[]> {
    return await this.client.restOrThrow({ appId, machineId: '' })
  }

  async startMachine(payload: StartMachineRequest): Promise<OkResponse> {
    return await this.client.restOrThrow(
      { ...payload, action: 'start' },
      'POST'
    )
  }

  async stopMachine(payload: StopMachineRequest): Promise<OkResponse> {
    return await this.client.restOrThrow(
      { ...payload, action: 'stop' },
      'POST',
      { signal: 'SIGTERM' }
    )
  }

  async deleteMachine(payload: DeleteMachineRequest): Promise<OkResponse> {
    return await this.client.restOrThrow(payload, 'DELETE')
  }

  async createMachine(payload: CreateMachineRequest): Promise<MachineResponse> {
    const { appId, ...body } = payload
    return await this.client.restOrThrow({ appId, machineId: '' }, 'POST', body)
  }
}
