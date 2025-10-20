# 🚀 Guia de Desenvolvimento - Flowzz

## 📋 Visão Geral

Este guia documenta as ferramentas de desenvolvimento implementadas no monorepo Flowzz para garantir qualidade de código, automação e produtividade da equipe.

## 🛠️ Ferramentas Implementadas

### 🎯 Biome (Linter & Formatter)
- **Versão:** 2.2.6
- **Função:** Linting e formatação ultrarrápida
- **Configuração:** `biome.json` na raiz e em cada workspace

### 🪝 Husky (Git Hooks)
- **Versão:** 9.1.6
- **Função:** Automação de pre-commit e pre-push
- **Localização:** `.husky/` na raiz do projeto

### 📦 lint-staged (Otimização)
- **Versão:** 15.2.10
- **Função:** Aplicar lint apenas em arquivos modificados
- **Configuração:** `lint-staged` no `package.json` raiz

### 🔷 TypeScript (Verificação de Tipos)
- **Modo:** Strict em todos os workspaces
- **Scripts:** `type-check` disponível em todos os projetos

---

## 📁 Estrutura do Projeto

```
flowzz/
├── .husky/                    # ✅ Git hooks (raiz)
├── biome.json                 # ✅ Configuração Biome
├── package.json               # ✅ Scripts e lint-staged
├── README.md                  # ✅ Documentação geral
├── Guia.md                    # ✅ Este guia
├── backend/                   # API (Node.js + Express)
├── admin/                     # Painel Admin (Vite + React)
├── flow/                      # Frontend Flow (Next.js)
└── landing/                   # Landing Page (Vite + React)
```

---

## ⚡ Configuração Inicial

### 1. Instalar Dependências
```bash
# Raiz do projeto
npm install

# OU com pnpm (recomendado)
pnpm install
```

### 2. Configurar Git Hooks
```bash
# Hooks configurados automaticamente
npm run prepare

# Verificar hooks
ls -la .husky/
```

### 3. Verificar Instalação
```bash
# Testar ferramentas básicas
npm run lint          # ✅ Deve funcionar
npm run check         # ✅ Deve validar tudo
```

---

## 🛠️ Scripts Disponíveis

### Scripts da Raiz
| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `npm run lint` | Verifica problemas em todo o monorepo | Sempre antes de commit |
| `npm run lint:fix` | Corrige problemas automaticamente | Quando houver erros |
| `npm run format` | Formata todo o código | Para manter consistência |
| `npm run check` | Validação completa (lint + type-check) | CI local / antes de push |
| `npm run prepare` | Configura git hooks | Após instalar dependências |

### Scripts por Workspace
```bash
# Backend
cd backend && npm run dev          # Desenvolvimento
cd backend && npm run build        # Build de produção
cd backend && npm run test         # Testes unitários

# Admin
cd admin && npm run dev            # Desenvolvimento
cd admin && npm run build          # Build de produção

# Flow (Next.js)
cd flow && npm run dev             # Desenvolvimento
cd flow && npm run build           # Build de produção

# Landing
cd landing && npm run dev          # Desenvolvimento
cd landing && npm run build        # Build de produção
```

---

## 🤖 Automação Ativa

### 1. VS Code (Ao Salvar)
✅ **Formatação automática** (`Ctrl+S`)
✅ **Correção automática** de problemas simples
✅ **Organização de imports**
✅ **Biome como formatter padrão**

### 2. Git Hooks (Pre-commit)
✅ **lint-staged** - Processa apenas arquivos modificados
✅ **Biome check** - Verificação de problemas
✅ **Biome format** - Formatação automática
✅ **Bloqueio** se houver erros críticos

### 3. Git Hooks (Pre-push)
✅ **TypeScript check** - Verificação de tipos
✅ **Build completo** - Testa compilação
✅ **Bloqueio** se houver falhas

---

## 📖 Uso Diário

### Desenvolvimento Típico

#### 1. **Início do Trabalho**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend desejado
cd admin && npm run dev    # OU
cd flow && npm run dev     # OU
cd landing && npm run dev
```

#### 2. **Durante o Desenvolvimento**
- ✅ Escreva código normalmente
- ✅ VS Code formata automaticamente ao salvar
- ✅ Problemas aparecem em tempo real
- ✅ Imports são organizados automaticamente

#### 3. **Antes de Commitar**
```bash
# Verificação rápida
npm run lint

# Correção automática (se necessário)
npm run lint:fix

# Validação completa (recomendado)
npm run check
```

#### 4. **Fazer Commit**
```bash
git add .
git commit -m "feat: descrição da mudança"

# ✅ Hook aplica automaticamente:
# - Formatação em arquivos modificados
# - Correção de problemas simples
# - Organização de imports
```

#### 5. **Push Seguro**
```bash
git push

# ✅ Hook valida automaticamente:
# - TypeScript (tipos corretos)
# - Build (sem erros de compilação)
# - Testes (se houver falhas)
```

---

## 🚨 Cenários de Problemas

### 🎯 **"Meu código não está formatando automaticamente"**
1. Verifique se a extensão `Biome` está instalada no VS Code
2. Certifique-se que `editor.formatOnSave` está ativado
3. Reinicie o VS Code se necessário

### 🎯 **"Commit está falhando"**
```bash
# 1. Ver o que está errado
npm run lint

# 2. Corrigir automaticamente
npm run lint:fix

# 3. Verificar tipos
npm run type-check

# 4. Tentar novamente
git add .
git commit -m "feat: descrição"
```

### 🎯 **"Push está sendo bloqueado"**
```bash
# 1. Problema sério (TypeScript ou build)
npm run check  # Diagnóstico completo

# 2. Corrigir erros identificados
npm run lint:fix

# 3. Testar build
npm run build  # OU pnpm run build

# 4. Tentar push novamente
git push
```

### 🎯 **"Quero contribuir com o projeto"**
```bash
# 1. Fork e clone
git clone seu-fork-url
cd flowzz

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
cp config.env.example config.env

# 4. Hooks configurados automaticamente
npm run prepare

# 5. Desenvolver seguindo padrões
# 6. Testar completamente
npm run check

# 7. Commitar e push
git push origin sua-branch
```

---

## ⚙️ Configuração Técnica

### Biome (biome.json)
```json
{
  "$schema": "https://biomejs.dev/schemas/2.2.6/schema.json",
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "style": "warn",
      "suspicious": "warn"
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "lineWidth": 100
  }
}
```

### lint-staged (package.json)
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "biome check --write --no-errors-on-unmatched",
      "biome format --write"
    ],
    "*.{json,md,css}": [
      "biome format --write"
    ]
  }
}
```

### VS Code (settings.json)
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": "explicit",
    "source.organizeImports": "explicit"
  },
  "editor.defaultFormatter": "biomejs.biome"
}
```

---

## 🧪 Testes e Validação

### Comandos de Teste
```bash
# Testes E2E (Playwright)
npm run test:e2e              # Todos os testes
npm run test:e2e:ui           # Interface visual
npm run test:e2e:flow         # Apenas Flow
npm run test:e2e:admin        # Apenas Admin

# Testes Unitários (Vitest)
cd backend && npm run test    # Backend
```

### Validação de Build
```bash
# Build de todos os projetos
pnpm -r run build

# OU build individual
cd backend && npm run build
cd admin && npm run build
cd flow && npm run build
cd landing && npm run build
```

---

## 📚 Recursos e Documentação

### 📖 Documentação Oficial
- [Biome](https://biomejs.dev/) - Linter e formatter ultrarrápido
- [Husky](https://typicode.github.io/husky/) - Git hooks modernos
- [lint-staged](https://github.com/lint-staged/lint-staged) - Lint otimizado
- [TypeScript](https://www.typescriptlang.org/docs/) - Verificação de tipos

### 🛠️ Extensões VS Code Recomendadas
```json
{
  "recommendations": [
    "biomejs.biome",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### 📋 Checklist de Setup
- [ ] Instalar dependências (`npm install`)
- [ ] Configurar hooks (`npm run prepare`)
- [ ] Testar comandos básicos (`npm run lint`)
- [ ] Configurar VS Code (extensões recomendadas)
- [ ] Testar workflow completo (commit + push)

---

## 🚨 Troubleshooting

### Problemas Comuns

#### **Extensões VS Code**
- **Solução:** Instalar `Biome` extension
- **Verificação:** `Ctrl+Shift+P` → "Format Document"

#### **Cache do Biome**
- **Solução:** Reiniciar VS Code
- **Alternativa:** `npm run format`

#### **Hooks Não Funcionando**
- **Solução:** `npm run prepare`
- **Verificação:** `ls -la .husky/`

#### **Dependências Não Instaladas**
- **Solução:** `npm install husky@^9.1.6 lint-staged@^15.2.10 --save-dev`
- **Verificação:** `npm list husky lint-staged`

#### **Sintaxe JSON Inválida**
- **Solução:** Verificar `package.json` em cada workspace
- **Ferramenta:** `cat package.json | jq . > /dev/null`

---

## 🎯 Padrões de Código

### Convenções Gerais
- **Linter/Formatter:** Biome (configurado na raiz)
- **TypeScript:** Strict mode em todos os projetos
- **Commits:** Conventional commits (`feat:`, `fix:`, `docs:`)
- **Imports:** Organizados automaticamente pelo Biome

### Estrutura de Commits
```bash
feat: adicionar nova funcionalidade
fix: corrigir bug crítico
docs: atualizar documentação
style: melhorar formatação
refactor: refatorar código
test: adicionar testes
chore: manutenção do projeto
```

### Nomenclatura
- **Componentes:** PascalCase (`MeuComponente`)
- **Funções/variáveis:** camelCase (`minhaFuncao`)
- **Constantes:** UPPER_SNAKE_CASE (`MINHA_CONSTANTE`)
- **Arquivos:** kebab-case (`meu-arquivo.tsx`)

---

## 📈 Métricas e Performance

### Tempos Esperados
| Comando | Tempo Aprox. | Descrição |
|---------|--------------|-----------|
| `npm run lint` | < 5s | Verificação rápida |
| `npm run format` | < 3s | Formatação completa |
| `npm run check` | < 15s | Validação completa |
| `npm run build` | < 30s | Build de produção |

### Cobertura de Código
- **TypeScript:** 100% dos arquivos verificados
- **Linting:** Todos os projetos cobertos
- **Formatação:** Código consistente em todo o monorepo

---

## 🤝 Contribuição

### Para Novos Desenvolvedores
1. **Setup inicial** (siga este guia)
2. **Estudar padrões** (leia a documentação)
3. **Testar mudanças** (`npm run check`)
4. **Seguir workflow** (commit → push com validação)

### Para Melhorias
1. **Propor mudanças** via Pull Request
2. **Testar impacto** em todos os workspaces
3. **Atualizar documentação** se necessário
4. **Manter padrões** estabelecidos

---

## 📞 Suporte

### Equipe Técnica
- **Repositório:** [Flowzz GitHub]
- **Documentação:** [README.md](./README.md)
- **Issues:** Reportar bugs e melhorias

### Recursos Comunitários
- **Biome Discord:** [https://biomejs.dev/chat](https://biomejs.dev/chat)
- **TypeScript Community:** [https://www.typescriptlang.org/community/](https://www.typescriptlang.org/community/)
- **React Community:** [https://react.dev/community](https://react.dev/community)

---

## 🎉 Conclusão

Este guia fornece tudo necessário para desenvolver no monorepo Flowzz com máxima produtividade e qualidade.

**Ferramentas implementadas:**
- ✅ **Biome:** Linting e formatação ultrarrápida
- ✅ **Husky:** Automação de Git hooks
- ✅ **lint-staged:** Otimização por arquivo modificado
- ✅ **TypeScript:** Verificação de tipos strict
- ✅ **VS Code:** Configuração otimizada

**Benefícios alcançados:**
- 🚀 **Produtividade:** Formatação automática e correções
- 🛡️ **Qualidade:** Validação automática e prevenção de bugs
- 🔄 **Consistência:** Padrões uniformes em todo o projeto
- 📈 **Escalabilidade:** Fácil manutenção e expansão

**🎯 Pronto para desenvolvimento profissional!**
