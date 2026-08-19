import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase/client'
import type { ChangeInterestInput } from '../types'

export async function registerChangeInterest(input: ChangeInterestInput) {
  const call = httpsCallable<ChangeInterestInput, { received: boolean; reference: string }>(
    functions,
    'registerChangeInterest',
  )
  return (await call(input)).data
}
