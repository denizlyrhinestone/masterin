"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/apiClient';
import { MarketplaceProductDetail, UploadedFileMetadata } from '@/types/marketplaceTypes';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircleIcon, ExclamationTriangleIcon, ShoppingCartIcon, DownloadIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown'; // For rendering product description

// Placeholder for a media carousel or viewer
const MediaViewer: React.FC<{ files: UploadedFileMetadata[] }> = ({ files }) => {
  if (!files || files.length === 0) {
    return <div className="text-center text-slate-500 py-4">No previews available.</div>;
  }
  // For now, just display the first image if available, or list file names
  const firstImage = files.find(f => f.mime_type?.startsWith('image/'));
  if (firstImage) {
    return (
      <Image
        src={firstImage.file_path || '/images/placeholder.png'} // Ensure placeholder exists
        alt={firstImage.file_name || 'Product preview'}
        width={600}
        height={400}
        className="rounded-lg object-cover w-full"
      />
    );
  }
  return (
    <div className="p-4 border rounded-lg bg-slate-50">
      <h4 className="font-semibold mb-2 text-sm">Available Previews:</h4>
      <ul className="list-disc list-inside text-xs">
        {files.map(file => (
          <li key={file.id}>{file.file_name} ({file.mime_type})</li>
        ))}
      </ul>
    </div>
  );
};


const ProductDetailPage = () => {
  const params = useParams();
  const productId = params.productId as string;
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const [product, setProduct] = useState<MarketplaceProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAcquiring, setIsAcquiring] = useState(false);
  const [acquireMessage, setAcquireMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasAcquired, setHasAcquired] = useState(false); // To track if user has acquired this product

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ product: MarketplaceProductDetail }>(`/marketplace/products/${productId}`);
      setProduct(response.data.product); // Assuming backend nests under 'product' key
    } catch (err: any) {
      console.error('Error fetching product:', err);
      setError(err.response?.data?.message || 'Failed to fetch product details.');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  // Check if product is already acquired (basic check, could be more sophisticated)
  useEffect(() => {
    if (acquireMessage?.type === 'success' && acquireMessage.text.includes("acquired successfully")) {
        setHasAcquired(true);
    } else if (acquireMessage?.type === 'error' && acquireMessage.text.includes("Already acquired")) {
        setHasAcquired(true);
    } else if (product && user) {
      // More robust check: query user's purchased products if available
      // For now, rely on acquireMessage or a future check against user's purchases list
    }
  }, [acquireMessage, product, user]);


  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAcquireProduct = async () => {
    if (!isAuthenticated) {
      // TODO: Prompt login (e.g., redirect to login page with return URL)
      setAcquireMessage({ type: 'error', text: 'Please log in to acquire this product.' });
      return;
    }
    if (!productId) return;

    setIsAcquiring(true);
    setAcquireMessage(null);
    try {
      const response = await apiClient.post<{ message: string; purchase?: any }>(`/marketplace/products/${productId}/acquire`, {});
      setAcquireMessage({ type: 'success', text: response.data.message || 'Product acquired successfully! You can find it in your dashboard.' });
      if (response.data.message.includes("already acquired") || response.data.message.includes("acquired successfully")) {
        setHasAcquired(true);
      }
      // Optionally, refetch product data if acquisition changes its state (e.g., stock count, not relevant here)
      // Or update a local state indicating the user has acquired this item
    } catch (err: any) {
      console.error('Error acquiring product:', err);
      setAcquireMessage({ type: 'error', text: err.response?.data?.message || 'Failed to acquire product.' });
      if (err.response?.data?.message.includes("Already acquired")) {
        setHasAcquired(true);
      }
    } finally {
      setIsAcquiring(false);
    }
  };

  if (isLoading || authLoading) {
    return <div className="container mx-auto px-4 py-10 text-center"><div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-600 mx-auto"></div><p className="mt-4">Loading product details...</p></div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-10 text-center"><Alert variant="destructive"><ExclamationTriangleIcon className="h-5 w-5" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>;
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-10 text-center"><p>Product not found.</p></div>;
  }

  const displayPrice = product.price === 0 ? 'Free' : `$${Number(product.price).toFixed(2)}`;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Media */}
        <div className="md:col-span-2">
          <MediaViewer files={product.preview_files || []} />
           {/* Display Content Files for Acquired Product */}
           {hasAcquired && product.content_files && product.content_files.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-xl">Download Your Files</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {product.content_files.map(file => (
                    <li key={file.id} className="flex justify-between items-center p-2 border rounded-md">
                      <div>
                        <p className="font-semibold">{file.file_name}</p>
                        <p className="text-xs text-slate-500">{file.mime_type} ({(file.size_bytes / 1024).toFixed(2)} KB)</p>
                      </div>
                      <a href={`/api/marketplace/products/${product.id}/download/${file.id}`} download>
                        <Button variant="outline" size="sm">
                          <DownloadIcon className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Details & Actions */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold leading-tight">{product.title}</CardTitle>
              <div className="flex items-center space-x-3 pt-2">
                <Image
                  src={product.seller_profile_picture_url || '/images/default-avatar.png'}
                  alt={product.seller_name || 'Seller'}
                  width={40} height={40}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-slate-700">{product.seller_name || 'Unknown Seller'}</p>
                  {/* <Link href={`/user/${product.seller_id}`} className="text-xs text-sky-600 hover:underline">View Profile</Link> */}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Description</h3>
                <div className="prose prose-sm max-w-none text-slate-600">
                    <ReactMarkdown>{product.description || 'No description available.'}</ReactMarkdown>
                </div>
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-sky-600">{displayPrice}</span>
                {product.price > 0 && <span className="text-sm text-slate-500">one-time purchase</span>}
              </div>

              {product.subject && <p className="text-xs text-slate-500"><strong>Subject:</strong> {product.subject}</p>}
              {product.grade_level && <p className="text-xs text-slate-500"><strong>Grade Level:</strong> {product.grade_level}</p>}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {product.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              {!hasAcquired ? (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleAcquireProduct}
                  disabled={isAcquiring || !isAuthenticated}
                >
                  {isAcquiring ? 'Processing...' : (product.price === 0 ? 'Get for Free' : 'Buy Now')}
                  <ShoppingCartIcon className="h-5 w-5 ml-2" />
                </Button>
              ) : (
                 <Button size="lg" className="w-full bg-green-600 hover:bg-green-700" disabled>
                    Acquired
                    <CheckCircleIcon className="h-5 w-5 ml-2" />
                </Button>
              )}
              {!isAuthenticated && !authLoading && <p className="text-xs text-center text-orange-600">Please log in to acquire this product.</p>}

              {acquireMessage && (
                <Alert variant={acquireMessage.type === 'success' ? 'default' : 'destructive'} className={`mt-3 text-sm ${acquireMessage.type === 'success' ? 'bg-green-50 border-green-300 text-green-700' : ''}`}>
                  {acquireMessage.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ExclamationTriangleIcon className="h-5 w-5" />}
                  <AlertTitle className="font-semibold">{acquireMessage.type === 'success' ? 'Success' : 'Notice'}</AlertTitle>
                  <AlertDescription>{acquireMessage.text}</AlertDescription>
                </Alert>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
