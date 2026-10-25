import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step1Schema } from "../../schemas/questionnaireSchema";

const BIO_PROMPTS = [
  "Describe a typical weekday for you.",
  "What matters most to you in a roommate?",
  "How do you usually spend your weekends?",
];

function Step1BasicInfo({ defaultValues, onNext }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      housingStatus: defaultValues?.housingStatus ?? undefined,
      age: defaultValues?.age ?? "",
      gender: defaultValues?.gender ?? undefined,
      bio: defaultValues?.bio ?? "",
    },
  });

  const housingStatus = watch("housingStatus");
  const bio = watch("bio") ?? "";

  const insertPrompt = (prompt) => {
    const separator = bio.trim().length ? "\n\n" : "";
    setValue("bio", `${bio}${separator}${prompt} `, { shouldValidate: true });
  };

  const onSubmit = (data) => onNext(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Let's start with the basics</h2>
        <p className="text-sm text-gray-500 mt-1">
          We ask your housing situation first — it decides how we match you.
        </p>
      </div>

      {/* Housing status — required before the rest of the wizard (FR-3.2) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What's your housing situation?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label
            className={`cursor-pointer rounded-lg border p-4 transition ${
              housingStatus === "has_room"
                ? "border-blue-600 ring-1 ring-blue-600 bg-blue-50"
                : "border-gray-300 bg-white"
            }`}
          >
            <input type="radio" value="has_room" className="sr-only" {...register("housingStatus")} />
            <span className="block font-medium text-gray-900">I have a room</span>
            <span className="block text-sm text-gray-500 mt-1">Looking for someone to move in.</span>
          </label>

          <label
            className={`cursor-pointer rounded-lg border p-4 transition ${
              housingStatus === "needs_room"
                ? "border-blue-600 ring-1 ring-blue-600 bg-blue-50"
                : "border-gray-300 bg-white"
            }`}
          >
            <input type="radio" value="needs_room" className="sr-only" {...register("housingStatus")} />
            <span className="block font-medium text-gray-900">I need a room</span>
            <span className="block text-sm text-gray-500 mt-1">Looking for a place to live.</span>
          </label>
        </div>
        {errors.housingStatus && (
          <p className="mt-1 text-sm text-red-600">{errors.housingStatus.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
          <input
            id="age"
            type="number"
            {...register("age")}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
          />
          {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>}
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            id="gender"
            {...register("gender")}
            defaultValue=""
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
          >
            <option value="" disabled>Select…</option>
            <option value="woman">Woman</option>
            <option value="man">Man</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
          {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
        <textarea
          id="bio"
          rows={5}
          placeholder="Introduce yourself..."
          {...register("bio")}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
        />
        {errors.bio ? (
          <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
        ) : (
          <span className="text-xs text-gray-400">{bio.length}/500</span>
        )}

        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500 mb-1.5">Need inspiration? Tap a prompt:</p>
          <div className="flex flex-wrap gap-2">
            {BIO_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => insertPrompt(prompt)}
                className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
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

export default Step1BasicInfo;