# Aethermoor live play notes

## Resume point

Claude's last live play session was saved in browser `localStorage`. The run was around Act 2, after Cael's murder, during the investigation phase.

To resume later:

1. From `C:\Git\Claude-Env`, serve the repo with a local HTTP server.
2. Open the game in a visible browser window with a cache-busted URL.
3. Use the main menu's load option, or open the browser console and inspect with `GameAPI.state()` after load.

Useful PowerShell:

```powershell
$port = 8877
$existing = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if (-not $existing) {
    Start-Process -FilePath python -ArgumentList @('-m','http.server',"$port",'--bind','127.0.0.1') -WorkingDirectory (Get-Location) -WindowStyle Hidden
    Start-Sleep -Seconds 1
}
$url = "http://127.0.0.1:$port/index.html?fresh=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
Start-Process $url
Write-Output $url
```

If the browser/game is going to stay in the background while testing, Edge/Chrome flags that help are:

```text
--disable-background-timer-throttling
--disable-renderer-backgrounding
--disable-backgrounding-occluded-windows
```

The game config also sets `disableVisibilityChange: true`, so Phaser should no longer pause itself when the tab/window is hidden.

## Live-play rule from the user

When asked to complete the game, play it live and decide step by step:

- move through the visible world;
- talk, fight, explore, and inspect as a player would;
- avoid pre-scripted completion runs;
- use `GameAPI` only as a controller/inspection aid for the live game, not to skip the story by mutating state.

At the end of the playthrough, report:

- positive things;
- negative things;
- things to improve;
- bugs found.

## Bugs from Claude's run now tracked/fixed in this commit

- Character creation/main menu hover crash: `setFillColor` replaced with `setFillStyle`.
- `newGame()` false negative: waits for the Game scene instead of using a fixed short delay.
- Overlay close leaving Game paused: API, map, inventory, dialogue, story, crafting, and ending paths now resume defensively where relevant.
- `resonance_sample` stacking: quest samples are stackable up to 99.
- Void Anchors in `GameAPI.nearby().enemies`: filtered out of nearby enemies; they remain discoverable as story sites.
- Concordat merchant empty dialogue: added the missing `concordat_merchant` dialogue tree.
- Dialogue `open_shop` effect: accepts `npcId` as well as `shopId`.
- Mojibake check: no corrupted replacement characters were found in JS source; `index.html` now declares UTF-8 on the module script as an extra guard.
