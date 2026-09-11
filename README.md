# LILCO STEM Augmented Reality Studio

[LILCO](https://lilco.eu) is a streaming platform and repository for STEM Education resources. This application provides an interactive, browser-based WebAR experience for middle school, high school, and university level STEM educational materials, classified according to the French National Education framework and the European Commission for Education standards.

---

## 🌟 About LILCO

LilCo is like a streaming service for your STEM Education resources. On our platform, students and educators find three core categories of educational assets:
1. **Low-Graphics Interactive Media & Games**: Level-based interactive media catering to subject material for STEM.
2. **Webtoons & Historical Concepts**: Theoretical concepts and historical accounts that make science interesting and accessible.
3. **Interactive Media, Films & Series**: Stories and series on STEM that can be used based on their relevance to physics, chemistry, mathematics, and biology.

### Leadership Team
- **Mayukh Chakraborty** — Founder & Chief Executive Officer (`mayukh2094@gmail.com`)
- **Valera Evgeniya Gerasimova** — Founder & Chief Pedagogy Officer
- **Contact Phone**: (+33) 749 706 796
- **Website**: [https://lilco.eu](https://lilco.eu)

---

## 🎨 Theme & Brand System

This application adopts the official **LilCo Signature Orange and Crisp White/Dark UI Palette**:
- **Primary Brand Accent**: `rgb(249, 115, 22)` (`#f97316` / LilCo Vibrant Orange)
- **Secondary Orange Highlights**: `#fb923c` & `#fdba74`
- **Surface & Background**: Dark Navy / Slate Glassmorphism (`#090d16`, `#111827`, `#131c2e`)
- **Typography**: `Outfit`, `Space Grotesk`, `DM Mono` via Google Fonts

---

## 🚀 Key Features

- **STEM WebAR Target Scanner**: Real-time camera-based image tracking powered by MindAR and Three.js.
- **Curriculum-Aligned STEM Modules**: Pre-configured interactive targets for Chemical Bonding, Wave Particle Duality, General Relativity, Photoelectric Effect, Maxwell's Demon, Laplace's Demon, Konigsberg Bridge, Double Pendulum, and Conservation of Momentum.
- **Interactive 2D Video & 3D GLTF Model Overlays**: Toggle seamlessly between educational video playback and real-time interactive 3D WebGL diagrams (e.g. molecular structures).
- **Cross-Platform Native Shell**: Capacitor 7 Android and iOS native integration ready.

---

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite 5
- **Routing**: React Router DOM (v7 transition flags)
- **Augmented Reality Engine**: MindAR (Image Tracking) + Three.js + CSS3DRenderer
- **3D Model Loader**: Three.js GLTFLoader
- **Native Mobile Wrapper**: Capacitor 7 (Android / iOS)

---

## 📁 Routes

| Route | Description |
| --- | --- |
| `/` | **LilCo STEM AR Studio Homepage**: Catalog of trackable STEM target modules, company vision, offerings, team details, and quick launcher. |
| `/ar` | **WebAR Scanner**: Live camera target tracker for default LilCo STEM modules. |
| `/ar/:id` | **Custom WebAR Scanner**: Plays a backend-driven custom experience. |

---

## 💻 Local Development

### Prerequisites
- Node.js 18+ and `npm`
- Modern web browser with WebRTC / Camera permissions (`localhost` or HTTPS required)

### Steps

1. **Clone & Install**:
   ```bash
   git clone <repository-url>
   cd lilco-ar
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   npm run preview
   ```

### Testing on a Real Device (Cloudflare Tunnel)

Camera access for the AR scanner requires HTTPS or `localhost`, so a phone on the same network can't just hit `http://<lan-ip>:5173`. Use a Cloudflare Tunnel to get a temporary public HTTPS URL for the dev server:

1. Start the dev server: `npm run dev`
2. In a second terminal, start the tunnel: `npm run tunnel`
3. Open the printed `https://*.trycloudflare.com` URL on your phone.

This requires `cloudflared` installed globally (`cloudflared --version` to check). No Cloudflare account is needed for this quick/ephemeral tunnel.

---

## 📱 Mobile APK / Native Build (Capacitor)

1. **Build Web Assets**:
   ```bash
   npm run build
   ```

2. **Sync with Capacitor**:
   ```bash
   npx cap copy
   npx cap sync
   ```

3. **Open Android Studio / Run**:
   ```bash
   npx cap open android
   # OR
   npx cap run android
   ```

## AR initialization contract

The default scanner uses `public/demo-experience.mind`, precompiled with MindAR 1.1.5 from the ordered postcard images at a maximum dimension of 1024 pixels. This keeps target compilation off the startup path without changing detector inputs or settings.

- Run `npm run build:check` before release. It rejects stale or reordered target inputs, a mismatched `.mind` artifact, missing offline scanner assets, and an initial JavaScript bundle above 80 KiB gzip.
- When a postcard image or its order changes, regenerate the `.mind` file with MindAR 1.1.5 and update `scripts/demo-target-manifest.json` plus `targetSetVersion` together.
- Source postcard PNGs remain in `public` for local development and regeneration, but the production build excludes them because the scanner consumes the compiled target artifact.
- The build also excludes the currently unreferenced `photoelectric2.glb` and `Schrodinger's Cat.png`; they remain in the repository until their ownership is resolved.
- Custom experience configs should provide `mindTargetUrl`, `targetAspectRatio`, and `targetSetVersion`. Legacy `mindDataUrl` and runtime `targetImageUrl` compilation remain supported.
- Video players are created only after their target is detected. GLBs remain bundled for offline use but are parsed only after the user selects the 3D mode.

---

## 📄 License & Attribution

© Copyright 2024–2026 **LILCO**. All rights reserved.
Official Web Platform: [https://lilco.eu](https://lilco.eu)
