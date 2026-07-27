import {
  check,
} from "@tauri-apps/plugin-updater";

import {
  relaunch,
} from "@tauri-apps/plugin-process";

export async function checkForUpdates():
  Promise<void> {
  try {
    const update =
      await check();

    if (!update) {
      console.log(
        "Application déjà à jour.",
      );

      return;
    }

    const shouldInstall =
      window.confirm(
        `La version ${update.version} est disponible. Installer la mise à jour maintenant ?`,
      );

    if (!shouldInstall) {
      return;
    }

    await update.downloadAndInstall();

    await relaunch();
  } catch (error) {
    console.warn(
      "Vérification des mises à jour impossible :",
      error,
    );
  }
}