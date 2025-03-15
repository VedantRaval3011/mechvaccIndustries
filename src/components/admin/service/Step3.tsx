// app/components/ServiceStep3.tsx
'use client';

import { useForm, useFieldArray, FieldError } from 'react-hook-form';
import { Query } from '@/types/service';
import { useState } from 'react';

interface ServiceStep3Props {
  serviceId: string;
  onComplete: () => void;
}

export default function ServiceStep3({ serviceId, onComplete }: ServiceStep3Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      queries: [{ title: '', type: 'string' as const }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'queries',
  });

  const onSubmit = async (data: { queries: Query[] }) => {
    setIsLoading(true);
    await fetch(`/api/services/step3/${serviceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queries: data.queries }),
    });
    onComplete();
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 border-b pb-4">Service Queries</h2>

      {isLoading && (
        <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
          <svg className="animate-spin h-5 w-5 mr-3 text-[var(--color-green)]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-gray-700">Saving queries...</span>
        </div>
      )}

      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Query Title</label>
              <input
                {...register(`queries.${index}.title` as const)}
                placeholder="Enter query title"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
                disabled={isLoading}
              />
              {errors.queries?.[index]?.title && (
                <p className="text-red-500 text-sm mt-1">{errors.queries[index]?.title?.message}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Query Type</label>
              <select
                {...register(`queries.${index}.type` as const)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
                disabled={isLoading}
              >
                <option value="number">Number</option>
                <option value="string">String</option>
              </select>
              {errors.queries?.[index]?.type && typeof errors.queries[index]?.type === 'object' && 'message' in errors.queries[index]?.type && (
                <p className="text-red-500 text-sm mt-1">{(errors.queries[index]?.type as FieldError).message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="p-2 text-red-500 hover:text-red-700 transition-colors"
              disabled={isLoading}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ title: '', type: 'string' })}
          className="mt-2 inline-flex items-center px-4 py-2 border border-[var(--color-green)] text-sm font-medium rounded-full text-[var(--color-green)] hover:bg-[var(--color-green)] hover:text-white transition-all"
          disabled={isLoading}
        >
          + Add More Queries
        </button>
      </div>

      <button
        type="submit"
        className="w-full inline-flex justify-center items-center px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-[var(--color-green-gradient-start)] to-[var(--color-green-gradient-end)] rounded-full hover:from-[var(--color-green-gradient-end)] hover:to-[var(--color-green-gradient-start)] transition-all transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50"
        disabled={isLoading}
      >
        Complete
      </button>
    </form>
  );
}