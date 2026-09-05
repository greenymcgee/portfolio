'use server'

import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import { CACHE_TAGS, ROUTES } from '@/globals/constants'
import { logger } from '@/lib/logger'

import { PostService } from '../post.service'
import type { TogglePostPublishedState } from '../types'

export async function togglePostPublished(state: TogglePostPublishedState) {
  const result = await PostService.togglePublished(state.id)
  return result.match(
    ({ post }) => {
      updateTag(CACHE_TAGS.post(post.id))
      updateTag(CACHE_TAGS.posts)
      if (post.publishedAt) return redirect(ROUTES.post(post.id))

      return {
        id: state.id,
        publishedAt: post.publishedAt,
        status: 'SUCCESS',
      } as TogglePostPublishedState
    },
    (error) => {
      switch (error.type) {
        case 'entity':
        case 'not-found':
          return {
            errorType: error.type,
            id: state.id,
            publishedAt: state.publishedAt,
            status: 'ERROR',
          } as TogglePostPublishedState
        case 'forbidden':
          return redirect(ROUTES.home)
        case 'unauthorized':
          return redirect(ROUTES.loginWithRedirect(ROUTES.post(state.id)))
        default:
          logger.error(
            { error: error satisfies never },
            'UNHANDLED_UPDATE_POST_ERROR',
          )
          return {
            errorType: 'unhandled',
            id: state.id,
            publishedAt: state.publishedAt,
            status: 'ERROR',
          } as TogglePostPublishedState
      }
    },
  )
}
