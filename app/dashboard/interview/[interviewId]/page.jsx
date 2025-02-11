"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/utils/db";
import { MOCKInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Lightbulb, WebcamIcon } from "lucide-react";
import Link from 'next/link';
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";

function interview({ params }) {
  const [interviewData, setinterviewData] = useState();
  const [interviewId, setinterviewId] = useState(params.id);
  const [webCamEnabled, setWebCamEnabled] = useState(false);
  useEffect(() => {
    console.log(params.interviewId);
    GetInterviewDetails();
  }, []);

  const GetInterviewDetails = async () => {
    const result = await db
      .select()
      .from(MOCKInterview)
      .where(eq(MOCKInterview.mockId, params.interviewId));

    setinterviewData(result[0]);
  };
  return (
    <div className="my-10 ">
      <h2 className="font-bold text-2xl">Let's Get Started</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div className="flex flex-col my-5 gap-5">
            <div className="flex flex-col p-5 rounded-lg border gap-5">
          {interviewData && (<h2 className="text-lg"><strong>Job Role/Job Position:</strong>{interviewData.jobPosition}
            </h2>)}
          {interviewData && (<h2 className="text-lg"><strong>Job Description:</strong> {interviewData.jobDesc}
            </h2>)}
          {interviewData && (<h2 className="text-lg"><strong>Year of Experience:</strong> {interviewData.jobExperience}
            </h2>)}
          </div>
          <div className="p-5 border rounded-lg border-yellow-400 bg-yellow-100">
          <h2 className="flex gap-2 items-center text-yellow-600"><Lightbulb /><strong>Information</strong></h2>
          <h2 className="mt-3 text-yellow-500">{process.env.NEXT_PUBLIC_INFORMATION}</h2>
        </div>
        </div>
        <div>
          {webCamEnabled ? (
            <Webcam
              onUserMedia={() => setWebCamEnabled(true)}
              onUserMediaError={() => setWebCamEnabled(false)}
              mirrored={true}
              style={{
                height: 300,
                width: 300,
              }}
            />
          ) : (
            <>
              <WebcamIcon className="h-72 w-full my-7 p-20 bg-secondary rounded-lg border" />
              <Button variant="ghost" className="w-full" onClick={() => setWebCamEnabled(true)}>
               Enable webcam and Microphone
              </Button>
            </>
          )}
        </div>
      </div>
          <div className="flex justify-end items-end">
            <Link href={'/dashboard/interview/'+params.interviewId+'/start'}>
            <Button>Start Interview</Button></Link>
          </div>
    </div>
  );
}

export default interview;
