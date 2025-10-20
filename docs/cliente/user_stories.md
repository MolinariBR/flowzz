# 📖 User Stories - Flowzz Platform

## 📖 USER STORIES (Gherkin Format)

### 🎫 EPIC 1: Dashboard e Visão Geral

**Story 1.1: Ver resumo diário consolidado**
```gherkin
Como afiliado
Quero ver um resumo diário consolidado de vendas, gastos com anúncios e outras despesas
Para entender rapidamente meu desempenho financeiro

Cenário: Acesso ao dashboard matinal
Dado que estou logado na plataforma
Quando abro o dashboard principal
Então vejo vendas do dia, gastos com anúncios e lucro líquido
E posso comparar com o dia anterior

Cenário: Dados atualizados em tempo real
Dado que novas vendas ocorrem
Quando atualizo o dashboard
Então os dados são sincronizados automaticamente das APIs integradas

Critérios de Aceitação:
- [ ] Dashboard carrega em <3 segundos
- [ ] Dados sincronizados a cada 1 hora
- [ ] Interface responsiva em mobile

Estimativa: 5 story points
Prioridade: Alta
```

**Story 1.2: Visualizar lucro líquido real**
```gherkin
Como afiliado
Quero visualizar o lucro líquido real, considerando inadimplências e disponibilidade de dinheiro
Para tomar decisões informadas sobre investimentos

Cenário: Cálculo automático de lucro
Dado que tenho vendas e custos registrados
Quando visualizo o dashboard
Então vejo lucro real subtraindo inadimplências e considerando disponibilidade

Cenário: Ajuste por dívidas no cartão
Dado que tenho dívidas no cartão de crédito
Quando o sistema calcula lucro
Então deduz o valor indisponível até o vencimento da fatura

Critérios de Aceitação:
- [ ] Cálculo considera todas as variáveis financeiras
- [ ] Dados atualizados diariamente
- [ ] Explicação clara dos fatores no tooltip

Estimativa: 8 story points
Prioridade: Alta
```

**Story 1.3: Acessar métricas dos últimos 30 dias**
```gherkin
Como afiliado
Quero acessar métricas dos últimos 30 dias automaticamente
Para acompanhar tendências de longo prazo

Cenário: Dashboard automático mensal
Dado que estou no módulo de dashboard
Quando seleciono período de 30 dias
Então vejo gráficos de vendas, custos e ROI sem filtros manuais

Cenário: Comparação com período anterior
Dado que visualizo métricas mensais
Quando habilito comparação
Então vejo variação percentual vs. mês anterior

Critérios de Aceitação:
- [ ] Dados agregados automaticamente
- [ ] Gráficos interativos
- [ ] Exportação para PDF/Excel

Estimativa: 5 story points
Prioridade: Média
```

**Story 1.4: Receber alertas para pagamentos próximos**
```gherkin
Como afiliado
Quero receber alertas visuais para pagamentos próximos (24h e 7 dias)
Para me preparar financeiramente

Cenário: Notificação de pagamentos em 24h
Dado que tenho pagamentos agendados para amanhã
Quando faço login
Então vejo banner de alerta no dashboard

Cenário: Calendário com alertas
Dado que acesso o calendário financeiro
Quando visualizo próximos 7 dias
Então pagamentos são destacados com cores por urgência

Critérios de Aceitação:
- [ ] Alertas visuais e por email/WhatsApp
- [ ] Configuração de lembretes personalizáveis
- [ ] Não spam (máximo 2 alertas/dia)

Estimativa: 3 story points
Prioridade: Alta
```

### 🎫 EPIC 2: Gestão de Clientes

**Story 2.1: Etiquetar clientes customizáveis**
```gherkin
Como afiliado
Quero etiquetar clientes com categorias customizáveis
Para organizar e priorizar minha base de clientes

Cenário: Aplicar etiqueta a cliente
Dado que estou na lista de clientes
Quando seleciono um cliente e aplico etiqueta "VIP"
Então a etiqueta aparece na ficha do cliente

Cenário: Filtros por etiqueta
Dado que tenho clientes etiquetados
Quando filtro por "Agendado 10/09"
Então vejo apenas clientes com essa etiqueta

Critérios de Aceitação:
- [ ] Criação ilimitada de etiquetas
- [ ] Busca e filtros avançados
- [ ] Sincronização com dados de entrega

Estimativa: 5 story points
Prioridade: Alta
```

**Story 2.2: Ver histórico completo de compras**
```gherkin
Como afiliado
Quero ver o histórico completo de compras de cada cliente
Para personalizar meu atendimento

Cenário: Acesso ao perfil do cliente
Dado que seleciono um cliente
Quando abro sua ficha
Então vejo todas as compras com datas, valores e status

Cenário: Integração com Logzz
Dado que o cliente recebeu entrega
Quando o status é atualizado
Então o histórico reflete automaticamente

Critérios de Aceitação:
- [ ] Dados integrados de Coinzz e Logzz
- [ ] Histórico cronológico
- [ ] Exportação de relatório por cliente

Estimativa: 5 story points
Prioridade: Média
```

**Story 2.3: Diferenciar inadimplentes reais**
```gherkin
Como afiliado
Quero diferenciar automaticamente entre inadimplentes reais e pagamentos agendados
Para focar esforços de cobrança nos casos certos

Cenário: Etiqueta automática
Dado que um pagamento está atrasado
Quando o sistema classifica
Então aplica "Inadimplente Real" ou "Agendado" baseado na data

Cenário: Dashboard separado
Dado que visualizo clientes
Quando filtro por status
Então vejo seções distintas para cada tipo

Critérios de Aceitação:
- [ ] Lógica automática baseada em regras
- [ ] Possibilidade de override manual
- [ ] Relatórios de inadimplência

Estimativa: 8 story points
Prioridade: Alta
```

### 🎫 EPIC 3: Integrações e Sincronização

**Story 3.1: Conectar conta Coinzz**
```gherkin
Como afiliado
Quero conectar minha conta Coinzz automaticamente
Para sincronizar vendas, comissões e dados de clientes

Cenário: Configuração de integração
Dado que estou na página de integrações
Quando insiro credenciais Coinzz
Então a conexão é estabelecida e dados sincronizam

Cenário: Sincronização em tempo real
Dado que uma nova venda ocorre na Coinzz
Quando o webhook é disparado
Então os dados aparecem no dashboard em <5 minutos

Critérios de Aceitação:
- [ ] Autenticação segura via OAuth
- [ ] Sincronização bidirecional
- [ ] Logs de erros visíveis

Estimativa: 13 story points
Prioridade: Crítica
```

**Story 3.2: Integrar Facebook Ads**
```gherkin
Como afiliado
Quero integrar meus dados do Facebook Ads
Para visualizar gastos e performance no mesmo dashboard

Cenário: Conexão com Facebook
Dado que autorizo acesso
Quando conecto conta de anúncios
Então gastos diários são importados automaticamente

Cenário: Métricas em tempo real
Dado que uma campanha roda
Quando visualizo dashboard
Então vejo impressões, cliques e CPC atualizados

Critérios de Aceitação:
- [ ] Suporte a múltiplas contas de anúncios
- [ ] Cache para evitar rate limits
- [ ] Alertas de desconexão

Estimativa: 13 story points
Prioridade: Crítica
```

**Story 3.3: Receber notificações WhatsApp**
```gherkin
Como afiliado
Quero receber notificações via WhatsApp quando cliente recebe produto
Para iniciar cobrança proativamente

Cenário: Notificação automática
Dado que cliente recebe entrega via Logzz
Quando webhook é recebido
Então WhatsApp é enviado com dados do cliente

Cenário: Template personalizado
Dado que configuro template
Quando notificação é enviada
Então usa mensagem customizada com nome e valor

Critérios de Aceitação:
- [ ] Templates pré-aprovados pelo WhatsApp
- [ ] Controle de custos por plano
- [ ] Logs de envio

Estimativa: 8 story points
Prioridade: Alta
```

### 🎫 EPIC 4: Projeções e Análises

**Story 4.1: Ver projeções de lucro**
```gherkin
Como afiliado
Quero ver projeções de lucro baseadas em vendas confirmadas
Para planejar metas mensais

Cenário: Projeção automática
Dado que tenho histórico de vendas
Quando acesso aba projeções
Então vejo estimativa mensal baseada em tendências

Cenário: Cenário pessimista/otimista
Dado que ajusto variáveis
Quando seleciono cenário
Então projeção recalcula automaticamente

Critérios de Aceitação:
- [ ] Algoritmo baseado em machine learning simples
- [ ] Ajustes manuais possíveis
- [ ] Comparação com metas definidas

Estimativa: 8 story points
Prioridade: Média
```

**Story 4.2: Analisar ROI por campanha**
```gherkin
Como afiliado
Quero analisar tendências de crescimento e ROI por campanha
Para otimizar investimentos em anúncios

Cenário: Relatório de ROI
Dado que tenho dados de Facebook Ads e vendas
Quando visualizo campanha específica
Então vejo ROI calculado automaticamente

Cenário: Tendências de crescimento
Dado que acesso gráficos
Quando seleciono período
Então vejo linha de tendência com projeções

Critérios de Aceitação:
- [ ] Cálculo preciso de ROI (vendas - custos)/custos
- [ ] Gráficos interativos
- [ ] Filtros por campanha e período

Estimativa: 5 story points
Prioridade: Média
```

### 🎫 EPIC 5: Pagamentos e Assinaturas

**Story 5.1: Gerenciar assinatura mensal**
```gherkin
Como afiliado
Quero gerenciar minha assinatura mensal com opções de cartão, PIX ou boleto
Para flexibilidade de pagamento

Cenário: Alterar método de pagamento
Dado que estou no perfil
Quando seleciono novo método
Então PagBank processa mudança automaticamente

Cenário: Upgrade de plano
Dado que quero mudar para Premium
Quando confirmo upgrade
Então cobrança proporcional é aplicada

Critérios de Aceitação:
- [ ] Suporte a cartão, PIX e boleto
- [ ] Webhooks para confirmação
- [ ] Histórico de pagamentos visível

Estimativa: 8 story points
Prioridade: Alta
```

**Story 5.2: Testar trial gratuito**
```gherkin
Como afiliado
Quero testar a plataforma gratuitamente por 7 dias
Para validar se atende minhas necessidades

Cenário: Início do trial
Dado que me cadastro
Quando insiro dados de cartão
Então trial inicia sem cobrança imediata

Cenário: Conversão automática
Dado que trial expira
Quando não cancelo
Então primeira cobrança mensal é processada

Critérios de Aceitação:
- [ ] Trial de 7 dias exato
- [ ] Lembretes de expiração
- [ ] Cancelamento fácil a qualquer momento

Estimativa: 3 story points
Prioridade: Crítica
```

### 🎫 EPIC 6: Suporte e Usabilidade

**Story 6.1: Acessar tutoriais e FAQ**
```gherkin
Como afiliado
Quero acessar tutoriais em vídeo e FAQ dentro da plataforma
Para configurar integrações sem dificuldades

Cenário: Centro de ajuda
Dado que clico em "Ajuda"
Quando busco por "integração Coinzz"
Então vejo vídeo tutorial e artigo detalhado

Cenário: FAQ inteligente
Dado que digito pergunta
Quando o sistema sugere
Então mostra resposta relevante

Critérios de Aceitação:
- [ ] Biblioteca completa de tutoriais
- [ ] Busca por palavra-chave
- [ ] Vídeos embedados

Estimativa: 3 story points
Prioridade: Baixa
```

**Story 6.2: Interface intuitiva**
```gherkin
Como afiliado
Quero uma interface intuitiva similar ao Facebook Ads Manager
Para navegar facilmente entre módulos

Cenário: Navegação fluida
Dado que estou no dashboard
Quando clico em "Clientes"
Então transito suavemente sem reload

Cenário: Design responsivo
Dado que acesso via mobile
Quando navego módulos
Então interface se adapta perfeitamente

Critérios de Aceitação:
- [ ] Similaridade com Ads Manager
- [ ] Carregamento rápido (<2s)
- [ ] Acessibilidade WCAG 2.1

Estimativa: 5 story points
Prioridade: Média
```

**Story 6.3: Suporte por chat**
```gherkin
Como afiliado
Quero suporte por chat durante horário comercial
Para resolver dúvidas rapidamente

Cenário: Iniciar chat
Dado que clico em "Suporte"
Quando digito mensagem
Então recebo resposta em <5 minutos

Cenário: Horário comercial
Dado que é fora do expediente
Quando tento chat
Então vejo mensagem com horário de atendimento

Critérios de Aceitação:
- [ ] Chat em tempo real
- [ ] SLA de resposta <2h
- [ ] Histórico de conversas

Estimativa: 5 story points
Prioridade: Baixa
```

---

## 📊 Critérios Gerais de Aceitação
Cada user story será validada com:
- Funcionalidade implementada e testada.
- Interface amigável e responsiva.
- Integração com APIs externas funcionando.
- Feedback do usuário em testes beta.

Estas user stories formam a base funcional da Flowzz. Elas podem ser priorizadas e refinadas com base no feedback do cliente durante a validação.