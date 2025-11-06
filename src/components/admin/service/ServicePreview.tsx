'use client';

import { Service } from '@/types/service';
import { motion } from 'framer-motion';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

interface ServicePreviewProps {
  service: Partial<Service>;
}

export default function ServicePreview({ service }: ServicePreviewProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Service Preview</h2>

      {Object.keys(service).length === 0 ? (
        <p className="text-gray-500 text-sm">No service data to preview yet.</p>
      ) : (
        <div className="space-y-6">
          {/* Display Image */}
          {service.displayImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100"
            >
              <Image
                src={service.displayImage}
                alt={service.displayTitle || 'Service Image'}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                quality={80}
                className="transition-all duration-300"
              />
            </motion.div>
          )}

          {/* Title and Group */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {service.displayTitle || 'No title'}
            </h3>
            {service.group && (
              <p className="text-sm text-gray-600">
                Group: <span className="text-gray-700">{service.group}</span>
              </p>
            )}
            {service.name && service.name !== service.displayTitle && (
              <p className="text-sm text-gray-600 mt-1">
                Name: <span className="text-gray-700">{service.name}</span>
              </p>
            )}
          </div>

          {/* Description */}
          {service.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Description:</h4>
              <div className="prose prose-sm max-w-none text-gray-600">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize]}
                  components={{
                    p: ({ node, ...props }) => (
                      <p className="text-gray-600 mb-2 text-sm" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc list-inside text-gray-600 mb-2 text-sm" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal list-inside text-gray-600 mb-2 text-sm" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="text-gray-600 mb-1 text-sm" {...props} />
                    ),
                    a: ({ node, ...props }) => (
                      <a className="text-[var(--color-green)] hover:underline" {...props} />
                    ),
                  }}
                >
                  {service.description}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Applications */}
          {service.applications && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Applications:</h4>
              <p className="text-gray-600 text-sm">{service.applications}</p>
            </div>
          )}

          {/* Additional Images */}
          {service.additionalImages && service.additionalImages.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Images:</h4>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {service.additionalImages
                  .filter((img): img is string => !!img && img !== '')
                  .map((img, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
                    >
                      <Image
                        src={img}
                        alt={`Additional Image ${index + 1}`}
                        fill
                        sizes="64px"
                        style={{ objectFit: 'cover' }}
                        quality={80}
                      />
                    </motion.div>
                  ))}
              </div>
            </div>
          )}

          {/* Video */}
          {service.video && service.video !== '' && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Video:</h4>
              <a
                href={service.video}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-green)] hover:underline text-sm break-all"
              >
                {service.video}
              </a>
            </div>
          )}

          {/* PDF */}
          {service.pdf && service.pdf !== '' && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">PDF:</h4>
              <a
                href={service.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-green)] hover:underline text-sm break-all"
              >
                {service.pdf}
              </a>
            </div>
          )}

          {/* Specifications */}
          {service.specifications && service.specifications.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Specifications:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {service.specifications.map((spec, index) => (
                  <li key={index}>
                    <span className="font-medium">{spec.title}:</span> {spec.value}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Queries */}
          {service.queries && service.queries.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Queries:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {service.queries.map((query, index) => (
                  <li key={index}>
                    {query.title} <span className="text-gray-500">({query.type})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Custom Sections */}
          {service.customSections && service.customSections.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Sections:</h4>
              <div className="space-y-4">
                {service.customSections.map((section, index) => (
                  <div key={index}>
                    <h5 className="text-sm font-medium text-gray-800 mb-1">{section.title}</h5>
                    <div className="prose prose-sm max-w-none text-gray-600">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        components={{
                          p: ({ node, ...props }) => (
                            <p className="text-gray-600 mb-2 text-sm" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc list-inside text-gray-600 mb-2 text-sm" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="list-decimal list-inside text-gray-600 mb-2 text-sm" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="text-gray-600 mb-1 text-sm" {...props} />
                          ),
                          a: ({ node, ...props }) => (
                            <a className="text-[var(--color-green)] hover:underline" {...props} />
                          ),
                        }}
                      >
                        {section.content || 'No content available'}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}