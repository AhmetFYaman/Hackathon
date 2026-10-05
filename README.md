# MediKiosk

A small-team project from the UA Little Rock AI Hackathon & HealthTech Startup event. Our idea was a kiosk that could collect some basic information before a patient sees hospital staff, with the hope of helping with long emergency-room waits.

I took on the programming side, using AI help to build the web app while another teammate worked on hardware. We had three days to prepare. We got the interface together, but the presentation had bugs and we did not finish the full system.

## What we worked on

The web app takes a user through consent, intake questions, a pain scale, and a short camera recording. We wanted to connect temperature and blood-pressure devices through a Raspberry Pi and explore whether video could help identify signs of distress.

The repository also contains experimental sensor, video-processing, and triage code. Having that code here does not mean the hardware setup worked end to end or that the results are medically reliable.

**This is an unfinished student prototype, not a medical device. It has not been clinically validated. Do not use it to diagnose, prioritize, or treat patients, and do not enter real patient information.**

## Where to start

- [Kiosk web app](Project/Hackathon-Project/kiosk-src): the Next.js interface.
- [Python server](Project/Hackathon-Project/jetson_ai_server.py): experimental processing and output.
- [Pi agent](Project/Hackathon-Project/pi_sensor.py): sensor and camera connections, with mock modes.
- [Testing notes](Project/Hackathon-Project/TESTING_NOTES.md): hardware checks and development notes. These are notes, not proof that every feature was tested successfully.

The active Next.js/Python version is in `Project/Hackathon-Project/`. Root-level scripts and the `LLM_olama/` folders are older or third-party reference material. The bundled Ollama code is not our own work; its original documentation and license are kept with it.

## Open the interface locally

With Node.js and npm installed, run these commands from the repository root:

```sh
cd Project/Hackathon-Project/kiosk-src
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). This starts the interface, not the whole system. Processing needs the Python server, and sensor readings may be simulated when hardware is unavailable.

For a local backend, copy `.env.local.example` to `.env.local` in `kiosk-src` and set `JETSON_AI_URL=http://localhost:8000`. Restart the web app after changing it.

<details>
<summary>Experimental backend and hardware setup</summary>

Use a Python virtual environment and a local test machine. From the repository root:

```sh
python -m pip install fastapi uvicorn python-multipart httpx numpy scipy opencv-python scikit-learn
cd Project/Hackathon-Project
```

Before training, set `ESI_MODEL_PATH` to `./esi_model.pkl` in your shell. In PowerShell, use `$env:ESI_MODEL_PATH = "./esi_model.pkl"`; in Bash, use `export ESI_MODEL_PATH=./esi_model.pkl`. Then run:

```sh
python AI-parts/train_esi.py
python jetson_ai_server.py --host 127.0.0.1 --model-path ./esi_model.pkl --hl7-dir ./hl7
```

The included training script uses synthetic examples. Its output is for experimentation, not clinical triage. The server also has an optional Ollama integration; see the source and testing notes for its settings.

Keep the web app running in another terminal. Its `/monitor` page shows the processing view. To try the Pi agent without real devices, install `requests` and run from the repo root:

```sh
python Project/Hackathon-Project/pi_sensor.py --server http://localhost:3000
```

Real hardware needs additional libraries, wiring, and the `--real-sensors` / `--real-camera` flags described in the Pi agent's header. Some failures fall back to mock data, so check the logs before treating a value as a measurement.

The web app uses port 3000 and the Python server uses 8000. A separate Pi needs the server's LAN address, not `localhost`; camera access in a browser also needs an appropriate secure context. Keep experiments on a trusted local network, not the public internet. The backend can write video and HL7 files; use dummy data and remove test recordings when finished.

</details>

## Current state

The interface is the clearest part of the project. Hardware integration, presentation bugs, and reliable testing still need work. I am keeping the project here to show what we attempted and the programming work behind the demo, not as a finished hospital system.
