/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { FilterQuery, SortOrder } from 'mongoose'
import { revalidatePath } from 'next/cache'

import Thread from '../models/thread.model'
import User from '../models/user.model'
import { connectToDB } from '../mongoose'

interface UpdateUserParams {
  userId: string
  username: string
  name: string
  bio: string
  image: string
  path: string
}

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: UpdateUserParams): Promise<void> {
  try {
    connectToDB()

    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true },
    )

    if (path === '/profile/edit') {
      revalidatePath(path)
    }
  } catch (error: any) {
    console.error(error)
    throw new Error(`Failed to create or update user: ${error.message}`)
  }
}

export async function fetchUser(userId: string) {
  try {
    connectToDB()

    const user = await User.findOne({ id: userId })
    // .populate({
    //   path: 'communities',
    //   model: Community,
    // })

    return user
  } catch (error: any) {
    console.error(error)
    throw new Error(`Failed to fetch user: ${error.message}`)
  }
}

export async function fetchUserThreads(userId: string) {
  try {
    connectToDB()

    const threads = await User.findOne({ id: userId }).populate({
      path: 'threads',
      model: Thread,
      populate: {
        path: 'children',
        model: Thread,
        populate: {
          path: 'author',
          model: User,
          select: 'id name image',
        },
      },
    })

    return threads
  } catch (error: any) {
    console.error(error)
    throw new Error(`Failed to fetch user threads: ${error.message}`)
  }
}

interface FetchUsersParams {
  userId: string
  searchString?: string
  pageNumber?: number
  pageSize?: number
  sortBy?: SortOrder
}

export async function fetchUsers({
  userId,
  searchString = '',
  pageNumber = 1,
  pageSize = 20,
  sortBy = 'desc',
}: FetchUsersParams) {
  try {
    connectToDB()

    const skipAmount = (pageNumber - 1) * pageSize

    // Trasnform search in not case sensitive
    const regex = new RegExp(searchString, 'i')

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    }

    if (searchString.trim() !== '') {
      query.$or = [{ username: { $regex: regex } }, { name: { $regex: regex } }]
    }

    const usersQuery = User.find(query)
      .sort({ createdAt: sortBy })
      .skip(skipAmount)
      .limit(pageSize)

    const totalUsersCount = await User.countDocuments(query)

    const users = await usersQuery.exec()

    const hasNextPage = totalUsersCount > skipAmount + users.length

    return {
      users,
      hasNextPage,
    }
  } catch (error: any) {
    console.error(error)
    throw new Error(`Failed to fetch users: ${error.message}`)
  }
}

export async function fetchNotifications(userId: string) {
  try {
    connectToDB()

    // Find all threads created by the user
    const userThreads = await Thread.find({ author: userId })

    // Collect all the child threads ids from the user threads
    const childThreadIds: string[] = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children)
    }, [])

    // Get all the child thread content by id, not including the author
    const comments = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId },
    }).populate({
      path: 'author',
      model: User,
      select: '_id name image',
    })

    return comments
  } catch (error: any) {
    console.error(error)
    throw new Error(`Failed to fetch users: ${error.message}`)
  }
}
