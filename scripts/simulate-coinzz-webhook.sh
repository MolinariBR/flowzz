#!/bin/bash

##############################################
# Simula webhook REAL da Coinzz
# Envia para localhost:4000 (backend local)
# Usa dados baseados no producer_email real
##############################################

echo "🚀 Simulando webhook da Coinzz..."
echo "📧 Producer: venettoinv092@gmail.com"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:4000/webhooks/coinzz \
  -H "Content-Type: application/json" \
  -d '{
  "client": {
    "client_name": "João Silva",
    "client_phone": "+55 11 98765-4321",
    "client_documment": "123.456.789-00",
    "client_email": "joao@example.com",
    "client_address": "Rua das Flores",
    "client_zip_code": "01310100",
    "client_address_number": "123",
    "client_address_district": "Centro",
    "client_address_comp": "Apto 45",
    "client_address_city": "São Paulo",
    "client_address_state": "SP",
    "client_address_country": "BR"
  },
  "order": {
    "first_order": true,
    "second_order": false,
    "date_order": "2025-11-04 10:30:00",
    "deadline_delivery": 7,
    "order_number": "TESTE-'$(date +%s)'",
    "order_status": "Aprovada",
    "shipping_status": "Pendente",
    "tracking_code": null,
    "order_quantity": 1,
    "product_name": "Produto Teste Coinzz",
    "order_final_price": 197.00,
    "method_payment": "Pix",
    "total_installments": 1,
    "qrcode_pix": null,
    "url_pix": null,
    "url_bank_slip": null,
    "terms_and_conditions_file_path": null,
    "courier_name": null,
    "delivery_time": null,
    "producer_name": "Venetto",
    "producer_email": "venettoinv092@gmail.com",
    "affiliate_name": null,
    "affiliate_email": null,
    "affiliate_phone": null,
    "deleted_at": null
  },
  "utms": {
    "utm_source": "facebook",
    "utm_medium": "cpc",
    "utm_campaign": "teste",
    "utm_content": null,
    "utm_term": null
  }
}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "📥 Resposta HTTP: $HTTP_CODE"
echo "📄 Body: $BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Webhook enviado com sucesso!"
    echo ""
    echo "⏳ Aguardando 2 segundos para processar..."
    sleep 2
    echo ""
    echo "🔍 Verificando se os dados foram salvos..."
    echo ""
    
    # Verificar se salvou no banco
    cd /media/mau/D1/PROJETOS/flowzz/backend
    node << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { created_at: 'desc' },
      take: 1
    });
    
    const sales = await prisma.sale.findMany({
      orderBy: { created_at: 'desc' },
      take: 1
    });
    
    if (clients.length > 0) {
      console.log('✅ CLIENTE SALVO:');
      console.log('   Nome:', clients[0].name);
      console.log('   Email:', clients[0].email);
      console.log('   Criado:', clients[0].created_at);
    } else {
      console.log('❌ Nenhum cliente encontrado');
    }
    
    console.log('');
    
    if (sales.length > 0) {
      console.log('✅ VENDA SALVA:');
      console.log('   Produto:', sales[0].product_name);
      console.log('   Pedido:', sales[0].external_id);
      console.log('   Valor:', sales[0].total_price);
      console.log('   Status:', sales[0].status);
      console.log('   Criado:', sales[0].created_at);
    } else {
      console.log('❌ Nenhuma venda encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
EOF
else
    echo "❌ Erro ao enviar webhook! HTTP $HTTP_CODE"
fi
