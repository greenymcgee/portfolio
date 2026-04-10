import { Dispatch, ReactNode, SetStateAction } from 'react'

export type AdminMenuContextType = {
  content: ReactNode | null
  setContent: Dispatch<SetStateAction<ReactNode | null>>
}
