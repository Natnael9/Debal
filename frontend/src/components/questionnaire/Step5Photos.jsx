import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { photoSchema } from "../../schemas/questionnaireSchema";

function Step5Photos({ defaultValues, onNext, onFinish, onBack, isFinalStep, isSubmitting }) {
  const [photoPreview, setPhotoPreview] = useState(defaultValues?.photoPreview ?? null);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(photoSchema),
    defaultValues: { photo: defaultValues?.photo ?? undefined },
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setValue("photo", file, { shouldValidate: true });
    setPhotoPreview(URL.createObjectURL(file));
  };

  const onSubmit = (data) => {
    const values = { ...data, photoPreview };
    isFinalStep ? onFinish(values) : onNext(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Add a profile photo</h2>
        <p className="text-sm text-gray-500 mt-1">
          Optional, but profiles with a photo get more matches.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        {photoPreview ? (
          <img src={photoPreview} alt="Profile preview" className="h-32 w-32 rounded-full object-cover border border-gray-200" />
        ) : (
          <div className="h-32 w-32 rounded-full bg-gray-100 border border-gray-200" />
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoChange}
          className="text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
        />
        {errors.photo && <p className="text-sm text-red-600">{errors.photo.message}</p>}
      </div>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Back</button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
        >
          {isFinalStep ? (isSubmitting ? "Submitting…" : "Finish") : "Continue"}
        </button>
      </div>
    </form>
  );
}

export default Step5Photos;