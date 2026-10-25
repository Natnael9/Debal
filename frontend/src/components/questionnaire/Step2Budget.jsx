import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { budgetSchema } from "../../schemas/questionnaireSchema";

function Step2Budget({ defaultValues, onNext, onBack }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      budgetMin: defaultValues?.budgetMin ?? "",
      budgetMax: defaultValues?.budgetMax ?? "",
    },
  });

  const onSubmit = (data) => onNext(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">What's your budget?</h2>
        <p className="text-sm text-gray-500 mt-1">Monthly range you're comfortable with.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="budgetMin" className="block text-sm font-medium text-gray-700">Minimum</label>
          <input
            id="budgetMin"
            type="number"
            min="0"
            {...register("budgetMin")}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
          />
          {errors.budgetMin && <p className="mt-1 text-sm text-red-600">{errors.budgetMin.message}</p>}
        </div>

        <div>
          <label htmlFor="budgetMax" className="block text-sm font-medium text-gray-700">Maximum</label>
          <input
            id="budgetMax"
            type="number"
            min="0"
            {...register("budgetMax")}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
          />
          {errors.budgetMax && <p className="mt-1 text-sm text-red-600">{errors.budgetMax.message}</p>}
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Back</button>
        <button type="submit" className="rounded-lg bg-blue-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">Continue</button>
      </div>
    </form>
  );
}

export default Step2Budget;