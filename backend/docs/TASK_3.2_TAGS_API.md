# 📊 STATUS ATUAL DO PROJETO - TASKS CONCLUÍDAS vs PENDENTES
## Baseado em tasks.md - Análise em 02/10/2025

---

## ✅ TASKS CONCLUÍDAS (Backend)

### FASE 1: Setup & Core API

#### ✅ 1.2 Setup Backend - Node.js + TypeScript + Express
- ✅ 1.2.1 Projeto Node.js inicializado
- ✅ 1.2.2 ESLint + Prettier + Nodemon configurados
- ✅ 1.2.3 Servidor Express com health check

#### ✅ 1.4 Docker Compose - PostgreSQL 16 + Redis 7
- ✅ Docker compose configurado
- ✅ PostgreSQL em porta 5433
- ✅ Redis em porta 6380
- ✅ Health checks funcionando

#### ✅ 1.5 Prisma ORM + Database Schema
- ✅ 1.5.1 Prisma instalado e inicializado
- ✅ 1.5.2 Schema completo com todos models
- ✅ 1.5.3 Migrations aplicadas + seed data

#### ✅ 2.1 Autenticação JWT Completa
- ✅ 2.1.1 AuthService com bcrypt
- ✅ 2.1.2 Middleware authenticate
- ✅ 2.1.3 Endpoints de autenticação
- ✅ 2.1.4 Testes unitários

#### ✅ 2.2 Trial de 7 dias
- ✅ 2.2.1 Lógica de trial automático
- ✅ 2.2.3 Middleware de validação trial

#### ✅ 3.1 API de Clientes (CRUD)
- ✅ 3.1.1 ClientRepository
- ✅ 3.1.2 ClientService
- ✅ 3.1.3 ClientController e rotas
- ✅ 3.1.4 Testes de integração

#### ✅ 3.3 Dashboard Metrics API
- ✅ 3.3.1 DashboardService com cálculos
- ✅ 3.3.2 Cache Redis implementado
- ✅ 3.3.3 Endpoints dashboard

---

## ❌ PRÓXIMAS TASKS PRIORITÁRIAS (Seguindo ordem do tasks.md)

### 🎯 TASK ATUAL RECOMENDADA: **3.2 Implementar API de Etiquetas (Tags)**

#### Por que esta task?
1. ✅ **Dependências satisfeitas:**
   - ✅ Task 1.5 (Tag model existe no schema)
   - ✅ Task 2.1 (autenticação funcionando)
   - ✅ Task 3.1 (Client API pronta para usar tags)

2. ✅ **Bloqueia tasks importantes:**
   - Task 3.1 precisa de filtros por tags
   - Frontend precisará desta API

3. ✅ **Complexidade baixa-média:**
   - CRUD básico similar a Client
   - Many-to-many já definido no schema
   - Tempo estimado: 2-3h

4. ✅ **Prioridade:** MÉDIA (mas necessária antes de continuar)

---

## 📋 TASK 3.2 - IMPLEMENTAR API DE ETIQUETAS (TAGS)

### Subtasks:

#### [ ] 3.2.1 Criar TagService e endpoints CRUD
**Endpoints:**
```typescript
GET    /api/v1/tags              // Listar todas tags do usuário
POST   /api/v1/tags              // Criar tag
PUT    /api/v1/tags/:id          // Atualizar tag
DELETE /api/v1/tags/:id          // Remover tag
```

**Validações:**
- Nome único por usuário
- Limite máximo de 20 tags por usuário
- Verificar se tag tem clientes antes de deletar

**Referências:** 
- `user-stories.md` - Story 3.4
- `user-journeys.md` - Jornada 3 Fase 3

---

#### [ ] 3.2.2 Implementar associação many-to-many Client-Tag
**Endpoints:**
```typescript
POST   /api/v1/clients/:id/tags           // Adicionar tags a cliente
DELETE /api/v1/clients/:id/tags/:tagId    // Remover tag de cliente
GET    /api/v1/clients?tags[]=uuid1       // Filtrar clientes por tags
```

**Lógica:**
- Usar model ClientTag (junction table)
- Suportar múltiplas tags por cliente
- Validar que tag e cliente pertencem ao mesmo usuário

**Referências:**
- `design.md` - Aggregates
- `user-stories.md` - Story 3.4

---

#### [ ] 3.2.3 Validar limite de 20 tags por usuário
**Implementação:**
```typescript
// No TagService.create()
const userTagsCount = await prisma.tag.count({
  where: { user_id: userId }
})

if (userTagsCount >= 20) {
  throw new Error('Limite de 20 tags atingido')
}
```

**Referências:**
- `plan.md` - Persona João Necessidades

---

### 📊 Estrutura de Arquivos a Criar

```
backend/src/
├── controllers/
│   └── TagController.ts          ← CRIAR
├── services/
│   └── TagService.ts             ← CRIAR
├── routes/
│   └── tag.routes.ts             ← CRIAR
├── validators/
│   └── tag.validator.ts          ← CRIAR (schemas Zod)
└── interfaces/
    └── TagService.interface.ts   ← CRIAR
```

---

### 🔧 Implementação Detalhada

#### 1. Interface TagService
```typescript
// src/interfaces/TagService.interface.ts

export interface ITag {
  id: string
  user_id: string
  name: string
  color: string
  created_at: Date
  updated_at: Date
}

export interface CreateTagDTO {
  name: string
  color?: string
}

export interface UpdateTagDTO {
  name?: string
  color?: string
}

export interface ITagService {
  // CRUD básico
  getAllTags(userId: string): Promise<ITag[]>
  getTagById(tagId: string, userId: string): Promise<ITag | null>
  createTag(userId: string, data: CreateTagDTO): Promise<ITag>
  updateTag(tagId: string, userId: string, data: UpdateTagDTO): Promise<ITag>
  deleteTag(tagId: string, userId: string): Promise<void>
  
  // Associações Client-Tag
  addTagToClient(clientId: string, tagId: string, userId: string): Promise<void>
  removeTagFromClient(clientId: string, tagId: string, userId: string): Promise<void>
  getClientTags(clientId: string, userId: string): Promise<ITag[]>
  
  // Validações
  checkTagLimit(userId: string): Promise<boolean>
  hasClientsWithTag(tagId: string): Promise<boolean>
}
```

#### 2. TagService
```typescript
// src/services/TagService.ts

import { PrismaClient } from '@prisma/client'
import type { ITagService, CreateTagDTO, UpdateTagDTO } from '../interfaces/TagService.interface'

export class TagService implements ITagService {
  constructor(private prisma: PrismaClient) {}
  
  async getAllTags(userId: string) {
    return this.prisma.tag.findMany({
      where: { user_id: userId },
      orderBy: { name: 'asc' }
    })
  }
  
  async getTagById(tagId: string, userId: string) {
    return this.prisma.tag.findFirst({
      where: { id: tagId, user_id: userId }
    })
  }
  
  async createTag(userId: string, data: CreateTagDTO) {
    // Validar limite de 20 tags
    const count = await this.prisma.tag.count({
      where: { user_id: userId }
    })
    
    if (count >= 20) {
      throw new Error('Limite máximo de 20 tags atingido')
    }
    
    // Validar nome único
    const existing = await this.prisma.tag.findFirst({
      where: { 
        user_id: userId,
        name: data.name 
      }
    })
    
    if (existing) {
      throw new Error('Já existe uma tag com este nome')
    }
    
    return this.prisma.tag.create({
      data: {
        user_id: userId,
        name: data.name,
        color: data.color || '#3B82F6' // Default blue
      }
    })
  }
  
  async updateTag(tagId: string, userId: string, data: UpdateTagDTO) {
    // Verificar se tag existe e pertence ao usuário
    const tag = await this.getTagById(tagId, userId)
    if (!tag) {
      throw new Error('Tag não encontrada')
    }
    
    // Se mudando nome, validar unicidade
    if (data.name && data.name !== tag.name) {
      const existing = await this.prisma.tag.findFirst({
        where: { 
          user_id: userId,
          name: data.name,
          id: { not: tagId }
        }
      })
      
      if (existing) {
        throw new Error('Já existe uma tag com este nome')
      }
    }
    
    return this.prisma.tag.update({
      where: { id: tagId },
      data
    })
  }
  
  async deleteTag(tagId: string, userId: string) {
    // Verificar se tag existe
    const tag = await this.getTagById(tagId, userId)
    if (!tag) {
      throw new Error('Tag não encontrada')
    }
    
    // Verificar se tem clientes associados
    const hasClients = await this.hasClientsWithTag(tagId)
    if (hasClients) {
      throw new Error('Não é possível remover tag com clientes associados')
    }
    
    await this.prisma.tag.delete({
      where: { id: tagId }
    })
  }
  
  // Associações Client-Tag
  async addTagToClient(clientId: string, tagId: string, userId: string) {
    // Validar que cliente e tag pertencem ao usuário
    const [client, tag] = await Promise.all([
      this.prisma.client.findFirst({ where: { id: clientId, user_id: userId } }),
      this.prisma.tag.findFirst({ where: { id: tagId, user_id: userId } })
    ])
    
    if (!client || !tag) {
      throw new Error('Cliente ou tag não encontrados')
    }
    
    // Verificar se já existe associação
    const existing = await this.prisma.clientTag.findFirst({
      where: { client_id: clientId, tag_id: tagId }
    })
    
    if (existing) {
      return // Já associado, não fazer nada
    }
    
    await this.prisma.clientTag.create({
      data: {
        client_id: clientId,
        tag_id: tagId
      }
    })
  }
  
  async removeTagFromClient(clientId: string, tagId: string, userId: string) {
    // Validar ownership
    const [client, tag] = await Promise.all([
      this.prisma.client.findFirst({ where: { id: clientId, user_id: userId } }),
      this.prisma.tag.findFirst({ where: { id: tagId, user_id: userId } })
    ])
    
    if (!client || !tag) {
      throw new Error('Cliente ou tag não encontrados')
    }
    
    await this.prisma.clientTag.deleteMany({
      where: {
        client_id: clientId,
        tag_id: tagId
      }
    })
  }
  
  async getClientTags(clientId: string, userId: string) {
    return this.prisma.tag.findMany({
      where: {
        user_id: userId,
        clients: {
          some: { client_id: clientId }
        }
      }
    })
  }
  
  async checkTagLimit(userId: string) {
    const count = await this.prisma.tag.count({
      where: { user_id: userId }
    })
    return count < 20
  }
  
  async hasClientsWithTag(tagId: string) {
    const count = await this.prisma.clientTag.count({
      where: { tag_id: tagId }
    })
    return count > 0
  }
}
```

#### 3. Validation Schemas (Zod)
```typescript
// src/validators/tag.validator.ts

import { z } from 'zod'

export const createTagSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Nome é obrigatório')
      .max(50, 'Nome deve ter no máximo 50 caracteres')
      .trim(),
    color: z.string()
      .regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato #RRGGBB')
      .optional()
      .default('#3B82F6')
  })
})

export const updateTagSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Nome não pode ser vazio')
      .max(50, 'Nome deve ter no máximo 50 caracteres')
      .trim()
      .optional(),
    color: z.string()
      .regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato #RRGGBB')
      .optional()
  })
})

export const addTagToClientSchema = z.object({
  body: z.object({
    tag_id: z.string().uuid('Tag ID inválido')
  })
})
```

#### 4. TagController
```typescript
// src/controllers/TagController.ts

import { Request, Response } from 'express'
import { TagService } from '../services/TagService'
import { prisma } from '../shared/config/database'

interface AuthenticatedRequest extends Request {
  user?: { userId: string }
}

export class TagController {
  private tagService: TagService
  
  constructor() {
    this.tagService = new TagService(prisma)
  }
  
  // GET /api/v1/tags
  async getTags(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId
      const tags = await this.tagService.getAllTags(userId)
      
      return res.status(200).json({
        success: true,
        data: tags,
        count: tags.length
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }
  
  // GET /api/v1/tags/:id
  async getTagById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId
      const { id } = req.params
      
      const tag = await this.tagService.getTagById(id, userId)
      
      if (!tag) {
        return res.status(404).json({
          success: false,
          error: 'Tag não encontrada'
        })
      }
      
      return res.status(200).json({
        success: true,
        data: tag
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }
  
  // POST /api/v1/tags
  async createTag(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId
      const { name, color } = req.body
      
      const tag = await this.tagService.createTag(userId, { name, color })
      
      return res.status(201).json({
        success: true,
        data: tag,
        message: 'Tag criada com sucesso'
      })
    } catch (error: any) {
      if (error.message.includes('Limite')) {
        return res.status(400).json({
          success: false,
          error: error.message
        })
      }
      
      if (error.message.includes('existe')) {
        return res.status(409).json({
          success: false,
          error: error.message
        })
      }
      
      return res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }
  
  // PUT /api/v1/tags/:id
  async updateTag(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId
      const { id } = req.params
      const data = req.body
      
      const tag = await this.tagService.updateTag(id, userId, data)
      
      return res.status(200).json({
        success: true,
        data: tag,
        message: 'Tag atualizada com sucesso'
      })
    } catch (error: any) {
      if (error.message.includes('não encontrada')) {
        return res.status(404).json({
          success: false,
          error: error.message
        })
      }
      
      if (error.message.includes('existe')) {
        return res.status(409).json({
          success: false,
          error: error.message
        })
      }
      
      return res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }
  
  // DELETE /api/v1/tags/:id
  async deleteTag(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId
      const { id } = req.params
      
      await this.tagService.deleteTag(id, userId)
      
      return res.status(200).json({
        success: true,
        message: 'Tag removida com sucesso'
      })
    } catch (error: any) {
      if (error.message.includes('não encontrada')) {
        return res.status(404).json({
          success: false,
          error: error.message
        })
      }
      
      if (error.message.includes('clientes')) {
        return res.status(400).json({
          success: false,
          error: error.message
        })
      }
      
      return res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }
  
  // POST /api/v1/clients/:id/tags
  async addTagToClient(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId
      const { id: clientId } = req.params
      const { tag_id } = req.body
      
      await this.tagService.addTagToClient(clientId, tag_id, userId)
      
      return res.status(200).json({
        success: true,
        message: 'Tag adicionada ao cliente com sucesso'
      })
    } catch (error: any) {
      if (error.message.includes('não encontrados')) {
        return res.status(404).json({
          success: false,
          error: error.message
        })
      }
      
      return res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }
  
  // DELETE /api/v1/clients/:id/tags/:tagId
  async removeTagFromClient(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId
      const { id: clientId, tagId } = req.params
      
      await this.tagService.removeTagFromClient(clientId, tagId, userId)
      
      return res.status(200).json({
        success: true,
        message: 'Tag removida do cliente com sucesso'
      })
    } catch (error: any) {
      if (error.message.includes('não encontrados')) {
        return res.status(404).json({
          success: false,
          error: error.message
        })
      }
      
      return res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }
  
  // GET /api/v1/clients/:id/tags
  async getClientTags(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId
      const { id: clientId } = req.params
      
      const tags = await this.tagService.getClientTags(clientId, userId)
      
      return res.status(200).json({
        success: true,
        data: tags,
        count: tags.length
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }
}
```

#### 5. Rotas
```typescript
// src/routes/tag.routes.ts

import { Router } from 'express'
import { TagController } from '../controllers/TagController'
import { authenticate } from '../middlewares/authenticate'
import { validateRequest } from '../middlewares/validateRequest'
import { 
  createTagSchema, 
  updateTagSchema,
  addTagToClientSchema 
} from '../validators/tag.validator'

const router = Router()
const tagController = new TagController()

// Todas as rotas requerem autenticação
router.use(authenticate)

// CRUD Tags
router.get('/', (req, res) => tagController.getTags(req, res))
router.get('/:id', (req, res) => tagController.getTagById(req, res))
router.post('/', validateRequest(createTagSchema), (req, res) => tagController.createTag(req, res))
router.put('/:id', validateRequest(updateTagSchema), (req, res) => tagController.updateTag(req, res))
router.delete('/:id', (req, res) => tagController.deleteTag(req, res))

export default router
```

#### 6. Registrar rotas no server.ts
```typescript
// src/server.ts (adicionar)

import tagRoutes from './routes/tag.routes'

// ... outras rotas ...
app.use('/api/v1/tags', tagRoutes)
```

#### 7. Adicionar endpoints em client.routes.ts
```typescript
// src/routes/client.routes.ts (adicionar)

import { TagController } from '../controllers/TagController'
import { validateRequest } from '../middlewares/validateRequest'
import { addTagToClientSchema } from '../validators/tag.validator'

const tagController = new TagController()

// Associações Client-Tag
router.post('/:id/tags', 
  validateRequest(addTagToClientSchema), 
  (req, res) => tagController.addTagToClient(req, res)
)

router.delete('/:id/tags/:tagId', 
  (req, res) => tagController.removeTagFromClient(req, res)
)

router.get('/:id/tags', 
  (req, res) => tagController.getClientTags(req, res)
)
```

---

### ✅ Checklist de Implementação

- [ ] Criar `src/interfaces/TagService.interface.ts`
- [ ] Criar `src/services/TagService.ts`
- [ ] Criar `src/controllers/TagController.ts`
- [ ] Criar `src/validators/tag.validator.ts`
- [ ] Criar `src/routes/tag.routes.ts`
- [ ] Registrar rotas em `src/server.ts`
- [ ] Adicionar endpoints Client-Tag em `client.routes.ts`
- [ ] Testar com Postman/Thunder Client
- [ ] Criar testes unitários (opcional mas recomendado)

---

### 🧪 Critérios de Aceitação

- [ ] CRUD de tags funciona
- [ ] Validação de nome único por usuário OK
- [ ] Limite de 20 tags por usuário validado
- [ ] Não permite deletar tag com clientes associados
- [ ] Associação many-to-many Client-Tag funciona
- [ ] Filtrar clientes por tags funciona
- [ ] Isolamento multi-tenancy (usuário A não vê tags de B)
- [ ] Validação Zod funciona
- [ ] Middleware authenticate aplicado
- [ ] Performance < 200ms

---

## ⏭️ PRÓXIMAS TASKS APÓS 3.2

1. **Task 4.0:** Setup Bull Queues + Redis (para background jobs)
2. **Task 5.1:** Pesquisar API Coinzz
3. **Task 5.2:** Implementar CoinzzService (CRÍTICO)
4. **Task 6.1:** Configurar Facebook Ads
5. **Task 7.1:** WhatsApp integration

---

## 🚀 PRONTO PARA IMPLEMENTAR TASK 3.2?

Aguardo sua confirmação para começar a implementação completa da API de Tags seguindo o padrão acima!

**Posso iniciar?**
- ✅ **Sim** - Implementar Task 3.2 agora
- ⏸️ **Aguardar** - Você tem dúvidas
- 🔄 **Outra task** - Prefere implementar outra
