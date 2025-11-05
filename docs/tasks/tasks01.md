# Tasks para Implementação de Configurações - Flowzz SaaS Multitenant

## Visão Geral
Implementar página completa de configurações em http://localhost:3000/configuracoes com conexão ao backend, isolamento multitenant e testes CRUD.

## Seções a Implementar

### Perfil
- Nome Completo
- Email
- Telefone
- CPF/CNPJ
- Endereço
- Cidade
- CEP
- Foto de Perfil (upload/remover)
- Botão "Salvar Alterações"

### Sistema
- Modo Escuro (switch preto/black)
- Idioma
- Fuso Horário
- Formato de Data
- Moeda

### Segurança
- Alterar Senha (Senha Atual, Nova Senha, Confirmar Senha, botão)
- Autenticação em Duas Etapas (não implementar agora)
- Sessões Ativas (Navegador, SO, estado, ativo agora)

## Requisitos Técnicos
- **Multitenant**: Isolamento completo entre contas de usuários
- **Backend**: Endpoints CRUD com validação
- **Frontend**: Componente React conectado às APIs
- **Banco**: Extensões no Prisma para novos campos
- **Testes**: Arquivos test_perfil.ts, test_system.ts, test-security.ts

## Tasks Detalhadas

### 1. Análise e Planejamento
- [x] Analisar modelos existentes no Prisma (User já tem alguns campos) Cuidado, diferencie User de Clientes dos usuários do flowzz.
- [x] Definir estrutura de dados para configurações do sistema e segurança
- [x] Planejar isolamento multitenant (user_id em todas as tabelas)

### 2. Backend - Modelos e Schemas
- [x] Expandir modelo User no Prisma para campos adicionais de perfil (se necessário)
- [x] Criar modelo UserSettings para configurações do sistema
- [x] Criar modelo UserSecurity para dados de segurança e sessões
- [x] Atualizar schemas de validação (updateProfileSchema, novos para system/security)

### 3. Backend - Endpoints
- [x] Implementar /auth/profile (GET/PUT) para perfil
- [x] Implementar /auth/system-settings (GET/PUT) para configurações do sistema
- [x] Implementar /auth/security (GET/PUT) para alteração de senha
- [x] Implementar /auth/sessions (GET) para listar sessões ativas
- [x] Garantir middleware de autenticação e isolamento por user_id

### 4. Backend - Lógica de Negócio
- [x] Upload de foto de perfil (integração com storage)
- [x] Hash seguro para alteração de senha
- [x] Gerenciamento de sessões ativas (armazenamento em Redis/banco)
- [x] Validações de CPF/CNPJ, CEP, etc.

### 5. Frontend - Componente
- [x] Criar ProfileSettings.tsx com seções Perfil, Sistema, Segurança (integrado com backend)
- [x] Implementar formulários com validação (React Hook Form + Zod)
- [x] Conectar com APIs do backend
- [x] UI responsiva com Tailwind CSS

### 6. Frontend - Integração
- [x] Adicionar rota /configuracoes no App.tsx
- [x] Integrar com store de autenticação (Zustand)
- [x] Tratamento de erros e loading states

### 7. Testes CRUD
- [ ] Criar test_perfil.ts (testes para CRUD de perfil)
- [ ] Criar test_system.ts (testes para configurações do sistema)
- [ ] Criar test-security.ts (testes para segurança e sessões)

### 8. Validação e Segurança
- [ ] Testar isolamento multitenant (usuários não acessam dados de outros)
- [ ] Validar rate limiting e autenticação
- [ ] Testes de integração end-to-end

### 9. Deploy e Monitoramento
- [ ] Atualizar migrations do Prisma
- [ ] Testar em ambiente de desenvolvimento
- [ ] Monitorar logs e performance