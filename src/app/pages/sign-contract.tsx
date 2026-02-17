import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, CheckCircle, Download } from "lucide-react";
import { Button } from "../components/ui/button";
import { Navbar } from "../components/navbar";

export default function SignContract() {
  const navigate = useNavigate();
  const { id } = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  // Mock contract data
  const contract = {
    id,
    title: "Employment Contract - Senior Developer",
    client: "Digital Solutions LLC",
    date: "Feb 13, 2026",
    content: `
This Employment Contract ("Agreement") is entered into as of February 13, 2026, by and between Digital Solutions LLC ("Employer") and Sarah Johnson ("Employee").

1. POSITION AND DUTIES
Employee is hereby employed as Senior Developer and shall perform all duties and responsibilities associated with this position.

2. COMPENSATION
Employee shall receive an annual salary of $120,000, payable in accordance with Employer's standard payroll practices.

3. BENEFITS
Employee shall be entitled to participate in all employee benefit programs made available by Employer to its employees.

4. TERM OF EMPLOYMENT
This Agreement shall commence on March 1, 2026, and shall continue until terminated by either party.

5. CONFIDENTIALITY
Employee agrees to maintain the confidentiality of all proprietary information of Employer during and after employment.

6. TERMINATION
Either party may terminate this Agreement with 30 days' written notice to the other party.

7. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California.
    `,
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSigned(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSign = () => {
    if (!hasSigned) {
      alert("Please provide your signature before signing the contract.");
      return;
    }
    setIsSigned(true);
    setTimeout(() => {
      alert("Contract signed successfully!");
      navigate("/client-dashboard");
    }, 1500);
  };

  if (isSigned) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="mb-4 flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Contract Signed!
          </h2>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Sign Contract" showLogout={true} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/client-dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Contract Preview */}
        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 mb-6">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {contract.title}
            </h1>
            <p className="text-sm text-gray-600">
              Client: {contract.client} • Date: {contract.date}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto border border-gray-200">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
              {contract.content}
            </pre>
          </div>

          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => alert("Download feature would be implemented here")}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>

        {/* Signature Section */}
        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Your Signature
          </h2>

          <div className="mb-4">
            <div className="border-2 border-gray-300 rounded-lg bg-white">
              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                className="w-full touch-none cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Draw your signature above
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={clearSignature}
          >
            Clear Signature
          </Button>
        </div>

        {/* Sign Button */}
        <div className="space-y-3">
          <Button
            onClick={handleSign}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
            disabled={!hasSigned}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Sign Contract
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/client-dashboard")}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
