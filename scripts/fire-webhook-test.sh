#!/bin/bash

# Teste via ngrok URL
NGROK_URL="https://82c980903390.ngrok-free.app/webhooks/coinzz"

echo "🚀 Disparando teste de webhook via ngrok..."
echo "URL: $NGROK_URL"
echo

curl -X POST "$NGROK_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 8747|FicLC2IcZVB7uoMvXBtUgxnNFanuhABVPTS98Bc88c5cb051" \
  -d '{
  "client": {
    "client_name": "Zidinalva De Almeida Queiroz",
    "client_phone": "+55 74999196196",
    "client_documment": "007.651.575-35",
    "client_email": "suportedermanatural@gmail.com",
    "client_address": "Povoado Italegre",
    "client_zip_code": "44620000",
    "client_address_number": "27",
    "client_address_district": "Baixa grande",
    "client_address_comp": "proximo ao psf",
    "client_address_city": "Baixa Grande",
    "client_address_state": "BA",
    "client_address_country": "BR"
  },
  "order": {
    "order_number": "ordmzlyy",
    "order_status": "Aguardando envio",
    "product_name": "Derma Natural",
    "order_final_price": 397.00,
    "first_order": true,
    "second_order": false,
    "date_order": "2025-09-24 18:44:06",
    "deadline_delivery": 2,
    "shipping_status": "A enviar",
    "tracking_code": null,
    "order_quantity": 5,
    "method_payment": "Venda pós-paga",
    "total_installments": 1,
    "producer_name": "Victor Henrique",
    "producer_email": "venettoinv092@gmail.com",
    "affiliate_name": "Talyta",
    "affiliate_email": "talytaaelide@gmail.com",
    "affiliate_phone": "71986022328",
    "qrcode_pix": null,
    "url_pix": null,
    "url_bank_slip": null,
    "terms_and_conditions_file_path": null,
    "courier_name": null,
    "delivery_time": null,
    "deleted_at": null
  },
  "utms": {
    "utm_source": null,
    "utm_medium": null,
    "utm_campaign": null,
    "utm_content": null,
    "utm_term": null
  }
}'

echo
echo "✅ Teste disparado!"