"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserPurchase } from '@/types/marketplaceTypes'; // Using existing UserPurchase type
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // For displaying price/status

interface PurchasedProductCardProps {
  product: UserPurchase;
}

const PurchasedProductCard: React.FC<PurchasedProductCardProps> = ({ product }) => {
  const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(product.price_paid));
  const formattedPurchasedDate = new Date(product.purchased_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0 relative">
        <Link href={`/marketplace/${product.product_id}`} passHref>
          <div className="aspect-[16/9] w-full relative cursor-pointer">
            <Image
              src={product.product_thumbnail_url || '/images/placeholder.png'} // Ensure placeholder exists
              alt={product.product_title || 'Product image'}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow p-4 space-y-2">
        <Link href={`/marketplace/${product.product_id}`} passHref>
            <CardTitle className="text-lg font-semibold hover:text-sky-600 transition-colors cursor-pointer leading-tight">
            {product.product_title}
            </CardTitle>
        </Link>
        {product.product_seller_name && (
          <p className="text-xs text-slate-500">Sold by: {product.product_seller_name}</p>
        )}
        <p className="text-xs text-slate-500">
          Purchased on: {formattedPurchasedDate}
        </p>
        <Badge variant="outline" className="text-sm font-semibold">Price Paid: {formattedPrice}</Badge>
      </CardContent>
      <CardFooter className="p-4 bg-slate-50 border-t">
        <Link href={`/marketplace/${product.product_id}`} passHref className="w-full">
          <Button variant="default" className="w-full">
            View & Download
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PurchasedProductCard;
