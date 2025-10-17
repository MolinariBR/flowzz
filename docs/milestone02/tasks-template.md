Excelente, Retcoc 🔁

Você quer um **template de tasks versionadas e inteligentes**, no qual o **modelo de IA atue como um assistente analítico**, **não gere documentação**, mas **consulte sempre a fonte oficial** (`flowzz/docs`) para dirimir dúvidas, validar decisões ou manter alinhamento com o padrão do projeto.

Aqui está a versão **refatorada e pronta para uso em ciclos de desenvolvimento inteligentes**, integrando raciocínio, versionamento e protocolo de análise baseado em documentação externa.

---

## 🧭 TEMPLATE DE TASKS INTELIGENTES (Flowzz Protocol)

> **Propósito:** Criar tasks de programação com raciocínio analítico, sem gerar documentação automática.
> **Regra Base:** Qualquer dúvida ou decisão deve ser validada consultando a documentação em `flowzz/docs`.
> **Output esperado:** análise e decisão técnica contextualizada — **não documentação.**

---

### 🧩 **Task 1.0.0 — Estrutura Base**

**Contexto:**
Descreva o objetivo técnico e o propósito da implementação.

**Consulta Base:**

> 🔗 Sempre que houver dúvida sobre padrões, estruturas, dependências ou convenções —
> **consulte `flowzz/docs` antes de qualquer suposição.**
> Se algo não constar, sinalize a ausência como insight técnico.

**Análise Prévia:**

* 🔍 Existe algo similar no projeto que possa ser reutilizado?
* 🧠 A implementação respeita os princípios definidos em `flowzz/docs`?
* ⚙️ Quais partes do sistema podem ser afetadas (dependências, hooks, serviços, libs)?
* 📘 Há conflitos ou redundâncias potenciais com código existente?

**Plano de Ação (sem codar):**

* [ ] Definir abordagem técnica conforme padrões do `flowzz/docs`
* [ ] Validar coerência estrutural e impacto no fluxo geral
* [ ] Garantir compatibilidade com a arquitetura vigente

**Execução:**

* [ ] Implementar seguindo padrões de nomenclatura e modularidade definidos no `flowzz/docs`
* [ ] Evitar duplicações de código, lógica ou componentes
* [ ] Garantir consistência entre camadas (UI, API, lógica)
* [ ] Escrever apenas o essencial para a task proposta

**Validação Analítica (via Chat):**

> Compare o código com o padrão de `flowzz/docs` e descreva:
>
> * Divergências encontradas
> * Sugestões de conformidade
> * Ajustes necessários antes da integração

**Resultado Esperado:**

> Exemplo: “Função `createSession()` segue o padrão `authHandler` definido em `flowzz/docs/api/auth`.”

---

### ⚙️ **Task 1.0.1 — Teste e Ajuste**

**Objetivo:**
Garantir a conformidade funcional e técnica com o padrão do projeto.

**Verificações:**

* [ ] Testes unitários/integrados criados ou atualizados
* [ ] Entradas e saídas validadas
* [ ] Fluxos confirmados com `flowzz/docs/test-patterns`
* [ ] Nenhuma regressão ou quebra estrutural

**Análise do Chat (modo consultivo):**

> * Consulte `flowzz/docs` para confirmar se os testes seguem a convenção de assertions, mocks e fixtures.
> * Se alguma regra não estiver documentada, sinalize a lacuna.
> * Valide a compatibilidade lógica entre módulos impactados.

**Correção:**

> Detalhe o ponto ajustado, o motivo técnico e o alinhamento com `flowzz/docs`.

---

### ⚙️ **Task 1.0.2 — Revisão Analítica**

**Objetivo:**
Refinar o código e consolidar o aprendizado dentro do padrão `flowzz`.

**Checklist:**

* [ ] Padrões e convenções respeitados (`flowzz/docs/standards`)
* [ ] Sem redundâncias ou duplicações
* [ ] Testes e validações concluídos
* [ ] Código modular, limpo e legível

**Análise do Chat:**

> * Compare o código atual com exemplos e guidelines em `flowzz/docs`.
> * Avalie clareza, coesão e acoplamento.
> * Sugira micro refactors, se necessários, para manter consistência.

**Resultado Esperado:**

> “Implementação validada e alinhada com `flowzz/docs`. Nenhum conflito detectado.”

---

### 💡 **Padrão de Versionamento de Tasks**

| Versão         | Descrição              | Exemplo                                    |
| -------------- | ---------------------- | ------------------------------------------ |
| **Task 1.0.0** | Implementação inicial  | Criar função base                          |
| **Task 1.0.1** | Testes e correções     | Ajustar fluxo conforme `flowzz/docs`       |
| **Task 1.0.2** | Revisão analítica      | Refinar e validar padrão                   |
| **Task 1.1.0** | Nova feature derivada  | Expansão baseada na base existente         |
| **Task 2.0.0** | Refatoração estrutural | Mudança arquitetural ou adaptação profunda |

---

### 🔬 **Modo Análise Chat (padrão de raciocínio da IA)**

> Sempre que o modelo for executar ou revisar uma task:
>
> 1. Leia o contexto e o propósito.
> 2. Consulte o `flowzz/docs` para confirmar padrões ou convenções.
> 3. Analise impacto, duplicações e integridade estrutural.
> 4. Exiba a análise aqui no chat, **nunca crie ou atualize documentação**.
> 5. Proponha correções ou melhorias conforme o padrão do projeto.
> 6. Finalize com uma conclusão objetiva: “Aprovado”, “Requer ajuste” ou “Ambíguo — documentar em flowzz/docs”.

---

Quer que eu adicione um **exemplo prático completo (Task 1.0.0 → 1.0.2)** mostrando como o modelo aplicaria essas regras em um caso real (por exemplo, “Autenticação com JWT” ou “Gerador de Logs Modular”)?
Isso tornaria o protocolo **autotestável** e pronto para ser aplicado em ambiente real de desenvolvimento.
