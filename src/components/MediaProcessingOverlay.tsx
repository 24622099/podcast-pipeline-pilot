
import React, { useEffect, useState } from "react";
import { Check, Video, Image } from "lucide-react";

interface ProcessingStep {
  id: string;
  label: string;
  isCompleted: boolean;
  isProcessing: boolean;
}

interface MediaProcessingOverlayProps {
  isOpen: boolean;
  onClose?: () => void;
  steps: ProcessingStep[];
}

const MediaProcessingOverlay = ({ isOpen, onClose, steps }: MediaProcessingOverlayProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-6 text-center">Media Generation</h2>
        
        <div className="space-y-6">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center">
              <div className="mr-4">
                {step.id === "video" ? (
                  <div className={`p-2 rounded-full ${step.isCompleted ? "bg-green-100" : "bg-blue-100"}`}>
                    {step.isCompleted ? (
                      <Check className="h-6 w-6 text-green-600" />
                    ) : (
                      <Video className={`h-6 w-6 text-blue-600 ${step.isProcessing ? "animate-pulse" : ""}`} />
                    )}
                  </div>
                ) : (
                  <div className={`p-2 rounded-full ${step.isCompleted ? "bg-green-100" : "bg-blue-100"}`}>
                    {step.isCompleted ? (
                      <Check className="h-6 w-6 text-green-600" />
                    ) : (
                      <Image className={`h-6 w-6 text-blue-600 ${step.isProcessing ? "animate-pulse" : ""}`} />
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-medium">{step.label}</p>
                  {step.isProcessing && !step.isCompleted && (
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  )}
                </div>
                
                {step.isProcessing && !step.isCompleted && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: "100%" }}></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {onClose && steps.every(step => step.isCompleted) && (
          <button
            onClick={onClose}
            className="mt-6 w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
};

export default MediaProcessingOverlay;
