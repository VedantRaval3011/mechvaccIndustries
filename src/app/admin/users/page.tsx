"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import * as XLSX from 'xlsx';

interface EnquiryUser {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  contact: string;
  message: string;
  country: string;
  createdAt: Date;
  source?: string;
  status?: string;
}

interface InterestedUser {
  _id: string;
  productId: string;
  productTitle: string;
  queries: { title: string; type: string; value: string }[];
  createdAt: Date;
  source?: string;
  status?: string;
}

interface FilterOptions {
  startDate: string;
  endDate: string;
  searchQuery: string;
  year: string;
  month: string;
  source: string;
  status: string;
  country: string;
  product: string;
}

export default function ManageUsers() {
  const [enquiryUsers, setEnquiryUsers] = useState<EnquiryUser[]>([]);
  const [interestedUsers, setInterestedUsers] = useState<InterestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"enquiry" | "interested">("interested");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    startDate: "",
    endDate: "",
    searchQuery: "",
    year: "",
    month: "",
    source: "",
    status: "",
    country: "",
    product: ""
  });

  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const enquiryRes = await fetch('/api/enquiry/users');
        if (!enquiryRes.ok) throw new Error("Failed to fetch enquiry users");
        const enquiryData = await enquiryRes.json();
        setEnquiryUsers(enquiryData);

        const interestedRes = await fetch('/api/interested-users');
        if (!interestedRes.ok) throw new Error("Failed to fetch interested users");
        const interestedData = await interestedRes.json();
        setInterestedUsers(interestedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Enhanced filtering
  const filteredEnquiryUsers = enquiryUsers.filter(user => {
    const userDate = new Date(user.createdAt);
    const userYear = userDate.getFullYear().toString();
    const userMonth = (userDate.getMonth() + 1).toString();

    if (filterOptions.startDate && new Date(filterOptions.startDate) > userDate) return false;
    if (filterOptions.endDate && new Date(filterOptions.endDate) < userDate) return false;
    if (filterOptions.year && filterOptions.year !== userYear) return false;
    if (filterOptions.month && filterOptions.month !== userMonth) return false;
    if (filterOptions.source && user.source !== filterOptions.source) return false;
    if (filterOptions.status && user.status !== filterOptions.status) return false;
    if (filterOptions.country && user.country !== filterOptions.country) return false;

    if (filterOptions.searchQuery) {
      const query = filterOptions.searchQuery.toLowerCase();
      return (
        user.firstname.toLowerCase().includes(query) ||
        user.lastname.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.contact.toLowerCase().includes(query) ||
        user.message.toLowerCase().includes(query) ||
        user.country.toLowerCase().includes(query) ||
        (user.source?.toLowerCase().includes(query) || false)
      );
    }

    return true;
  });

  const filteredInterestedUsers = interestedUsers.filter(user => {
    const userDate = new Date(user.createdAt);
    const userYear = userDate.getFullYear().toString();
    const userMonth = (userDate.getMonth() + 1).toString();

    if (filterOptions.startDate && new Date(filterOptions.startDate) > userDate) return false;
    if (filterOptions.endDate && new Date(filterOptions.endDate) < userDate) return false;
    if (filterOptions.year && filterOptions.year !== userYear) return false;
    if (filterOptions.month && filterOptions.month !== userMonth) return false;
    if (filterOptions.source && (user.source || '') !== filterOptions.source) return false;
    if (filterOptions.status && (user.status || '') !== filterOptions.status) return false;
    if (filterOptions.product && user.productTitle !== filterOptions.product) return false;

    if (filterOptions.searchQuery) {
      const query = filterOptions.searchQuery.toLowerCase();
      return (
        user.productTitle.toLowerCase().includes(query) ||
        user.productId.toLowerCase().includes(query) ||
        user.queries.some(q =>
          q.title.toLowerCase().includes(query) ||
          q.value.toLowerCase().includes(query)
        ) ||
        (user.source?.toLowerCase().includes(query) || false)
      );
    }

    return true;
  });

  // Filter options data
  const getYears = () => {
    const years = new Set<string>();
    [...enquiryUsers, ...interestedUsers].forEach(user => {
      years.add(new Date(user.createdAt).getFullYear().toString());
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  };

  const getMonths = () => [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];

  const getSources = () => {
    const sources = new Set<string>();
    [...enquiryUsers, ...interestedUsers].forEach(user => {
      if (user.source) sources.add(user.source);
    });
    return Array.from(sources).sort();
  };

  const getStatuses = () => {
    const statuses = new Set<string>();
    [...enquiryUsers, ...interestedUsers].forEach(user => {
      if (user.status) statuses.add(user.status);
    });
    return Array.from(statuses).sort();
  };

  const getCountries = () => {
    const countries = new Set<string>();
    enquiryUsers.forEach(user => {
      if (user.country) countries.add(user.country);
    });
    return Array.from(countries).sort();
  };

  const getProducts = () => {
    const products = new Set<string>();
    interestedUsers.forEach(user => {
      if (user.productTitle) products.add(user.productTitle);
    });
    return Array.from(products).sort();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    setCopiedId(id);
    copyTimeoutRef.current = setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleLeadSelection = (id: string) => {
    setSelectedLeads(prev =>
      prev.includes(id) ? prev.filter(leadId => leadId !== id) : [...prev, id]
    );
  };

  const exportLeadsToExcel = () => {
    let dataToExport = [];
    const timestamp = new Date().toISOString().split('T')[0];

    if (activeTab === "enquiry") {
      const leadsToExport = selectedLeads.length > 0
        ? filteredEnquiryUsers.filter(user => selectedLeads.includes(user._id))
        : filteredEnquiryUsers;

      dataToExport = leadsToExport.map(user => ({
        'First Name': user.firstname,
        'Last Name': user.lastname,
        'Email': user.email,
        'Country': user.country,
        'Contact': user.contact,
        'Message': user.message,
        'Source': user.source || '',
        'Status': user.status || '',
        'Date': new Date(user.createdAt).toLocaleString()
      }));
    } else {
      const leadsToExport = selectedLeads.length > 0
        ? filteredInterestedUsers.filter(user => selectedLeads.includes(user._id))
        : filteredInterestedUsers;

      dataToExport = leadsToExport.map(user => {
        const baseData: { [key: string]: string } = {
          'Product': user.productTitle,
          'Product ID': user.productId,
          'Source': user.source || '',
          'Status': user.status || '',
          'Date': new Date(user.createdAt).toLocaleString()
        };
        user.queries.forEach(query => {
          baseData[query.title] = query.value;
        });
        return baseData;
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab === "enquiry" ? "Enquiry Users" : "Interested Users");
    XLSX.writeFile(workbook, `${activeTab}_leads_${timestamp}.xlsx`);
  };

  const resetFilters = () => {
    setFilterOptions({
      startDate: "",
      endDate: "",
      searchQuery: "",
      year: "",
      month: "",
      source: "",
      status: "",
      country: "",
      product: ""
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-[var(--color-green)] text-lg font-futuristic"
        >
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[var(--color-green)] rounded-full animate-pulse" />
            Initializing Data Matrix...
          </span>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-600 text-lg font-futuristic p-4 bg-red-100/50 backdrop-blur-md rounded-lg"
        >
          System Error: {error}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 py-4 px-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-7xl mx-auto mb-4"
      >
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-green)] hover:text-green-700 transition-colors bg-white/70 backdrop-blur-sm py-2 px-3 rounded-lg shadow-sm hover:shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Admin Dashboard
        </Link>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-green)] to-gray-700"
      >
        Lead Management Dashboard
      </motion.h1>

      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("enquiry")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === "enquiry"
                  ? "bg-[var(--color-green)] text-white shadow-lg"
                  : "bg-white/70 text-gray-600 hover:bg-white/90"
              }`}
            >
              Enquiry Leads
            </button>
            <button
              onClick={() => setActiveTab("interested")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === "interested"
                  ? "bg-[var(--color-green)] text-white shadow-lg"
                  : "bg-white/70 text-gray-600 hover:bg-white/90"
              }`}
            >
              Product Interest
            </button>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/70 hover:bg-white/90 text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {isFilterOpen ? "Hide Filters" : "Show Filters"}
            </button>

            <button
              onClick={exportLeadsToExcel}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#0dac9a] hover:bg-green-600 cursor-pointer text-white rounded-lg shadow-sm hover:shadow-md transition-all text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export to Excel
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 bg-white/80 backdrop-blur-md p-3 rounded-xl shadow-md overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search by any field..."
                    value={filterOptions.searchQuery}
                    onChange={(e) => setFilterOptions({...filterOptions, searchQuery: e.target.value})}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-green)] focus:border-[var(--color-green)] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filterOptions.startDate}
                    onChange={(e) => setFilterOptions({...filterOptions, startDate: e.target.value})}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-green)] focus:border-[var(--color-green)] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filterOptions.endDate}
                    onChange={(e) => setFilterOptions({...filterOptions, endDate: e.target.value})}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-green)] focus:border-[var(--color-green)] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                  <select
                    value={filterOptions.year}
                    onChange={(e) => setFilterOptions({...filterOptions, year: e.target.value})}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-green)] focus:border-[var(--color-green)] text-sm"
                  >
                    <option value="">All Years</option>
                    {getYears().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Month</label>
                  <select
                    value={filterOptions.month}
                    onChange={(e) => setFilterOptions({...filterOptions, month: e.target.value})}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-green)] focus:border-[var(--color-green)] text-sm"
                  >
                    <option value="">All Months</option>
                    {getMonths().map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Source</label>
                  <select
                    value={filterOptions.source}
                    onChange={(e) => setFilterOptions({...filterOptions, source: e.target.value})}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-green)] focus:border-[var(--color-green)] text-sm"
                  >
                    <option value="">All Sources</option>
                    {getSources().map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filterOptions.status}
                    onChange={(e) => setFilterOptions({...filterOptions, status: e.target.value})}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-green)] focus:border-[var(--color-green)] text-sm"
                  >
                    <option value="">All Statuses</option>
                    {getStatuses().map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {activeTab === "enquiry" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
                    <select
                      value={filterOptions.country}
                      onChange={(e) => setFilterOptions({...filterOptions, country: e.target.value})}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-green)] focus:border-[var(--color-green)] text-sm"
                    >
                      <option value="">All Countries</option>
                      {getCountries().map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                )}

                {activeTab === "interested" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Product</label>
                    <select
                      value={filterOptions.product}
                      onChange={(e) => setFilterOptions({...filterOptions, product: e.target.value})}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-green)] focus:border-[var(--color-green)] text-sm"
                    >
                      <option value="">All Products</option>
                      {getProducts().map(product => (
                        <option key={product} value={product}>{product}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={resetFilters}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm"
                >
                  Reset Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white/80 backdrop-blur-md p-3 rounded-xl shadow-md mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-800">Lead Generator</h3>
              <p className="text-sm text-gray-600">
                {selectedLeads.length} leads selected out of {activeTab === "enquiry" ? filteredEnquiryUsers.length : filteredInterestedUsers.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Select leads to export or manage. Use filters to narrow down your target audience.
              </p>
            </div>
            <div className="flex gap-2">
              {selectedLeads.length > 0 && (
                <button
                  onClick={() => setSelectedLeads([])}
                  className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm"
                >
                  Clear Selection
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedLeads(activeTab === "enquiry"
                    ? filteredEnquiryUsers.map(user => user._id)
                    : filteredInterestedUsers.map(user => user._id));
                }}
                className="px-2.5 py-1 bg-[var(--color-green)] hover:bg-green-700 text-white rounded-lg text-sm"
              >
                Select All
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "enquiry" && (
          <motion.section
            key="enquiry-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto mb-8"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--color-green)]">
                Enquiry Leads
              </h2>
              <span className="text-gray-600 font-medium text-sm">
                {filteredEnquiryUsers.length} {filteredEnquiryUsers.length === 1 ? 'lead' : 'leads'}
              </span>
            </div>

            <AnimatePresence>
              {filteredEnquiryUsers.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-600 italic text-sm"
                >
                  No enquiry leads found matching your criteria
                </motion.p>
              ) : (
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filteredEnquiryUsers.map((user) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 0 15px rgba(0, 255, 0, 0.2)",
                      }}
                      className={`bg-white/80 backdrop-blur-md p-3 rounded-xl border ${
                        selectedLeads.includes(user._id)
                          ? "border-[var(--color-green)] ring-2 ring-[var(--color-green)]"
                          : "border-gray-200 hover:border-[var(--color-green)]"
                      } transition-colors relative`}
                    >
                      <div className="absolute top-3 right-3">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(user._id)}
                          onChange={() => toggleLeadSelection(user._id)}
                          className="h-4 w-4 text-[var(--color-green)] rounded border-gray-300 focus:ring-[var(--color-green)]"
                        />
                      </div>

                      <h3 className="text-base font-semibold text-gray-800 mb-2">
                        {user.firstname} {user.lastname}
                      </h3>
                      <div className="space-y-1.5 text-gray-700 text-sm">
                        <div className="flex items-center">
                          <span className="text-[var(--color-green)] font-medium mr-2 text-xs">Email:</span>
                          <span className="flex-1 truncate text-xs">{user.email}</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleCopy(user.email, `email-${user._id}`)}
                              className="text-gray-500 hover:text-[var(--color-green)] p-0.5 relative"
                              title="Copy email"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              {copiedId === `email-${user._id}` && (
                                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs py-0.5 px-1.5 rounded whitespace-nowrap">
                                  Copied!
                                </span>
                              )}
                            </button>
                            <a
                              href={`mailto:${user.email}`}
                              className="text-gray-500 hover:text-[var(--color-green)] p-0.5"
                              title="Send email"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-[var(--color-green)] font-medium mr-2 text-xs">Contact:</span>
                          <span className="flex-1 text-xs">{user.country} {user.contact}</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleCopy(user.contact, `contact-${user._id}`)}
                              className="text-gray-500 hover:text-[var(--color-green)] p-0.5 relative"
                              title="Copy contact number"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              {copiedId === `contact-${user._id}` && (
                                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs py-0.5 px-1.5 rounded whitespace-nowrap">
                                  Copied!
                                </span>
                              )}
                            </button>
                            <a
                              href={`https://wa.me/${user.contact.replace(/\s+/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 hover:text-green-600 p-0.5"
                              title="Contact on WhatsApp"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm7 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12z" />
                              </svg>
                            </a>
                          </div>
                        </div>
                        <p className="text-xs">
                          <span className="text-[var(--color-green)] font-medium">Message:</span> {user.message}
                        </p>
                        {user.source && (
                          <p className="text-xs">
                            <span className="text-[var(--color-green)] font-medium">Source:</span> {user.source}
                          </p>
                        )}
                        {user.status && (
                          <p className="text-xs">
                            <span className="text-[var(--color-green)] font-medium">Status:</span> {user.status}
                          </p>
                        )}
                        <p className="text-xs">
                          <span className="text-[var(--color-green)] font-medium">Date:</span>{" "}
                          {new Date(user.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {activeTab === "interested" && (
          <motion.section
            key="interested-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto mb-8"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--color-green)]">
                Product Interest Leads
              </h2>
              <span className="text-gray-600 font-medium text-sm">
                {filteredInterestedUsers.length} {filteredInterestedUsers.length === 1 ? 'lead' : 'leads'}
              </span>
            </div>

            <AnimatePresence>
              {filteredInterestedUsers.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-600 italic text-sm"
                >
                  No product interest leads found matching your criteria
                </motion.p>
              ) : (
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filteredInterestedUsers.map((user) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 0 15px rgba(0, 255, 0, 0.2)",
                      }}
                      className={`bg-white/80 backdrop-blur-md p-3 rounded-xl border ${
                        selectedLeads.includes(user._id)
                          ? "border-[var(--color-green)] ring-2 ring-[var(--color-green)]"
                          : "border-gray-200 hover:border-[var(--color-green)]"
                      } transition-colors relative`}
                    >
                      <div className="absolute top-3 right-3">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(user._id)}
                          onChange={() => toggleLeadSelection(user._id)}
                          className="h-4 w-4 text-[var(--color-green)] rounded border-gray-300 focus:ring-[var(--color-green)]"
                        />
                      </div>

                      <h3 className="text-base font-semibold text-gray-800 mb-2">
                        {user.productTitle}
                      </h3>
                      <div className="space-y-1.5 text-gray-700 text-sm">
                        <p className="text-xs">
                          <span className="text-[var(--color-green)] font-medium">Product ID:</span>{" "}
                          {user.productId}
                        </p>
                        {user.queries.map((query, index) => (
                          <p key={index} className="text-xs">
                            <span className="text-[var(--color-green)] font-medium">{query.title}:</span>{" "}
                            {query.value}
                          </p>
                        ))}
                        {user.source && (
                          <p className="text-xs">
                            <span className="text-[var(--color-green)] font-medium">Source:</span> {user.source}
                          </p>
                        )}
                        {user.status && (
                          <p className="text-xs">
                            <span className="text-[var(--color-green)] font-medium">Status:</span> {user.status}
                          </p>
                        )}
                        <p className="text-xs">
                          <span className="text-[var(--color-green)] font-medium">Date:</span>{" "}
                          {new Date(user.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
