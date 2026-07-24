export type NativeDeviceIdentity = {
  computerName: string;
  domain: string | null;
  lastWindowsUser: string | null;
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
};