import type {
  DeviceIdentity,
  NativeDeviceIdentity,
} from "@/types/device";

import {
  getInstallationId,
  storeInstallationId,
} from "./storage";

export async function getDeviceIdentity():
  Promise<DeviceIdentity> {
  const searchParams =
    new URLSearchParams(
      window.location.search,
    );

  const launcherInstallationId =
    searchParams.get(
      "installationId",
    );

  const installationId =
    launcherInstallationId ??
    getInstallationId();

  if (
    launcherInstallationId
  ) {
    storeInstallationId(
      launcherInstallationId,
    );
  }

  try {
    const { invoke } =
      await import(
        "@tauri-apps/api/core"
      );

    const identity =
      await invoke<NativeDeviceIdentity>(
        "get_device_identity",
      );

    return {
      installationId,
      computerName:
        identity.computerName,
      domain:
        identity.domain,
      lastWindowsUser:
        identity.lastWindowsUser,
    };
  } catch {
    return {
      installationId,

      computerName:
        searchParams.get(
          "computerName",
        ) ??
        "NAVIGATEUR-WEB",

      domain:
        searchParams.get(
          "domain",
        ) || null,

      lastWindowsUser:
        searchParams.get(
          "lastWindowsUser",
        ) ??
        "Utilisateur web",
    };
  }
}