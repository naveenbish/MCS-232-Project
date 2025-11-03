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
    </section>
  )
}
