import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuestionnaireProvider, useQuestionnaire } from "../context/QuestionnaireContext";
import WizardProgress from "../components/questionnaire/WizardProgress";
import Step1BasicInfo from "../components/questionnaire/Step1BasicInfo";
import Step2Budget from "../components/questionnaire/Step2Budget";
import Step3Location from "../components/questionnaire/Step3Location";
import Step4Lifestyle from "../components/questionnaire/Step4Lifestyle";
import Step5Photos from "../components/questionnaire/Step5Photos";
import Step6TeamUp from "../components/questionnaire/Step6TeamUp";

function QuestionnaireWizardInner() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    steps,
    stepIndex,
    currentStepKey,
    isFinalStep,
    formData,
    saveStepData,
    goNext,
    goBack,
    goToStep,
    canAccessStep,
    clearDraft,
  } = useQuestionnaire();

  const handleStepNext = (values) => {
    saveStepData(values);
    goNext();
  };

  const handleFinalSubmit = async (values) => {
    setSubmitError(null);
    setIsSubmitting(true);
    const payload = { ...formData, ...values };

    try {
      // TODO: wire up to the real questionnaire submit endpoint
      console.log("Submitting questionnaire:", payload);
      clearDraft();
      navigate("/app/dashboard");
    } catch (err) {
      setSubmitError("Something went wrong submitting your answers. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-gray-100">
        <WizardProgress
          steps={steps}
          stepIndex={stepIndex}
          canAccessStep={canAccessStep}
          onStepClick={goToStep}
        />

        {submitError && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>
        )}

        {currentStepKey === "basicInfo" && (
          <Step1BasicInfo defaultValues={formData} onNext={handleStepNext} />
        )}
        {currentStepKey === "budget" && (
          <Step2Budget defaultValues={formData} onNext={handleStepNext} onBack={goBack} />
        )}
        {currentStepKey === "location" && (
          <Step3Location defaultValues={formData} onNext={handleStepNext} onBack={goBack} />
        )}
        {currentStepKey === "lifestyle" && (
          <Step4Lifestyle defaultValues={formData} onNext={handleStepNext} onBack={goBack} />
        )}
        {currentStepKey === "photo" && (
          <Step5Photos
            defaultValues={formData}
            onNext={handleStepNext}
            onFinish={handleFinalSubmit}
            onBack={goBack}
            isFinalStep={isFinalStep}
            isSubmitting={isSubmitting}
          />
        )}
        {currentStepKey === "teamUp" && (
          <Step6TeamUp
            defaultValues={formData}
            onFinish={handleFinalSubmit}
            onBack={goBack}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}

function QuestionnaireWizard() {
  return (
    <QuestionnaireProvider>
      <QuestionnaireWizardInner />
    </QuestionnaireProvider>
  );
}

export default QuestionnaireWizard;