import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📊 === CLIENTES SALVOS ===\n')

  const clients = await prisma.client.findMany({
    orderBy: { created_at: 'desc' },
    take: 10,
  })

  console.log(`Total: ${clients.length} clientes\n`)

  for (const client of clients) {
    console.log(`${client.name}`)
    console.log(`  📧 ${client.email || 'N/A'}`)
    console.log(`  📱 ${client.phone || 'N/A'}`)
    console.log(`  🏙️  ${client.city || 'N/A'}, ${client.state || 'N/A'}`)
    console.log(`  💰 R$ ${client.total_spent || 0} (${client.total_orders || 0} pedidos)`)
    console.log(`  📅 ${client.created_at?.toLocaleString('pt-BR') || 'N/A'}`)
    console.log()
  }

  console.log('\n💰 === VENDAS SALVAS ===\n')

  const sales = await prisma.sale.findMany({
    orderBy: { created_at: 'desc' },
    take: 10,
  })

  console.log(`Total: ${sales.length} vendas\n`)

  for (const sale of sales) {
    console.log(`${sale.product_name}`)
    console.log(`  📊 ID: ${sale.external_id}`)
    console.log(`  💵 R$ ${sale.sale_value || 0}`)
    console.log(`  📊 ${sale.status}`)
    console.log(`  📅 ${sale.created_at?.toLocaleString('pt-BR') || 'N/A'}`)
    console.log()
  }

  await prisma.$disconnect()
}

await main().catch((e: any) => {
  console.error(e)
  process.exit(1)
})
