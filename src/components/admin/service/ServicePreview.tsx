// app/components/admin/services/ServicePreview.tsx
"use client";

import { Service } from "@/types/service";

interface ServicePreviewProps {
  service: Partial<Service>;
}

export default function ServicePreview({ service }: ServicePreviewProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Service Preview</h3>
      {Object.keys(service).length === 0 ? (
        <p className="text-gray-500">No service data to preview yet.</p>
      ) : (
        <div className="space-y-4">
          {service.displayImage && (
            <img
              src={service.displayImage}
              alt="Display Image"
              className="w-full h-48 object-cover rounded-lg"
            />
          )}
          <h4 className="text-xl font-semibold text-gray-700">{service.displayTitle}</h4>
          <p className="text-gray-500">Group: {service.group}</p>
          {service.price && <p className="text-gray-700">Price: ${service.price}</p>}
          {service.additionalImages && service.additionalImages.length > 0 && (
            <div>
              <h5 className="text-lg font-medium text-gray-700">Additional Images</h5>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {service.additionalImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Additional Image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}
          {service.video && (
            <p className="text-gray-700">
              Video: <a href={service.video} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{service.video}</a>
            </p>
          )}
          {service.pdf && (
            <p className="text-gray-700">
              PDF: <a href={service.pdf} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{service.pdf}</a>
            </p>
          )}
          {service.specifications && service.specifications.length > 0 && (
            <div>
              <h5 className="text-lg font-medium text-gray-700">Specifications</h5>
              <ul className="list-disc pl-5">
                {service.specifications.map((spec, index) => (
                  <li key={index} className="text-gray-600">{spec.title}: {spec.value}</li>
                ))}
              </ul>
            </div>
          )}
          {service.queries && service.queries.length > 0 && (
            <div>
              <h5 className="text-lg font-medium text-gray-700">Queries</h5>
              <ul className="list-disc pl-5">
                {service.queries.map((query, index) => (
                  <li key={index} className="text-gray-600">{query.title} ({query.type})</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}