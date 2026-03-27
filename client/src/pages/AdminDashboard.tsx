import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, Download, FileSpreadsheet, CheckCircle, AlertCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAdminAuth } from "@/hooks/useAdminAuth";
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

const statuses: CandidateStatus[] = ["qualified", "semi_qualified", "not_qualified"];

const STATUS_LABELS: Record<CandidateStatus, string> = {
  qualified: "Qualificado",
  semi_qualified: "Semi-qualificado",
  not_qualified: "Nao qualificado",
};

const STATUS_STYLES: Record<CandidateStatus, string> = {
  qualified: "bg-green-100 text-green-800",
  semi_qualified: "bg-yellow-100 text-yellow-800",
  not_qualified: "bg-red-100 text-red-800",
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading, isAuthenticated, signOut } = useAdminAuth();
  const [selectedProfile, setSelectedProfile] = useState<ProfessionalProfile>("clinical_doctor");
  const [selectedStatus, setSelectedStatus] = useState<CandidateStatus>("qualified");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: candidates = [], isLoading } = trpc.candidates.listByProfileAndStatus.useQuery(
    { profile: selectedProfile, status: selectedStatus },
    { enabled: isAuthenticated }
  );

  const updateStatusMutation = trpc.candidates.updateStatus.useMutation();

  const exportAllQuery = trpc.candidates.exportAll.useQuery(undefined, {
    enabled: false,
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full" />
          </div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/admin/login");
    return null;
  }

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
      "CNPJ",
      "Tem CNPJ",
      "Registro",
      "UF",
      "Experiencia (anos)",
      "Especialidades",
      "Dias Disponiveis",
      "Turnos Disponiveis",
      "Nivel",
      "Status",
      "Observacoes",
      "Data de Submissao",
    ];
    const rows = filteredCandidates.map((c) => [
      c.fullName,
      c.email,
      c.phone,
      PROFESSIONAL_PROFILES[c.professionalProfile as ProfessionalProfile],
      c.cnpj ?? "",
      c.hasCNPJ,
      c.registrationNumber,
      c.registrationState,
      c.yearsOfExperience,
      Array.isArray(c.specialties) ? c.specialties.join("; ") : c.specialties ?? "",
      Array.isArray(c.availableDays) ? c.availableDays.join("; ") : c.availableDays ?? "",
      Array.isArray(c.availableShifts) ? c.availableShifts.join("; ") : c.availableShifts ?? "",
      c.qualificationLevel,
      STATUS_LABELS[c.status as CandidateStatus] ?? c.status,
      Array.isArray(c.pendingReasons) ? c.pendingReasons.join("; ") : "",
      new Date(c.submittedAt).toLocaleDateString("pt-BR"),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candidatos-${selectedProfile}-${selectedStatus}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportAll = async () => {
    const { data } = await exportAllQuery.refetch();
    if (!data || data.length === 0) return;

    const headers = [
      "Nome", "Email", "Telefone", "Perfil", "CNPJ", "Tem CNPJ",
      "Registro", "UF", "Experiencia (anos)", "Especialidades",
      "Dias Disponiveis", "Turnos Disponiveis", "Nivel",
      "Status", "Observacoes", "Data de Submissao",
    ];
    const rows = data.map((c: any) => [
      c.fullName, c.email, c.phone,
      PROFESSIONAL_PROFILES[c.professionalProfile as ProfessionalProfile],
      c.cnpj ?? "", c.hasCNPJ, c.registrationNumber, c.registrationState,
      c.yearsOfExperience,
      Array.isArray(c.specialties) ? c.specialties.join("; ") : "",
      Array.isArray(c.availableDays) ? c.availableDays.join("; ") : "",
      Array.isArray(c.availableShifts) ? c.availableShifts.join("; ") : "",
      c.qualificationLevel,
      STATUS_LABELS[c.status as CandidateStatus] ?? c.status,
      Array.isArray(c.pendingReasons) ? c.pendingReasons.join("; ") : "",
      new Date(c.submittedAt).toLocaleDateString("pt-BR"),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row: any[]) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `todos-candidatos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await signOut();
    setLocation("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard de Candidatos</h1>
              <p className="text-gray-600 mt-2">
                Gerencie e acompanhe os candidatos do banco de talentos
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </motion.div>

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
                  Qualificacao
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as CandidateStatus)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
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

              <div className="flex items-end gap-2">
                <Button
                  onClick={handleDownloadCSV}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar Filtro
                </Button>
                <Button
                  onClick={handleExportAll}
                  variant="outline"
                  className="flex-1 gap-2"
                  disabled={exportAllQuery.isFetching}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  {exportAllQuery.isFetching ? "Exportando..." : "Exportar Tudo"}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isLoading ? (
            <Card className="p-12 text-center border-0 shadow-lg">
              <div className="animate-spin mb-4">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full mx-auto" />
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
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[candidate.status as CandidateStatus] ?? "bg-gray-100 text-gray-800"}`}>
                            Nivel {candidate.qualificationLevel} - {STATUS_LABELS[candidate.status as CandidateStatus] ?? candidate.status}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium text-gray-700">Email</p>
                            <p>{candidate.email}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Telefone</p>
                            <p>{candidate.phone}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Experiencia</p>
                            <p>{candidate.yearsOfExperience} anos</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">CNPJ</p>
                            <p>{candidate.hasCNPJ === "yes" ? candidate.cnpj || "Sim" : candidate.hasCNPJ === "pending" ? "Em processo" : "Nao"}</p>
                          </div>
                        </div>

                        {candidate.pendingReasons && candidate.pendingReasons.length > 0 && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xs font-medium text-yellow-900 mb-1">
                              Observacoes:
                            </p>
                            <ul className="text-xs text-yellow-800 space-y-1">
                              {candidate.pendingReasons.map((reason: string, idx: number) => (
                                <li key={idx}>- {reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {candidate.status !== "qualified" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(candidate.id, "qualified")}
                            disabled={updateStatusMutation.isPending}
                            className="gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Qualificar
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <p className="text-sm text-green-700 font-medium mb-2">Nivel 1 - Qualificados</p>
            <p className="text-3xl font-bold text-green-900">
              {candidates.filter((c) => c.status === "qualified").length}
            </p>
          </Card>

          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <p className="text-sm text-yellow-700 font-medium mb-2">Nivel 2 - Semi-qualificados</p>
            <p className="text-3xl font-bold text-yellow-900">
              {candidates.filter((c) => c.status === "semi_qualified").length}
            </p>
          </Card>

          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
            <p className="text-sm text-red-700 font-medium mb-2">Nivel 3 - Nao qualificados</p>
            <p className="text-3xl font-bold text-red-900">
              {candidates.filter((c) => c.status === "not_qualified").length}
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
