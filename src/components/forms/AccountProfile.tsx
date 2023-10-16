'use client'

interface AccountProfileProps {
  user: {
    id: string
    objectId: string
    username: string
    name: string
    bio: string
    image: string
  }
  btnTitle: string
}

export function AccountProfile({ user, btnTitle }: AccountProfileProps) {
  return <h1>Account Profile</h1>
}
