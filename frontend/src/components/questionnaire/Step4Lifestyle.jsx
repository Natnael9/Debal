import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { lifestyleSchema } from "../../schemas/questionnaireSchema";

const FIELDS = [
  { name: "cleanliness", label: "How tidy do you keep your space?", options: [
    { value: "relaxed", label: "Relaxed" }, { value: "moderate", label: "Moderate" }, { value: "very_clean", label: "Very clean" },
  ]},
  { name: "sleepSchedule", label: "Sleep schedule", options: [
    { value: "early_bird", label: "Early bird" }, { value: "night_owl", label: "Night owl" }, { value: "flexible", label: "Flexible" },
  ]},
  { name: "smoking", label: "Smoking", options: [
    { value: "no", label: "No" }, { value: "outdoors_only", label: "Outdoors only" }, { value: "yes", label: "Yes" },
  ]},
  { name: "pets", label: "Pets", options: [
    { value: "no_pets", label: "No pets" }, { value: "has_pets", label: "I have pets" }, { value: "okay_with_pets", label: "Okay with pets" },
  ]},
];

function Step4Lifestyle({ defaultValues, onNext, onBack }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(lifestyleSchema),
    defaultValues: {
      cleanliness: defaultValues?.cleanliness ?? undefined,
      sleepSchedule: defaultValues?.sleepSchedule ?? undefined,
      smoking: defaultValues?.smoking ?? undefined,
      pets: defaultValues?.pets ?? undefined,
    },
  });

  const onSubmit = (data) => onNext(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lifestyle</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Helps us match you with compatible roommates.</p>
      </div>

      {FIELDS.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{field.label}</label>
          <div className="grid grid-cols-3 gap-2">
            {field.options.map((opt) => (
              <label
                key={opt.value}
                className="cursor-pointer select-none rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-center text-sm font-medium text-gray-700 dark:text-gray-200 transition-all hover:border-[#2274A5] hover:bg-gray-50 dark:hover:bg-gray-700/60 has-[:checked]:border-[#2274A5] has-[:checked]:bg-[#2274A5] has-[:checked]:text-white dark:has-[:checked]:border-[#2274A5] dark:has-[:checked]:bg-[#2274A5] dark:has-[:checked]:text-white has-[:checked]:shadow-xs has-[:checked]:font-semibold"
              >
                <input type="radio" value={opt.value} className="sr-only" {...register(field.name)} />
                {opt.label}
              </label>
            ))}
          </div>
          {errors[field.name] && <p className="mt-1 text-sm text-red-600">{errors[field.name].message}</p>}
        </div>
      ))}

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="rounded-xl border border-gray-300 dark:border-gray-700 px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition">Back</button>
        <button type="submit" className="rounded-xl bg-[#0B3954] hover:bg-[#072435] dark:bg-[#2274A5] dark:hover:bg-[#1b5d85] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition">Continue</button>
      </div>
    </form>
  );
}

export default Step4Lifestyle;