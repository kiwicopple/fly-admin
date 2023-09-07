import Client from '../client'

export type ListAppRequest = string

export interface ListAppResponse {
  total_apps: number
  apps: {
    name: string
    machine_count: number
    network: string
  }[]
}

export type GetAppRequest = string

export enum AppStatus {
  deployed = 'deployed',
  pending = 'pending',
  suspended = 'suspended',
}

export interface AppResponse {
  name: string
  status: AppStatus
  organization: {
    name: string
    slug: string
  }
}

export interface CreateAppRequest {
  org_slug: string
  app_name: string
  network?: string
}

export type DeleteAppRequest = string

export class App {
  private client: Client

  constructor(client: Client) {
    this.client = client
  }

  async listApps(org_slug: ListAppRequest): Promise<ListAppResponse> {
    const path = `apps?org_slug=${org_slug}`
    return await this.client.restOrThrow(path)
  }

  async getApp(app_name: GetAppRequest): Promise<AppResponse> {
    const path = `apps/${app_name}`
    return await this.client.restOrThrow(path)
  }

  async createApp(payload: CreateAppRequest): Promise<void> {
    const path = 'apps'
    return await this.client.restOrThrow(path, 'POST', payload)
  }

  async deleteApp(app_name: DeleteAppRequest): Promise<void> {
    const path = `apps/${app_name}`
    return await this.client.restOrThrow(path, 'DELETE')
  }
}
