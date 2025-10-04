/**
 * Script para criar usuário admin no banco de dados
 * Uso: npx tsx create-admin.ts
 */

import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔐 Criando usuário SUPER_ADMIN...\n');

    const email = 'admin@flowzz.com';
    const password = 'admin123'; // Senha padrão (trocar em produção!)
    const nome = 'Admin Flowzz';

    // Verificar se já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('⚠️  Usuário já existe!');
      console.log(`Email: ${existingUser.email}`);
      console.log(`Role: ${existingUser.role}`);
      
      // Atualizar para SUPER_ADMIN se não for
      if (existingUser.role !== 'SUPER_ADMIN') {
        await prisma.user.update({
          where: { email },
          data: { role: Role.SUPER_ADMIN },
        });
        console.log('✅ Role atualizada para SUPER_ADMIN');
      }
      
      return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        nome,
        password_hash: hashedPassword,
        role: Role.SUPER_ADMIN,
        is_active: true,
      },
    });

    console.log('✅ Usuário SUPER_ADMIN criado com sucesso!\n');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);
    console.log('👤 Nome:', nome);
    console.log('🎭 Role:', user.role);
    console.log('\n⚠️  IMPORTANTE: Troque a senha após o primeiro login!\n');
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
