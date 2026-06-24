# Memoria: lancio live di Aethermoor

Questa nota serve a non perdere la procedura che ha funzionato per aprire il gioco
in una sessione visibile all'utente.

## Procedura che ha funzionato

Il lancio riuscito non usava WebView/controller/headless. Era il percorso semplice:

1. Avviare un server HTTP locale dalla root del repo.
2. Aprire il browser di sistema con un URL cache-busted.
3. Verificare che `tiles.png` venga servito correttamente.

PowerShell dalla root `C:\Git\Claude-Env`:

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

Verifica texture:

```powershell
$r = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:8877/assets/textures/tiles.png?v=generated-32px-tiles"
Write-Output "status=$($r.StatusCode) bytes=$($r.RawContentLength) contentType=$($r.Headers['Content-type'])"
```

Risultato atteso:

```text
status=200 bytes=57184 contentType=image/png
```

## Cosa ricordare

- Se si vede di nuovo la griglia rotta/checkerboard, prima fare hard refresh o riaprire con `?fresh=<timestamp>`.
- Il bug grafico era legato al campionamento dell'atlas tile/cache; la fix è in:
  - `js/world/TileMap.js`
  - `js/scenes/PreloadScene.js`
- Per una richiesta "lancialo tu", usare questa procedura semplice prima di provare controller più complessi.
- Non confondere questa procedura con i tentativi WebView/headless: WebView2 può bloccarsi con errori di risorsa in uso.

## Modalità richiesta dall'utente per giocare

Quando l'utente chiede di completare il gioco:

- giocare live, osservando e decidendo passo per passo;
- non creare un percorso automatico/pre-scriptato;
- non usare teleport o manipolazione diretta dello stato per "completare";
- usare API solo come input/telecomando verso il gioco reale, se serve;
- a fine gioco preparare una valutazione con:
  - cose positive;
  - cose negative;
  - cose da migliorare;
  - bug trovati.
