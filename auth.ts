/* eslint-disable require-await */
import bcrypt from 'bcryptjs'
import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import prisma from '@/lib/prisma'

export const authOptions = {
  callbacks: {
    async jwt({ token, user }) {
      return { ...token, id: token.id ?? user?.id }
    },
    async session({ session, token }) {
      return { ...session, user: { ...session.user, id: token.id } }
    },
  },
  // @ts-expect-error: this was present in the template setup. Leaving till I know more.
  name: 'credentials',
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user) throw new Error('User not found')

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password,
        )
        if (!isCorrectPassword) throw new Error('Invalid credentials')

        return user
      },
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
    }),
  ],
} satisfies NextAuthOptions

/* eslint-enable require-await */
