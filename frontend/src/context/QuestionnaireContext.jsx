import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
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

  // FR-3.7: the "teamUp" step is only visible for needs_room users —
  // filter it out of the active step list for everyone else.
  const steps = useMemo(() => {
    return STEP_ORDER.filter(
      (key) => key !== "teamUp" || formData.housingStatus === "needs_room"
    );
  }, [formData.housingStatus]);

  // Clamp stepIndex if housingStatus changes (e.g. user goes back and
  // switches from needs_room to has_room) and the teamUp step disappears.
  useEffect(() => {
    setStepIndex((i) => Math.min(i, steps.length - 1));
  }, [steps.length]);

  const canAccessStep = useCallback(
    (index) => (index === 0 ? true : housingStatusComplete),
    [housingStatusComplete]
  );

  const saveStepData = useCallback((values) => {
    setFormData((prev) => ({ ...prev, ...values }));
  }, []);

  const goNext = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }, [steps.length]);

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
    steps,
    stepIndex,
    totalSteps: steps.length,
    currentStepKey: steps[stepIndex],
    isFinalStep: stepIndex === steps.length - 1,
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