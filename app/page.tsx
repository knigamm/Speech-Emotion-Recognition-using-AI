"use client";

import { useState, useRef } from "react";
import { FileMusic, Heart, Mic, User, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyzeAudio, saveAnalysis } from "./server_actions";
export default function Page() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [loading, setLoading] = useState(false)
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioURL(URL.createObjectURL(audioBlob));
        audioChunksRef.current = []; // Reset for next recording
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Error accessing microphone. Please try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async () => {
    if (!audioURL) return alert("Record audio first!");

    const response = await fetch(audioURL);
    const audioBlob = await response.blob();
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("Upload Success:", data);
    } catch (error) {
      console.error("Upload Failed:", error);
    }
  };

  const convertToWav = async (audioBlob: Blob): Promise<File> => {
    // Create an audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Convert blob to array buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    
    // Decode the audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Create a WAV file
    const wavBuffer = audioBufferToWav(audioBuffer);
    const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
    
    return new File([wavBlob], 'recording.wav', { type: 'audio/wav' });
  };

  // Helper function to convert AudioBuffer to WAV format
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const wav = new ArrayBuffer(44 + buffer.length * blockAlign);
    const view = new DataView(wav);

    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + buffer.length * blockAlign, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, buffer.length * blockAlign, true);

    // Write audio data
    const data = new Float32Array(buffer.length);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      data[i] = channel[i];
    }

    let offset = 44;
    for (let i = 0; i < data.length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }

    return wav;
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const analyze = async () => {  
    if (!selectedFile && !audioURL) {
      alert("Please either upload an audio file or record audio first!");
      return;
    }

    setLoading(true);
    try {
      let fileToAnalyze: File;
      
      if (audioURL) {
        const response = await fetch(audioURL);
        const audioBlob = await response.blob();
        fileToAnalyze = await convertToWav(audioBlob);
      } else {
        fileToAnalyze = selectedFile!;
      }

      console.log("Analyzing audio file:", fileToAnalyze.name, "Type:", fileToAnalyze.type);
      const result = await analyzeAudio(fileToAnalyze);
      
      if (result) {
        setEmotion(result.emotion);
        setConfidence(result.confidence);
        try {
          await saveAnalysis(result.emotion, result.confidence);
          console.log("Analysis saved successfully");
        } catch (error) {
          console.error("Failed to save analysis:", error);
          alert("Analysis completed but failed to save. Please try again.");
        }
      } else {
        throw new Error("No result received from analysis");
      }
    } catch (error) {
      console.error("Error analyzing audio:", error);
      alert(`Error analyzing audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <main className="max-w-2xl mx-auto p-6 space-y-8">

        <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <FileMusic className="w-12 h-12 text-[#4695f1]" />
              <div className="absolute -right-1 -bottom-1 bg-[#4695f1] text-white p-1 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-medium text-[#292d32] mb-2">
                Import an audio file
              </h2>
              
              <p className="text-[#808080] text-sm">Supported formats: WAV</p>
              <input
                type="file"
                className="mt-2"
                accept=".wav"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && file.size <= 50 * 1024 * 1024) {
                    setSelectedFile(file);
                  } else {
                    alert("Please select an WAV file under 50MB");
                  }
                }}
              />
            </div>

          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-[#292d32] font-medium">OR</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <div className="text-center space-y-4">
          <button
            onClick={() => {
              if (isRecording) {
                stopRecording();
              } else {
                startRecording();
              }
            }}
            className="w-20 h-20 rounded-full bg-[#4695f1]/10 flex items-center justify-center mx-auto transition-colors hover:bg-[#4695f1]/20"
          >
            <Mic
              className={`w-8 h-8 ${isRecording ? "text-red-500" : "text-[#4695f1]"}`}
            />
          </button>
          <h2 className="text-xl font-medium text-[#292d32]">
            {isRecording ? "Recording..." : "Record your own audio"}
          </h2>
        </div>

        <div className="text-center pt-8">
          <Button 
            className="bg-white hover:bg-gray-50 text-[#292d32] border-2 border-[#292d32] rounded-lg px-8 py-4 text-lg" 
            onClick={analyze}
            disabled={loading || (!selectedFile && !audioURL)}
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Heart className="w-5 h-5 mr-2" />
            )}
            {loading ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
      </main>
      {emotion && (
        <div className="text-center pt-8">
          <h2 className="text-xl font-medium text-[#292d32]">
            Emotion: {emotion}
          </h2>
          <p className="text-[#808080] text-sm">Confidence: {confidence}</p>
        </div>
      )}
    </div>
  );
}
