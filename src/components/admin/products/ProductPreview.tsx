'use client';

import { Product } from '@/types/product';

interface ProductPreviewProps {
  product: Partial<Product>;
}

export default function ProductPreview({ product }: ProductPreviewProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Product Preview</h2>
      
      {product.displayImage && (
        <img src={product.displayImage} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-4" />
      )}
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-800">{product.displayTitle || 'No title'}</h3>
          <p className="text-gray-600">{product.name || 'No name'}</p>
        </div>

        {product.description && (
          <div>
            <h4 className="text-sm font-medium text-gray-700">Description:</h4>
            <p className="text-gray-600">{product.description}</p>
          </div>
        )}

        {product.applications && (
        <div>
          <h4 className="text-sm font-medium text-gray-700">Applications:</h4>
          <p className="text-gray-600">{product.applications}</p>
        </div>
      )}
        
        {product.group && <p className="text-gray-600">Group: {product.group}</p>}
        
        {product.additionalImages && product.additionalImages.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700">Additional Images:</h4>
            <div className="flex gap-2 mt-2 flex-wrap">
              {product.additionalImages.map((img, index) => (
                <img key={index} src={img} alt="Additional" className="h-16 rounded-lg" />
              ))}
            </div>
          </div>
        )}
        
        {product.video && (
          <div>
            <h4 className="text-sm font-medium text-gray-700">Video:</h4>
            <a href={product.video} target="_blank" rel="noopener noreferrer" className="text-green-500 break-all">
              {product.video}
            </a>
          </div>
        )}
        
        {product.pdf && (
          <div>
            <h4 className="text-sm font-medium text-gray-700">PDF:</h4>
            <a href={product.pdf} target="_blank" rel="noopener noreferrer" className="text-green-500 break-all">
              {product.pdf}
            </a>
          </div>
        )}
        
        {product.specifications && product.specifications.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700">Specifications:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {product.specifications.map((spec, i) => (
                <li key={i}>{spec.title}: {spec.value}</li>
              ))}
            </ul>
          </div>
        )}
        
        {product.queries && product.queries.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700">Queries:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {product.queries.map((query, i) => (
                <li key={i}>{query.title} ({query.type})</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}