import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CONTABILIZEI_URL } from "@shared/types";

interface CNPJValidatorProps {
  onValidated: (hasCNPJ: "yes" | "pending") => void;
  onCancel?: () => void;
}

export function CNPJValidator({ onValidated, onCancel }: CNPJValidatorProps) {
  const [step, setStep] = useState<"initial" | "redirect" | "confirmed">("initial");
  const [cnpj, setCNPJ] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateCNPJ = (value: string): boolean => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length !== 14) {
      setError("CNPJ deve ter 14 dígitos");
      return false;
    }
    // Validação básica de CNPJ (algoritmo de verificação)
    const validateCNPJAlgorithm = (cnpj: string): boolean => {
      if (cnpj === "00000000000000") return false;

      let size = cnpj.length - 2;
      let numbers = cnpj.substring(0, size);
      let digits = cnpj.substring(size);
      let sum = 0;
      let pos = size - 7;

      for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
      }

      let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
      if (result !== parseInt(digits.charAt(0))) return false;

      size = size + 1;
      numbers = cnpj.substring(0, size);
      sum = 0;
      pos = size - 7;

      for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
      }

      result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
      return result === parseInt(digits.charAt(1));
    };

    if (!validateCNPJAlgorithm(cleaned)) {
      setError("CNPJ inválido");
      return false;
    }

    setError(null);
    return true;
  };

  const handleCNPJSubmit = () => {
    if (!validateCNPJ(cnpj)) return;
    onValidated("yes");
  };

  const handleRedirectToContabilizei = () => {
    setStep("redirect");
    window.open(CONTABILIZEI_URL, "_blank");
  };

  const handleConfirmPending = () => {
    setStep("confirmed");
    onValidated("pending");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <Card className="w-full max-w-md shadow-2xl border-0">
        {step === "initial" && (
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Validação de CNPJ
              </h2>
              <p className="text-gray-600">
                Para prosseguir com sua inscrição, você precisa ter uma empresa formalizada com CNPJ.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Informe seu CNPJ
                </label>
                <input
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 14) {
                      setCNPJ(value);
                      setError(null);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {error && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Não tem CNPJ?</strong> Clique no botão abaixo para formalizar sua empresa com a Contabilizei através de nossa parceria.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleCNPJSubmit}
                disabled={cnpj.length !== 14}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              >
                Validar CNPJ
              </Button>

              <Button
                variant="outline"
                onClick={handleRedirectToContabilizei}
                className="w-full gap-2"
              >
                Formalizar CNPJ na Contabilizei
                <ExternalLink className="w-4 h-4" />
              </Button>

              {onCancel && (
                <Button variant="ghost" onClick={onCancel} className="w-full">
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        )}

        {step === "redirect" && (
          <div className="p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <ExternalLink className="w-8 h-8 text-orange-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Redirecionado para Contabilizei
            </h2>
            <p className="text-gray-600 mb-6">
              Uma nova aba foi aberta com a Contabilizei para você formalizar sua empresa. Após concluir o processo, retorne aqui para confirmar.
            </p>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
              <p className="text-sm text-yellow-800">
                Se a aba não abriu automaticamente, clique no botão abaixo para acessar a Contabilizei.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => window.open(CONTABILIZEI_URL, "_blank")}
                className="w-full gap-2 bg-gradient-to-r from-orange-500 to-pink-500"
              >
                Abrir Contabilizei
                <ExternalLink className="w-4 h-4" />
              </Button>

              <Button
                onClick={handleConfirmPending}
                variant="outline"
                className="w-full"
              >
                Já formalizei, continuar
              </Button>
            </div>
          </div>
        )}

        {step === "confirmed" && (
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-6 flex justify-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Ótimo!
            </h2>
            <p className="text-gray-600 mb-6">
              Sua inscrição foi registrada como pendente de confirmação de CNPJ. Após você formalizar sua empresa na Contabilizei, nossa equipe validará e você receberá um email com os próximos passos.
            </p>

            <Button
              onClick={() => window.location.href = "/"}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500"
            >
              Voltar ao Início
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
