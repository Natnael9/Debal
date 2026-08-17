import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teamUpSchema } from "../../schemas/questionnaireSchema";

// FR-3.7: opt-in toggle, only rendered when housingStatus === 'needs_room'.
// Photos is now the final step, so this hands off with onNext.
function Step6TeamUp({ defaultValues, onNext, onBack }) {
  const { register, handleSubmit, watch } = useForm({
    resolver: zodResolver(teamUpSchema),
    defaultValues: { teamUp: defaultValues?.teamUp ?? false },
  });

  const teamUp = watch("teamUp");
  const onSubmit = (data) => onNext(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Want to team up?</h2>
        <p className="text-sm text-gray-500 mt-1">
          Since you're also looking for a room, you can be matched with
          others in the same boat.
        </p>
      </div>

      <label
        className={`flex items-start gap-3 cursor-pointer rounded-lg border p-4 transition ${
          teamUp ? "border-blue-600 ring-1 ring-blue-600 bg-blue-50" : "border-gray-300 bg-white"
        }`}
      >
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          {...register("teamUp")}
        />
        <span>
          <span className="block font-medium text-gray-900">Open to teaming up</span>
          <span className="block text-sm text-gray-500 mt-0.5">
            Also match me with other people looking for a place, so we can
            search together — not just with people who already have a room.
          </span>
        </span>
      </label>

      <p className="text-xs text-gray-400">
        You can turn this on or off later from your preferences too.
      </p>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="submit"
          className="rounded-lg bg-blue-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    </form>
  );
}

export default Step6TeamUp;