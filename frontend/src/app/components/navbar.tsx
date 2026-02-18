import { useNavigate } from "react-router";
import { FileText, LogOut } from "lucide-react";

interface NavbarProps {
  title: string;
  showLogout?: boolean;
}

export function Navbar({ title, showLogout = false }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any stored auth data
    localStorage.removeItem("userType");
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <span className="font-semibold text-lg text-gray-900">
            ContractEase
          </span>
        </div>
        
        {showLogout && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </nav>
  );
}
