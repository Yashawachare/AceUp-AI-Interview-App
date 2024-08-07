"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { chatSession } from "@/utils/GeminiAIMoodal";
import { LoaderCircle } from "lucide-react";
import { db } from "@/utils/db";
import { MOCKInterview } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment/moment";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';


function AddNewInterview() {
  const [openDialog, setOpenDailog] = useState(false);
  const [jobPosition, setJobPosition] = useState();
  const [jobDesc, setJobDesc] = useState();
  const [jobExperience , setJobExperience] = useState();
  const [loading , setLoading] = useState(false);
  const [jsonResponse , setJsonResponse] = useState([]);
  const {user}=useUser();
  const router =useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const InputPrompt = `Job Position: ${jobPosition}, Job Description: ${jobDesc}, Years of Experience: ${jobExperience}, Depends on this information please give me ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview questions with answers in JSON format. Give Questions and Answers as fields in JSON`;
  
    try {
      const result = await chatSession.sendMessage(InputPrompt);
      let MockJsonResp = (await result.response.text())
        .replace('```json', '')
        .replace('```', '');
  
      console.log("Raw JSON response:", MockJsonResp);
  
      
      const jsonEndIndex = MockJsonResp.lastIndexOf(']');
      if (jsonEndIndex !== -1) {
        MockJsonResp = MockJsonResp.slice(0, jsonEndIndex + 1);
      }
  
      const parsedResponse = JSON.parse(MockJsonResp);
      console.log("Parsed JSON response:", parsedResponse);
      setJsonResponse(parsedResponse);
  
      const resp = await db.insert(MOCKInterview)
        .values({
          mockId: uuidv4(),
          jsonMockResp: MockJsonResp,
          jobPosition: jobPosition,
          jobDesc: jobDesc,
          jobExperience: jobExperience,
          createdBy: user?.primaryEmailAddress?.emailAddress,
          createdAt: moment().format('DD-MM-YYYY')
        }).returning({ mockId: MOCKInterview.mockId });
  
      console.log('Inserted ID:', resp);
      if (resp) {
        setOpenDailog(false);
        router.push('/dashboard/interview/' + resp[0]?.mockId);
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all "
        onClick={() => setOpenDailog(true)}
      >
        <h2 className="text-lg text-center"> + Add New</h2>
      </div>
      <Dialog open={openDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='text-2xl'>Tell us more about Job you are Interviewing</DialogTitle>
            <DialogDescription>
                <form onSubmit={onSubmit}>
              <div>
                <h2>Add Details about your job position/role,job description and Experience</h2>
                <div className="mt-7 my-3">
                    <label >Job Position</label>
                    <Input placeholder='EX.Full Stack Developer' type="text" required onChange={(event)=>setJobPosition(event.target.value)}/>
                </div>
                <div className=" my-3">
                    <label >Job Description</label>
                    <Textarea placeholder='EX.React , Angular , Vue etc.' type="text" required onChange={(event)=>setJobDesc(event.target.value)}/>
                </div>
                <div className=" my-3">
                    <label >Years of Experience</label>
                    <Input placeholder='5' type="number" max='50' required onChange={(event)=>setJobExperience(event.target.value)}/>
                </div>
              </div>
              
              <div className="flex gap-5 justify-end mt-2">
                <Button type="button" varient="ghost" onClick={() => setOpenDailog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}> 
                    {loading?
                    <>
                    <LoaderCircle className="animate-spin"/>'Genearating From AI'
                    </>:'Start Interview'
                }
                </Button>
              </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
