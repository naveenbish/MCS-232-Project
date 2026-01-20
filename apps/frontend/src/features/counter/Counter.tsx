'use client'

import React from 'react'
import type { RootState } from '@/store'
import { useSelector, useDispatch } from 'react-redux'
import { decrement, increment } from './counterSlice'
import { Button } from '@/components/ui/button'

export function Counter() {
  const count = useSelector((state: RootState) => state.counter.value)
  const dispatch = useDispatch()

  return (
    <section className='container m-auto my-20'>
      <div className='py-4 text-xl font-semibold'>Small Redux Example</div>
      <div className='text-xl font-semibold'>
        <Button
          className='cursor-pointer dark:bg-green-500 bg-blue-500 dark:hover:bg-green-700 hover:bg-blue-700'
          aria-label="Increment value"
          onClick={() => dispatch(increment())}
        >
          Increment
        </Button>
        <span className='px-5'>{count}</span>
        <Button
          className='cursor-pointer dark:bg-green-500 bg-blue-500 dark:hover:bg-green-700 hover:bg-blue-700'
          aria-label="Decrement value"
          onClick={() => dispatch(decrement())}
        >
          Decrement
        </Button>
      </div>
    </section>
  )
}
