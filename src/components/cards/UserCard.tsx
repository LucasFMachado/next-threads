'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { Button } from '../ui/button'

interface UserCardProps {
  id: string
  name: string
  username: string
  imageUrl: string
  userType: string
}

export function UserCard({
  id,
  name,
  username,
  imageUrl,
  userType,
}: UserCardProps) {
  const router = useRouter()

  return (
    <article className="user-card">
      <div className="user-card_avatar">
        <Image
          src={imageUrl}
          alt={`${name} profile image`}
          width={48}
          height={48}
          className="rounded-full"
        />

        <div className="flex-1 text-ellipsis">
          <h4 className="text-base-semibold text-light-1">{name}</h4>
          <p className="text-small-medium text-gray-1">@{username}</p>
        </div>
      </div>
      <Button
        className="user-card_btn"
        onClick={() => router.push(`/profile/${id}`)}
      >
        View
      </Button>
    </article>
  )
}
