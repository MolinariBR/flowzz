Aqui está a documentação reorganizada em um formato **mais limpo, padronizado e de fácil consulta**. Mantive todos os detalhes técnicos, mas reestruturei a hierarquia e os exemplos para melhorar a legibilidade:

---

# 🔗 Documentação dos Webhooks — **Coinzz Platform**

## 📋 Visão Geral

Os webhooks permitem que sistemas externos recebam notificações em tempo real sobre eventos da plataforma Coinzz, como **pedidos, solicitações de afiliação e assinaturas recorrentes**.
Todos os webhooks seguem o padrão **HTTP POST com payload JSON**.

---

## 🛒 Webhook de Pedidos

### Estrutura dos Dados

Envia informações completas sobre transações realizadas na plataforma.

#### Parâmetros

| Categoria   | Parâmetro                        | Descrição                          | Formato            |
| ----------- | -------------------------------- | ---------------------------------- | ------------------ |
| **Cliente** | `client_name`                    | Nome completo do cliente           | String             |
|             | `client_phone`                   | Telefone do cliente                | String             |
|             | `client_documment`               | Documento do cliente (CPF ou CNPJ) | String             |
|             | `client_email`                   | Email do cliente                   | String ou null     |
|             | `client_address`                 | Rua do cliente                     | String             |
|             | `client_zip_code`                | CEP do cliente                     | String             |
|             | `client_address_number`          | Número do endereço                 | String             |
|             | `client_address_district`        | Bairro                             | String             |
|             | `client_address_comp`            | Complemento                        | String             |
|             | `client_address_city`            | Cidade                             | String             |
|             | `client_address_state`           | Estado                             | String             |
|             | `client_address_country`         | País                               | String             |
| **Pedido**  | `first_order`                    | Indica se é um pedido primário     | Boolean            |
|             | `second_order`                   | Indica se é um pedido secundário   | Boolean            |
|             | `date_order`                     | Data do pedido                     | `yyyy-mm-dd H:i:s` |
|             | `deadline_delivery`              | Prazo de entrega                   | Integer            |
|             | `order_number`                   | Código do pedido                   | String             |
|             | `order_status`                   | Status do pedido                   | String             |
|             | `shipping_status`                | Status do envio                    | String             |
|             | `tracking_code`                  | Código de rastreio                 | String             |
|             | `order_quantity`                 | Quantidade de itens                | Integer            |
|             | `product_name`                   | Nome do produto                    | String             |
|             | `order_final_price`              | Preço total                        | Float              |
|             | `method_payment`                 | Forma de pagamento                 | String             |
|             | `total_installments`             | Quantidade de parcelas             | Integer            |
|             | `qrcode_pix`                     | Qrcode do Pix                      | String             |
|             | `url_pix`                        | URL do Pix                         | String             |
|             | `url_bank_slip`                  | URL do boleto                      | String             |
|             | `producer_name`                  | Nome do produtor                   | String             |
|             | `producer_email`                 | Email do produtor                  | String             |
|             | `affiliate_name`                 | Nome do afiliado                   | String ou null     |
|             | `affiliate_email`                | Email do afiliado                  | String ou null     |
|             | `affiliate_phone`                | Telefone do afiliado               | String ou null     |
|             | `terms_and_conditions_file_path` | Termo de compromisso               | String ou null     |
|             | `courier_name`                   | Nome do entregador                 | String ou null     |
|             | `delivery_time`                  | Tempo estimado de entrega          | String ou null     |
|             | `deleted_at`                     | Data de exclusão                   | `yyyy-mm-dd H:i:s` |
| **UTMs**    | `utm_source`                     | Origem da campanha                 | String             |
|             | `utm_medium`                     | Mídia da campanha                  | String             |
|             | `utm_campaign`                   | Nome da campanha                   | String             |
|             | `utm_content`                    | Conteúdo                           | String             |
|             | `utm_term`                       | Termo                              | String             |

#### Exemplo de Payload

```json
{
  "client": {
    "client_name": "Felipe Santana",
    "client_email": "cliente@example.com",
    "client_documment": "62972194004",
    "client_phone": "62954544554",
    "client_zip_code": "12345678",
    "client_address": "Rua Exemplo",
    "client_address_number": "123",
    "client_address_district": "Bairro Exemplo",
    "client_address_comp": "Apartamento 456",
    "client_address_city": "Cidade Exemplo",
    "client_address_state": "Estado Exemplo",
    "client_address_country": "BR"
  },
  "order": {
    "first_order": true,
    "second_order": false,
    "date_order": "2023-12-06 14:30:00",
    "deadline_delivery": 7,
    "order_number": "ORD123456",
    "order_status": "Aprovada",
    "shipping_status": "Enviado",
    "tracking_code": "123456789",
    "order_quantity": 5,
    "product_name": "Garrafa Térmica",
    "order_final_price": 150.99,
    "method_payment": "Pix",
    "total_installments": 1,
    "qrcode_pix": "00020BR.GOV.BCB.PIX0114...",
    "url_pix": "00020BR.GOV.BCB.PIX0114...",
    "url_bank_slip": "https://boleto.exemplo.com/ord123456",
    "terms_and_conditions_file_path": "https://documento.coinzz.com.br/termo/ordxxxxx",
    "courier_name": "João da Silva",
    "delivery_time": "15:55:00",
    "producer_name": "Maria Silva",
    "producer_email": "maria@produtor.com",
    "affiliate_name": "José Pereira",
    "affiliate_email": "jose@afiliado.com",
    "affiliate_phone": "5489932313",
    "deleted_at": "2023-12-06 17:30:00"
  },
  "utms": {
    "utm_source": "facebook",
    "utm_medium": "cpc",
    "utm_campaign": "blackfriday",
    "utm_content": "banner1",
    "utm_term": "termo1"
  }
}
```

---

## 🤝 Webhook de Solicitações de Afiliação

### Estrutura dos Dados

Envia notificações sobre novas solicitações de afiliação.

| Parâmetro           | Descrição                 | Formato |
| ------------------- | ------------------------- | ------- |
| `affiliate_name`    | Nome completo do afiliado | String  |
| `affiliate_email`   | Email do afiliado         | String  |
| `affiliate_phone`   | Telefone do afiliado      | String  |
| `affiliate_request` | Solicitação do afiliado   | String  |
| `product_name`      | Nome do produto           | String  |
| `date`              | Data do postback          | String  |

#### Exemplo de Payload

```json
{
  "affiliate_name": "Felipe Santana",
  "affiliate_email": "afiliado@email.com",
  "affiliate_phone": "62954544554",
  "affiliate_request": "Pendente",
  "product_name": "Produto Exemplo",
  "date": "2025-05-02 18:11:48"
}
```

---

## 🔄 Webhook de Assinaturas

### Estrutura dos Dados

Notificações sobre assinaturas recorrentes e ciclos de cobrança.

| Categoria      | Parâmetro                   | Descrição                | Formato            |
| -------------- | --------------------------- | ------------------------ | ------------------ |
| **Assinatura** | `subscription_hash`         | ID da assinatura         | String             |
|                | `status`                    | Status da assinatura     | String             |
|                | `frequency`                 | Frequência               | String             |
|                | `cycle`                     | Ciclo atual              | String             |
|                | `next_charge_date`          | Data da próxima cobrança | String             |
| **Cliente**    | `client_name`               | Nome completo            | String             |
|                | `client_phone`              | Telefone                 | String             |
|                | `client_documment`          | CPF/CNPJ                 | String             |
|                | `client_email`              | Email                    | String ou null     |
|                | `client_address`            | Rua                      | String             |
|                | `client_zip_code`           | CEP                      | String             |
|                | `client_address_number`     | Número                   | String             |
|                | `client_address_district`   | Bairro                   | String             |
|                | `client_address_complement` | Complemento              | String             |
|                | `client_address_city`       | Cidade                   | String             |
|                | `client_address_state`      | Estado                   | String             |
|                | `client_address_country`    | País                     | String             |
| **Pedido**     | `date_order`                | Data do pedido           | `yyyy-mm-dd H:i:s` |
|                | `order_number`              | Código do pedido         | String             |
|                | `order_status`              | Status do pedido         | String             |
|                | `shipping_status`           | Status do envio          | String             |
|                | `tracking_code`             | Código de rastreio       | String             |
|                | `order_quantity`            | Quantidade de itens      | Integer            |
|                | `product_name`              | Nome do produto          | String             |
|                | `order_final_price`         | Preço total              | Float              |
|                | `method_payment`            | Forma de pagamento       | String             |
|                | `total_installments`        | Parcelas                 | Integer            |
|                | `producer_name`             | Nome do produtor         | String             |
|                | `producer_email`            | Email do produtor        | String             |
|                | `affiliate_name`            | Nome do afiliado         | String ou null     |
|                | `affiliate_email`           | Email do afiliado        | String ou null     |
|                | `affiliate_phone`           | Telefone do afiliado     | String ou null     |
|                | `courier_name`              | Nome do entregador       | String ou null     |
|                | `delivery_time`             | Tempo estimado           | String ou null     |
|                | `deleted_at`                | Data de exclusão         | `yyyy-mm-dd H:i:s` |
| **UTMs**       | `utm_source`                | Origem da campanha       | String ou null     |
|                | `utm_medium`                | Mídia                    | String ou null     |
|                | `utm_campaign`              | Nome da campanha         | String ou null     |
|                | `utm_content`               | Conteúdo                 | String ou null     |
|                | `utm_term`                  | Termo                    | String ou null     |
| **Gerais**     | `date_sent`                 | Data do postback         | String             |
|                | `name_sent`                 | Nome do disparo          | String             |

#### Exemplo de Payload

```json
{
  "subscription": {
    "subscription_hash": "ass123456",
    "status": "ativa",
    "frequency": "Mensal",
    "cycle": "1",
    "next_charge_date": "2025-05-02 18:11:48"
  },
  "client": {
    "client_name": "Felipe Santana",
    "client_phone": "62954544554",
    "client_documment": "62972194004",
    "client_email": "cliente@example.com",
    "client_address": "Rua Exemplo",
    "client_zip_code": "12345678",
    "client_address_number": "123",
    "client_address_district": "Bairro Exemplo",
    "client_address_complement": "Apartamento 456",
    "client_address_city": "Cidade Exemplo",
    "client_address_state": "Estado Exemplo",
    "client_address_country": "BR"
  },
  "order": {
    "date_order": "2023-12-06 14:30:00",
    "order_number": "ORD123456",
    "order_status": "Aprovada",
    "shipping_status": "Enviado",
    "tracking_code": "1234567890",
    "order_quantity": 5,
    "product_name": "Garrafa Térmica",
    "order_final_price": 150.99,
    "method_payment": "Pix",
    "total_installments": 1,
    "producer_name": "Maria Silva",
    "producer_email": "maria@produtor.com",
    "affiliate_name": "José Pereira",
    "affiliate_email": "jose@afiliado.com",
    "affiliate_phone": "5489932313",
    "courier_name": "João da Silva",
    "delivery_time": "15:55:00",
    "deleted_at": "2023-12-06 14:30:00"
  },
  "utms": {
    "utm_source": "facebook",
    "utm_medium": "cpc",
    "utm_campaign": "blackfriday",
    "utm_content": "banner",
    "utm_term": "termo"
  },
  "general_info": {
    "date_sent": "2025-05-02 18:11:48",
    "name_sent": "Webhook de Teste"
  }
}
```

---

## 📚 Notas Técnicas

* Todos os webhooks são enviados via **HTTP POST**
* Payloads no formato **JSON**
* Recomenda-se implementar **validação de assinatura** para segurança
* Em caso de falha no recebimento, a Coinzz realiza **tentativas de reenvio**

---

👉 Documento estruturado para **facilitar integração rápida e segura** com os webhooks da Coinzz.

---

Quer que eu prepare essa documentação também em **formato OpenAPI/Swagger (YAML/JSON)** para facilitar testes diretos em ferramentas como Postman e Insomnia?
