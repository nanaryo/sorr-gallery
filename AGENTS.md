# Maintenance instructions

- Read README.md and manifest.json first. This is a Marinara capability/Home-tab package, not a personal extension.
- The root package is a byte-for-byte snapshot of the installed 1.1.1 files; preserve the original snapshot and Git history.
- Inspect the live server before claims about current installation state.
- Read-only inspection is authorized. Obtain user approval before live changes and prepare rollback. Existing scope approval remains valid.
- Do not deploy merely because changes were pushed to GitHub.
- Preserve package ID `home-gallery` and the existing favorites storage. Never migrate or replace favorite values implicitly.
- `client.js` contains a deployment-specific `STORAGE_ID`. The companion extension must exist and remain enabled. Its settings are private and excluded.
- Preserve both icons. Do not replace the portrait or alter the original package files as part of an upload.
- Changes to package files require updating their byte sizes and SHA-256 values in manifest.json and bumping the package version appropriately.
- Verify both PC and mobile for UI changes, including filters, favorites, enlargement, navigation, refresh and cleanup.
- Do not publish credentials, chat/gallery contents, favorite values, personal server configuration or runtime logs.
- Keep agent-facing documentation in English and user-facing Korean strings intact.
- Do not claim fresh-install or live-browser validation from syntax and checksum checks.
