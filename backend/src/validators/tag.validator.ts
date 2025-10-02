/**
 * Tag Validation Schemas
 *
 * Referências:
 * - openapi.yaml: Tag schema validations
 * - design.md: Zod validation library
 * - tasks.md: Task 3.2 - Tags API
 */

import { z } from 'zod';

/**
 * Schema de validação para criação de tag
 * Referência: openapi.yaml POST /tags
 */
export const createTagSchema = z.object({
  body: z.object({
    nome: z
      .string({
        required_error: 'Nome é obrigatório',
        invalid_type_error: 'Nome deve ser uma string',
      })
      .min(1, 'Nome não pode estar vazio')
      .max(50, 'Nome deve ter no máximo 50 caracteres')
      .trim(),
    cor: z
      .string({
        required_error: 'Cor é obrigatória',
        invalid_type_error: 'Cor deve ser uma string',
      })
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal (#RRGGBB)')
      .toUpperCase(),
  }),
});

/**
 * Schema de validação para atualização de tag
 * Referência: openapi.yaml PUT /tags/{id}
 */
export const updateTagSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: 'ID é obrigatório',
      })
      .uuid('ID deve ser um UUID válido'),
  }),
  body: z.object({
    nome: z
      .string()
      .min(1, 'Nome não pode estar vazio')
      .max(50, 'Nome deve ter no máximo 50 caracteres')
      .trim()
      .optional(),
    cor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal (#RRGGBB)')
      .toUpperCase()
      .optional(),
  }).refine(
    (data) => data.nome !== undefined || data.cor !== undefined,
    {
      message: 'Forneça pelo menos um campo para atualizar (nome ou cor)',
    },
  ),
});

/**
 * Schema de validação para obter tag por ID
 * Referência: openapi.yaml GET /tags/{id}
 */
export const getTagByIdSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: 'ID é obrigatório',
      })
      .uuid('ID deve ser um UUID válido'),
  }),
});

/**
 * Schema de validação para excluir tag
 * Referência: openapi.yaml DELETE /tags/{id}
 */
export const deleteTagSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: 'ID é obrigatório',
      })
      .uuid('ID deve ser um UUID válido'),
  }),
});

/**
 * Schema de validação para adicionar tag a cliente
 * Referência: tasks.md Task 3.2.2 - Many-to-many associations
 */
export const addTagToClientSchema = z.object({
  params: z.object({
    clientId: z
      .string({
        required_error: 'ID do cliente é obrigatório',
      })
      .uuid('ID do cliente deve ser um UUID válido'),
  }),
  body: z.object({
    tagId: z
      .string({
        required_error: 'ID da tag é obrigatório',
      })
      .uuid('ID da tag deve ser um UUID válido'),
  }),
});

/**
 * Schema de validação para remover tag de cliente
 * Referência: tasks.md Task 3.2.2 - Many-to-many associations
 */
export const removeTagFromClientSchema = z.object({
  params: z.object({
    clientId: z
      .string({
        required_error: 'ID do cliente é obrigatório',
      })
      .uuid('ID do cliente deve ser um UUID válido'),
    tagId: z
      .string({
        required_error: 'ID da tag é obrigatório',
      })
      .uuid('ID da tag deve ser um UUID válido'),
  }),
});

/**
 * Tipos TypeScript inferidos dos schemas Zod
 */
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type GetTagByIdInput = z.infer<typeof getTagByIdSchema>;
export type DeleteTagInput = z.infer<typeof deleteTagSchema>;
export type AddTagToClientInput = z.infer<typeof addTagToClientSchema>;
export type RemoveTagFromClientInput = z.infer<typeof removeTagFromClientSchema>;
