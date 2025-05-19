
import { WorkflowStage } from "@/types/podcast";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: WorkflowStage;
  className?: string;
}

const getStatusConfig = (status: WorkflowStage) => {
  switch (status) {
    case "initialize":
      return { bg: "bg-blue-100", text: "text-blue-800", label: "Initialize" };
    case "draft_script":
      return { bg: "bg-yellow-100", text: "text-yellow-800", label: "Drafting Script" };
    case "approve_script":
      return { bg: "bg-orange-100", text: "text-orange-800", label: "Awaiting Script Approval" };
    case "draft_image_prompt":
      return { bg: "bg-purple-100", text: "text-purple-800", label: "Drafting Image Prompt" };
    case "approve_image_prompt":
      return { bg: "bg-indigo-100", text: "text-indigo-800", label: "Awaiting Image Approval" };
    case "media_finalized":
      return { bg: "bg-green-100", text: "text-green-800", label: "Completed" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", label: "Unknown" };
  }
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const { bg, text, label } = getStatusConfig(status);
  
  return (
    <span className={cn("px-3 py-1 text-xs font-medium rounded-full", bg, text, className)}>
      {label}
    </span>
  );
};

export default StatusBadge;
