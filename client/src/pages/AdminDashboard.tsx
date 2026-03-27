import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, Filter, Download, Eye, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  PROFESSIONAL_PROFILES,
  type ProfessionalProfile,
  type CandidateStatus,
} from "@shared/types";

const profiles: ProfessionalProfile[] = [
  "clinical_doctor",
  "specialist_doctor",
  "psychologist",
  "nutritionist",
];

const statuses: CandidateStatus[] = ["ready", "pending", "rejected"];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState<ProfessionalProfile>("clinical_doctor");
  const [selectedStatus, setSelectedStatus] = useState<CandidateStatus>("ready");
  const [searchTerm, setSearchTerm] = useState("");

  // Verificar autenticação e permissões
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full"></div>
          </div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-6">
            Você não tem permissão para acessar esta página.
          </p>
          <Button onClick={() => setLocation("/")} className="w-full">
            Voltar ao Início
          </Button>
        </Card>
      </div>
    );
  }

  // Buscar candidatos
  const { data: candidates = [], isLoading } = trpc.candidates.listByProfileAndStatus.useQuery(
    {
      profile: selectedProfile,
      status: selectedStatus,
    },
    {
      enabled: !!user && user.role === "admin",
    }
  );

  const updateStatusMutation = trpc.candidates.updateStatus.useMutation();

  // Filtrar candidatos por termo de busca
  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (
    candidateId: number,
    newStatus: CandidateStatus,
    reasons?: string[]
  ) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: candidateId,
        status: newStatus,
        pendingReasons: reasons,
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const handleDownloadCSV = () => {
    const headers = [
      "Nome",
      "Email",
      "Telefone",
      "Perfil",
      "Experiência",
      "Status",
      "Data de Submissão",
    ];
    const rows = filteredCandidates.map((c) => [
      c.fullName,
      c.email,
      c.phone,
      PROFESSIONAL_PROFILES[c.professionalProfile as ProfessionalProfile],
      c.yearsOfExperience,
      c.status,
      new Date(c.submittedAt).toLocaleDateString("pt-BR"),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candidatos-${selectedProfile}-${selectedStatus}.csv`;
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Candidatos</h1>
          <p className="text-gray-600 mt-2">
            Gerencie e acompanhe os candidatos do banco de talentos
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 border-0 shadow-lg">
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Perfil Profissional
                </label>
                <select
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value as ProfessionalProfile)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {profiles.map((profile) => (
                    <option key={profile} value={profile}>
                      {PROFESSIONAL_PROFILES[profile]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as CandidateStatus)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === "ready"
                        ? "Pronto para Contato"
                        : status === "pending"
                          ? "Com Pendências"
                          : "Rejeitado"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleDownloadCSV}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Candidates List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isLoading ? (
            <Card className="p-12 text-center border-0 shadow-lg">
              <div className="animate-spin mb-4">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full mx-auto"></div>
              </div>
              <p className="text-gray-600">Carregando candidatos...</p>
            </Card>
          ) : filteredCandidates.length === 0 ? (
            <Card className="p-12 text-center border-0 shadow-lg">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum candidato encontrado</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCandidates.map((candidate) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {candidate.fullName}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              candidate.status === "ready"
                                ? "bg-green-100 text-green-800"
                                : candidate.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {candidate.status === "ready"
                              ? "✓ Pronto"
                              : candidate.status === "pending"
                                ? "⏳ Pendente"
                                : "✗ Rejeitado"}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium text-gray-700">Email</p>
                            <p>{candidate.email}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Telefone</p>
                            <p>{candidate.phone}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Experiência</p>
                            <p>{candidate.yearsOfExperience} anos</p>
                          </div>
                        </div>

                        {candidate.pendingReasons && candidate.pendingReasons.length > 0 && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xs font-medium text-yellow-900 mb-1">
                              Pendências:
                            </p>
                            <ul className="text-xs text-yellow-800 space-y-1">
                              {candidate.pendingReasons.map((reason: string, idx: number) => (
                                <li key={idx}>• {reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Implementar visualização detalhada
                          }}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </Button>

                        {candidate.status !== "ready" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(candidate.id, "ready")}
                            disabled={updateStatusMutation.isPending}
                            className="gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Aprovar
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <p className="text-sm text-green-700 font-medium mb-2">Prontos para Contato</p>
            <p className="text-3xl font-bold text-green-900">
              {candidates.filter((c) => c.status === "ready").length}
            </p>
          </Card>

          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <p className="text-sm text-yellow-700 font-medium mb-2">Com Pendências</p>
            <p className="text-3xl font-bold text-yellow-900">
              {candidates.filter((c) => c.status === "pending").length}
            </p>
          </Card>

          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
            <p className="text-sm text-red-700 font-medium mb-2">Rejeitados</p>
            <p className="text-3xl font-bold text-red-900">
              {candidates.filter((c) => c.status === "rejected").length}
            </p>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
