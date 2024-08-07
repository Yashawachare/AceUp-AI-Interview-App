"use client"
import React, { act, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { db } from "@/utils/db";
import { MOCKInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import QuestionsSection from './_components/QuestionsSection';
import RecordAnsSection from './_components/RecordAnsSection';

function StartInterview({params}) {

    const [interviewData, setinterviewData]=useState();
    const [mockInterviewQuestion,setMockInterviewQuestion]=useState([]);
    const [activeQuestionIndex,setactiveQuestionIndex]=useState(0);
    
    useEffect(()=>{
        GetInterviewDetails();
    },[]);

    const GetInterviewDetails = async () => {
        const result = await db.select().from(MOCKInterview).where(eq(MOCKInterview.mockId, params.interviewId));
        
        const jsonMockResp=JSON.parse(result[0].jsonMockResp);
        setMockInterviewQuestion(jsonMockResp);
        setinterviewData(result[0]);
        console.log("Mock Interview Data:", jsonMockResp);
      };

  return (
    <div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
        {/* Questions */}
        <QuestionsSection 
        mockInterviewQuestion={mockInterviewQuestion}
        activeQuestionIndex={activeQuestionIndex} 
        />

        {/* Video / Audio Recording */}
        <RecordAnsSection
        mockInterviewQuestion={mockInterviewQuestion}
        activeQuestionIndex={activeQuestionIndex}
        interviewData={interviewData}
        />
        </div>
        <div className='flex justify-end gap-5'>
         {activeQuestionIndex>0&& <Button  onClick={()=>setactiveQuestionIndex(activeQuestionIndex-1)}>Previous Question</Button>}
         {activeQuestionIndex!=mockInterviewQuestion?.length-1&&<Button onClick={()=>setactiveQuestionIndex(activeQuestionIndex+1)}>Next Question</Button>}
         {activeQuestionIndex==mockInterviewQuestion?.length-1&& <Link href={'/dashboard/interview/'+interviewData?.mockId+"/feedback"}> <Button>End Interview</Button></Link>}
          
          
        </div>
    </div>
  )
}

export default StartInterview
