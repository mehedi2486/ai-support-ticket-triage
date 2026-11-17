# Render free demo deployment

The app serves its React build and Express API from one service. MongoDB remains the external database. Use fictional reports only: this is a public portfolio demo without user accounts or private-ticket authorization.

**Live demo:** [triage-desk-mehedi.onrender.com](https://triage-desk-mehedi.onrender.com/). Verified 17 November 2026 on Render Free in Singapore, deployed source commit `8b55a967d1c86bccc645339a8d7d8543ac66d46c`. Automatic deployments are off.

Live checks passed: HTTPS frontend, logo and database health returned200; the public browser created a fictional ticket through Gemini/MongoDB and showed its saved analysis; an independent HTTP lookup returned200 with that stored ticket. Environment-file access returned404 and a malformed ticket ID returned400. One real model request was used for this live check. Credentials remained in Render's environment settings, outside Git and client assets. No database network rule change or paid resource was needed. Browser control became unavailable before the final screenshot, so no new deployment screenshot is provided.

## Service configuration

[render.yaml](../render.yaml) defines one Node web service on the Free instance plan in Singapore. It does not create a paid database, disk, custom domain or other resource.

| Setting | Value |
| --- | --- |
| Branch | main |
| Build command | `npm ci --include=dev --ignore-scripts && npm run build` |
| Start command | `npm start` |
| Health check | `/health` |
| Node version | `22` |
| Node environment | `production` |
| Host | `0.0.0.0` |
| Daily demo budget | `25` |
| Automatic deployments | Off; deploy reviewed updates manually |

The build explicitly includes development dependencies because Vite and Tailwind are needed to generate the browser assets. The server uses Render's supplied `PORT`. A local `.env` file is not needed on Render.

## Secrets and database access

Set `GEMINI_API_KEY` and `MONGODB_URI` in the service's Render environment settings. The Blueprint uses `sync: false` so their values are entered privately during initial setup. Do not put secrets in render.yaml, Git, frontend variables, screenshots or deployment notes. Keep the existing model setting unless a separately checked model change is needed.

For an IP-restricted MongoDB Atlas deployment, open the Render service's **Connect → Outbound** tab and add its published outbound CIDR ranges to Atlas Network Access. These ranges are shared with other Render services, so database authentication still matters. Use a database user limited to this demo's database. Do not replace a restricted allowlist with unrestricted internet access just to make the deployment succeed.

No new database is provisioned by the Blueprint. The existing `triage_lab` database stores the fictional tickets and daily usage counter.

## Usage and data limits

- At most 25 Gemini creation attempts per UTC day across this demo. The counter is stored in MongoDB so a service restart or idle spin-down does not reset it.
- An attempt is reserved before calling Gemini. Failed model requests still count because an accepted upstream request may consume quota. The budget is not rolled back after a failure.
- The existing limit of ten valid creation attempts per minute remains scoped to a single server process. It resets on restart and does not replace the persistent daily budget.
- GET ticket lookup reads MongoDB without using the model budget. Gemini's own rate limits and account quota can reject a request before the app reaches its daily cap.
- This cap covers calls made by this app, not other applications using the same API key. It is not a guarantee about provider billing.
- There is no ticket-list or deletion endpoint. Keep personal/customer information out of every report. Database records remain until the database owner removes them.

## Deploy and verify

1. Connect the repository to Render and create the service from the Blueprint, or enter the matching settings manually. Keep the instance plan **Free** and automatic deployments off. The proposed name is `triage-desk-mehedi`; Render may require a different available name.
2. Enter secrets in Render and configure the database allowlist for the service's outbound ranges.
3. Deploy the reviewed commit. Check build/start logs without copying credential values into notes.
4. Confirm the public HTTPS URL serves the app and its logo/assets. Check `GET /health` and verify it does not call Gemini.
5. Create one clearly fictional ticket, copy its ID and retrieve it. Confirm the browser shows the saved result and safe errors. This live create consumes one daily attempt and provider quota.
6. Verify the deployed commit and actual URL before adding the link to a resume or social post. The proposed service name is not proof that a URL is live.

Render's Free service sleeps after 15 idle minutes and usually takes about one minute to restart for the next visitor. Files on its local disk are ephemeral, so tickets and the daily counter must stay in MongoDB. Free instance hours, bandwidth and build limits apply. Do not select paid upgrades or add-ons as part of this free-demo setup.

## Official references

Checked 17 November 2026:

- [Blueprint fields](https://render.com/docs/blueprint-spec): free plan, Node runtime, region, health check, secret prompts and `autoDeployTrigger: off`.
- [Node version selection](https://render.com/docs/node-version): version ranges and aliases; `22` stays within major version 22.
- [Web service networking](https://render.com/docs/web-services): public listener on `0.0.0.0` and the supplied `PORT`.
- [Outbound IP ranges](https://render.com/docs/outbound-ip-addresses): service-specific dashboard location and region-shared ranges.
- [Free plan limits](https://render.com/docs/free): idle sleep, restart delay, ephemeral storage and monthly allowances.
