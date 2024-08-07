"use client";
import { Button } from "@/components/ui/button";
import { Image, StopCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import { Mic } from "lucide-react";
import useSpeechToText from "react-hook-speech-to-text";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIMoodal";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { db } from "@/utils/db";

function RecordAnsSection({ mockInterviewQuestion, activeQuestionIndex, interviewData }) {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  useEffect(() => {
    if (results.length > 0) {
      setUserAnswer((prevAns) => prevAns + results.map(result => result?.transcript).join(''));
    }
  }, [results]);
  

  useEffect(() => {
    if (!isRecording && userAnswer.length > 10) {
      UpdateUserAnswer();
    }
  }, [userAnswer]);

  const StartStopRecording = async () => {
    if (isRecording) {
      try {
        stopSpeechToText();
      } catch (err) {
        console.error("Error stopping speech recognition:", err);
      }
    } else {
      try {
        startSpeechToText();
      } catch (err) {
        console.error("Error starting speech recognition:", err);
      }
    }
  };

  const UpdateUserAnswer = async () => {
    console.log("User Answer:", userAnswer);
    setLoading(true);
  
    const currentQuestion = mockInterviewQuestion?.[activeQuestionIndex]?.question;
    const correctAnswer = mockInterviewQuestion?.[activeQuestionIndex]?.answer;
  
    if (!currentQuestion) {
      console.error("Question is null or undefined");
      toast("Error: Question is not defined");
      setLoading(false);
      return;
    }
  
    if (!correctAnswer) {
      console.error("Correct Answer is null or undefined");
      toast("Error: Correct Answer is not defined");
      setLoading(false);
      return;
    }
  
    const feedbackPrompt =
      "Question: " +
      currentQuestion +
      ", User Answer: " +
      userAnswer +
      ". Based on the question and user answer, " +
      "please give us a rating for the answer and feedback as an area of improvement if any " +
      "in just 3 to 5 lines in JSON format with rating field and feedback field.";
  
    try {
      const result = await chatSession.sendMessage(feedbackPrompt);
      const mockJsonResp = await result.response.text();
  
      // Clean and parse JSON
      const cleanedJsonResp = mockJsonResp
        .replace("```json", "")
        .replace("```", "");
      console.log("Cleaned JSON response:", cleanedJsonResp);
  
      const JsonFeedbackResp = JSON.parse(cleanedJsonResp);
      
      const resp = await db.insert(UserAnswer).values({
        mockIdRef: interviewData?.mockId,
        question: currentQuestion,
        correctAns: correctAnswer,
        userAns: userAnswer,
        feedback: JsonFeedbackResp?.feedback,
        rating: JsonFeedbackResp?.rating,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format("YYYY-MM-DD"), // Adjusted date format
      });
  
      if (resp) {
        toast("User Answer recorded successfully");
        setUserAnswer('');
        setResults([]);
      }
    } catch (error) {
      console.error("Error recording user answer:", error);
      toast("Error recording user answer");
    } finally {
      setLoading(false);
    }
    

  };
  
  

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex flex-col my-20 justify-center items-center bg-black rounded-lg p-5">
        <Image
          src={"/webcam.png"}
          width={200}
          height={200}
          className="absolute"
        />
        <Webcam
          mirrored={true}
          style={{ height: 300, width: "100%", zIndex: 10 }}
        />
      </div>
      
      <Button disabled={loading} variant="outline" className="my-10" onClick={StartStopRecording}>
        {isRecording ? (
          <h2 className="text-red-700 flex gap-2 items-center">
            <StopCircle />
            Stop Recording...
          </h2>
        ) : (
          <h2 className="text-green-700 flex gap-2 items-center">
            <Mic /> Record Answer
          </h2>
        )}
      </Button>
    </div>
  );
}

export default RecordAnsSection;
