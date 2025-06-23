"use client";

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { UserPurchase } from '@/types/marketplaceTypes'; // Using existing UserPurchase type
import PurchasedProductCard from '@/components/marketplace/PurchasedProductCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

// Basic Loading Spinner
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-[calc(100vh-300px)]">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-600"></div>
  </div>
);

const MyPurchasedProductsPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [purchasedProducts, setPurchasedProducts] = useState<UserPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchasedProducts = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false); // Not authenticated, so not loading products
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ purchasedProducts: UserPurchase[] }>('/users/my-purchased-products');
      setPurchasedProducts(response.data.purchasedProducts || []);
    } catch (err: any) {
      console.error('Error fetching purchased products:', err);
      setError(err.response?.data?.message || 'Failed to fetch your purchased products.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) { // Only fetch after auth status is resolved
        fetchPurchasedProducts();
    }
  }, [authLoading, fetchPurchasedProducts]);

  if (authLoading || isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You must be logged in to view your purchased products.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (purchasedProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <ShoppingBagIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-slate-700 mb-2">No Purchased Resources Yet</h2>
        <p className="text-slate-500 mb-6">
          You haven&apos;t acquired any resources from the marketplace. Explore our collection and find something new!
        </p>
        <Link href="/marketplace" passHref>
          <Button size="lg">Browse Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">My Purchased Resources</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {purchasedProducts.map(product => (
          <PurchasedProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default MyPurchasedProductsPage;
