# AI / coding-agent instructions

This app uses the shared Apps Version Lab. Read and obey https://nirav2000.github.io/Apps/version-lab/AI_AGENT_CONTRACT.md. Do not implement or maintain local versioning, snapshots or Version Lab UI.

## Shared PWA adoption (mandatory)

- Read the canonical [Apps PWA v1 installation contract](https://github.com/nirav2000/Apps/blob/main/pwa/v1/INSTALLATION.md) before changing Home Screen install behaviour.
- Do **not** implement app-local installation/update policy or add a second overlapping service worker.
- InClass identity/configuration is `pwa.config.json`, and its shared SVG icon source is generated with `Apps/pwa/v1/icon-factory.mjs`.
- Use the existing `.github/workflows/pwa-assets.yml` to generate Apple 180, PWA 192/512, maskable 512, favicon and manifest. Run `tests/pwa-assets.test.mjs` and existing lesson tests before accepting generated changes.
- Preserve earlier homework and all learning data; shared PWA adoption must not modify lesson content.
- App Monitor's PWA audit is a public-file check, **not** proof of iPhone/iPad Home Screen installation. Record physical-device testing separately.
