# MediKiosk — Smart Triage Kiosk (Jetson + Raspberry Pi)

> ## ⚠ READ THIS FIRST
> **Do NOT run `app.py` — the old Flask prototype has been removed.**
> The current app is the **Next.js kiosk + FastAPI AI server** in
> [`Project/Hackathon-Project/`](Project/Hackathon-Project/).
> If your version asks almost no questions and shows two consent pages,
> you are running the old prototype — pull the latest `main`.

## What this is

A self-service triage kiosk: the patient answers intake questions on a
touchscreen, vitals are measured (sensors + a home BP monitor read by camera),
a 5-second video clip is analyzed by AI on the Jetson (BP display OCR, rPPG
vitals, distress), and the system produces an **ESI triage level** and an
**HL7 v2.5 file** for the hospital.

| Device | Role |
|---|---|
| **Jetson** (or any PC) | Hosts the kiosk website (port **3000**), runs the AI server (port **8000**), stores HL7 output |
| **Raspberry Pi 4B** | Touchscreen (browser pointed at the Jetson) + sensors + camera agent |

## How to run — Jetson / PC (the server machine)

```bash
# 1. AI server deps
pip install fastapi uvicorn python-multipart httpx numpy scipy opencv-python scikit-learn

# 2. Train the ESI model (once)
ESI_MODEL_PATH=./esi_model.pkl python3 "Project/Hackathon-Project/AI-parts/train_esi.py"

# 3. Optional but recommended — local LLM for clinical reasoning
curl -fsSL https://ollama.com/install.sh | sh && ollama pull llama3.2:3b

# 4. Start the AI server (port 8000)
cd "Project/Hackathon-Project"
ESI_MODEL_PATH=./esi_model.pkl python3 jetson_ai_server.py --host 0.0.0.0

# 5. Start the kiosk website (port 3000) — separate terminal
cd "Project/Hackathon-Project/kiosk-src"
npm install        # first time only
npx next dev -H 0.0.0.0 -p 3000
```

On Windows (PowerShell): set env vars with `$env:ESI_MODEL_PATH = "..."` etc.

**Jetson's own screen:** open `http://localhost:3000/monitor` — live AI
dashboard (received clip playback, pipeline feed, ESI summary).

## How to run — Raspberry Pi 4B

```bash
pip install requests picamera2 opencv-python      # + sensor libs, see pi_sensor.py header
python3 "Project/Hackathon-Project/pi_sensor.py" \
    --server http://<JETSON-IP>:3000 --real-sensors --real-camera
```

Kiosk display (browser on the Pi's touchscreen):
```bash
chromium-browser --kiosk \
  --unsafely-treat-insecure-origin-as-secure=http://<JETSON-IP>:3000 \
  --user-data-dir=/tmp/kiosk-profile \
  http://<JETSON-IP>:3000
```
(The `--unsafely-treat-...` flag is only needed if the kiosk device's own
camera should record the 5-second clip; the Pi camera path works without it.)

## Ports

| Port | What | Who connects |
|---|---|---|
| 3000 | Kiosk website (Next.js) | Pi browser, patient UI, Pi agent vitals POST |
| 8000 | AI server (FastAPI) | Pi agent clip upload, monitor dashboard, HL7 download |

Open both in the firewall on the server machine.

## Where results go

- HL7 files: `HL7_DIR` (default `/opt/medikiosk/hl7`), also listable at
  `http://<JETSON-IP>:8000/hl7`
- Video clips: `VIDEO_TEMP_DIR` (default `/tmp/medikiosk_video`), auto-purged
  after ~30 min

## More

- **[Project/Hackathon-Project/TESTING_NOTES.md](Project/Hackathon-Project/TESTING_NOTES.md)**
  — full improvement log, hardware test checklist, architecture decisions
- `AI_python/`, `LLM_olama/`, root `pi_server.py` / `train_esi.py` — legacy /
  reference material, not part of the running system
