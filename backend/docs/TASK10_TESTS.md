# Task 10 - Sistema de Relatórios - Guia de Testes

## 🧪 Roteiro de Testes Completo

### Pré-requisitos

1. **Instalar Dependências**:
   ```bash
   cd backend
   npm install puppeteer xlsx express-rate-limit
   npm install --save-dev @types/express-rate-limit
   ```

2. **Configurar Rate Limiter** (substitua placeholder em `server.ts`):
   ```typescript
   import rateLimit from 'express-rate-limit';
   
   const reportGenerateLimiter = rateLimit({
     windowMs: 60 * 60 * 1000,
     max: 10,
     message: {
       success: false,
       error: 'Limite de geração excedido. Aguarde 1 hora.',
     },
   });
   ```

3. **Iniciar Serviços**:
   ```bash
   # PostgreSQL
   docker-compose up -d postgres
   
   # Redis (Bull queue)
   docker-compose up -d redis
   
   # Backend
   npm run dev
   
   # Worker (em outro terminal)
   npm run worker
   ```

---

## 📝 Casos de Teste

### Teste 1: Geração de Relatório de Vendas (PDF)

**Request**:
```bash
POST http://localhost:3000/api/v1/reports/generate
Authorization: Bearer {seu_token_jwt}
Content-Type: application/json

{
  "type": "SALES_REPORT",
  "title": "Relatório de Vendas - Janeiro 2024",
  "format": "pdf",
  "filters": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "includeCharts": true,
    "includeLogo": true
  },
  "sendEmail": false
}
```

**Resposta Esperada** (202 Accepted):
```json
{
  "success": true,
  "message": "Relatório enfileirado para geração",
  "data": {
    "id": "uuid-do-relatorio",
    "status": "PENDING",
    "estimatedTime": "2-5 minutos"
  }
}
```

**Validações**:
- ✅ Status 202 Accepted
- ✅ Campo `id` é UUID válido
- ✅ Campo `status` = "PENDING"
- ✅ Job enfileirado na Bull queue
- ✅ Registro criado no banco (tabela reports)

---

### Teste 2: Verificar Status (Polling)

**Request**:
```bash
GET http://localhost:3000/api/v1/reports/{reportId}/status
Authorization: Bearer {seu_token_jwt}
```

**Respostas Esperadas**:

**Fase 1 - PENDING** (imediatamente após criar):
```json
{
  "success": true,
  "data": {
    "id": "uuid-do-relatorio",
    "status": "PENDING",
    "user_id": "user-uuid",
    "type": "SALES_REPORT",
    "title": "Relatório de Vendas - Janeiro 2024",
    "format": "pdf",
    "file_url": null,
    "error_message": null,
    "created_at": "2024-01-15T10:00:00.000Z",
    "expires_at": "2024-02-14T10:00:00.000Z"
  }
}
```

**Fase 2 - GENERATING** (worker processando):
```json
{
  "success": true,
  "data": {
    "id": "uuid-do-relatorio",
    "status": "GENERATING",
    // ... outros campos
  }
}
```

**Fase 3 - READY** (concluído com sucesso):
```json
{
  "success": true,
  "data": {
    "id": "uuid-do-relatorio",
    "status": "READY",
    "file_url": "/temp/reports/report-uuid.pdf",
    // ... outros campos
  }
}
```

**Fase 4 - ERROR** (falha na geração):
```json
{
  "success": true,
  "data": {
    "id": "uuid-do-relatorio",
    "status": "ERROR",
    "error_message": "Erro ao coletar dados: ...",
    // ... outros campos
  }
}
```

**Validações**:
- ✅ Transição PENDING → GENERATING → READY
- ✅ file_url preenchida quando READY
- ✅ error_message preenchida quando ERROR
- ✅ expires_at = created_at + 30 dias

---

### Teste 3: Download do Relatório

**Request**:
```bash
GET http://localhost:3000/api/v1/reports/{reportId}/download
Authorization: Bearer {seu_token_jwt}
```

**Resposta Esperada** (200 OK):
```json
{
  "success": true,
  "data": {
    "downloadUrl": "/temp/reports/report-uuid.pdf",
    "expiresAt": "2024-02-14T10:00:00.000Z"
  }
}
```

**Erros Possíveis**:

**Relatório não pronto** (400 Bad Request):
```json
{
  "success": false,
  "error": "Relatório ainda não está pronto para download",
  "status": "GENERATING"
}
```

**Relatório expirado** (410 Gone):
```json
{
  "success": false,
  "error": "Relatório expirado"
}
```

**Validações**:
- ✅ Só permite download se status = READY
- ✅ Retorna 410 se expirado (expires_at < now)
- ✅ URL válida e acessível

---

### Teste 4: Geração de Relatório Financeiro (Excel)

**Request**:
```bash
POST http://localhost:3000/api/v1/reports/generate
Authorization: Bearer {seu_token_jwt}
Content-Type: application/json

{
  "type": "FINANCIAL_SUMMARY",
  "title": "Relatório Financeiro - Q1 2024",
  "format": "excel",
  "filters": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-03-31T23:59:59.999Z",
    "includeCharts": false,
    "includeLogo": false
  }
}
```

**Validações**:
- ✅ Excel gerado com 3 sheets (Resumo Financeiro, Receitas, Projeções)
- ✅ Headers formatados (negrito, centralizado)
- ✅ Valores em R$ formatados corretamente
- ✅ Percentuais com 2 casas decimais
- ✅ Colunas com largura automática

---

### Teste 5: Listagem com Filtros

**Request 1 - Todos os relatórios**:
```bash
GET http://localhost:3000/api/v1/reports?page=1&limit=20
Authorization: Bearer {seu_token_jwt}
```

**Request 2 - Filtrado por tipo e status**:
```bash
GET http://localhost:3000/api/v1/reports?type=SALES_REPORT&status=READY&page=1&limit=10
Authorization: Bearer {seu_token_jwt}
```

**Request 3 - Filtrado por formato e período**:
```bash
GET http://localhost:3000/api/v1/reports?format=pdf&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {seu_token_jwt}
```

**Resposta Esperada**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "type": "SALES_REPORT",
      "title": "Relatório de Vendas",
      "format": "pdf",
      "status": "READY",
      "created_at": "2024-01-15T10:00:00.000Z"
    },
    // ... mais relatórios
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Validações**:
- ✅ Paginação funcionando corretamente
- ✅ Filtros aplicados (type, status, format, dates)
- ✅ Apenas relatórios do usuário autenticado
- ✅ total e totalPages corretos

---

### Teste 6: Estatísticas de Uso

**Request**:
```bash
GET http://localhost:3000/api/v1/reports/statistics
Authorization: Bearer {seu_token_jwt}
```

**Resposta Esperada**:
```json
{
  "success": true,
  "data": {
    "totalReports": 45,
    "reportsByType": [
      { "type": "SALES_REPORT", "count": 20 },
      { "type": "FINANCIAL_SUMMARY", "count": 15 },
      { "type": "CLIENT_ANALYSIS", "count": 10 }
    ],
    "reportsByFormat": [
      { "format": "pdf", "count": 30 },
      { "format": "excel", "count": 15 }
    ],
    "reportsByStatus": [
      { "status": "READY", "count": 40 },
      { "status": "ERROR", "count": 3 },
      { "status": "PENDING", "count": 2 }
    ],
    "averageGenerationTime": 3.5,
    "lastGenerated": "2024-01-15T14:30:00.000Z"
  }
}
```

**Validações**:
- ✅ Totais corretos
- ✅ Agrupamento por tipo, formato e status
- ✅ averageGenerationTime em segundos
- ✅ lastGenerated = relatório mais recente

---

### Teste 7: Exclusão de Relatório

**Request**:
```bash
DELETE http://localhost:3000/api/v1/reports/{reportId}
Authorization: Bearer {seu_token_jwt}
```

**Resposta Esperada** (204 No Content):
```
(sem corpo, apenas status 204)
```

**Erros Possíveis**:

**Relatório não encontrado** (404 Not Found):
```json
{
  "success": false,
  "error": "Relatório não encontrado"
}
```

**Não autorizado** (403 Forbidden):
```json
{
  "success": false,
  "error": "Não autorizado"
}
```

**Validações**:
- ✅ Relatório deletado do banco
- ✅ Arquivo removido do storage (quando S3 implementado)
- ✅ Apenas owner pode deletar
- ✅ 404 se ID não existe

---

### Teste 8: Rate Limiting

**Cenário**: Gerar 11 relatórios em menos de 1 hora

**Requests** (repetir 11 vezes):
```bash
POST http://localhost:3000/api/v1/reports/generate
Authorization: Bearer {seu_token_jwt}
Content-Type: application/json

{
  "type": "SALES_REPORT",
  "title": "Teste Rate Limit",
  "format": "pdf",
  "filters": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z"
  }
}
```

**Respostas**:
- **Requisições 1-10**: 202 Accepted
- **Requisição 11**: 429 Too Many Requests

**Resposta da 11ª Requisição**:
```json
{
  "success": false,
  "error": "Limite de geração de relatórios excedido. Você pode gerar até 10 relatórios por hora."
}
```

**Headers da Resposta** (com express-rate-limit):
```
RateLimit-Limit: 10
RateLimit-Remaining: 0
RateLimit-Reset: 1705324800
```

**Validações**:
- ✅ Primeiras 10 aceitas
- ✅ 11ª bloqueada com 429
- ✅ Headers RateLimit-* presentes
- ✅ Reset após 1 hora

---

### Teste 9: Validação de Dados (Erros 400)

**Teste 9.1 - Tipo inválido**:
```bash
POST /api/v1/reports/generate
{
  "type": "INVALID_TYPE",
  "title": "Teste",
  "format": "pdf",
  "filters": { ... }
}
```
**Esperado**: 400 Bad Request - "Dados inválidos"

**Teste 9.2 - Data final antes da inicial**:
```bash
{
  "type": "SALES_REPORT",
  "title": "Teste",
  "format": "pdf",
  "filters": {
    "startDate": "2024-01-31",
    "endDate": "2024-01-01"
  }
}
```
**Esperado**: 400 Bad Request - "endDate deve ser maior ou igual a startDate"

**Teste 9.3 - Email sem destinatários**:
```bash
{
  "type": "SALES_REPORT",
  "title": "Teste",
  "format": "pdf",
  "filters": { ... },
  "sendEmail": true
  // emailRecipients ausente
}
```
**Esperado**: 400 Bad Request - "emailRecipients obrigatório quando sendEmail=true"

**Validações**:
- ✅ Zod schemas validando corretamente
- ✅ Mensagens de erro descritivas
- ✅ Status 400 para erros de validação

---

### Teste 10: Ownership Validation

**Cenário**: Usuário A tenta acessar relatório de Usuário B

**Setup**:
1. Usuário A cria relatório (reportId: `uuid-a`)
2. Usuário B tenta acessar

**Request do Usuário B**:
```bash
GET http://localhost:3000/api/v1/reports/uuid-a/status
Authorization: Bearer {token_usuario_b}
```

**Resposta Esperada** (404 Not Found):
```json
{
  "success": false,
  "error": "Relatório não encontrado"
}
```

**Validações**:
- ✅ Retorna 404 (não 403, para não vazar existência)
- ✅ Mesmo comportamento em /status, /download, DELETE

---

## 🔍 Validações no Worker

### Checklist de Logs (verificar console/logs)

Durante processamento de job, deve aparecer:

```
[INFO] Report generation job started { jobId: 1, reportId: 'uuid', type: 'SALES_REPORT' }
[INFO] Status updated to GENERATING { reportId: 'uuid' }
[INFO] Collecting data for SALES_REPORT { userId: 'user-uuid', filters: {...} }
[INFO] Data collected successfully { reportId: 'uuid', dataSize: 1234 }
[INFO] Generating PDF { reportId: 'uuid', options: {...} }
[INFO] File generated successfully { reportId: 'uuid', size: 45678 }
[INFO] Uploading file { reportId: 'uuid', filename: 'report-uuid.pdf' }
[WARN] Upload not implemented, using local path { reportId: 'uuid' }
[INFO] Report updated with file URL { reportId: 'uuid', fileUrl: '/temp/...' }
[INFO] Report generation completed successfully { reportId: 'uuid', duration: 3500 }
```

**Se houver erro**:
```
[ERROR] Error generating report { reportId: 'uuid', error: '...' }
[INFO] Status updated to ERROR { reportId: 'uuid', error: '...' }
```

---

## 🐛 Troubleshooting

### Problema: Chromium não baixado (Puppeteer)

**Sintoma**: Erro "Chromium revision is not downloaded"

**Solução**:
```bash
node node_modules/puppeteer/install.js
# ou
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false npm install puppeteer
```

### Problema: Worker não processa jobs

**Verificações**:
1. Redis rodando? `docker ps | grep redis`
2. Worker iniciado? `npm run worker` ou verificar `startAllWorkers()`
3. Queue registrada? Verificar `workers/index.ts`

**Debug**:
```bash
# Ver jobs na fila
curl http://localhost:3000/admin/queues
```

### Problema: PDF com layout quebrado

**Causas comuns**:
- Tailwind CSS não carregado (verificar CDN no template)
- Wait timeout muito curto (aumentar `waitUntil: 'networkidle0'`)
- Dados muito grandes (aumentar timeout do worker)

**Solução**:
```typescript
// Em PDFGenerator.ts
await page.goto(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`, {
  waitUntil: 'networkidle0',
  timeout: 60000, // Aumentar de 30s para 60s
});
```

### Problema: Excel com caracteres estranhos

**Causa**: Encoding UTF-8 não configurado

**Solução**:
```typescript
// Em ExcelGenerator.ts
const buffer = XLSX.write(workbook, { 
  type: 'buffer', 
  bookType: 'xlsx',
  compression: true,
  cellStyles: true
});
```

---

## ✅ Checklist Final

Antes de considerar Task 10 completa:

- [ ] Todas as dependências instaladas (puppeteer, xlsx, express-rate-limit)
- [ ] Rate limiter configurado (não mais placeholder)
- [ ] Teste 1: PDF gerado corretamente
- [ ] Teste 2: Status transitions PENDING → GENERATING → READY
- [ ] Teste 3: Download funciona
- [ ] Teste 4: Excel com múltiplos sheets
- [ ] Teste 5: Listagem com paginação e filtros
- [ ] Teste 6: Estatísticas corretas
- [ ] Teste 7: Exclusão com ownership
- [ ] Teste 8: Rate limit após 10 requisições
- [ ] Teste 9: Validações Zod bloqueiam dados inválidos
- [ ] Teste 10: Usuários não acessam relatórios de outros
- [ ] Logs do worker aparecem corretamente
- [ ] Cleanup automático de relatórios antigos (30 dias)
- [ ] Sem errors TypeScript (npm run build)

---

## 📊 Métricas de Sucesso

**Performance**:
- PDF < 5s para 100 vendas
- Excel < 3s para 100 vendas
- Worker timeout não atingido (< 5min)

**Confiabilidade**:
- 0% de jobs perdidos (Bull retries funcionando)
- 100% de ownership validation
- 0 vulnerabilidades (npm audit)

**UX**:
- Status atualizado em tempo real
- Mensagens de erro claras
- Downloads sem quebrar layout

---

**Última Atualização**: 2024
**Próximo Passo**: Testes manuais com Postman/Insomnia
