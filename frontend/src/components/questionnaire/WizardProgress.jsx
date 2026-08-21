import { STEP_LABELS } from "../../schemas/questionnaireSchema";

function WizardProgress({ steps, stepIndex, canAccessStep, onStepClick }) {
  const percent = Math.round(((stepIndex + 1) / steps.length) * 100);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {steps.map((key, i) => {
          const isActive = i === stepIndex;
          const isComplete = i < stepIndex;
          const isReachable = canAccessStep(i);

          return (
            <button
              key={key}
              type="button"
              disabled={!isReachable}
              onClick={() => isReachable && onStepClick(i)}
              className={`flex flex-col items-center flex-1 text-xs font-medium transition ${
                isReachable ? "cursor-pointer" : "cursor-not-allowed opacity-40"
              }`}
            >
              <span
                className={`h-7 w-7 rounded-full flex items-center justify-center mb-1 text-white ${
                  isActive ? "bg-blue-900" : isComplete ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                {isComplete ? "✓" : i + 1}
              </span>
              <span className={isActive ? "text-blue-900" : "text-gray-500"}>
                {STEP_LABELS[key]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-blue-900 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default WizardProgress;