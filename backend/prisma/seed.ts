import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed do banco de dados
 * Cria usuários demo e admin para testes
 */
async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Hash das senhas
  const demoPasswordHash = await bcrypt.hash('Demo@123', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

  // Criar ou atualizar usuário demo
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@flowzz.com.br' },
    update: {
      password_hash: demoPasswordHash,
      nome: 'Usuário Demo',
      role: 'USER',
      is_active: true,
      subscription_status: 'ACTIVE',
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
    },
    create: {
      email: 'demo@flowzz.com.br',
      password_hash: demoPasswordHash,
      nome: 'Usuário Demo',
      role: 'USER',
      is_active: true,
      subscription_status: 'ACTIVE',
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
    },
  });

  console.log(`✅ Usuário demo criado: ${demoUser.email}`);

  // Criar ou atualizar usuário admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@flowzz.com.br' },
    update: {
      password_hash: adminPasswordHash,
      nome: 'Administrador',
      role: 'ADMIN',
      is_active: true,
      subscription_status: 'ACTIVE',
    },
    create: {
      email: 'admin@flowzz.com.br',
      password_hash: adminPasswordHash,
      nome: 'Administrador',
      role: 'ADMIN',
      is_active: true,
      subscription_status: 'ACTIVE',
    },
  });

  console.log(`✅ Usuário admin criado: ${adminUser.email}`);

  // Criar alguns clientes de exemplo para o usuário demo
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { 
        user_id_email: {
          user_id: demoUser.id,
          email: 'cliente1@example.com'
        }
      },
      update: {},
      create: {
        user_id: demoUser.id,
        name: 'João Silva',
        email: 'cliente1@example.com',
        phone: '+55 11 98888-1111',
        cpf: '123.456.789-01',
        status: 'ACTIVE',
        total_spent: 1500.00,
        total_orders: 3,
      },
    }),
    prisma.client.upsert({
      where: {
        user_id_email: {
          user_id: demoUser.id,
          email: 'cliente2@example.com'
        }
      },
      update: {},
      create: {
        user_id: demoUser.id,
        name: 'Maria Santos',
        email: 'cliente2@example.com',
        phone: '+55 11 98888-2222',
        status: 'ACTIVE',
        total_spent: 2500.00,
        total_orders: 5,
      },
    }),
  ]);

  console.log(`✅ ${clients.length} clientes de exemplo criados`);

  // Criar algumas vendas de exemplo
  const sales = await Promise.all([
    prisma.sale.create({
      data: {
        user_id: demoUser.id,
        client_id: clients[0].id,
        external_id: 'sale_demo_1',
        product_name: 'Produto Demo 1',
        unit_price: 500.00,
        total_price: 500.00,
        status: 'PAID',
        payment_method: 'PIX',
        payment_date: new Date(),
      },
    }),
    prisma.sale.create({
      data: {
        user_id: demoUser.id,
        client_id: clients[1].id,
        external_id: 'sale_demo_2',
        product_name: 'Produto Demo 2',
        unit_price: 1000.00,
        total_price: 1000.00,
        status: 'PAID',
        payment_method: 'CREDIT_CARD',
        payment_date: new Date(),
      },
    }),
  ]);

  console.log(`✅ ${sales.length} vendas de exemplo criadas`);

  // Criar algumas atividades
  const activities = await prisma.activity.createMany({
    data: [
      {
        user_id: demoUser.id,
        action: 'login',
        entity_type: 'user',
        entity_id: demoUser.id,
      },
      {
        user_id: demoUser.id,
        action: 'create_client',
        entity_type: 'client',
        entity_id: clients[0].id,
      },
      {
        user_id: demoUser.id,
        action: 'create_sale',
        entity_type: 'sale',
        entity_id: sales[0].id,
      },
    ],
  });

  console.log(`✅ ${activities.count} atividades criadas`);

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Credenciais criadas:');
  console.log('   Demo: demo@flowzz.com.br / Demo@123');
  console.log('   Admin: admin@flowzz.com.br / Admin@123');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
