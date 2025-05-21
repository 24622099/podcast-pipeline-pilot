
import React from "react";
import { Loader, Check, Pen } from "lucide-react";

interface ProcessingStepProps {
  label: string;
  isCompleted: boolean;
  isProcessing: boolean;
}

const ProcessingStep: React.FC<ProcessingStepProps> = ({ label, isCompleted, isProcessing }) => {
  return (
    <div className="flex items-center gap-3">
      {isCompleted ? (
        <Check className="h-5 w-5 text-green-600" />
      ) : isProcessing ? (
        <Loader className="h-5 w-5 text-gray-600 animate-spin" />
      ) : (
        <div className="h-5 w-5 rounded-full border border-gray-300"></div>
      )}
      <span className={`${isCompleted ? 'text-green-600 font-medium' : isProcessing ? 'text-gray-700' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
};

interface ProcessingOverlayProps {
  isOpen: boolean;
  title: string;
  steps: Array<{
    id: string;
    label: string;
    isCompleted: boolean;
    isProcessing: boolean;
  }>;
  onClose?: () => void;
  isInitializing?: boolean;
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ 
  isOpen, 
  title, 
  steps, 
  onClose,
  isInitializing = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          
          {isInitializing ? (
            <div className="flex flex-col items-center justify-center p-6">
              <div className="relative h-24 w-24 mb-4">
                <Pen className="h-12 w-12 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600">Processing your request...</p>
            </div>
          ) : (
            <div className="space-y-4 text-left mt-4">
              {steps.map((step) => (
                <ProcessingStep
                  key={step.id}
                  label={step.label}
                  isCompleted={step.isCompleted}
                  isProcessing={step.isProcessing}
                />
              ))}
            </div>
          )}
        </div>
        
        {onClose && (
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="mt-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingOverlay;
