import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle, Mail, Zap, Heart, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { WHATSAPP_GROUPS } from "@shared/types";

export default function Welcome() {
  const [match, params] = useRoute("/welcome/:id");
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const candidateId = params?.id ? parseInt(params.id) : null;
  const { data: candidate, isLoading } = trpc.candidates.getById.useQuery(
    { id: candidateId || 0 },
    { enabled: !!candidateId }
  );

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full"></div>
          </div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Candidato não encontrado</p>
          <Button onClick={() => setLocation("/")}>Voltar ao início</Button>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <img 
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663031250061/FrybflfzLOrFpEzo.png" 
            alt="Starbem" 
            className="h-8 object-contain"
          />
          <Button variant="ghost" onClick={() => setLocation("/")}>
            Voltar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        className="pt-24 pb-12 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <motion.div
              className="mb-6 flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bem-vindo à Starbem!
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              {candidate.fullName}, sua inscrição foi recebida com sucesso!
            </p>
            <p className="text-gray-500">
              Estamos analisando seu perfil e em breve entraremos em contato.
            </p>
          </motion.div>

          {/* Status Card */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="p-8 bg-gradient-to-r from-orange-50 to-pink-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Status da sua inscrição
                </h2>
                <div className="flex items-center gap-4">
                  <div
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      candidate.status === "ready"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {candidate.status === "ready"
                      ? "✓ Pronto para contato"
                      : "⏳ Pendências"}
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="text-gray-900 font-medium">{candidate.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Perfil</p>
                    <p className="text-gray-900 font-medium">
                      {candidate.professionalProfile === "clinical_doctor"
                        ? "Médico Clínico"
                        : candidate.professionalProfile === "specialist_doctor"
                          ? "Médico Especialista"
                          : candidate.professionalProfile === "psychologist"
                            ? "Psicólogo"
                            : "Nutricionista"}
                    </p>
                  </div>

                  {candidate.pendingReasons && candidate.pendingReasons.length > 0 && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-900 mb-2">
                        Pendências identificadas:
                      </p>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        {candidate.pendingReasons.map((reason: string, idx: number) => (
                          <li key={idx}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* About Starbem */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Sobre a Starbem
                </h2>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-orange-100">
                        <Heart className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Cuidado Humanizado
                      </h3>
                      <p className="text-gray-600">
                        Conectamos profissionais de saúde de excelência com pacientes que
                        precisam de atendimento de qualidade, com foco em cuidado humano e
                        excelência clínica.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-pink-100">
                        <Zap className="h-6 w-6 text-pink-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Tecnologia Inovadora
                      </h3>
                      <p className="text-gray-600">
                        Plataforma digital que facilita o acesso a teleconsultas, agendamentos
                        rápidos e suporte contínuo para profissionais e pacientes.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-orange-100">
                        <Mail className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Conformidade Regulatória
                      </h3>
                      <p className="text-gray-600">
                        Operamos em conformidade com todas as regulamentações de saúde,
                        garantindo segurança e confidencialidade dos dados.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* WhatsApp Group Link - Only for Clinical Doctors */}
          {candidate.professionalProfile === "clinical_doctor" && (
            <motion.div variants={itemVariants} className="mb-8">
              <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="p-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-500">
                        <MessageCircle className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Bem-vindo ao Grupo de Talentos Clínicos!
                      </h2>
                      <p className="text-gray-600 mb-4">
                        Junte-se à nossa comunidade de médicos clínicos na Starbem. Compartilhe experiências, 
                        receba atualizações sobre oportunidades e conecte-se com outros profissionais.
                      </p>
                      <Button
                        className="gap-2 bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => window.open(WHATSAPP_GROUPS.clinical_doctor, "_blank")}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Entrar no Grupo WhatsApp
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Newsletter Signup */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-r from-orange-500 to-pink-500">
              <div className="p-8 text-white">
                <h2 className="text-2xl font-bold mb-3">
                  Fique por dentro das novidades
                </h2>
                <p className="mb-6 text-white/90">
                  Receba atualizações sobre novos processos, oportunidades e notícias da
                  Starbem.
                </p>

                {!subscribed ? (
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                    <Button
                      onClick={() => setSubscribed(true)}
                      className="bg-white text-orange-600 hover:bg-gray-100 font-semibold"
                    >
                      Inscrever
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle className="w-5 h-5" />
                    <span>Obrigado! Você receberá nossas novidades em breve.</span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* CTA */}
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-gray-600 mb-6">
              Tem dúvidas? Entre em contato conosco através do email ou telefone.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => window.open("https://starbem.app", "_blank")}
              >
                Visitar Starbem
              </Button>
              <Button
                className="gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                onClick={() => setLocation("/")}
              >
                Voltar ao Início
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
