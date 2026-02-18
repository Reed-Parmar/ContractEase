import { FileText, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router";

interface ContractCardProps {
  id: string;
  title: string;
  client: string;
  date: string;
  status: "draft" | "pending" | "signed";
  type?: "user" | "client";
}

export function ContractCard({
  id,
  title,
  client,
  date,
  status,
  type = "user",
}: ContractCardProps) {
  const navigate = useNavigate();

  const getStatusStyles = () => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-300";
      case "signed":
        return "bg-green-50 text-green-700 border-green-300";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "draft":
        return <FileText className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "signed":
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const handleClick = () => {
    if (type === "client" && status === "pending") {
      navigate(`/sign-contract/${id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
        type === "client" && status === "pending" ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 flex-1">{title}</h3>
        <span
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusStyles()}`}
        >
          {getStatusIcon()}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-1">Client: {client}</p>
      <p className="text-xs text-gray-500">{date}</p>
    </div>
  );
}
