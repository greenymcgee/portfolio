import { PrismaHTTPErrorCodeKey } from './errorClasses'

export const PRISMA_ERROR_CODE_TO_HTTP_STATUS: Record<
  PrismaHTTPErrorCodeKey,
  400 | 404 | 409 | 422
> = {
  P2000: 400,
  P2001: 404,
  P2002: 409,
  P2003: 422,
  P2004: 422,
  P2005: 400,
  P2006: 400,
  P2007: 400,
  P2011: 422,
  P2012: 422,
  P2013: 422,
  P2014: 422,
  P2015: 404,
  P2017: 422,
  P2018: 404,
  P2019: 400,
  P2020: 422,
  P2033: 422,
  P2034: 422,
}
