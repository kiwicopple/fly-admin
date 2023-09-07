# `fly-admin`

A Typescript client for managing Fly infrastructure.

## Install

```bash
npm i --save fly-admin
```

## Usage

```ts
import { createClient } from 'fly-admin'

const fly = createClient('FLY_API_TOKEN')

async function deployApp() {
  const machine = await fly.Machine.createMachine('myAppId', {
    image: 'supabase/postgres',
  })
}
```

## API

**Apps**

- `fly.App.createApp()`
- `fly.App.deleteApp()`

**Machines**

- `fly.Machine.listMachines()`
- `fly.Machine.getMachine()`
- `fly.Machine.createMachine()`
- `fly.Machine.updateMachine()`
- `fly.Machine.startMachine()`
- `fly.Machine.stopMachine()`
- `fly.Machine.deleteMachine()`
- `fly.Machine.restartMachine()`
- `fly.Machine.signalMachine()`
- `fly.Machine.waitMachine()`
- `fly.Machine.cordonMachine()`
- `fly.Machine.uncordonMachine()`
- `fly.Machine.listEvents()`
- `fly.Machine.listVersions()`
- `fly.Machine.listProcesses()`
- `fly.Machine.getLease()`
- `fly.Machine.acquireLease()`

**Networks**

- `fly.Network.allocateIpAddress()`
- `fly.Network.releaseIpAddress()`

**Organizations**

- `fly.Organization.getOrganization()`

**Secrets**

- `fly.Secret.setSecrets()`
- `fly.Secret.unsetSecrets()`

**Volumes**

- `fly.Volume.listVolumes()`
- `fly.Volume.getVolume()`
- `fly.Volume.createVolume()`
- `fly.Volume.deleteVolume()`
- `fly.Volume.extendVolume()`
- `fly.Volume.listSnapshots()`

**TODO**

- [ ] `fly.Machine.execMachine()`
- [ ] `fly.Machine.releaseLease()`
- [ ] `fly.Machine.getMetadata()`
- [ ] `fly.Machine.updateMetadata()`
- [ ] `fly.Machine.deleteMetadata()`

## License

MIT
