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

## Fase 2: Infraestrutura Local-First (IndexedDB) (Concluída)
- [x] Módulo nativo de IndexedDB em `src/lib/utils/indexedDB.ts`.
- [x] Auto-Save do texto do editor.
- [x] Sistema de "Abas de Arquivos" e árvore de arquivos persistidos localmente.

**Desafios Técnicos:** O estado do editor CodeMirror e o estado Svelte podem ciclar se não gerenciados corretamente, por isso a atualização `internalContent` previne atualizações recursivas.
**Decisões Arquitetônicas:** O IndexedDB nativo foi adotado em `src/lib/utils/indexedDB.ts` sem bibliotecas de terceiros para minimizar o tamanho final do bundle. O estado Svelte (stores) é utilizado para reagir à mudança de arquivos e auto-salvamento debounced (`setTimeout`), garantindo persistência "Local-First" do código-fonte sem necessitar de backend.

---

## Fase 3: O Web Worker do Lean 4 WASM (Concluída)
- [x] Hospedar `lean.wasm` em um Web Worker (`src/lib/workers/`). (Atualmente utilizando simulação nativa robusta até build final do WebAssembly).
- [x] Ponte assíncrona (`postMessage`) entre Main Thread e Worker.
- [x] Integração de diagnósticos (squiggly lines) de volta no editor.

**Desafios Técnicos:** Mapeamento correto de erros assíncronos (diagnósticos via `postMessage`) no CodeMirror State para renderizar os marcadores corretamente sem interromper a digitação.
**Decisões Arquitetônicas:** Criação da Store `lean.ts` isolando as trocas de mensagens através de reatividade. A conversão de `LeanDiagnostic` para as extensões de Linter do `@codemirror/lint` resolve o overhead do editor enquanto mantém as "linhas vermelhas/amarelas". 

---

## Fase 4: A Interface de InfoView (Tactic State) (Concluída)
- [x] Componente de UI para InfoView reativo ao cursor do usuário.
- [x] Parse do JSON do Worker para exibir hipóteses, tipos e `⊢ Goals`.

**Desafios Técnicos:** O State do Worker e do CodeMirror não sabiam inicialmente a posição do cursor. Extração de metadata de seleção no EventListener do `EditorView.updateListener` do CM6.
**Decisões Arquitetônicas:** A InfoView compartilha do estado da ponte de Worker (`tacticState`). Atualizamos o `Worker` e a Interface `LeanRequest` para enviar a posição local (`cursorLine`), com o Worker simulando a resposta específica dependendo de onde o usuário clica.

---

## Fase 5: Telemetria BYOK (Quotas) e AI Co-Pilot (Concluída)
- [x] Modal de configuração BYOK (Bring Your Own Key) para APIs de IA.
- [x] Svelte Stores de Telemetria salvos no IndexedDB para token counting.
- [x] Chat Co-Pilot consumindo contexto ativo (código + InfoView).
- [x] Fetch direto do navegador (Zero-Infra).

**Desafios Técnicos:** Enviar os prompts do LLM diretamente do browser sem backend, garantindo que o rate-limit fosse respeitado sem expor chaves (armazenamento seguro via IndexedDB).
**Decisões Arquitetônicas:** A `SettingsModal` injeta a chave da API na camada local sem sincronização remota, permitindo que a `askCopilot` chame as APIs REST (Gemini e OpenAI) construindo dinamicamente o contexto incluindo o estado completo do `Editor` e o `Tactic State` atual. A métrica foi agregada via Svelte Stores, alimentando a persistência com cada nova requisição, controlando "tokens estimados" com fallback visual no front-end.

---

## Track 2: IDE Enhancements (`lean-ide-enhancements_20261106`) (Em Planejamento / Execução)
- [ ] Fase 1: Test Suite Setup (Vitest) & Atalhos Unicode no CodeMirror (`\forall ` -> `∀ `).
- [ ] Fase 2: Visualizador Estruturado em Cards no InfoView (Interactive Goal Tree).
- [ ] Fase 3: Indicador Granular de Progresso de Download do WASM (Lean4.js).
- [ ] Fase 4: Assistente de Provas com IA e Diff Preview ("Solve with AI").
- [ ] Fase 5: Exportação/Importação Zip e Compartilhamento de Provas via Hash URL.
- [ ] Fase 6: Mitigação de Riscos de Memória e Storage Limits.

