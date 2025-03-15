"use client";

import { Product } from "@/types/product";
import { useEffect, useState } from "react";

interface ProductListProps {
  onProductSelect: (product: Product) => void;
}

export default function ProductList({ onProductSelect }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  // Function to fetch products
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch initial products
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search query
  useEffect(() => {
    const filtered = products.filter((product) => {
      const name = product.name || "";
      const group = product.group || "";
      const price =
        product.price !== undefined && product.price !== null
          ? product.price.toString()
          : "";
      return [name, group, price].some((field) =>
        field.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page on new search
  }, [searchQuery, products]);

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleProductUpdate = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p._id === updatedProduct._id ? updatedProduct : p
      )
    );
  };

  // Function to delete a product
  const handleProductDelete = async (productId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation(); // Prevent triggering the parent onClick
    }
    
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }
      
      // Remove the product from state
      setProducts((prevProducts) =>
        prevProducts.filter((p) => p._id !== productId)
      );
      
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  if (isLoading) return <div>Loading products...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Product List</h2>
        <button
          onClick={fetchProducts}
          className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-green)] rounded-full hover:bg-opacity-90 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 3v6h-6" />
            <path d="M3 21v-6h6" />
            <path d="M3.51 9a9 9 0 0114.136-4.302L21 9M20.49 15a9 9 0 01-14.136 4.302L3 15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, group, or price..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent"
        />
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <p className="text-gray-600">No products found.</p>
      ) : (
        <div className="space-y-4">
          {currentProducts.map((product) => (
            <div
              key={product._id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() =>
                onProductSelect({
                  ...product,
                  onUpdate: handleProductUpdate,
                  onDelete: () => handleProductDelete(product._id),
                } as Product & {
                  onUpdate?: (updatedProduct: Product) => void;
                  onDelete?: () => void;
                })
              }
            >
              <div>
                <h3 className="font-semibold">
                  {product.name || "Unnamed Product"}
                </h3>
                <p className="text-sm text-gray-600">
                ₹
                  {product.price !== undefined && product.price !== null
                    ? product.price
                    : "N/A"}{" "}
                  | {product.group || "No Group"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-[var(--color-green)] hover:underline">
                  Edit
                </button>
                <button 
                  onClick={(e) => handleProductDelete(product._id, e)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredProducts.length > productsPerPage && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-[var(--color-green)] border border-[var(--color-green)] rounded-full hover:bg-[var(--color-green)] hover:text-white disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-1 rounded-full ${
                  currentPage === index + 1
                    ? "bg-[var(--color-green)] text-white"
                    : "text-[var(--color-green)] border border-[var(--color-green)] hover:bg-[var(--color-green)] hover:text-white"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-[var(--color-green)] border border-[var(--color-green)] rounded-full hover:bg-[var(--color-green)] hover:text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}