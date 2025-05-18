
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to Dashboard after a short delay
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-4xl font-bold mb-6">Podcast Content Workflow</h1>
        <p className="text-gray-600 mb-8">
          Welcome to your podcast content creation workflow manager. This application helps you streamline and organize 
          your podcast production process.
        </p>
        
        <Button 
          size="lg"
          onClick={() => navigate("/")}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Index;
