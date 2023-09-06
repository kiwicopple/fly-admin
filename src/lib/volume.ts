import Client from '../client'

export type ListVolumesRequest = string

// Ref: https://github.com/superfly/flyctl/blob/master/api/volume_types.go#L23
export interface CreateVolumeRequest {
  appId: string
  name: string
  region: string
  size_gb?: number
  encrypted?: boolean
  require_unique_zone?: boolean
  machines_only?: boolean
  // restore from snapshot
  snapshot_id?: string
  // fork from remote volume
  source_volume_id?: string
}

// Ref: https://github.com/superfly/flyctl/blob/master/api/volume_types.go#L5
export interface VolumeResponse {
  id: string
  name: string
  state: string
  size_gb: number
  region: string
  zone: string
  encrypted: boolean
  attached_machine_id: string | null
  attached_alloc_id: string | null
  created_at: string
  blocks: number
  block_size: number
  blocks_free: number
  blocks_avail: number
  fstype: string
  host_dedication_key: string
}

interface VolumeRequest {
  appId: string
  volumeId: string
}
export type DeleteVolumeRequest = VolumeRequest

export interface ExtendVolumeRequest extends VolumeRequest {
  size_gb: number
}

export interface ExtendVolumeResponse {
  needs_restart: boolean
  volume: VolumeResponse
}

export class Volume {
  private client: Client

  constructor(client: Client) {
    this.client = client
  }

  async listVolumes(appId: ListVolumesRequest): Promise<VolumeResponse[]> {
    const path = `apps/${appId}/volumes`
    return await this.client.restOrThrow(path)
  }

  async createVolume(payload: CreateVolumeRequest): Promise<VolumeResponse> {
    const { appId, ...body } = payload
    const path = `apps/${appId}/volumes`
    return await this.client.restOrThrow(path, 'POST', body)
  }

  async deleteVolume(payload: DeleteVolumeRequest): Promise<VolumeResponse> {
    const { appId, volumeId } = payload
    const path = `apps/${appId}/volumes/${volumeId}`
    return await this.client.restOrThrow(path, 'DELETE')
  }

  async extendVolume(
    payload: ExtendVolumeRequest
  ): Promise<ExtendVolumeResponse> {
    const { appId, volumeId, ...body } = payload
    const path = `apps/${appId}/volumes/${volumeId}/extend`
    return await this.client.restOrThrow(path, 'PUT', body)
  }
}
