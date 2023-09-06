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
  attached_machine_id?: string
  attached_alloc_id?: string
  created_at: string
  host_dedication_id: string
}

export interface DeleteVolumeRequest {
  appId: string
  volumeId: string
}

export class Volume {
  private client: Client

  constructor(client: Client) {
    this.client = client
  }

  async listVolumes(appId: ListVolumesRequest): Promise<VolumeResponse[]> {
    return await this.client.restOrThrow({ appId, volumeId: '' })
  }

  async createVolume(payload: CreateVolumeRequest): Promise<VolumeResponse> {
    const { appId, ...body } = payload
    return await this.client.restOrThrow({ appId, volumeId: '' }, 'POST', body)
  }

  async deleteVolume(payload: DeleteVolumeRequest): Promise<VolumeResponse> {
    return await this.client.restOrThrow(payload, 'DELETE')
  }
}
