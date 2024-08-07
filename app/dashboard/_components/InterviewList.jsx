'use client'
import { db } from '@/utils/db';
import { MOCKInterview } from '@/utils/schema';
import { useUser } from '@clerk/nextjs'
import { eq , desc } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import InterviewItemCard from './InterviewItemCard';

function InterviewList() {

    const {user}=useUser();
    const [interviewList,setInterviewList]=useState([]);

    useEffect(()=>{
        user&&GetInterviewList();
    },[user])


    const GetInterviewList=async()=>{
        const result=await db.select().from(MOCKInterview).where(eq(MOCKInterview.createdBy,user?.primaryEmailAddress?.emailAddress))
        .orderBy(desc(MOCKInterview.id))

        console.log(result);
        setInterviewList(result);
    }
  return (
    <div>
        <h2 className='font-medium text-xl'>Previous Interviews</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-5'>
        {interviewList.length > 0 ? (
          interviewList.map((interview, index) => (
            <InterviewItemCard key={index} interview={interview} />
          ))
        ) : (
          <p>No interviews found.</p>
        )}
        </div>
    </div>
  )
}

export default InterviewList;