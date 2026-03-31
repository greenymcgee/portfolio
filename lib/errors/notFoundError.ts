import { NOT_FOUND } from '@/globals/constants'

type Entity = 'Post'

export class NotFoundError<ID extends string | number = number> extends Error {
  public status = NOT_FOUND

  constructor(id: ID, entity: Entity) {
    super(`${entity}: ${id} could not be found`)
  }
}
