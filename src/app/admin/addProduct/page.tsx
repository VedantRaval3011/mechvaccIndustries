// app/page.tsx
"use client";

import ProductList from "@/components/admin/products/ProductList";
import ProductPreview from "@/components/admin/products/ProductPreview";
import Step1 from "@/components/admin/products/Step1";
import Step2 from "@/components/admin/products/Step2";
import Step3 from "@/components/admin/products/Step3";
import ProductUpdateForm from "@/components/admin/products/ProductUpdateForm";
import { Product } from "@/types/product";
import { useState } from "react";

export default function Home() {
  const [step, setStep] = useState(1);
  const [productId, setProductId] = useState<string | null>(null);
  const [productData, setProductData] = useState<Partial<Product>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const nextStep = (id?: string, data?: Partial<Product>) => {
    if (id) setProductId(id);
    if (data) setProductData((prev) => ({ ...prev, ...data }));
    setStep((prev) => prev + 1);
  };

  const resetForm = () => {
    setStep(1);
    setProductId(null);
    setProductData({});
    setSelectedProduct(null);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="min-h-screen py-12 bg-gray-100">
      <div className="container mx-auto px-6 lg:px-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Step Tracker with Water Effect */}
              {!selectedProduct && (
                // Inside the Home component's return statement
                <div className="step-tracker mb-8">
                  <div className="steps-container">
                    <div className={`step z-10 ${step >= 1 ? "active" : ""}`}>
                      <span className="step-number">1</span>
                      <span className="step-label">Step 1</span>
                    </div>
                    <div className={`step z-10 ${step >= 2 ? "active" : ""}`}>
                      <span className="step-number">2</span>
                      <span className="step-label">Step 2</span>
                    </div>
                    <div className={`step z-10 ${step >= 3 ? "active" : ""}`}>
                      <span className="step-number">3</span>
                      <span className="step-label">Step 3</span>
                    </div>
                    <div className="water-shimmer"></div> {/* Shimmer layer */}
                  </div>
                  {/* SVG filter for wave effect */}
                  <svg className="wave-filter">
                    <defs>
                      <filter id="waveFilter">
                        <feTurbulence
                          type="fractalNoise"
                          baseFrequency="0.01"
                          numOctaves="2"
                          result="turbulence"
                        />
                        <feDisplacementMap
                          in="SourceGraphic"
                          in2="turbulence"
                          scale="5"
                          xChannelSelector="R"
                          yChannelSelector="G"
                        />
                      </filter>
                    </defs>
                  </svg>
                </div>
              )}

              {/* Form Steps */}
              {!selectedProduct && step === 1 && <Step1 onNext={nextStep} />}
              {!selectedProduct && step === 2 && productId && (
                <Step2 productId={productId} onNext={nextStep} />
              )}
              {!selectedProduct && step === 3 && productId && (
                <Step3 productId={productId} onComplete={resetForm} />
              )}
              {selectedProduct && (
                <ProductUpdateForm
                  product={selectedProduct}
                  onUpdateComplete={resetForm}
                  onDeleteComplete={resetForm}
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <ProductPreview product={selectedProduct || productData} />
          </div>
        </div>

        <div className="mt-12">
          <ProductList onProductSelect={handleProductSelect} />
        </div>
      </div>
    </div>
  );
}
