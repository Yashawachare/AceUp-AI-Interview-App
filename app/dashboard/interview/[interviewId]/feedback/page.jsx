'use client'
import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import React, { useEffect,useState } from 'react'
import { ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

function Feedback({params}) {

  const [feedbackList,setFeedbackList]=useState([]);
  const router=useRouter();
  useEffect(()=>{
    Getfeedback();
  },[])

  const Getfeedback=async()=>{
    const result=await db.select().from(UserAnswer).where(eq(UserAnswer.mockIdRef,params.interviewId))
    .orderBy(UserAnswer.id);

    console.log(result);
    setFeedbackList(result);
  }

  return (
    <div className='p-10'>
      {feedbackList?.length === 0 ?
        <h2 className='font-bold text-xl text-gray-500'>No Interview feedback Found</h2>
        :
        <>
          <h2 className='text-3xl font-bold text-green-400'>Congratulation!🎉</h2>
          <h2 className='font-bold text-2xl'>Here is your Interview Feedback</h2>

          <h2 className='text-purple-900 text-lg my-3'> Your Overall Rating <strong>7/10</strong></h2>
          <h2 className='text-sm text-gray-500'>Find Below Interview</h2>
          {feedbackList && feedbackList.map((item, index) =>
            item.question ? (
              <Collapsible key={index}>
                <CollapsibleTrigger className='p-2 bg-secondary rounded-lg justify-between my-2 text-left'>
                  {item.question} <ChevronsUpDown className='h-5 w-5'/>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div>
                    <h2 className='text-red-500 p-2 border rounded-lg'><strong>Rating:</strong></h2>
                    <h2 className='p-2 border rounded-lg bg-red-50 text-sm text-red-800'><strong>Your Answer :</strong>{item.UserAns}</h2>
                    <h2 className='p-2 border rounded-lg bg-green-50 text-sm text-green-600'><strong>Correct Answer :</strong>{item.correctAns}</h2>
                    <h2 className='p-2 border rounded-lg bg-blue-50 text-sm text-purple-800'><strong>Feedback :</strong>{item.feedback}</h2>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ) : null
          )}
        </>
      }
      <Button onClick={()=>router.replace('/dashboard')}>Go Home</Button>
    </div>
  )
}

export default Feedback