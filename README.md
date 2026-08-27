# Lean AI Workspace 🚀

A Zero-Infra, 100% Client-Side Single Page Application (SPA) designed as a modern Scientific IDE for formal theorem verification using Lean 4. Built with Vite, Svelte, TypeScript, and TailwindCSS, this workspace brings the power of AI assistance directly to your browser without the need for external backends.

![Lean AI Workspace Dashboard](https://raw.githubusercontent.com/lucasracoci/lean-ai-workspace/main/public/favicon.svg)

## Overview 🛠️

The Lean AI Workspace bridges the gap between formal mathematical verification and artificial intelligence, offering:

- **Local-First Architecture:** Powered by `IndexedDB`, your files, telemetry, and API settings never leave your machine.
- **Lean 4 Web Worker (Simulated/Ready):** Designed to handle heavy Lean compilation entirely client-side via WebAssembly isolation.
- **Reactive Tactic State:** Context-aware `InfoView` dynamically updates hypotheses and goals based on your cursor position in the editor.
- **BYOK AI Co-Pilot:** "Bring Your Own Key" support for Google Gemini and OpenAI. Contextualized chat uses your active code and tactic state to provide surgical suggestions directly in the interface.

## Tech Stack 💻

- **Framework:** Svelte + TypeScript
- **Bundler:** Vite
- **Styling:** TailwindCSS (Cyberpunk Theme)
- **Editor:** CodeMirror 6
- **Storage:** Native IndexedDB
- **CI/CD:** GitHub Actions (Deploy to GitHub Pages)

## Progressive Roadmap

See the detailed implementation timeline and architectural decisions in [docs/ROADMAP.md](./docs/ROADMAP.md).

- **Phase 0:** DevOps, CI/CD, and Layout initialization (Done).
- **Phase 1:** CodeMirror 6 integration with split-pane workspace (Done).
- **Phase 2:** Local-first infrastructure with IndexedDB file tabs (Done).
- **Phase 3:** Lean 4 WASM Web Worker message bridge (Done).
- **Phase 4:** Tactic State (InfoView) UI (Done).
- **Phase 5:** AI Co-Pilot with BYOK Telemetry (Done).

## Getting Started 🏃‍♂️

### Prerequisites
- Node.js >= 20.x

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/lucasracoci/lean-ai-workspace.git
   cd lean-ai-workspace
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Usage 💡

1. Open the application in your browser.
2. You will be greeted with a sample `Main.lean` file in the central editor.
3. Use the `+` button in the tabs bar to create new Lean files.
4. Click on **⚙️ Settings** in the AI Co-Pilot panel to add your Google Gemini or OpenAI API key.
5. Ask the Co-Pilot questions; it automatically reads your current file content and tactic state to provide accurate theorem-proving assistance.

## License 📜

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
