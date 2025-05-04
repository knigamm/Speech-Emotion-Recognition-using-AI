import { Roles } from '@/types/globals'
import { auth } from '@clerk/nextjs/server'

interface UserMetadata {
  role?: Roles;
}

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth()
  return (sessionClaims?.metadata as UserMetadata)?.role === role
}

export async function isAdmin() {
  const { sessionClaims } = await auth();
  return (sessionClaims?.metadata as UserMetadata)?.role === "admin";
}