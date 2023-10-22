/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { revalidatePath } from 'next/cache'

import Thread from '../models/thread.model'
import User from '../models/user.model'
import { connectToDB } from '../mongoose'

interface CreateTheadParams {
  text: string
  author: string
  communityId: string | null
  path: string
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  try {
    connectToDB()

    const skipAmount = (pageNumber - 1) * pageSize

    const threadsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({
        path: 'author',
        model: User,
      })
      .populate({
        path: 'children',
        populate: {
          path: 'author',
          model: User,
          select: '_id name parentId image',
        },
      })

    const totalThreadsCount = await Thread.countDocuments({
      parentId: { $in: [null, undefined] },
    })

    const threads = await threadsQuery.exec()
    const hasNextPage = totalThreadsCount > skipAmount + threads.length

    return {
      threads,
      hasNextPage,
    }
  } catch (error: any) {
    console.error(error)
    throw new Error(`Failed to fetch threads: ${error.message}`)
  }
}

export async function createThread({
  text,
  author,
  communityId = null,
  path,
}: CreateTheadParams): Promise<void> {
  try {
    connectToDB()

    const createdThread = await Thread.create({
      text,
      author,
      community: communityId,
    })

    // Update user model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    })

    revalidatePath(path)
  } catch (error: any) {
    console.error(error)
    throw new Error(`Failed to create thread: ${error.message}`)
  }
}

export async function fetchThread(id: string) {
  try {
    connectToDB()

    const thread = await Thread.findById(id)
      .populate({
        path: 'author',
        model: User,
        select: '_id id name image',
      })
      .populate({
        path: 'children',
        populate: [
          {
            path: 'author',
            model: User,
            select: '_id id name parentId image',
          },
          {
            path: 'children',
            model: Thread,
            populate: {
              path: 'author',
              model: User,
              select: '_id id name parentId image',
            },
          },
        ],
      })
      .exec()

    return thread
  } catch (error: any) {
    console.error(error)
    throw new Error(`Failed to fetch thread: ${error.message}`)
  }
}
