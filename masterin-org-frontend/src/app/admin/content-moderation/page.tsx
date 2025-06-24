"use client";

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import { ModerationItem, AdminPendingContentApiResponse } from '@/types/adminTypes';
import PaginationControls from '@/components/common/PaginationControls';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { CheckCircleIcon, XCircleIcon, ExternalLinkIcon } from '@heroicons/react/24/outline';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ContentModerationPage = () => {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState<{ [key: string]: boolean }>({}); // Track loading state per item

  const { toast } = useToast();

  const fetchPendingContent = useCallback(async (page: number, currentLimit: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<AdminPendingContentApiResponse>(`/admin/content/pending-review?page=${page}&limit=${currentLimit}`);
      setItems(response.data.items);
      setTotalItems(response.data.totalItems);
      setCurrentPage(response.data.page);
      setLimit(response.data.limit);
      setTotalPages(response.data.totalPages);
    } catch (err: any) {
      console.error("Error fetching pending content:", err);
      setError(err.response?.data?.message || "Failed to fetch content for moderation.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingContent(currentPage, limit);
  }, [fetchPendingContent, currentPage, limit]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleContentAction = async (contentType: 'course' | 'product', contentId: number, action: 'approve' | 'reject') => {
    const itemKey = `${contentType}-${contentId}`;
    const originalItems = [...items]; // Store original items for potential revert
    const originalTotalItems = totalItems;
    const originalTotalPages = totalPages;
    const originalCurrentPage = currentPage;

    setIsProcessingAction(prev => ({ ...prev, [itemKey]: true }));

    // Optimistic UI update
    const updatedItems = items.filter(item => !(item.id === contentId && item.content_type === contentType));
    setItems(updatedItems);
    const newTotalItems = originalTotalItems - 1;
    setTotalItems(newTotalItems);
    const newTotalPages = Math.ceil(newTotalItems / limit);
    setTotalPages(newTotalPages);
    // If the current page becomes empty and it's not the first page, try to go to previous.
    if (updatedItems.length === 0 && originalCurrentPage > 1 && originalCurrentPage === originalTotalPages) {
        setCurrentPage(originalCurrentPage - 1); // This will trigger a refetch via useEffect
    }


    try {
      await apiClient.post(`/admin/content/${contentType}/${contentId}/${action}`, {});
      toast({
        title: `Content ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `The ${contentType} (ID: ${contentId}) has been successfully ${action === 'approve' ? 'approved' : 'rejected'}.`,
      });
      // If the optimistic update caused a page change that triggers a refetch,
      // or if we want to ensure data consistency, we might refetch here.
      // For now, the optimistic update handles the immediate UI change.
      // If the page didn't change due to emptying, but total items changed, fetch to update counts accurately if needed.
      if (!(updatedItems.length === 0 && originalCurrentPage > 1 && originalCurrentPage === originalTotalPages)) {
         // If we didn't auto-navigate to prev page, we might need to refetch to ensure pagination counts are perfect
         // or simply trust the local decrements for totalItems.
         // A full fetch is safer for totalItems if other admins are working.
         fetchPendingContent(currentPage, limit); // Re-fetch current page to get accurate totals if needed
      }


    } catch (err: any) {
      console.error(`Error ${action}ing content:`, err);
      toast({
        title: `Error ${action === 'approve' ? 'Approving' : 'Rejecting'} Content`,
        description: err.response?.data?.message || `Could not ${action} the ${contentType}. Action has been reverted.`,
        variant: "destructive",
      });
      // Revert UI changes
      setItems(originalItems);
      setTotalItems(originalTotalItems);
      setTotalPages(originalTotalPages);
      setCurrentPage(originalCurrentPage); // Revert page if it was changed optimistically
    } finally {
      setIsProcessingAction(prev => ({ ...prev, [itemKey]: false }));
    }
  };

  const getItemLink = (item: ModerationItem) => {
    return item.content_type === 'course' ? `/courses/${item.id}` : `/marketplace/${item.id}`;
  };

  const LoadingRowSkeleton = () => (
    <TableRow>
      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
      <TableCell><Skeleton className="h-8 w-40" /></TableCell>
    </TableRow>
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-slate-100">Content Moderation</h1>
      <p className="mb-6 text-slate-600 dark:text-slate-300">Review courses and marketplace products awaiting approval.</p>

      {error && (
         <Alert variant="destructive" className="mb-4">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-700">
              <TableHead>Title</TableHead>
              <TableHead className="w-[120px]">Type</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead className="w-[180px]">Submitted</TableHead>
              <TableHead className="w-[260px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: limit }).map((_, index) => <LoadingRowSkeleton key={index} />)
            ) : items.length === 0 && !error ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-slate-500 dark:text-slate-400">
                        No content pending review. Well done!
                    </TableCell>
                </TableRow>
            ) : (
              items.map((item) => {
                const itemKey = `${item.content_type}-${item.id}`;
                const processing = isProcessingAction[itemKey];
                return (
                  <TableRow key={itemKey} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50">
                    <TableCell className="font-medium max-w-xs truncate" title={item.title}>{item.title}</TableCell>
                    <TableCell>
                      <Badge variant={item.content_type === 'course' ? 'default' : 'secondary'} className="capitalize">
                        {item.content_type}
                      </Badge>
                    </TableCell>
                    <TableCell title={item.creator_email || ''}>{item.creator_name || item.creator_email || 'N/A'}</TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-center space-x-2">
                      <Button variant="outline" size="sm" asChild disabled={processing}>
                        <Link href={getItemLink(item)} target="_blank" rel="noopener noreferrer">
                          View <ExternalLinkIcon className="h-3.5 w-3.5 ml-1.5"/>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-700 dark:hover:text-white"
                        onClick={() => handleContentAction(item.content_type, item.id, 'approve')}
                        disabled={processing}
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1.5"/> Approve
                        {processing && actionBeingProcessed === 'approve' && itemKey === currentItemKey ? 'ing...' : ''}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-700 dark:hover:text-white"
                        onClick={() => handleContentAction(item.content_type, item.id, 'reject')}
                        disabled={processing}
                      >
                        <XCircleIcon className="h-4 w-4 mr-1.5"/> Reject
                         {processing && actionBeingProcessed === 'reject' && itemKey === currentItemKey ? 'ing...' : ''}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
         {!isLoading && totalItems > 0 && (
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={limit}
                totalItems={totalItems}
            />
        )}
      </div>
    </div>
  );
};

export default ContentModerationPage;

// Helper state variables for button loading text (if needed, but simpler to just disable)
// const [actionBeingProcessed, setActionBeingProcessed] = useState<'approve' | 'reject' | null>(null);
// const [currentItemKey, setCurrentItemKey] = useState<string | null>(null);
// Inside handleContentAction:
// setCurrentItemKey(itemKey);
// setActionBeingProcessed(action);
// ...
// In finally:
// setCurrentItemKey(null);
// setActionBeingProcessed(null);
