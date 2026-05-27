# Network Status Worker Setup

This Worker proxies IP/ISP and Radar data so API keys are never exposed in your Tistory skin.

## 1) Create Worker

- Create a Cloudflare Worker and paste code from `worker/cloudflare-network-status-worker.js`.
- Deploy it.

## 2) Set Worker secrets

- `IPINFO_TOKEN`: from ipinfo account.
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with Radar API access.

## 3) Update skin URL

In `skin.html`, set:

`const networkWorkerUrl = "https://YOUR-WORKER.workers.dev/api/network-status"`

to your real Worker URL.

## 4) Behavior

- Widget appears only on `/` (main page).
- Shows IP, ISP, and Radar traffic status text.

## 5) Notes

- If Radar endpoint response format changes, adjust `getRadarStatus` in the Worker.
- If token is missing, widget still renders with fallback messages.
