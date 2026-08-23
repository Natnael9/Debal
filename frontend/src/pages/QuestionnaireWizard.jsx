import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuestionnaireProvider, useQuestionnaire } from "../context/QuestionnaireContext";
import { useAuth } from "../context/AuthContext";
import WizardProgress from "../components/questionnaire/WizardProgress";
import Step1BasicInfo from "../components/questionnaire/Step1BasicInfo";
import Step2Budget from "../components/questionnaire/Step2Budget";
import Step3Location from "../components/questionnaire/Step3Location";
import Step4Lifestyle from "../components/questionnaire/Step4Lifestyle";
import Step6TeamUp from "../components/questionnaire/Step6TeamUp";
import Step5Photos from "../components/questionnaire/Step5Photos";
import { apiPost, apiPatch } from "../services/api";

function QuestionnaireWizardInner() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    steps,
    stepIndex,
    currentStepKey,
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
    const raw = { ...formData, ...values };

    // ── Gender mapping ────────────────────────────────────────────────────────
    const genderMap = { woman: "female", man: "male" };
    const gender = genderMap[raw.gender] ?? (raw.gender === "female" || raw.gender === "male" ? raw.gender : "male");

    // ── Cleanliness mapping ───────────────────────────────────────────────────
    const cleanlinessMap = { relaxed: 2, moderate: 3, very_clean: 5 };
    const cleanliness = typeof raw.cleanliness === "number"
      ? raw.cleanliness
      : (cleanlinessMap[raw.cleanliness] ?? (Number(raw.lifestyle?.cleanliness) || 3));

    // ── Smoking / pets mapping ────────────────────────────────────────────────
    const smokingOk = raw.smoking === "yes" || raw.smoking === "outdoors_only" || raw.smokingOk === true || raw.lifestyle?.smokingOk === true;
    const petsOk    = raw.pets === "has_pets" || raw.pets === "okay_with_pets" || raw.petsOk === true || raw.lifestyle?.petsOk === true;

    // ── Sleep Schedule ────────────────────────────────────────────────────────
    const sleepSchedule = raw.sleepSchedule || raw.lifestyle?.sleepSchedule || "flexible";

    // ── Location mapping ──────────────────────────────────────────────────────
    const locationCoords = Array.isArray(raw.location?.coordinates) && raw.location.coordinates.length === 2
      ? raw.location.coordinates.map(Number)
      : [38.7635, 9.0168]; // Addis Ababa default
    const locationName   = raw.location?.displayName || raw.preferredLocation || "Addis Ababa";
    const maxDistance    = Math.max(1, Number(raw.maxDistanceKm ?? raw.maxDistance ?? 10));

    // ── Budget mapping ────────────────────────────────────────────────────────
    const budgetMin = Math.max(0, Number(raw.budgetMin ?? raw.budget?.budgetMin ?? 0));
    const rawMax    = Number(raw.budgetMax ?? raw.budget?.budgetMax ?? 10000);
    const budgetMax = Math.max(budgetMin, rawMax);

    // ── Age ───────────────────────────────────────────────────────────────────
    const age = Math.min(100, Math.max(18, Number(raw.age || 20)));

    // ── Final payload ─────────────────────────────────────────────────────────
    const payload = {
      housingStatus: raw.housingStatus || "needs_room",
      age,
      gender,
      bio:           raw.bio || "",
      budget: {
        budgetMin,
        budgetMax,
      },
      location: {
        coordinates: locationCoords,
        displayName: locationName,
      },
      maxDistance,
      lifestyle: {
        cleanliness,
        sleepSchedule,
        smokingOk,
        petsOk,
      },
      teamUpEnabled: raw.housingStatus === "needs_room" ? Boolean(raw.teamUp ?? raw.teamUpEnabled) : false,
    };

    try {
      const res = await apiPost("/onboarding/questionnaire", payload);
      let updatedUser = res?.data?.user;
      
      // Save avatar if photo was uploaded
      if (values?.photo?.url) {
        try {
          const patchRes = await apiPatch("/users/me", { avatarUrl: values.photo.url });
          if (patchRes?.data?.user) {
            updatedUser = patchRes.data.user;
          }
        } catch (err) {
          console.warn("Failed to update profile avatar:", err);
        }
      }

      // Update AuthContext user state locally so ProtectedRoutes allows entry immediately!
      if (updatedUser) {
        setUser(updatedUser);
      } else {
        setUser((prev) => (prev ? { ...prev, questionnaireCompleted: true } : null));
      }

      clearDraft();

      // Route based on verification status
      const targetUser = updatedUser || user;
      if (targetUser?.verificationStatus !== "verified") {
        navigate("/app/verification", { replace: true });
      } else {
        navigate("/app/dashboard", { replace: true });
      }
    } catch (err) {
      setSubmitError(err.message || "Something went wrong submitting your answers. Please try again.");
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
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {submitError}
          </p>
        )}

        {currentStepKey === "basicInfo" && (
          <Step1BasicInfo defaultValues={formData} onNext={handleStepNext} />
        )}

        {currentStepKey === "budget" && (
          <Step2Budget
            defaultValues={formData}
            onNext={handleStepNext}
            onBack={goBack}
          />
        )}

        {currentStepKey === "location" && (
          <Step3Location
            defaultValues={formData}
            onNext={handleStepNext}
            onBack={goBack}
          />
        )}

        {currentStepKey === "lifestyle" && (
          <Step4Lifestyle
            defaultValues={formData}
            onNext={handleStepNext}
            onBack={goBack}
          />
        )}

        {currentStepKey === "teamUp" && (
          <Step6TeamUp
            defaultValues={formData}
            onNext={handleStepNext}
            onBack={goBack}
          />
        )}

        {currentStepKey === "photo" && (
          <Step5Photos
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