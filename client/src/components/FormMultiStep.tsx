import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ProfessionalProfile } from "@shared/types";

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "number" | "select" | "checkbox" | "radio";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: (value: any) => string | null;
}

interface FormMultiStepProps {
  steps: FormStep[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel?: () => void;
}

export function FormMultiStep({ steps, onSubmit, onCancel }: FormMultiStepProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    // Limpar erro do campo ao alterar
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    for (const field of step.fields) {
      const value = formData[field.name];

      // Validação de campo obrigatório
      if (field.required && !value) {
        newErrors[field.name] = `${field.label} é obrigatório`;
        continue;
      }

      // Validação customizada
      if (field.validation && value) {
        const error = field.validation(value);
        if (error) {
          newErrors[field.name] = error;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (currentStep < steps.length - 1) {
      setDirection("forward");
      setCurrentStep((prev) => prev + 1);
    } else {
      // Submeter formulário
      setIsSubmitting(true);
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error("Erro ao submeter formulário:", error);
        setErrors({ submit: "Erro ao submeter formulário. Tente novamente." });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection("backward");
      setCurrentStep((prev) => prev - 1);
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header com logo */}
        <div className="text-center mb-8">
          <img 
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663031250061/FrybflfzLOrFpEzo.png" 
            alt="Starbem - Banco de Talentos" 
            className="h-16 mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Banco de Talentos</h1>
          <p className="text-gray-600">Junte-se à nossa rede de profissionais de saúde</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Etapa {currentStep + 1} de {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg border-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{
                opacity: 0,
                x: direction === "forward" ? 100 : -100,
              }}
              animate={{ opacity: 1, x: 0 }}
              exit={{
                opacity: 0,
                x: direction === "forward" ? -100 : 100,
              }}
              transition={{ duration: 0.3 }}
              className="p-8"
            >
              {/* Step Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
                {step.description && (
                  <p className="text-gray-600">{step.description}</p>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-6 mb-8">
                {step.fields.map((field) => (
                  <FormField
                    key={field.name}
                    field={field}
                    value={formData[field.name] || ""}
                    onChange={(value) => handleFieldChange(field.name, value)}
                    error={errors[field.name]}
                  />
                ))}
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{errors.submit}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0 || isSubmitting}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            <div className="flex gap-2">
              {onCancel && (
                <Button
                  variant="ghost"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Enviando...
                  </>
                ) : isLastStep ? (
                  <>
                    Enviar
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Seus dados estão seguros e protegidos conforme nossa política de privacidade.</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente para renderizar um campo do formulário
 */
interface FormFieldProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

function FormField({ field, value, onChange, error }: FormFieldProps) {
  const baseClasses =
    "w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition";

  switch (field.type) {
    case "text":
    case "email":
    case "tel":
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseClasses} ${error ? "border-red-500 focus:ring-red-500" : ""}`}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      );

    case "number":
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className={`${baseClasses} ${error ? "border-red-500 focus:ring-red-500" : ""}`}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      );

    case "select":
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseClasses} ${error ? "border-red-500 focus:ring-red-500" : ""}`}
          >
            <option value="">Selecione uma opção</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      );

    case "radio":
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      );

    case "checkbox":
      if (field.options && field.options.length > 0) {
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {field.options.map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    value={opt.value}
                    checked={selectedValues.includes(opt.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...selectedValues, opt.value]);
                      } else {
                        onChange(selectedValues.filter((v) => v !== opt.value));
                      }
                    }}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <span className="text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        );
      }
      return (
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
            />
            <span className="text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </span>
          </label>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      );

    default:
      return null;
  }
}
