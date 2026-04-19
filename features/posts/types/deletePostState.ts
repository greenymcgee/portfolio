import { ActionState } from '@greenymcgee/typescript-utils'

import { Post } from '@/prisma/generated/client'

export interface DeletePostState extends ActionState {
  id: Post['id']
}
