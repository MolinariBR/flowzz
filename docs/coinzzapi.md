# Coinzz API — Campos e instruções de integração

Este documento descreve os campos enviados pela Coinzz em webhooks relacionados a pedidos (order) e clientes (client), assim como regras práticas de mapeamento e normalização para o receptor (Flowzz).

## Visão rápida

- Formato: HTTP POST com JSON.
- Envelope principal: { client: {...}, order: {...}, utms: {...} }.
- Atenção: alguns campos podem variar entre contas (ex.: `client_street` em vez de `client_address`).

---

## Cliente (client)

| Campo | Descrição | Tipo | Observações |
| --- | --- | ---: | --- |
| `client.client_name` | Nome completo do cliente | string | |
| `client.client_phone` | Telefone do cliente | string | Pode vir com `+55`, espaços ou parênteses — normalize para apenas dígitos |
| `client.client_documment` | CPF ou CNPJ | string | Pode vir formatado (ex.: `007.651.575-35`) — remover não-dígitos antes de usar em busca/uniqueness |
| `client.client_email` | Email do cliente | string or null | |
| `client.client_address` | Logradouro / rua | string | Alias observado: `client_street` — use como fallback |
| `client.client_zip_code` | CEP | string | Normalize para dígitos |
| `client.client_address_number` | Número do endereço | string | |
| `client.client_address_district` | Bairro | string | |
| `client.client_address_comp` | Complemento | string | Em outros exemplos aparece `client_address_complement` — aceite ambos |
| `client.client_address_city` | Cidade | string | |
| `client.client_address_state` | Estado | string | |
| `client.client_address_country` | País | string | Ex.: `BR` |

---

## Pedido (order)

| Campo | Descrição | Tipo | Observações |
| --- | --- | ---: | --- |
| `order.first_order` | Pedido primário | boolean | true/false |
| `order.second_order` | Pedido secundário | boolean | true/false |
| `order.date_order` | Data do pedido | string (`yyyy-mm-dd H:i:s`) | Converter para ISO Date se necessário |
| `order.deadline_delivery` | Prazo de entrega (dias) | integer | |
| `order.order_number` | Código do pedido | string | |
| `order.order_status` | Status do pedido | string | Liste como enum flexível — novos status podem aparecer |
| `order.shipping_status` | Status do envio | string | Veja também `tracking_code` |
| `order.tracking_code` | Código de rastreio | string | Pode ser null |
| `order.order_quantity` | Quantidade do item principal | integer | |
| `order.product_name` | Nome do produto | string | |
| `order.order_final_price` | Preço final do pedido | number | Pode vir como string (`"397.00"`) — use parseFloat seguro |
| `order.method_payment` | Forma de pagamento | string | Ex.: `Pix`, `Cartão`, `Venda pós-paga` |
| `order.total_installments` | Parcelas | integer | |
| `order.qrcode_pix` | Qrcode do Pix | string | Opcional |
| `order.url_pix` | URL do Pix | string | Opcional |
| `order.url_bank_slip` | URL do boleto | string | Opcional |
| `order.producer_name` | Nome do produtor (vendedor) | string | |
| `order.producer_email` | Email do produtor | string | Frequentemente usado para associar evento à integração — ver seção abaixo |
| `order.affiliate_name` | Nome do afiliado | string or null | |
| `order.affiliate_email` | Email do afiliado | string or null | |
| `order.affiliate_phone` | Telefone do afiliado | string or null | Normalize se presente |
| `order.terms_and_conditions_file_path` | Link para termo | string or null | |
| `order.agency_address` | Endereço da agência (retirada) | string or null | |
| `order.courier_name` | Nome do entregador | string or null | |
| `order.delivery_time` | Tempo estimado de entrega | string or null | |
| `order.deleted_at` | Data de exclusão do pedido | string (`yyyy-mm-dd H:i:s`) | Pode ser null |

---

## UTMs

Campos utm podem chegar nulos. Trate-os como opcionais:

| Campo | Descrição |
| --- | --- |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` | Informações de campanha (padrão UTM) — podem ser string ou null |

---

## Associação de webhooks / identificação da integração

Resumindo: o webhook não exige senha. Para que um evento seja atribuído automaticamente ao tenant/integration correto, o Flowzz precisa de um identificador.

- Se a integração foi criada enviando `producerEmail` (via `/integrations/coinzz/connect`), o `order.producer_email` presente nos webhooks deve corresponder a esse email para o matching funcionar.
- Alternativa mais robusta: identificar por `apiKey` ou por assinatura de webhook (se Coinzz suportar). Confirme com a equipe de backend qual método está ativo.

Se o `producer_email` não bater, o webhook ainda será recebido, mas não será associado — resultado comum: `salesProcessed: 0` após sync.

---

## Normalizações recomendadas (para o receptor)

- CPF/CNPJ: remover tudo exceto dígitos antes de comparar (ex.: `007.651.575-35` → `00765157535`).
- Telefone: remover espaços, parênteses e `+`, mantendo o DDI quando existir (ex.: `+55 74 999196196` → `5574999196196`).
- Preço: converter string para número (parseFloat) e substituir `,` por `.` quando necessário.
- Endereço: aceitar `client_street` como alias para `client_address` e aceitar `client_address_comp` ou `client_address_complement` como complemento.
- UTMs: aceitar `null` sem erro.

---

## Exemplo de payload (raw) — baseado em dados reais

```json
{
  "utms": {"utm_term": null, "utm_medium": null, "utm_source": null, "utm_content": null, "utm_campaign": null},
  "order": {
    "url_pix": null,
    "date_order": "2025-09-24 18:44:06",
    "deleted_at": null,
    "qrcode_pix": null,
    "first_order": true,
    "courier_name": null,
    "order_number": "ordmzlyy",
    "order_status": "Aguardando envio",
    "product_name": "Derma Natural",
    "second_order": false,
    "delivery_time": null,
    "producer_name": "Victor Henrique",
    "tracking_code": null,
    "url_bank_slip": null,
    "affiliate_name": "Talyta",
    "method_payment": "Venda pós-paga",
    "order_quantity": 5,
    "producer_email": "venettoinv092@gmail.com",
    "affiliate_email": "talytaaelide@gmail.com",
    "affiliate_phone": "71986022328",
    "shipping_status": "A enviar",
    "deadline_delivery": 2,
    "order_final_price": "397.00",
    "total_installments": 1,
    "terms_and_conditions_file_path": null
  },
  "client": {
    "client_name": "Zidinalva De Almeida Queiroz",
    "client_email": "suportedermanatural@gmail.com",
    "client_phone": "+55 74999196196",
    "client_street": "Povoado Italegre",
    "client_zip_code": "44620000",
    "client_documment": "007.651.575-35",
    "client_address_city": "Baixa Grande",
    "client_address_comp": "proximo ao psf",
    "client_address_state": "BA",
    "client_address_number": "27",
    "client_address_country": "BR",
    "client_address_district": "Baixa grande"
  },
  "Postack": "STATUS PAGAMENTO PLANILHA DN"
}
```

---

## Checklist rápido para quem vai configurar a integração

- [ ] Conectar a integração usando o token/apiKey fornecido pela Coinzz.
- [ ] Verificar se a associação é por `producerEmail` ou `apiKey` e ajustar a configuração conforme necessário.
- [ ] Testar com payloads reais (usar Postman/curl) e validar que clientes/vendas aparecem no tenant esperado.

---

Se quiser, eu me responsabilizo por gerar um trecho de código TypeScript (função de normalização) e um exemplo de curl para testes que você pode rodar localmente, sem alterar código em produção.

