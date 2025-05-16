"use client";

import { Service } from "@/types/service";
import { useEffect, useState, useMemo } from "react";

interface ServiceListProps {
  onServiceSelect: (service: Service) => void;
}

export default function ServiceList({ onServiceSelect }: ServiceListProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchServices = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/services");
      if (!res.ok) {
        throw new Error("Failed to fetch services");
      }
      const data = await res.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleRefresh = () => {
    fetchServices();
  };

  // Function to delete a service
  const handleServiceDelete = async (serviceId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation(); // Prevent triggering the parent onClick
    }
    
    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete service');
      }
      
      // Remove the service from state
      setServices((prevServices) =>
        prevServices.filter((s) => s._id !== serviceId)
      );
      
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete service. Please try again.");
    }
  };

  const handleServiceUpdate = (updatedService: Service) => {
    setServices((prevServices) =>
      prevServices.map((s) =>
        s._id === updatedService._id ? updatedService : s
      )
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredServices = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return services;

    return services.filter((service) => {
      const nameMatch = service.name?.toLowerCase().includes(query);
      const groupMatch = service.group?.toLowerCase().includes(query);
      const priceMatch = service.price?.toString().includes(query);
      return nameMatch || groupMatch || priceMatch;
    });
  }, [services, searchQuery]);

  if (isLoading) {
    return <div>Loading services...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-800">Service List</h3>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-green)] rounded-full hover:bg-[var(--color-green-gradient-end)] transition-all disabled:opacity-50 flex items-center gap-2"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Refreshing...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </>
          )}
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by name, group, or price..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
            disabled={isRefreshing}
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {isRefreshing && !isLoading && (
        <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg mb-4">
          <svg className="animate-spin h-5 w-5 mr-3 text-[var(--color-green)]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-gray-700">Refreshing services...</span>
        </div>
      )}

      {filteredServices.length === 0 ? (
        <p className="text-gray-500">
          {searchQuery ? "No services match your search." : "No services available."}
        </p>
      ) : (
        <ul className="space-y-4">
          {filteredServices.map((service) => (
            <li
              key={service._id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
              onClick={() =>
                onServiceSelect({
                  ...service,
                  onUpdate: handleServiceUpdate,
                  onDelete: () => handleServiceDelete(service._id),
                } as Service & {
                  onUpdate?: (updatedService: Service) => void;
                  onDelete?: () => void;
                })
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-700">{service.displayTitle}</h4>
                  <p className="text-gray-600">{service.group} | {service.price && <span className="text-gray-800">Price: ${service.price}</span>}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-[var(--color-green)] hover:underline">
                    Edit
                  </button>
                  <button 
                    onClick={(e) => handleServiceDelete(service._id, e)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}