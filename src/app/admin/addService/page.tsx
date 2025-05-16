"use client";

import ServiceList from "@/components/admin/service/ServicesList";
import ServicePreview from "@/components/admin/service/ServicePreview";
import AddService from "@/components/admin/service/Step1";
import ServiceStep2 from "@/components/admin/service/Step2";
import ServiceStep3 from "@/components/admin/service/Step3";
import ServiceUpdateForm from "@/components/admin/service/ServiceUpdateForm";
import { Service } from "@/types/service";
import { useState } from "react";

export default function ServicesPage() {
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [serviceData, setServiceData] = useState<Partial<Service>>({});
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const nextStep = (id?: string, data?: Partial<Service>) => {
    if (id) setServiceId(id);
    if (data) setServiceData((prev) => ({ ...prev, ...data }));
    setStep((prev) => prev + 1);
  };

  const resetForm = () => {
    setStep(1);
    setServiceId(null);
    setServiceData({});
    setSelectedService(null);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3 lg:gap-10">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              {/* Step Tracker with Water Effect */}
              {!selectedService && (
                <div className="step-tracker mb-6 sm:mb-8">
                  <div className="steps-container flex justify-between relative">
                    <div className={`step z-10 ${step >= 1 ? "active" : ""} flex flex-col items-center`}>
                      <span className="step-number text-sm sm:text-base w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 ${step >= 1 ? 'bg-green-400 text-white' : ''}">1</span>
                      <span className="step-label text-xs sm:text-sm mt-2">Step 1</span>
                    </div>
                    <div className={`step z-10 ${step >= 2 ? "active" : ""} flex flex-col items-center`}>
                      <span className="step-number text-sm sm:text-base w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 ${step >= 2 ? 'bg-green-400 text-white' : ''}">2</span>
                      <span className="step-label text-xs sm:text-sm mt-2">Step 2</span>
                    </div>
                    <div className={`step z-10 ${step >= 3 ? "active" : ""} flex flex-col items-center`}>
                      <span className="step-number text-sm sm:text-base w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 ${step >= 3 ? 'bg-green-400 text-white' : ''}">3</span>
                      <span className="step-label text-xs sm:text-sm mt-2">Step 3</span>
                    </div>
                    <div className="water-shimmer absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-blue-200/50 to-transparent animate-shimmer"></div>
                  </div>
                  <svg className="wave-filter hidden">
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
              {!selectedService && step === 1 && (
                <AddService onNext={nextStep} />
              )}
              {!selectedService && step === 2 && serviceId && (
                <ServiceStep2 serviceId={serviceId} onNext={nextStep} />
              )}
              {!selectedService && step === 3 && serviceId && (
                <ServiceStep3 serviceId={serviceId} onComplete={resetForm} />
              )}
              {selectedService && (
                <ServiceUpdateForm
                  service={selectedService}
                  onUpdateComplete={resetForm}
                  onDeleteComplete={resetForm}
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <ServicePreview service={selectedService || serviceData} />
          </div>
        </div>

        <div className="mt-8 sm:mt-12">
          <ServiceList onServiceSelect={handleServiceSelect} />
        </div>
      </div>
    </div>
  );
}