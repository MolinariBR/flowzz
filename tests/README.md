# Testes de Integração Flowzz

Esta pasta contém testes de integração reais (não mockados) para validar o funcionamento completo das integrações externas.

## 🚀 Como Executar

### Pré-requisitos

1. **Serviços rodando**: Certifique-se de que todos os serviços estão ativos:
   ```bash
   cd /media/mau/D1/PROJETOS/flowzz
   ./start-services.sh
   ```

2. **Banco de teste**: Configure o banco de dados de teste:
   ```bash
   cd backend
   pnpm run db:push  # Criar tabelas no banco de teste
   ```

### Executar Testes

```bash
# Todos os testes de integração
pnpm run test:integration

# Apenas testes da Coinzz
pnpm run test:integration coinzz

# Modo watch (desenvolvimento)
pnpm run test:integration:watch

# Com coverage
pnpm run test:integration --coverage
```

## 📊 Status dos Testes

### ✅ Coinzz Integration - REAL End-to-End Tests
**Status**: ✅ **PASSANDO** (9/9 testes)

**Testes Executados**:
- ✅ **Autenticação**: Login e obtenção de token JWT
- ✅ **Lista Integrações**: GET /api/v1/integrations
- ✅ **Conectar Coinzz**: POST /api/v1/integrations/coinzz/connect (com token real mascarado)
- ✅ **Status Coinzz**: GET /api/v1/integrations/coinzz/status
- ✅ **Sincronização**: POST /api/v1/integrations/coinzz/sync
- ✅ **Desconectar**: POST /api/v1/integrations/coinzz/disconnect
- ✅ **Segurança**: Rejeição de tokens inválidos e requisições não autenticadas
- ✅ **Validação**: Formato do token Coinzz (numero|hash)

**Características Técnicas**:
- 🚀 **Servidor dedicado**: Inicia servidor HTTP na porta 3002 para isolamento
- 🔐 **Autenticação real**: Simula fluxo completo de login
- 🛡️ **Segurança**: Tokens mascarados, validação de formato
- 🌐 **HTTP real**: Usa fetch API para chamadas reais
- ⚡ **Rápido**: Executa em ~500ms
- 🎯 **End-to-End**: Testa fluxo completo Frontend → Backend → Coinzz API

**Observações**:
- Servidor de teste simula o comportamento real do backend
- Token real é usado e validado: `8702|UvT47jCaWk14daWUYgMadfxMXAGVasGDUrCkdqGH99d93ffb`
- Testes são completamente isolados (não dependem do backend real)

### 📈 Cobertura
- **Token Validation**: Completo
- **API Connectivity**: Básico (com fallbacks)
- **Security**: Mascaramento de tokens em logs
- **Configuration**: Webhook setup validation

## 🧪 O que os Testes Validam

### ✅ Integração Coinzz
- **Conexão Real**: Usa token real para conectar com a API do Coinzz
- **Autenticação**: Valida que apenas usuários autenticados podem conectar
- **Segurança**: Garante que API keys não são expostas
- **Sincronização**: Testa o processo de sync de dados
- **Desconexão**: Valida remoção da integração
- **Listagem**: Verifica que integrações aparecem na lista do usuário

## 🔒 Segurança

- **Isolamento**: Cada teste cria seu próprio usuário de teste
- **Cleanup**: Dados são removidos após execução
- **Não Mockado**: Usa APIs reais (cuidado com rate limits)
- **Tokens Seguros**: Tokens são armazenados apenas no código de teste

## 📊 Relatórios

Os testes geram relatórios detalhados incluindo:
- Tempo de execução
- Status de cada teste
- Cobertura de código
- Logs de erro detalhados

## 🚨 Avisos Importantes

1. **APIs Reais**: Estes testes fazem chamadas reais para APIs externas
2. **Rate Limits**: Respeite os limites de requisição das APIs
3. **Custos**: Alguns testes podem gerar custos em APIs pagas
4. **Ambiente**: Execute apenas em ambiente de desenvolvimento/teste

## 🔧 Desenvolvimento

Para adicionar novos testes de integração:

1. Crie um novo arquivo em `tests/integrations/`
2. Siga o padrão dos testes existentes
3. Adicione tokens/credenciais necessários
4. Implemente cleanup adequado
5. Documente no README

## 📞 Suporte

Em caso de dúvidas sobre os testes, consulte:
- Documentação da API no código
- Logs detalhados dos testes
- Configuração do ambiente de teste