/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation'

import { fetchUserThreads } from '@/lib/actions/user.actions'

import { ThreadCard } from '../cards/ThreadCard'

interface ThreadsTabProps {
  currentUserId: string
  accountId: string
  accountType: string
}

export async function ThreadsTab({
  currentUserId,
  accountId,
  accountType,
}: ThreadsTabProps) {
  const result = await fetchUserThreads(accountId)

  if (!result) {
    redirect('/')
  }

  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.threads.map((thread: any) => (
        <ThreadCard
          key={String(thread._id)}
          id={String(thread._id)}
          currentUserId={currentUserId}
          parentId={thread.parentId}
          content={thread.text}
          author={
            accountType === 'User'
              ? { id: result.id, name: result.name, image: result.image }
              : {
                  id: thread.author.id,
                  name: thread.author.name,
                  image: thread.author.image,
                }
          }
          community={thread.community}
          createdAt={thread.createdAt}
          comments={thread.children}
        />
      ))}
    </section>
  )
}
