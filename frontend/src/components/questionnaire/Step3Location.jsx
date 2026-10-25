import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { locationSchema } from "../../schemas/questionnaireSchema";

function Step3Location({ defaultValues, onNext, onBack }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      preferredLocation: defaultValues?.preferredLocation ?? "",
      maxDistanceKm: defaultValues?.maxDistanceKm ?? 10,
    },
  });

  const maxDistanceKm = watch("maxDistanceKm");
  const onSubmit = (data) => onNext(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Where are you looking?</h2>
        <p className="text-sm text-gray-500 mt-1">We'll prioritize matches near this area.</p>
      </div>

      <div>
        <label htmlFor="preferredLocation" className="block text-sm font-medium text-gray-700">Preferred location</label>
        <input
          id="preferredLocation"
          type="text"
          placeholder="Neighborhood, city, or area"
          {...register("preferredLocation")}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
        />
        {errors.preferredLocation && <p className="mt-1 text-sm text-red-600">{errors.preferredLocation.message}</p>}
      </div>

      <div>
        <label htmlFor="maxDistanceKm" className="block text-sm font-medium text-gray-700">
          Max distance: <span className="font-semibold text-gray-900">{maxDistanceKm} km</span>
        </label>
        <input
          id="maxDistanceKm"
          type="range"
          min="1"
          max="200"
          {...register("maxDistanceKm")}
          className="mt-2 w-full accent-blue-900"
        />
        {errors.maxDistanceKm && <p className="mt-1 text-sm text-red-600">{errors.maxDistanceKm.message}</p>}
      </div>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Back</button>
        <button type="submit" className="rounded-lg bg-blue-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">Continue</button>
      </div>
    </form>
  );
}

export default Step3Location;