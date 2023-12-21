/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface App {
  id?: string
  name?: string
  organization?: Organization
  status?: string
}

export interface CheckStatus {
  name?: string
  output?: string
  status?: string
  updated_at?: string
}

export interface CreateAppRequest {
  app_name?: string
  app_role_id?: string
  network?: string
  org_slug?: string
}

export interface CreateLeaseRequest {
  description?: string
  ttl?: number
}

export interface CreateMachineRequest {
  /** An object defining the Machine configuration */
  config?: ApiMachineConfig
  lease_ttl?: number
  lsvd?: boolean
  /** Unique name for this Machine. If omitted, one is generated for you */
  name?: string
  /** The target region. Omitting this param launches in the same region as your WireGuard peer connection (somewhere near you). */
  region?: string
  skip_launch?: boolean
  skip_service_registration?: boolean
}

export interface CreateVolumeRequest {
  compute?: ApiMachineGuest
  encrypted?: boolean
  fstype?: string
  machines_only?: boolean
  name?: string
  region?: string
  require_unique_zone?: boolean
  size_gb?: number
  /** restore from snapshot */
  snapshot_id?: string
  snapshot_retention?: number
  /** fork from remote volume */
  source_volume_id?: string
}

export interface ErrorResponse {
  /** Deprecated */
  details?: any
  error?: string
  status?: MainStatusCode
}

export interface ExtendVolumeRequest {
  size_gb?: number
}

export interface ExtendVolumeResponse {
  needs_restart?: boolean
  volume?: Volume
}

export interface ImageRef {
  digest?: string
  labels?: Record<string, string>
  registry?: string
  repository?: string
  tag?: string
}

export interface Lease {
  /** Description or reason for the Lease. */
  description?: string
  /** ExpiresAt is the unix timestamp in UTC to denote when the Lease will no longer be valid. */
  expires_at?: number
  /** Nonce is the unique ID autogenerated and associated with the Lease. */
  nonce?: string
  /** Owner is the user identifier which acquired the Lease. */
  owner?: string
  /** Machine version */
  version?: string
}

export interface ListApp {
  id?: string
  machine_count?: number
  name?: string
  network?: any
}

export interface ListAppsResponse {
  apps?: ListApp[]
  total_apps?: number
}

export interface ListenSocket {
  address?: string
  proto?: string
}

export interface Machine {
  checks?: CheckStatus[]
  config?: ApiMachineConfig
  created_at?: string
  events?: MachineEvent[]
  id?: string
  image_ref?: ImageRef
  /** InstanceID is unique for each version of the machine */
  instance_id?: string
  name?: string
  /** Nonce is only every returned on machine creation if a lease_duration was provided. */
  nonce?: string
  /** PrivateIP is the internal 6PN address of the machine. */
  private_ip?: string
  region?: string
  state?: string
  updated_at?: string
}

export interface MachineEvent {
  id?: string
  request?: any
  source?: string
  status?: string
  timestamp?: number
  type?: string
}

export interface MachineExecRequest {
  /** Deprecated: use Command instead */
  cmd?: string
  command?: string[]
  timeout?: number
}

export interface MachineVersion {
  user_config?: ApiMachineConfig
  version?: string
}

export interface Organization {
  name?: string
  slug?: string
}

export interface ProcessStat {
  command?: string
  cpu?: number
  directory?: string
  listen_sockets?: ListenSocket[]
  pid?: number
  rss?: number
  rtime?: number
  stime?: number
}

export interface SignalRequest {
  signal?: SignalRequestSignalEnum
}

export interface StopRequest {
  signal?: string
  timeout?: string
}

export interface UpdateMachineRequest {
  /** An object defining the Machine configuration */
  config?: ApiMachineConfig
  current_version?: string
  lease_ttl?: number
  lsvd?: boolean
  /** Unique name for this Machine. If omitted, one is generated for you */
  name?: string
  /** The target region. Omitting this param launches in the same region as your WireGuard peer connection (somewhere near you). */
  region?: string
  skip_launch?: boolean
  skip_service_registration?: boolean
}

export interface UpdateVolumeRequest {
  snapshot_retention?: number
}

export interface Volume {
  attached_alloc_id?: string
  attached_machine_id?: string
  block_size?: number
  blocks?: number
  blocks_avail?: number
  blocks_free?: number
  created_at?: string
  encrypted?: boolean
  fstype?: string
  id?: string
  name?: string
  region?: string
  size_gb?: number
  snapshot_retention?: number
  state?: string
  zone?: string
}

export interface VolumeSnapshot {
  created_at?: string
  digest?: string
  id?: string
  size?: number
  status?: string
}

export interface ApiDNSConfig {
  skip_registration?: boolean
}

/** A file that will be written to the Machine. One of RawValue or SecretName must be set. */
export interface ApiFile {
  /**
   * GuestPath is the path on the machine where the file will be written and must be an absolute path.
   * For example: /full/path/to/file.json
   */
  guest_path?: string
  /** The base64 encoded string of the file contents. */
  raw_value?: string
  /** The name of the secret that contains the base64 encoded file contents. */
  secret_name?: string
}

export interface ApiHTTPOptions {
  compress?: boolean
  h2_backend?: boolean
  response?: ApiHTTPResponseOptions
}

export interface ApiHTTPResponseOptions {
  headers?: Record<string, any>
}

/** An optional object that defines one or more named checks. The key for each check is the check name. */
export interface ApiMachineCheck {
  /** The time to wait after a VM starts before checking its health */
  grace_period?: string
  headers?: ApiMachineHTTPHeader[]
  /** The time between connectivity checks */
  interval?: string
  /** For http checks, the HTTP method to use to when making the request */
  method?: string
  /** For http checks, the path to send the request to */
  path?: string
  /** The port to connect to, often the same as internal_port */
  port?: number
  /** For http checks, whether to use http or https */
  protocol?: string
  /** The maximum time a connection can take before being reported as failing its health check */
  timeout?: string
  /** If the protocol is https, the hostname to use for TLS certificate validation */
  tls_server_name?: string
  /** For http checks with https protocol, whether or not to verify the TLS certificate */
  tls_skip_verify?: boolean
  /** tcp or http */
  type?: string
}

export interface ApiMachineConfig {
  /** Optional boolean telling the Machine to destroy itself once it’s complete (default false) */
  auto_destroy?: boolean
  checks?: Record<string, ApiMachineCheck>
  /** Deprecated: use Service.Autostart instead */
  disable_machine_autostart?: boolean
  dns?: ApiDNSConfig
  /** An object filled with key/value pairs to be set as environment variables */
  env?: Record<string, string>
  files?: ApiFile[]
  guest?: ApiMachineGuest
  /** The docker image to run */
  image?: string
  init?: ApiMachineInit
  metadata?: Record<string, string>
  metrics?: ApiMachineMetrics
  mounts?: ApiMachineMount[]
  processes?: ApiMachineProcess[]
  /** The Machine restart policy defines whether and how flyd restarts a Machine after its main process exits. See https://fly.io/docs/machines/guides-examples/machine-restart-policy/. */
  restart?: ApiMachineRestart
  schedule?: string
  services?: ApiMachineService[]
  /** Deprecated: use Guest instead */
  size?: string
  /**
   * Standbys enable a machine to be a standby for another. In the event of a hardware failure,
   * the standby machine will be started.
   */
  standbys?: string[]
  statics?: ApiStatic[]
  stop_config?: ApiStopConfig
}

export interface ApiMachineGuest {
  cpu_kind?: string
  cpus?: number
  gpu_kind?: string
  host_dedication_id?: string
  kernel_args?: string[]
  memory_mb?: number
}

/** For http checks, an array of objects with string field Name and array of strings field Values. The key/value pairs specify header and header values that will get passed with the check call. */
export interface ApiMachineHTTPHeader {
  /** The header name */
  name?: string
  /** The header value */
  values?: string[]
}

export interface ApiMachineInit {
  cmd?: string[]
  entrypoint?: string[]
  exec?: string[]
  kernel_args?: string[]
  swap_size_mb?: number
  tty?: boolean
}

export interface ApiMachineMetrics {
  path?: string
  port?: number
}

export interface ApiMachineMount {
  add_size_gb?: number
  encrypted?: boolean
  extend_threshold_percent?: number
  name?: string
  path?: string
  size_gb?: number
  size_gb_limit?: number
  volume?: string
}

export interface ApiMachinePort {
  end_port?: number
  force_https?: boolean
  handlers?: string[]
  http_options?: ApiHTTPOptions
  port?: number
  proxy_proto_options?: ApiProxyProtoOptions
  start_port?: number
  tls_options?: ApiTLSOptions
}

export interface ApiMachineProcess {
  cmd?: string[]
  entrypoint?: string[]
  env?: Record<string, string>
  exec?: string[]
  user?: string
}

/** The Machine restart policy defines whether and how flyd restarts a Machine after its main process exits. See https://fly.io/docs/machines/guides-examples/machine-restart-policy/. */
export interface ApiMachineRestart {
  /** When policy is on-failure, the maximum number of times to attempt to restart the Machine before letting it stop. */
  max_retries?: number
  /**
   * * no - Never try to restart a Machine automatically when its main process exits, whether that’s on purpose or on a crash.
   * * always - Always restart a Machine automatically and never let it enter a stopped state, even when the main process exits cleanly.
   * * on-failure - Try up to MaxRetries times to automatically restart the Machine if it exits with a non-zero exit code. Default when no explicit policy is set, and for Machines with schedules.
   */
  policy?: ApiMachineRestartPolicyEnum
}

export interface ApiMachineService {
  autostart?: boolean
  autostop?: boolean
  checks?: ApiMachineCheck[]
  concurrency?: ApiMachineServiceConcurrency
  force_instance_description?: string
  force_instance_key?: string
  internal_port?: number
  min_machines_running?: number
  ports?: ApiMachinePort[]
  protocol?: string
}

export interface ApiMachineServiceConcurrency {
  hard_limit?: number
  soft_limit?: number
  type?: string
}

export interface ApiProxyProtoOptions {
  version?: string
}

export interface ApiStatic {
  guest_path: string
  url_prefix: string
}

export interface ApiStopConfig {
  signal?: string
  timeout?: string
}

export interface ApiTLSOptions {
  alpn?: string[]
  default_self_signed?: boolean
  versions?: string[]
}

export enum MainStatusCode {
  Unknown = 'unknown',
  CapacityErr = 'insufficient_capacity',
}

export enum SignalRequestSignalEnum {
  SIGABRT = 'SIGABRT',
  SIGALRM = 'SIGALRM',
  SIGFPE = 'SIGFPE',
  SIGHUP = 'SIGHUP',
  SIGILL = 'SIGILL',
  SIGINT = 'SIGINT',
  SIGKILL = 'SIGKILL',
  SIGPIPE = 'SIGPIPE',
  SIGQUIT = 'SIGQUIT',
  SIGSEGV = 'SIGSEGV',
  SIGTERM = 'SIGTERM',
  SIGTRAP = 'SIGTRAP',
  SIGUSR1 = 'SIGUSR1',
}

/**
 * * no - Never try to restart a Machine automatically when its main process exits, whether that’s on purpose or on a crash.
 * * always - Always restart a Machine automatically and never let it enter a stopped state, even when the main process exits cleanly.
 * * on-failure - Try up to MaxRetries times to automatically restart the Machine if it exits with a non-zero exit code. Default when no explicit policy is set, and for Machines with schedules.
 */
export enum ApiMachineRestartPolicyEnum {
  No = 'no',
  Always = 'always',
  OnFailure = 'on-failure',
}

export interface AppsListParams {
  /** The org slug, or 'personal', to filter apps */
  org_slug?: string
}

export interface MachinesListParams {
  /** Include deleted machines */
  include_deleted?: boolean
  /** Region filter */
  region?: string
  /** Fly App Name */
  appName: string
}

export interface MachinesListProcessesParams {
  /** Sort by */
  sort_by?: string
  /** Order */
  order?: string
  /** Fly App Name */
  appName: string
  /** Machine ID */
  machineId: string
}

export interface MachinesRestartParams {
  /** Restart timeout as a Go duration string or number of seconds */
  timeout?: string
  /** Fly App Name */
  appName: string
  /** Machine ID */
  machineId: string
}

export interface MachinesWaitParams {
  /** instance? version? TODO */
  instance_id?: string
  /** wait timeout. default 60s */
  timeout?: number
  /** desired state */
  state?: StateEnum
  /** Fly App Name */
  appName: string
  /** Machine ID */
  machineId: string
}

/** desired state */
export enum StateEnum {
  Started = 'started',
  Stopped = 'stopped',
  Destroyed = 'destroyed',
}

/** desired state */
export enum MachinesWaitParams1StateEnum {
  Started = 'started',
  Stopped = 'stopped',
  Destroyed = 'destroyed',
}
