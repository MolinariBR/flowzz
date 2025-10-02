/**
 * Tag Service Interfaces
 * 
 * Referências:
 * - openapi.yaml: Tag schema (id, nome, cor)
 * - design.md: Clean Architecture + Repository Pattern
 * - tasks.md: Task 3.2 - Tags API
 */

/**
 * Entidade Tag conforme openapi.yaml
 */
export interface ITag {
  id: string;
  nome: string;
  cor: string; // Hexadecimal format: #RRGGBB
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO para criação de tag
 * Referência: openapi.yaml POST /tags
 */
export interface CreateTagDTO {
  nome: string;
  cor: string;
}

/**
 * DTO para atualização de tag
 * Referência: openapi.yaml PUT /tags/{id}
 */
export interface UpdateTagDTO {
  nome?: string;
  cor?: string;
}

/**
 * DTO para adicionar tag a cliente
 * Referência: tasks.md Task 3.2.2 - Many-to-many associations
 */
export interface AddTagToClientDTO {
  tagId: string;
  clientId: string;
}

/**
 * Interface do serviço de tags seguindo Clean Architecture
 * Referência: design.md §Clean Architecture
 */
export interface ITagService {
  /**
   * Criar nova tag
   * Validações: nome único, limite de 20 tags por usuário
   */
  create(userId: string, data: CreateTagDTO): Promise<ITag>;

  /**
   * Listar todas as tags do usuário
   * Multi-tenancy: retorna apenas tags do userId
   */
  getAll(userId: string): Promise<ITag[]>;

  /**
   * Obter tag por ID
   * Multi-tenancy: valida que tag pertence ao userId
   */
  getById(userId: string, tagId: string): Promise<ITag>;

  /**
   * Atualizar tag
   * Validações: nome único (se alterado)
   */
  update(userId: string, tagId: string, data: UpdateTagDTO): Promise<ITag>;

  /**
   * Excluir tag
   * Validação: não pode excluir tag com clientes associados
   */
  delete(userId: string, tagId: string): Promise<void>;

  /**
   * Adicionar tag a um cliente
   * Referência: tasks.md Task 3.2.2
   */
  addTagToClient(userId: string, clientId: string, tagId: string): Promise<void>;

  /**
   * Remover tag de um cliente
   * Referência: tasks.md Task 3.2.2
   */
  removeTagFromClient(userId: string, clientId: string, tagId: string): Promise<void>;

  /**
   * Listar clientes de uma tag
   */
  getClientsByTag(userId: string, tagId: string): Promise<unknown[]>;

  /**
   * Validar limite de 20 tags por usuário
   * Referência: tasks.md Task 3.2.3
   */
  validateTagLimit(userId: string): Promise<boolean>;

  /**
   * Verificar se tag tem clientes associados
   * Usado antes de permitir exclusão
   */
  checkTagHasClients(userId: string, tagId: string): Promise<boolean>;

  /**
   * Verificar se nome de tag é único para o usuário
   */
  isTagNameUnique(userId: string, nome: string, excludeTagId?: string): Promise<boolean>;
}
