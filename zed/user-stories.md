# 📖 USER STORIES - FLOWZZ PLATFORM
## Formato Gherkin Completo

---

## 🎫 ÉPICA 1: Autenticação e Onboarding

### Story 1.1: Cadastro com Trial de 7 Dias

```gherkin
Como afiliado iniciante (João)
Quero me cadastrar com trial gratuito de 7 dias
Para testar a plataforma antes de pagar

Cenário: Cadastro bem-sucedido com cartão válido
  Dado que estou na landing page do Flowzz
  Quando clico em "Começar Trial Grátis"
  E preencho nome "João Silva", email "joao@email.com", senha "Senha123!"
  E insiro dados do cartão válido
  E concordo com os termos de uso
  Então sou redirecionado para o wizard de integração
  E recebo email de boas-vindas
  E vejo mensagem "Trial ativo até 08/10/2025"
  E não sou cobrado imediatamente

Cenário: Cadastro com cartão inválido
  Dado que estou no formulário de cadastro
  Quando preencho dados pessoais corretamente
  E insiro cartão com número inválido
  Então vejo mensagem "Cartão inválido. Verifique os dados."
  E não consigo prosseguir

Cenário: Email já cadastrado
  Dado que existe conta com email "joao@email.com"
  Quando tento me cadastrar com este email
  Então vejo mensagem "Este email já está cadastrado"
  E vejo link "Fazer login"

Critérios de Aceitação:
- [ ] Trial dura exatamente 7 dias corridos
- [ ] Não cobra cartão durante trial
- [ ] Email de boas-vindas enviado em < 1 minuto
- [ ] Validação de cartão via PagBank API
- [ ] Senha deve ter mínimo 8 caracteres, 1 maiúscula, 1 número
- [ ] Lembrete automático enviado 2 dias antes do fim do trial
- [ ] Conversão trial → pago deve ser > 30%

Estimativa: 8 story points
Prioridade: 🔴 Crítica
```

---

### Story 1.2: Wizard de Integração - Conectar Coinzz

```gherkin
Como afiliado (João)
Quero conectar minha conta Coinzz no primeiro acesso
Para importar minhas vendas automaticamente

Cenário: Conexão bem-sucedida via API key
  Dado que completei o cadastro
  E estou no passo 1 do wizard "Conectar Coinzz"
  Quando insiro minha API key válida do Coinzz
  E clico em "Conectar"
  Então vejo loading "Buscando suas vendas..."
  E em até 10 segundos vejo "✅ 847 vendas importadas!"
  E sou levado ao passo 2 "Conectar Facebook Ads"

Cenário: API key inválida
  Dado que estou no passo de conexão Coinzz
  Quando insiro API key inválida "abc123"
  Então vejo mensagem "API key inválida. Verifique nas configurações do Coinzz."
  E vejo link "Como obter minha API key?"
  E não consigo prosseguir para próximo passo

Cenário: Pular integração Coinzz (não permitido)
  Dado que estou no wizard de integração
  Quando tento clicar em "Pular"
  Então vejo mensagem "Coinzz é obrigatório para usar o Flowzz"
  E não consigo prosseguir

Critérios de Aceitação:
- [ ] Integração Coinzz é obrigatória (não pode pular)
- [ ] Importa últimas 1000 vendas ou 90 dias (o que for menor)
- [ ] Timeout de API de 30 segundos
- [ ] Link de ajuda abre tutorial em vídeo
- [ ] Após conexão, sincronização automática a cada 1 hora
- [ ] 90%+ dos usuários completam este passo

Estimativa: 13 story points
Prioridade: 🔴 Crítica
Dependências: API Coinzz disponível
```

---

### Story 1.3: Conectar Facebook Ads (Opcional)

```gherkin
Como afiliado (Maria)
Quero conectar minha conta de anúncios do Facebook
Para ver gastos e ROI no mesmo dashboard

Cenário: Conexão via OAuth bem-sucedida
  Dado que estou no passo 2 do wizard
  Quando clico em "Conectar Facebook Ads"
  Então sou redirecionado para login do Facebook
  E autorizo permissões: ads_read, ads_management
  E retorno ao Flowzz
  Então vejo "✅ 5 campanhas conectadas, R$ 2.340 em gastos este mês"
  E sou levado ao passo 3 "Conectar WhatsApp"

Cenário: Usuário nega permissões no Facebook
  Dado que estou no fluxo de OAuth do Facebook
  Quando clico em "Cancelar" ou nego permissões
  Então retorno ao wizard
  E vejo mensagem "Conexão cancelada. Você pode conectar depois em Integrações."
  E posso prosseguir para próximo passo

Cenário: Pular integração Facebook Ads
  Dado que estou no passo 2 do wizard
  Quando clico em "Pular por enquanto"
  Então vejo tooltip "Você não verá gastos com anúncios no dashboard"
  E posso confirmar e ir para próximo passo

Critérios de Aceitação:
- [ ] Integração é opcional (pode pular)
- [ ] OAuth usa Facebook Marketing API v18+
- [ ] Importa campanhas ativas dos últimos 30 dias
- [ ] Mostra preview de dados antes de confirmar
- [ ] 70%+ conectam Facebook Ads no primeiro dia
- [ ] Sincronização automática a cada 6 horas

Estimativa: 8 story points
Prioridade: 🟡 Alta
```

---

### Story 1.4: Conectar WhatsApp Business

```gherkin
Como afiliado (Maria)
Quero conectar meu WhatsApp Business
Para enviar notificações automáticas de entregas

Cenário: Conexão via QR Code bem-sucedida
  Dado que estou no passo 3 do wizard
  Quando clico em "Conectar WhatsApp"
  Então vejo QR Code para escanear
  E abro WhatsApp no celular
  E escaneio o QR Code
  Então vejo "✅ WhatsApp conectado!"
  E vejo "200 notificações disponíveis no seu plano"
  E posso finalizar o wizard

Cenário: QR Code expira
  Dado que vejo o QR Code na tela
  Quando não escaneio em 60 segundos
  Então QR Code expira
  E vejo botão "Gerar novo QR Code"

Cenário: Pular integração WhatsApp
  Dado que estou no passo 3 do wizard
  Quando clico em "Pular por enquanto"
  Então vejo mensagem "Você não receberá notificações automáticas"
  E posso finalizar o wizard

Critérios de Aceitação:
- [ ] Integração é opcional
- [ ] QR Code expira em 60 segundos
- [ ] Usa WhatsApp Business Cloud API
- [ ] Templates de mensagem pré-aprovados
- [ ] Contador de créditos visível
- [ ] 40%+ ativam WhatsApp no primeiro mês

Estimativa: 13 story points
Prioridade: 🟢 Média
Dependências: WhatsApp Business API aprovada
```

---

## 🎫 ÉPICA 2: Dashboard e Métricas

### Story 2.1: Ver Dashboard com Dados do Dia

```gherkin
Como afiliado (João)
Quero ver resumo financeiro do dia ao fazer login
Para saber rapidamente como está meu negócio

Cenário: Dashboard com dados atualizados
  Dado que tenho integração Coinzz ativa
  E tenho vendas hoje no valor de R$ 1.247
  E gastos com anúncios de R$ 340,50
  Quando faço login pela manhã
  Então vejo card "Vendas Hoje: R$ 1.247,00" (+23% vs. ontem)
  E vejo card "Gasto Anúncios: R$ 340,50" (-12% vs. ontem)
  E vejo card "Lucro Líquido: R$ 906,50" 💚
  E vejo card "Pagamentos Agendados: R$ 2.450,00"

Cenário: Dashboard sem vendas hoje
  Dado que não tenho vendas registradas hoje
  Quando acesso o dashboard
  Então vejo "Vendas Hoje: R$ 0,00"
  E vejo mensagem "Ainda não há vendas hoje. Última venda foi ontem às 21:45"
  E lucro líquido mostra apenas gastos (negativo)

Cenário: Sincronização de dados em andamento
  Dado que dados do Coinzz estão sincronizando
  Quando acesso dashboard
  Então vejo skeleton loading nos cards
  E vejo mensagem "Atualizando dados..."
  E cards aparecem quando sync terminar

Critérios de Aceitação:
- [ ] Dados atualizados em tempo real (< 5 min atraso)
- [ ] Cards mostram variação percentual vs. dia anterior
- [ ] Lucro líquido = Vendas - Gastos Ads - Outras despesas
- [ ] Ícones visuais: 💚 lucro, 🔴 prejuízo, 🟡 neutro
- [ ] Pagamentos agendados somam apenas status "agendado"
- [ ] Loading não deve travar interface
- [ ] Tempo de carregamento < 2 segundos

Estimativa: 8 story points
Prioridade: 🔴 Crítica
```

---

### Story 2.2: Gráfico Vendas vs Gastos (Últimos 30 Dias)

```gherkin
Como afiliado (Maria)
Quero ver evolução de vendas e gastos em gráfico
Para identificar tendências e tomar decisões

Cenário: Visualizar gráfico com dados completos
  Dado que tenho dados de vendas dos últimos 30 dias
  E tenho dados de gastos com ads dos últimos 30 dias
  Quando acesso a seção "Histórico" no dashboard
  Então vejo gráfico de linhas com 2 séries:
  - Linha verde: Vendas diárias
  - Linha laranja: Gastos com ads diários
  E posso passar mouse sobre pontos para ver valores exatos
  E vejo legenda com totais: "Total Vendas: R$ 42.500 | Total Gastos: R$ 8.900"

Cenário: Filtrar período do gráfico
  Dado que estou vendo gráfico de 30 dias
  Quando seleciono filtro "Últimos 7 dias"
  Então gráfico atualiza mostrando apenas últimos 7 dias
  E totais são recalculados
  E posso alternar entre: 7 dias, 30 dias, 90 dias, 6 meses, 1 ano

Cenário: Dados insuficientes para gráfico
  Dado que tenho apenas 3 dias de dados
  Quando acesso gráfico de 30 dias
  Então vejo mensagem "Colete mais dados para visualizar tendências"
  E vejo os 3 pontos disponíveis
  E não vejo erro

Critérios de Aceitação:
- [ ] Gráfico responsivo (desktop e mobile)
- [ ] Tooltip ao passar mouse mostra data + valor
- [ ] Pode baixar gráfico como PNG
- [ ] Filtros: 7d, 30d, 90d, 6m, 1a, personalizado
- [ ] Animação suave ao trocar período
- [ ] Cores acessíveis (contraste adequado)

Estimativa: 5 story points
Prioridade: 🟡 Alta
Biblioteca: Recharts
```

---

## 🎫 ÉPICA 3: Gestão de Clientes

### Story 3.1: Listar Todos os Clientes

```gherkin
Como afiliado (Maria)
Quero ver lista completa dos meus clientes
Para ter visão geral e gerenciar individualmente

Cenário: Visualizar tabela de clientes
  Dado que tenho 156 clientes importados do Coinzz
  Quando acesso página "Clientes"
  Então vejo tabela com colunas:
  - Nome do cliente
  - Contato (telefone/email)
  - Valor do pedido
  - Status (pago/agendado/inadimplente)
  - Etiquetas
  - Ações (whatsapp, editar, excluir)
  E vejo paginação: 20 clientes por página
  E vejo total: "156 clientes"

Cenário: Buscar cliente por nome
  Dado que estou na lista de clientes
  Quando digito "João" no campo de busca
  Então vejo apenas clientes com "João" no nome
  E vejo "3 resultados encontrados"
  E busca é case-insensitive

Cenário: Filtrar por status
  Dado que tenho clientes com diversos status
  Quando seleciono filtro "Status: Agendado"
  Então vejo apenas clientes com pagamento agendado
  E contador atualiza para quantidade filtrada

Critérios de Aceitação:
- [ ] Tabela responsiva (scroll horizontal em mobile)
- [ ] Paginação de 20 itens por página
- [ ] Busca em tempo real (debounce 300ms)
- [ ] Filtros combinados (status + etiqueta + valor)
- [ ] Ordenação por qualquer coluna clicável
- [ ] Exportar lista filtrada (CSV, Excel)
- [ ] Performance com 1000+ clientes < 1s

Estimativa: 8 story points
Prioridade: 🔴 Crítica
```

---

### Story 3.2: Criar Sistema de Etiquetas Customizadas

```gherkin
Como afiliado (Maria)
Quero criar etiquetas personalizadas
Para organizar meus clientes da minha maneira

Cenário: Criar primeira etiqueta
  Dado que não tenho etiquetas criadas
  Quando clico em "Nova Etiqueta"
  E preencho nome "Agendado 15/10"
  E seleciono cor azul (#2563EB)
  E clico em "Criar"
  Então vejo mensagem "Etiqueta criada com sucesso"
  E etiqueta aparece na lista de etiquetas disponíveis
  E posso aplicar esta etiqueta em clientes

Cenário: Criar etiqueta com nome duplicado
  Dado que já existe etiqueta "VIP"
  Quando tento criar nova etiqueta com nome "VIP"
  Então vejo erro "Já existe etiqueta com este nome"
  E não consigo criar

Cenário: Editar etiqueta existente
  Dado que tenho etiqueta "VIP" em azul
  Quando clico em "Editar etiqueta"
  E mudo cor para dourado (#F59E0B)
  E clico em "Salvar"
  Então todos os clientes com esta etiqueta veem nova cor
  E vejo mensagem "Etiqueta atualizada"

Cenário: Excluir etiqueta com clientes associados
  Dado que etiqueta "VIP" está aplicada em 8 clientes
  Quando tento excluir esta etiqueta
  Então vejo confirmação "8 clientes têm esta etiqueta. Confirma exclusão?"
  E se confirmo, etiqueta é removida dos clientes
  E etiqueta é deletada

Critérios de Aceitação:
- [ ] Máximo 20 etiquetas por usuário
- [ ] Nome único por usuário
- [ ] Paleta de 12 cores pré-definidas
- [ ] Edição não quebra associações existentes
- [ ] Confirmação antes de excluir
- [ ] Sugestões inteligentes de etiquetas comuns

Estimativa: 8 story points
Prioridade: 🟡 Alta
```

---

## 🎫 ÉPICA 4: Projeções Financeiras

### Story 4.1: Ver Projeções de Fluxo de Caixa

```gherkin
Como afiliado (Carlos)
Quero ver projeções de lucro futuro
Para planejar investimentos e tomar decisões estratégicas

Cenário: Visualizar projeções 30 dias
  Dado que tenho histórico de 90 dias de vendas
  Quando acesso página "Projeções"
  E seleciono período "Próximos 30 dias"
  Então vejo 3 cenários:
  - Pessimista: R$ 8.500 (baseado em pior semana)
  - Realista: R$ 12.300 (baseado em média)
  - Otimista: R$ 15.800 (baseado em melhor semana)
  E vejo gráfico de linha com 3 curvas
  E vejo confiança do modelo: "Precisão estimada: 85%"

Cenário: Dados insuficientes para projeção
  Dado que tenho apenas 5 dias de histórico
  Quando acesso projeções
  Então vejo mensagem "Precisamos de pelo menos 30 dias de dados para projeções confiáveis"
  E vejo contador "Coletando dados: 5/30 dias"

Cenário: Ajustar fatores da projeção
  Dado que estou vendo projeções
  Quando clico em "Ajustar fatores"
  E aumento "Investimento em ads" em 20%
  Então projeções recalculam em tempo real
  E vejo novo cenário realista: R$ 14.100 (+15%)

Critérios de Aceitação:
- [ ] Projeções baseadas em regressão linear ou ARIMA
- [ ] Mínimo 30 dias de histórico necessário
- [ ] Considera sazonalidade (dia da semana, mês)
- [ ] Fatores ajustáveis: ads, despesas, inadimplência
- [ ] Gráfico interativo com zoom
- [ ] Exportar projeções em PDF

Estimativa: 13 story points
Prioridade: 🟡 Alta
Complexidade: Machine Learning básico
```

---

### Story 4.2: Criar Metas Mensais Personalizadas

```gherkin
Como afiliado (João)
Quero definir meta de faturamento mensal
Para acompanhar meu progresso e me manter motivado

Cenário: Criar primeira meta
  Dado que não tenho metas ativas
  Quando clico em "Criar Meta"
  E preencho "Faturar R$ 15.000 em Outubro"
  E seleciono categoria "Receita"
  E defino prazo "31/10/2025"
  E clico em "Criar Meta"
  Então vejo card da meta no dashboard
  E vejo progresso: "73% atingido (R$ 10.950/R$ 15.000)"
  E vejo "18 dias restantes"

Cenário: Atingir meta antes do prazo
  Dado que tenho meta de R$ 15.000
  E já faturei R$ 15.200
  Quando dashboard atualiza
  Então vejo confete animado 🎉
  E vejo mensagem "Parabéns! Você atingiu sua meta!"
  E meta fica marcada como "Concluída"
  E recebo notificação push

Cenário: Meta não atingida no prazo
  Dado que tenho meta de R$ 15.000 até 31/10
  E em 31/10 faturei apenas R$ 12.500
  Quando data vence
  Então meta fica marcada como "Não atingida"
  E vejo "83% atingido"
  E recebo email com análise: "O que impediu você de atingir?"

Critérios de Aceitação:
- [ ] Máximo 5 metas ativas simultâneas
- [ ] Categorias: Receita, Lucro, Economia, Redução de custos
- [ ] Progresso atualizado em tempo real
- [ ] Notificações: 80% atingido, 100% atingido, vencimento
- [ ] Histórico de metas anteriores
- [ ] Gamificação: badges ao atingir múltiplas metas

Estimativa: 8 story points
Prioridade: 🟢 Média
```

---

## 🎫 ÉPICA 5: Notificações WhatsApp

### Story 5.1: Notificação Automática de Entrega

```gherkin
Como afiliado (Maria)
Quero receber notificação quando cliente receber produto
Para fazer cobrança imediatamente

Cenário: Cliente recebe produto (webhook Coinzz)
  Dado que tenho integração WhatsApp ativa
  E cliente "João Silva" tem pedido #12345 "Em trânsito"
  Quando Coinzz envia webhook "pedido entregue"
  Então Flowzz envia mensagem WhatsApp para mim:
  "🎉 Cliente João Silva recebeu o produto!
  Valor: R$ 89,90
  Pagamento agendado: 15/10
  [Ver detalhes] [Enviar cobrança]"
  E notificação aparece no app
  E SMS enviado (se configurado)

Cenário: Limite de notificações atingido
  Dado que tenho plano Basic (50 notificações/mês)
  E já enviei 50 notificações este mês
  Quando novo cliente recebe produto
  Então não recebo notificação WhatsApp
  E vejo alerta no app: "Limite de notificações atingido"
  E vejo sugestão "Faça upgrade para Pro (200/mês)"

Critérios de Aceitação:
- [ ] Notificação enviada em < 30 segundos após webhook
- [ ] Respeita limites por plano (Basic:50, Pro:200, Premium:∞)
- [ ] Template de mensagem aprovado pelo WhatsApp
- [ ] Botões de ação rápida (enviar cobrança)
- [ ] Fallback: se WhatsApp falhar, envia email
- [ ] Contador de créditos visível no dashboard

Estimativa: 13 story points
Prioridade: 🟡 Alta
Dependências: Webhook Coinzz configurado
```

---

## 🎫 ÉPICA 6: Relatórios

### Story 6.1: Gerar Relatório de Vendas Mensal

```gherkin
Como afiliado (Carlos)
Quero gerar relatório completo de vendas do mês
Para enviar para meu contador e analisar resultados

Cenário: Gerar relatório padrão
  Dado que tenho vendas em Setembro/2025
  Quando acesso "Relatórios"
  E clico em "Gerar Relatório de Vendas"
  E seleciono período "Setembro 2025"
  E seleciono formato "PDF"
  E clico em "Gerar"
  Então vejo status "Gerando relatório..."
  E em até 30 segundos vejo "Relatório pronto!"
  E posso baixar PDF com:
  - Total de vendas: R$ 42.500
  - Ticket médio: R$ 89,00
  - Total de clientes: 478
  - Gráficos de vendas diárias
  - Lista detalhada de transações

Cenário: Gerar relatório customizado
  Dado que tenho plano Premium
  Quando crio "Relatório Custom"
  E seleciono campos: Nome cliente, Valor, Data, Status, ROI
  E aplico filtro "Status: Pago"
  E adiciono logo da minha empresa
  E gero em Excel
  Então recebo arquivo Excel com dados filtrados
  E posso salvar template para reusar

Cenário: Agendar geração automática
  Dado que quero relatório mensal todo dia 1
  Quando clico em "Agendar Relatório"
  E configuro "Todo dia 1 do mês, 8h"
  E adiciono email do contador
  Então relatório é gerado e enviado automaticamente
  E recebo cópia

Critérios de Aceitação:
- [ ] Formatos: PDF, Excel, CSV
- [ ] Geração assíncrona (não trava UI)
- [ ] Timeout de 5 minutos
- [ ] Inclui gráficos e tabelas
- [ ] Logo customizada (Premium)
- [ ] Envio automático por email
- [ ] Histórico de relatórios gerados

Estimativa: 13 story points
Prioridade: 🟢 Média
```

---

## 🎫 ÉPICA 7: Painel Admin

### Story 7.1: Dashboard Admin com Métricas SaaS

```gherkin
Como admin Flowzz (Ana)
Quero ver métricas globais da plataforma
Para monitorar saúde do negócio

Cenário: Visualizar dashboard admin
  Dado que sou admin autenticado
  Quando acesso "/admin/dashboard"
  Então vejo cards com métricas:
  - Total usuários: 247
  - Usuários ativos (30d): 198 (80%)
  - MRR: R$ 18.450
  - Churn rate: 4,2%
  - Novas assinaturas (mês): 23
  - Cancelamentos (mês): 5
  - Tickets abertos: 12
  E vejo gráfico de crescimento de usuários (12 meses)
  E vejo gráfico de receita mensal
  E vejo distribuição de planos (pizza)

Cenário: Drill-down em métrica
  Dado que vejo "Churn rate: 4,2%"
  Quando clico na métrica
  Então vejo lista de usuários que cancelaram
  E vejo motivos do cancelamento
  E posso filtrar por período

Critérios de Aceitação:
- [ ] Acesso restrito a role "admin"
- [ ] Métricas atualizadas a cada 1 hora
- [ ] Gráficos interativos
- [ ] Exportar métricas em CSV
- [ ] Comparação com mês anterior
- [ ] Alertas automáticos se churn > 7%

Estimativa: 13 story points
Prioridade: 🟢 Média (Release 2.5)
```

---

### Story 7.2: Gestão de Usuários - Suspender/Reativar

```gherkin
Como admin Flowzz (Ana)
Quero suspender usuário inadimplente
Para bloquear acesso até regularização

Cenário: Suspender usuário
  Dado que usuário "João Silva" está com pagamento atrasado
  Quando busco usuário no admin
  E clico em "Suspender conta"
  E confirmo ação
  Então status do usuário vira "Suspenso"
  E usuário não consegue mais fazer login
  E vejo mensagem de bloqueio ao tentar login
  E email automático enviado: "Sua conta foi suspensa"

Cenário: Reativar usuário após pagamento
  Dado que usuário estava suspenso
  E pagamento foi regularizado
  Quando clico em "Reativar conta"
  Então status volta para "Ativo"
  E usuário pode fazer login normalmente
  E email enviado: "Sua conta foi reativada"

Critérios de Aceitação:
- [ ] Suspensão bloqueia login imediatamente
- [ ] Dados do usuário não são deletados
- [ ] Integrações pausadas durante suspensão
- [ ] Histórico de suspensões registrado
- [ ] Email automático enviado
- [ ] Reativação restaura tudo como antes

Estimativa: 8 story points
Prioridade: 🟡 Alta (Release 2.5)
```

---

**Total Épicas:** 9  
**Total Stories:** 50+  
**Estimativa Total:** ~400 story points (~20-25 sprints de 2 semanas)

**Documento gerado em:** 1 de outubro de 2025  
**Versão:** 1.0
