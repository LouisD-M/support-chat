export type NativeDeviceIdentity = {
  computerName: string;
  domain: string | null;
  lastWindowsUser: string | null;

  osName: string | null;
  osVersion: string | null;
  ipAddress: string | null;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
};

export type DeviceIdentity = NativeDeviceIdentity & {
  installationId: string;
};

export type Device = {
  id: string;
  installationId: string;
  computerName: string;
  domain: string | null;
  lastWindowsUser: string | null;

  osName: string | null;
  osVersion: string | null;
  ipAddress: string | null;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
};