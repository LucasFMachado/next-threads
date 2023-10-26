/* eslint-disable @typescript-eslint/no-explicit-any */
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

import { ThreadCard } from '@/components/cards/ThreadCard'
import { Comment } from '@/components/forms/Comment'
import { fetchThread } from '@/lib/actions/thread.actions'
import { fetchUser } from '@/lib/actions/user.actions'

export default async function ThreadPage({
  params,
}: {
  params: { id: string }
}) {
  if (!params.id) {
    return null
  }

  const user = await currentUser()
  if (!user) {
    return null
  }

  const userInfo = await fetchUser(user.id)
  if (!userInfo?.onboarded) {
    redirect('/onboarding')
  }

  const thread = await fetchThread(params.id)

  return (
    <section className="relative">
      <div>
        <ThreadCard
          key={String(thread._id)}
          id={String(thread._id)}
          currentUserId={user?.id || ''}
          parentId={thread.parentId}
          content={thread.text}
          author={thread.author}
          community={thread.community}
          createdAt={thread.createdAt}
          comments={thread.children}
        />
      </div>

      <div className="mt-7">
        <Comment
          threadId={thread.id}
          currentUserId={String(userInfo._id)}
          currentUserImg={userInfo.image}
        />
      </div>

      <div className="mt-10">
        {thread.children.map((comment: any) => (
          <ThreadCard
            key={String(comment._id)}
            id={String(comment._id)}
            currentUserId={user?.id || ''}
            parentId={comment.parentId}
            content={comment.text}
            author={comment.author}
            community={comment.community}
            createdAt={comment.createdAt}
            comments={comment.children}
            isComment
          />
        ))}
      </div>
    </section>
  )
}
