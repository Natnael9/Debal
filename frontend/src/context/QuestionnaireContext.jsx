import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { STEP_ORDER } from "../schemas/questionnaireSchema";

const STORAGE_KEY = "questionnaire_draft_v1";
const QuestionnaireContext = createContext(null);

function loadDraft() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function QuestionnaireProvider({ children }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState(loadDraft);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // sessionStorage unavailable — non-critical
    }
  }, [formData]);

  // FR-3.2: housingStatus (collected in step 1) gates every later step.
  const housingStatusComplete = Boolean(formData.housingStatus);

  const canAccessStep = useCallback(
    (index) => (index === 0 ? true : housingStatusComplete),
    [housingStatusComplete]
  );

  const saveStepData = useCallback((values) => {
    setFormData((prev) => ({ ...prev, ...values }));
  }, []);

  const goNext = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, STEP_ORDER.length - 1));
  }, []);

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goToStep = useCallback(
    (index) => {
      if (canAccessStep(index)) setStepIndex(index);
    },
    [canAccessStep]
  );

  const clearDraft = useCallback(() => {
    setFormData({});
    setStepIndex(0);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const value = {
    stepIndex,
    totalSteps: STEP_ORDER.length,
    currentStepKey: STEP_ORDER[stepIndex],
    formData,
    saveStepData,
    goNext,
    goBack,
    goToStep,
    canAccessStep,
    clearDraft,
  };

  return (
    <QuestionnaireContext.Provider value={value}>
      {children}
    </QuestionnaireContext.Provider>
  );
}

export function useQuestionnaire() {
  const ctx = useContext(QuestionnaireContext);
  if (!ctx) throw new Error("useQuestionnaire must be used within a QuestionnaireProvider");
  return ctx;
}