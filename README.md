# Sorr Gallery / 소르 갤러리

Marinara Home browser-tab package, version **1.1.1**. Captured from the installed server on 2026-11-02 (Asia/Seoul).

This repository preserves the currently installed code and UI icons. It is not a `marinara.personal-extension` package and cannot be installed as-is through the GitHub personal-extension manager.

## Read first

- `AGENTS.md`: maintenance rules.
- `manifest.json`: original capability-package manifest, engine compatibility and file checksums.
- `client.js`: deployed gallery source, with embedded styles.
- `verification.json`: package identity, checksum and publication checks.

## Features

- Home gallery tab with synced favorites.
- Filters by chat, character, persona and library.
- Thumbnail loading, incremental display, sorting and photo enlargement.
- Responsive PC/mobile layout and a portrait menu icon.
- Reads existing gallery APIs; this package has no image-generation, deletion or move actions.

## Files and dependencies

`manifest.json`, `client.js`, `icon.png` and `sorr-portrait.png` are copied byte-for-byte from the installed 1.1.1 package. The PNG files are UI assets, not exports of the user's gallery photos.

The client uses a separate installed personal extension named **Gallery Favorites Storage** through its same-origin storage API. `STORAGE_ID` in `client.js` identifies the owner's existing storage extension. This is an installation-specific dependency, not a portable fresh-install default. A new installation needs its own storage extension and an adjusted ID; update manifest checksums if code changes.

No gallery photos, favorite values, chat contents, credentials, server configuration or package registry are included. The companion storage extension's code-only template is in `companion-storage/`; its saved values are intentionally excluded.

## Compatibility and updates

The manifest declares Marinara `>=2.5.0 <2.6.0`. Recheck compatibility against the actual server before upgrades. Keep package ID `home-gallery`, preserve favorites and review the existing storage link before changing anything.

This GitHub upload does not modify or restart the running server. Future live updates require user approval, a rollback and PC/mobile validation. Do not install a second gallery on top of the current one merely to connect this repository to another manager.

## Verification limits

This upload verifies file integrity, JavaScript syntax, manifest references and a targeted secret scan. Historical browser checks are not rerun by publishing these files. It does not certify a fresh installation on a different server.
