# Lean AI Workspace - Roadmap Progressivo

## Fase 0: Inicialização e Fundação DevOps (Concluída)
- [x] Inicialização do repositório Git e branch `main`.
- [x] Criação de `.gitignore` e `LICENSE.md`.
- [x] Configuração de CI/CD para GitHub Pages (`deploy.yml`).
- [x] Instalação de Vite, Svelte, TypeScript e TailwindCSS.
- [x] Configuração de `vite.config.ts` (`base`) e `tailwind.config.js` (tema Cyberpunk).
- [x] Criação da estrutura base (`src/lib/workers/`, `stores/`, `utils/`).
- [x] Esqueleto visual em `src/App.svelte` (Split-Pane com Editor, InfoView e Chat).

**Desafios Técnicos:** A criação automática do projeto Vite via CLI precisou ser ajustada para bypassar prompts interativos (`--yes --no-interactive`), assegurando automação limpa.
**Decisões Arquitetônicas:** Escolhida a Stack Vite+Svelte+Tailwind por sua compilação rápida e leveza do build final. Adotada paleta de cores 'Cyberpunk' para contrastes altos úteis em ambientes de programação contínua. Layout de 3 painéis criado utilizando CSS Flexbox.

---

## Fase 1: Implementação do Editor Base e Layout (A Fazer)
- [ ] Integrar **Monaco Editor** ou **CodeMirror 6** na thread UI principal no Painel Central.
- [ ] Implementar highlight de sintaxe básico.
- [ ] Funcionalidade de redimensionamento dinâmico dos painéis.

---

## Fase 2: Infraestrutura Local-First (IndexedDB) (A Fazer)
- [ ] Módulo nativo de IndexedDB em `src/lib/utils/indexedDB.ts`.
- [ ] Auto-Save do texto do editor.
- [ ] Sistema de "Abas de Arquivos" e árvore de arquivos persistidos localmente.

---

## Fase 3: O Web Worker do Lean 4 WASM (A Fazer)
- [ ] Hospedar `lean.wasm` em um Web Worker (`src/lib/workers/`).
- [ ] Ponte assíncrona (`postMessage`) entre Main Thread e Worker.
- [ ] Integração de diagnósticos (squiggly lines) de volta no editor.

---

## Fase 4: A Interface de InfoView (Tactic State) (A Fazer)
- [ ] Componente de UI para InfoView reativo ao cursor do usuário.
- [ ] Parse do JSON do Worker para exibir hipóteses, tipos e `⊢ Goals`.

---

## Fase 5: Telemetria BYOK (Quotas) e AI Co-Pilot (A Fazer)
- [ ] Modal de configuração BYOK (Bring Your Own Key) para APIs de IA.
- [ ] Svelte Stores de Telemetria salvos no IndexedDB para token counting.
- [ ] Chat Co-Pilot consumindo contexto ativo (código + InfoView).
- [ ] Ações rápidas (ex: Aplicar Sugestão, Explicar Erro).