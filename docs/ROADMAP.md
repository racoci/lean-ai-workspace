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

## Fase 1: Implementação do Editor Base e Layout (Concluída)
- [x] Integrar **CodeMirror 6** (substituindo Monaco por leveza Zero-Infra) na thread UI principal no Painel Central.
- [x] Implementar highlight de sintaxe básico (StreamLanguage para Lean).
- [x] Funcionalidade de redimensionamento dinâmico dos painéis (Split-Pane handle).

**Desafios Técnicos:** Monaco é pesado e muitas vezes traz dependências de infra/assets extras. CodeMirror 6 foi escolhido por ser perfeitamente modular e fácil de integrar no ecosistema Vite/Svelte para 100% Client-Side.
**Decisões Arquitetônicas:** Criado um analisador simples de tokens (keywords, comments) usando `@codemirror/language` `StreamLanguage` para dar feedback visual instantâneo aos comandos do Lean 4. Adicionados listeners globais de mouse para redimensionamento suave e performático via variáveis Svelte reativas interpoladas no style `width`.

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