
import { Check } from "lucide-react";
import { WorkflowStage, workflowStages } from "@/contexts/PodcastContext";
import { cn } from "@/lib/utils";

interface WorkflowProgressProps {
  currentStage: WorkflowStage;
}

const WorkflowProgress = ({ currentStage }: WorkflowProgressProps) => {
  const currentStageIndex = workflowStages.findIndex(stage => stage.id === currentStage);
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between w-full mb-2">
        {workflowStages.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = stage.id === currentStage;
          
          return (
            <div 
              key={stage.id} 
              className="flex flex-col items-center relative"
            >
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center z-10",
                  isCompleted ? "bg-blue-600 text-white" : 
                  isCurrent ? "bg-blue-500 text-white border-4 border-blue-200" : 
                  "bg-gray-100 text-gray-400 border border-gray-300"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : (index + 1)}
              </div>
              <p 
                className={cn(
                  "text-xs font-medium mt-1 text-center max-w-[80px]", 
                  isCurrent ? "text-blue-600" : 
                  isCompleted ? "text-blue-600" : 
                  "text-gray-400"
                )}
              >
                {stage.label}
              </p>
              
              {/* Connector line */}
              {index < workflowStages.length - 1 && (
                <div 
                  className={cn(
                    "absolute top-4 left-full w-[calc(100%-16px)] h-[2px]", 
                    index < currentStageIndex ? "bg-blue-500" : "bg-gray-300"
                  )}
                  style={{ transform: "translateX(-50%)" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowProgress;
