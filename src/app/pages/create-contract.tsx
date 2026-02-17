import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Navbar } from "../components/navbar";

export default function CreateContract() {
  const navigate = useNavigate();
  const [contractType, setContractType] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Clause toggles
  const [confidentiality, setConfidentiality] = useState(false);
  const [nonCompete, setNonCompete] = useState(false);
  const [termination, setTermination] = useState(true);
  const [liability, setLiability] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock contract creation
    alert("Contract created successfully!");
    navigate("/user-dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Create Contract" showLogout={true} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/user-dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create New Contract
          </h1>
          <p className="text-gray-600">
            Fill in the details below to generate a new contract
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contract Type */}
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Contract Type</h2>
            <div className="space-y-2">
              <Label htmlFor="contract-type">Select Type</Label>
              <Select value={contractType} onValueChange={setContractType}>
                <SelectTrigger id="contract-type">
                  <SelectValue placeholder="Choose a contract type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employment">Employment Contract</SelectItem>
                  <SelectItem value="service">Service Agreement</SelectItem>
                  <SelectItem value="nda">Non-Disclosure Agreement</SelectItem>
                  <SelectItem value="consulting">Consulting Agreement</SelectItem>
                  <SelectItem value="partnership">Partnership Agreement</SelectItem>
                  <SelectItem value="license">License Agreement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Client Information</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client-name">Client Name</Label>
                <Input
                  id="client-name"
                  type="text"
                  placeholder="Company or Individual Name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-email">Client Email</Label>
                <Input
                  id="client-email"
                  type="email"
                  placeholder="client@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Contract Details */}
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Contract Details</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Contract Title</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Website Development Agreement"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a brief description of the contract scope and terms..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>
          </div>

          {/* Clause Toggles */}
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Contract Clauses</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="confidentiality" className="font-medium">
                    Confidentiality Clause
                  </Label>
                  <p className="text-sm text-gray-500">
                    Include confidentiality and privacy terms
                  </p>
                </div>
                <Switch
                  id="confidentiality"
                  checked={confidentiality}
                  onCheckedChange={setConfidentiality}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="non-compete" className="font-medium">
                    Non-Compete Clause
                  </Label>
                  <p className="text-sm text-gray-500">
                    Restrict competition during and after contract
                  </p>
                </div>
                <Switch
                  id="non-compete"
                  checked={nonCompete}
                  onCheckedChange={setNonCompete}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="termination" className="font-medium">
                    Termination Clause
                  </Label>
                  <p className="text-sm text-gray-500">
                    Define contract termination conditions
                  </p>
                </div>
                <Switch
                  id="termination"
                  checked={termination}
                  onCheckedChange={setTermination}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="liability" className="font-medium">
                    Liability Limitation
                  </Label>
                  <p className="text-sm text-gray-500">
                    Include liability and indemnification terms
                  </p>
                </div>
                <Switch
                  id="liability"
                  checked={liability}
                  onCheckedChange={setLiability}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <FileText className="w-5 h-5 mr-2" />
              Generate Contract
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate("/user-dashboard")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
