
import React from "react";
import { Book } from "lucide-react";

interface BookAnimationProps {
  isLoading: boolean;
  message?: string;
}

const BookAnimation = ({ isLoading, message = "Processing script..." }: BookAnimationProps) => {
  if (!isLoading) return null;

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="animate-spin-slow relative">
        <Book size={64} className="text-primary" />
        <div className="absolute inset-0 opacity-30 animate-pulse bg-gradient-to-r from-transparent via-primary to-transparent rounded-full blur-sm"></div>
      </div>
      <p className="mt-4 text-lg font-medium text-gray-700">{message}</p>
    </div>
  );
};

export default BookAnimation;
