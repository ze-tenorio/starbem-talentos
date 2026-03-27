import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Users, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [, setLocation] = useLocation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <img 
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663031250061/FrybflfzLOrFpEzo.png" 
            alt="Starbem" 
            className="h-10 object-contain"
          />
          <div className="flex items-center gap-4">
            <a
              href="https://starbem.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              Sobre
            </a>
            <Button
              onClick={() => setLocation("/form")}
              className="gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
            >
              Inscrever-se
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        className="pt-32 pb-20 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Junte-se ao Banco de Talentos da{" "}
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Starbem
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Conecte-se com uma rede de profissionais de saúde de excelência. Oferecemos
              oportunidades para médicos clínicos, especialistas, psicólogos e nutricionistas
              que compartilham nosso compromisso com o cuidado humanizado.
            </p>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setLocation("/form")}
                size="lg"
                className="gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
              >
                Começar Inscrição
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  window.open("https://starbem.app", "_blank")
                }
              >
                Conhecer Starbem
              </Button>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            variants={itemVariants}
            className="relative rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="aspect-video bg-gradient-to-br from-orange-400 via-pink-400 to-purple-400 flex items-center justify-center">
              <div className="text-center text-white">
                <Users className="w-20 h-20 mx-auto mb-4 opacity-80" />
                <p className="text-xl font-semibold">
                  Profissionais de Saúde de Excelência
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="py-20 px-4 bg-white/50"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por que se inscrever?
            </h2>
            <p className="text-xl text-gray-600">
              Benefícios exclusivos para profissionais de saúde
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Cuidado Humanizado",
                description:
                  "Trabalhe em um ambiente que valoriza o cuidado com excelência clínica e empatia.",
              },
              {
                icon: Zap,
                title: "Tecnologia Inovadora",
                description:
                  "Acesso a uma plataforma digital moderna que facilita teleconsultas e agendamentos.",
              },
              {
                icon: Users,
                title: "Rede de Profissionais",
                description:
                  "Conecte-se com outros profissionais de saúde e compartilhe experiências.",
              },
            ].map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition p-8">
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Profiles Section */}
      <motion.section
        className="py-20 px-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Procuramos profissionais em
            </h2>
            <p className="text-xl text-gray-600">
              Diferentes especialidades e áreas de atuação
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Médicos Clínicos",
                description: "Profissionais de medicina geral e clínica",
              },
              {
                title: "Médicos Especialistas",
                description: "Cardiologia, endocrinologia, ginecologia e mais",
              },
              {
                title: "Psicólogos",
                description: "Especialistas em saúde mental e bem-estar",
              },
              {
                title: "Nutricionistas",
                description: "Profissionais de nutrição e alimentação",
              },
            ].map((profile, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition p-6 bg-gradient-to-br from-orange-50 to-pink-50">
                  <CheckCircle className="w-8 h-8 text-orange-500 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {profile.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{profile.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Process Section */}
      <motion.section
        className="py-20 px-4 bg-white/50"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Como funciona o processo
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Preencha o Formulário",
                description:
                  "Responda perguntas sobre seu perfil profissional, experiência e formação.",
              },
              {
                step: "2",
                title: "Validação de Dados",
                description:
                  "Verificamos seus registros profissionais e formalização empresarial.",
              },
              {
                step: "3",
                title: "Análise de Perfil",
                description:
                  "Nossa equipe analisa seu perfil e identifica oportunidades de encaixe.",
              },
              {
                step: "4",
                title: "Contato e Integração",
                description:
                  "Entramos em contato para próximos passos e integração à rede.",
              },
            ].map((item, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-orange-500 to-pink-500">
                      <span className="text-white font-bold text-lg">{item.step}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 px-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-12 text-white text-center shadow-2xl"
          >
            <h2 className="text-4xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Junte-se à rede de profissionais de saúde que transformam vidas através da
              Starbem.
            </p>
            <Button
              onClick={() => setLocation("/form")}
              size="lg"
              className="gap-2 bg-white text-orange-600 hover:bg-gray-100 font-semibold"
            >
              Inscrever-se Agora
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">★</span>
            </div>
            <span className="font-bold text-white">Starbem</span>
          </div>
          <p className="mb-4">
            Banco de Talentos - Conectando profissionais de saúde de excelência
          </p>
          <div className="flex gap-6 justify-center text-sm mb-6">
            <a href="https://starbem.app" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              Sobre
            </a>
            <a href="https://starbem.app" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              Privacidade
            </a>
            <a href="https://starbem.app" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              Contato
            </a>
          </div>
          <p className="text-xs">
            © 2026 Starbem. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
