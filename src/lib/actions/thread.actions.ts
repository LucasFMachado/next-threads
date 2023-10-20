/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import mongoose from 'mongoose'
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
      author: new mongoose.Types.ObjectId(author),
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
