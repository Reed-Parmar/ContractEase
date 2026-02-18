import { Navbar } from "../components/navbar";
import { ContractCard } from "../components/contract-card";

// Mock data
const pendingContracts = [
  {
    id: "3",
    title: "Employment Contract - Senior Developer",
    client: "Digital Solutions LLC",
    date: "Feb 13, 2026",
    status: "pending" as const,
  },
  {
    id: "4",
    title: "Consulting Agreement",
    client: "StartupXYZ",
    date: "Feb 12, 2026",
    status: "pending" as const,
  },
  {
    id: "7",
    title: "Service Level Agreement",
    client: "Tech Partners Inc",
    date: "Feb 11, 2026",
    status: "pending" as const,
  },
];

const signedContracts = [
  {
    id: "5",
    title: "Partnership Agreement",
    client: "Global Enterprises",
    date: "Feb 10, 2026",
    status: "signed" as const,
  },
  {
    id: "6",
    title: "License Agreement - Software",
    client: "CloudTech Co",
    date: "Feb 8, 2026",
    status: "signed" as const,
  },
];

export default function ClientDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Client Dashboard" showLogout={true} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, Sarah
          </h1>
          <p className="text-gray-600">
            Review and sign your pending contracts
          </p>
        </div>

        {/* Pending Contracts */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Contracts Pending Signature
          </h2>
          <div className="space-y-3">
            {pendingContracts.length > 0 ? (
              pendingContracts.map((contract) => (
                <ContractCard key={contract.id} {...contract} type="client" />
              ))
            ) : (
              <p className="text-gray-500 text-sm bg-white rounded-lg p-4 border border-gray-200">
                No pending contracts
              </p>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Tap on a contract to review and sign
          </p>
        </section>

        {/* Signed Contracts */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Signed Contracts
          </h2>
          <div className="space-y-3">
            {signedContracts.length > 0 ? (
              signedContracts.map((contract) => (
                <ContractCard key={contract.id} {...contract} type="client" />
              ))
            ) : (
              <p className="text-gray-500 text-sm bg-white rounded-lg p-4 border border-gray-200">
                No signed contracts
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
