import Client from '../client'
import { CreateVolumeRequest as ApiCreateVolumeRequest } from './types'

export type ListVolumesRequest = string

// Ref: https://github.com/superfly/flyctl/blob/master/api/volume_types.go#L23
export interface CreateVolumeRequest extends ApiCreateVolumeRequest {
  app_name: string
  name: string
  region: string
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

export interface GetVolumeRequest {
  app_name: string
  volume_id: string
}

export type DeleteVolumeRequest = GetVolumeRequest

export interface ExtendVolumeRequest extends GetVolumeRequest {
  size_gb: number
}

export interface ExtendVolumeResponse {
  needs_restart: boolean
  volume: VolumeResponse
}

export type ListSnapshotsRequest = GetVolumeRequest

export interface SnapshotResponse {
  id: string
  created_at: string
  digest: string
  size: number
}

export class Volume {
  private client: Client

  constructor(client: Client) {
    this.client = client
  }

  async listVolumes(app_name: ListVolumesRequest): Promise<VolumeResponse[]> {
    const path = `apps/${app_name}/volumes`
    return await this.client.restOrThrow(path)
  }

  async getVolume(payload: GetVolumeRequest): Promise<VolumeResponse> {
    const { app_name, volume_id } = payload
    const path = `apps/${app_name}/volumes/${volume_id}`
    return await this.client.restOrThrow(path)
  }

  async createVolume(payload: CreateVolumeRequest): Promise<VolumeResponse> {
    const { app_name, ...body } = payload
    const path = `apps/${app_name}/volumes`
    return await this.client.restOrThrow(path, 'POST', body)
  }

  async deleteVolume(payload: DeleteVolumeRequest): Promise<VolumeResponse> {
    const { app_name, volume_id } = payload
    const path = `apps/${app_name}/volumes/${volume_id}`
    return await this.client.restOrThrow(path, 'DELETE')
  }

  async extendVolume(
    payload: ExtendVolumeRequest
  ): Promise<ExtendVolumeResponse> {
    const { app_name, volume_id, ...body } = payload
    const path = `apps/${app_name}/volumes/${volume_id}/extend`
    return await this.client.restOrThrow(path, 'PUT', body)
  }

  async listSnapshots(
    payload: ListSnapshotsRequest
  ): Promise<SnapshotResponse> {
    const { app_name, volume_id } = payload
    const path = `apps/${app_name}/volumes/${volume_id}/snapshots`
    return await this.client.restOrThrow(path)
  }
}
