import { currentUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { fetchNotifications, fetchUser } from '@/lib/actions/user.actions'

export default async function ActivityPage() {
  const user = await currentUser()

  if (!user) {
    return null
  }

  const userInfo = await fetchUser(user.id)

  if (!userInfo?.onboarded) {
    redirect('/onboarding')
  }

  const notifications = await fetchNotifications(String(userInfo._id))

  return (
    <section>
      <h1 className="head-text bm-10">Activity</h1>

      <section className="mt-10 flex flex-col gap-5">
        {notifications.length === 0 ? (
          <p className="no-result">No notifications found</p>
        ) : (
          <>
            {notifications.map(notification => (
              <Link
                key={String(notification._id)}
                href={`/thread/${notification.parentId}`}
              >
                <article className="activity-card">
                  <Image
                    src={notification.author.image}
                    alt={`${notification.author.name} profile image`}
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />

                  <p className="text-small-regular text-light-1">
                    <span className="mr-1 text-primary-500">
                      {notification.author.name}
                    </span>{' '}
                    replied to your thread
                  </p>
                </article>
              </Link>
            ))}
          </>
        )}
      </section>
    </section>
  )
}
