#!/bin/bash

# Configurações da Coinzz
TOKEN="8747|FicLC2IcZVB7uoMvXBtUgxnNFanuhABVPTS98Bc88c5cb051"
PRODUCER="venettoinv092@gmail.com"
OUTPUT_DIR="coinzz-test-results"

# Criar diretório para resultados
mkdir -p "$OUTPUT_DIR"

echo "🔍 Testando API da Coinzz"
echo "Token: $TOKEN"
echo "Producer Email: $PRODUCER"
echo

# Array de URLs para testar
urls=(
  "https://api.coinzz.com.br/v1/customers"
  "https://api.coinzz.com.br/v1/sales"
  "https://api.coinzz.com/v1/customers"
  "https://api.coinzz.com/v1/sales"
  "https://app.coinzz.com.br/v1/customers"
  "https://app.coinzz.com.br/v1/sales"
)

# Testar cada URL
for url in "${urls[@]}"; do
  echo "📡 Testando: $url"
  
  filename=$(echo "$url" | sed 's|https://||g; s|/|-|g')
  output_file="$OUTPUT_DIR/response_$filename.json"
  
  # Fazer requisição com Bearer token
  response=$(curl -s -w "\n%{http_code}" "$url" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/json")
  
  # Extrair status code
  status=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')
  
  # Salvar resposta
  echo "$body" > "$output_file"
  
  echo "  Status: $status"
  
  if [ "$status" = "200" ]; then
    if jq -e . >/dev/null 2>&1 <<<"$body"; then
      echo "  ✅ JSON válido!"
      count=$(echo "$body" | jq '.data | length' 2>/dev/null || echo "?")
      echo "  📊 Registros: $count"
    else
      echo "  ⚠️ Resposta não é JSON"
    fi
  else
    echo "  ❌ Erro"
  fi
  
  echo
done

echo "✅ Teste concluído!"
echo "📁 Resultados salvos em: $OUTPUT_DIR/"
echo "🔧 Criando payload de teste..."
cat > $OUTPUT_DIR/webhook_payload.json << EOL
{
  "utms": {
    "utm_term": null,
    "utm_medium": null,
    "utm_source": null,
    "utm_content": null,
    "utm_campaign": null
  },
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
    "order_final_price": 397.00,
    "total_installments": 1,
    "terms_and_conditions_file_path": null
  },
  "client": {
    "client_name": "Zidinalva De Almeida Queiroz",
    "client_email": "suportedermanatural@gmail.com",
    "client_phone": "+55 74999196196",
    "client_address": "Povoado Italegre",
    "client_zip_code": "44620000",
    "client_documment": "007.651.575-35",
    "client_address_city": "Baixa Grande",
    "client_address_comp": "proximo ao psf",
    "client_address_state": "BA",
    "client_address_number": "27",
    "client_address_country": "BR",
    "client_address_district": "Baixa grande"
  }
}
EOL

echo "🔍 Testando webhook Coinzz"
echo "URL: $WEBHOOK_URL"
echo "Producer Email: $PRODUCER"
echo

echo "📡 Enviando webhook de teste..."
curl -v "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @$OUTPUT_DIR/webhook_payload.json

echo
echo "✅ Teste concluído!"
echo "📁 Payload usado salvo em: $OUTPUT_DIR/webhook_payload.json"