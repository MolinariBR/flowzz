/**
 * Database seed file for development environment
 * Referência: implement.md §Development Setup, plan.md §Sample Data
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning development database...');

    await prisma.activity.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.report.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.ad.deleteMany();
    await prisma.integration.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.clientTag.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.client.deleteMany();
    await prisma.user.deleteMany();
    await prisma.plan.deleteMany();
  }

  // Create subscription plans
  console.log('📋 Creating subscription plans...');

  const basicPlan = await prisma.plan.create({
    data: {
      name: 'Básico',
      description: 'Plano ideal para iniciantes',
      price: 29.90,
      interval: 'month',
      features: {
        max_clients: 100,
        max_integrations: 2,
        reports: ['basic'],
        support: 'email',
      },
      limits: {
        api_calls_per_day: 1000,
        storage_gb: 1,
      },
    },
  });

  const proPlan = await prisma.plan.create({
    data: {
      name: 'Profissional',
      description: 'Plano completo para profissionais',
      price: 79.90,
      interval: 'month',
      features: {
        max_clients: 1000,
        max_integrations: 5,
        reports: ['basic', 'advanced', 'custom'],
        support: 'priority',
      },
      limits: {
        api_calls_per_day: 10000,
        storage_gb: 10,
      },
    },
  });

  // Create demo user
  console.log('👤 Creating demo user...');

  const passwordHash = await bcrypt.hash('demo123456', 12);

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@flowzz.com.br',
      password_hash: passwordHash,
      nome: 'Usuario Demo',
      role: 'USER',
      subscription_status: 'TRIAL',
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      plan_id: basicPlan.id,
    },
  });

  // Create admin user
  console.log('🔧 Creating admin user...');

  const adminPasswordHash = await bcrypt.hash('admin123456', 12);

  await prisma.user.create({
    data: {
      email: 'admin@flowzz.com.br',
      password_hash: adminPasswordHash,
      nome: 'Administrador',
      role: 'ADMIN',
      subscription_status: 'ACTIVE',
      plan_id: proPlan.id,
    },
  });

  // Create sample clients for demo user
  console.log('👥 Creating sample clients...');

  const clients = await Promise.all([
    prisma.client.create({
      data: {
        user_id: demoUser.id,
        name: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '(11) 99999-1234',
        cpf: '123.456.789-00',
        city: 'São Paulo',
        state: 'SP',
        status: 'ACTIVE',
        total_spent: 1250.50,
        total_orders: 3,
      },
    }),
    prisma.client.create({
      data: {
        user_id: demoUser.id,
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        phone: '(21) 98888-5678',
        cpf: '987.654.321-00',
        city: 'Rio de Janeiro',
        state: 'RJ',
        status: 'ACTIVE',
        total_spent: 890.30,
        total_orders: 2,
      },
    }),
    prisma.client.create({
      data: {
        user_id: demoUser.id,
        name: 'Pedro Oliveira',
        email: 'pedro.oliveira@email.com',
        phone: '(31) 97777-9012',
        city: 'Belo Horizonte',
        state: 'MG',
        status: 'INACTIVE',
        total_spent: 0,
        total_orders: 0,
      },
    }),
  ]);

  // Create sample tags
  console.log('🏷️ Creating sample tags...');

  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        user_id: demoUser.id,
        name: 'VIP',
        color: '#FFD700',
      },
    }),
    prisma.tag.create({
      data: {
        user_id: demoUser.id,
        name: 'Frequente',
        color: '#32CD32',
      },
    }),
    prisma.tag.create({
      data: {
        user_id: demoUser.id,
        name: 'Inativo',
        color: '#FF6347',
      },
    }),
  ]);

  // Associate tags with clients
  await Promise.all([
    prisma.clientTag.create({
      data: {
        client_id: clients[0].id,
        tag_id: tags[0].id, // João Silva - VIP
      },
    }),
    prisma.clientTag.create({
      data: {
        client_id: clients[1].id,
        tag_id: tags[1].id, // Maria Santos - Frequente
      },
    }),
    prisma.clientTag.create({
      data: {
        client_id: clients[2].id,
        tag_id: tags[2].id, // Pedro Oliveira - Inativo
      },
    }),
  ]);

  // Create sample sales
  console.log('💰 Creating sample sales...');

  await Promise.all([
    prisma.sale.create({
      data: {
        user_id: demoUser.id,
        client_id: clients[0].id,
        product_name: 'Curso de Marketing Digital',
        product_sku: 'CMD-001',
        quantity: 1,
        unit_price: 497.00,
        total_price: 497.00,
        commission: 149.10,
        status: 'DELIVERED',
        payment_method: 'PIX',
        payment_date: new Date('2024-09-15'),
        shipped_at: new Date('2024-09-16'),
        delivered_at: new Date('2024-09-18'),
      },
    }),
    prisma.sale.create({
      data: {
        user_id: demoUser.id,
        client_id: clients[0].id,
        product_name: 'Ebook: Estratégias de Vendas',
        product_sku: 'EBK-002',
        quantity: 1,
        unit_price: 97.00,
        total_price: 97.00,
        commission: 29.10,
        status: 'DELIVERED',
        payment_method: 'Cartão de Crédito',
        payment_date: new Date('2024-09-20'),
        delivered_at: new Date('2024-09-20'),
      },
    }),
    prisma.sale.create({
      data: {
        user_id: demoUser.id,
        client_id: clients[1].id,
        product_name: 'Consultoria Personalizada',
        product_sku: 'CONS-003',
        quantity: 1,
        unit_price: 890.30,
        total_price: 890.30,
        commission: 267.09,
        status: 'DELIVERED',
        payment_method: 'Boleto',
        payment_date: new Date('2024-09-25'),
        delivered_at: new Date('2024-09-25'),
      },
    }),
    prisma.sale.create({
      data: {
        user_id: demoUser.id,
        client_id: clients[0].id,
        product_name: 'Workshop Avançado',
        product_sku: 'WORK-004',
        quantity: 1,
        unit_price: 656.50,
        total_price: 656.50,
        commission: 196.95,
        status: 'PAID',
        payment_method: 'PIX',
        payment_date: new Date('2024-09-28'),
      },
    }),
  ]);

  // Create sample integration
  console.log('🔗 Creating sample integration...');

  await prisma.integration.create({
    data: {
      user_id: demoUser.id,
      provider: 'COINZZ',
      status: 'CONNECTED',
      config: {
        api_key: 'demo_key_encrypted',
        webhook_url: 'https://api.flowzz.com.br/webhooks/coinzz',
        sync_frequency: 'daily',
      },
      last_sync: new Date(),
    },
  });

  // Create sample goal
  console.log('🎯 Creating sample goal...');

  await prisma.goal.create({
    data: {
      user_id: demoUser.id,
      title: 'Meta de Vendas - Outubro 2024',
      description: 'Alcançar R$ 10.000 em vendas no mês',
      target_type: 'REVENUE',
      target_value: 10000.00,
      current_value: 2141.30, // Sum of current sales
      period_type: 'MONTHLY',
      period_start: new Date('2024-10-01'),
      period_end: new Date('2024-10-31'),
    },
  });

  // Create sample activities
  console.log('📋 Creating sample activities...');

  await Promise.all([
    prisma.activity.create({
      data: {
        user_id: demoUser.id,
        action: 'login',
        metadata: { ip: '192.168.1.100' },
        ip_address: '192.168.1.100',
      },
    }),
    prisma.activity.create({
      data: {
        user_id: demoUser.id,
        action: 'create_client',
        entity_type: 'client',
        entity_id: clients[0].id,
        metadata: { client_name: clients[0].name },
      },
    }),
    prisma.activity.create({
      data: {
        user_id: demoUser.id,
        action: 'connect_integration',
        entity_type: 'integration',
        metadata: { provider: 'COINZZ' },
      },
    }),
  ]);

  console.log('✅ Database seed completed successfully!');
  console.log('\n📊 Created:');
  console.log('  - 2 subscription plans');
  console.log('  - 2 users (demo + admin)');
  console.log('  - 3 clients');
  console.log('  - 3 tags');
  console.log('  - 4 sales');
  console.log('  - 1 integration');
  console.log('  - 1 goal');
  console.log('  - 3 activities');
  console.log('\n🔑 Demo credentials:');
  console.log('  Email: demo@flowzz.com.br');
  console.log('  Password: demo123456');
  console.log('\n🔧 Admin credentials:');
  console.log('  Email: admin@flowzz.com.br');
  console.log('  Password: admin123456');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });