#!/bin/bash

echo "🔍 Consultando dados salvos no banco de dados..."
echo

# Ir para a pasta backend
cd backend

# Executar query via Prisma
npx prisma db execute --stdin <<EOF
SELECT 
  id, 
  name, 
  email, 
  phone, 
  city, 
  state,
  created_at
FROM "Client" 
ORDER BY created_at DESC 
LIMIT 10;
EOF

echo
echo "---"
echo

# Também tentar via prisma studio ou raw query
npx prisma client < <(cat <<EOF
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clients = await prisma.client.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(clients, null, 2));
  await prisma.\$disconnect();
}

main();
EOF
)