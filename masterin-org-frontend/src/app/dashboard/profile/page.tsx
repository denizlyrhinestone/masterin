"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/apiClient';
import { UserProfile, UserProfileFormData } from '@/types/userTypes'; // Ensure this path is correct
import FileUploadComponent from '@/components/common/FileUploadComponent'; // Ensure this path is correct
import Image from 'next/image';
import { Input } from '@/components/ui/input'; // Assuming shadcn/ui components
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import Link from 'next/link'; // For "Change Password" link

const UserProfilePage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserProfileFormData>({
    full_name: '',
    bio: '',
    profile_picture_file_id: null,
    linkedinLink: '',
    twitterLink: '',
    githubLink: '',
    websiteLink: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await apiClient.get<{ profile: UserProfile }>('/users/profile/me');
      const fetchedProfile = response.data.profile;
      setProfile(fetchedProfile);
      setFormData({
        full_name: fetchedProfile.full_name || '',
        bio: fetchedProfile.bio || '',
        profile_picture_file_id: fetchedProfile.profile_picture_file_id || null,
        linkedinLink: fetchedProfile.social_links?.linkedin || '',
        twitterLink: fetchedProfile.social_links?.twitter || '',
        githubLink: fetchedProfile.social_links?.github || '',
        websiteLink: fetchedProfile.social_links?.website || '',
      });
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.message || 'Failed to fetch profile.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else if (!authLoading) {
      // If not authenticated and auth is not loading anymore, stop loading UI
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading, fetchProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUploadSuccess = (uploadedFileMetadata: { id: number; file_path: string; file_name: string; }) => {
    setFormData(prev => ({ ...prev, profile_picture_file_id: uploadedFileMetadata.id }));
    // Optimistically update displayed profile picture URL if desired, or wait for save & refetch
    setProfile(prev => prev ? { ...prev, profile_picture_url: uploadedFileMetadata.file_path, profile_picture_file_id: uploadedFileMetadata.id } : null);
    setSuccessMessage('Profile picture updated. Save to make it permanent.');
  };

  const handleFileUploadError = (errorMessage: string) => {
    setError(`Profile picture upload failed: ${errorMessage}`);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    const socialLinksPayload: UserProfile['social_links'] = {
      linkedin: formData.linkedinLink || undefined,
      twitter: formData.twitterLink || undefined,
      github: formData.githubLink || undefined,
      website: formData.websiteLink || undefined,
    };
    // Remove empty keys
    Object.keys(socialLinksPayload).forEach(key => {
        if (!socialLinksPayload[key as keyof typeof socialLinksPayload]) {
            delete socialLinksPayload[key as keyof typeof socialLinksPayload];
        }
    });


    const payload = {
      full_name: formData.full_name,
      bio: formData.bio,
      profile_picture_file_id: formData.profile_picture_file_id,
      social_links: Object.keys(socialLinksPayload).length > 0 ? socialLinksPayload : null,
    };

    try {
      const response = await apiClient.put<{ profile: UserProfile, message: string }>('/users/profile/me', payload);
      setProfile(response.data.profile);
      // Re-initialize formData to be sure, especially if backend cleans/alters data
      setFormData({
        full_name: response.data.profile.full_name || '',
        bio: response.data.profile.bio || '',
        profile_picture_file_id: response.data.profile.profile_picture_file_id || null,
        linkedinLink: response.data.profile.social_links?.linkedin || '',
        twitterLink: response.data.profile.social_links?.twitter || '',
        githubLink: response.data.profile.social_links?.github || '',
        websiteLink: response.data.profile.social_links?.website || '',
      });
      setSuccessMessage(response.data.message || 'Profile updated successfully!');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-600"></div></div>;
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <p className="text-red-600 text-lg">You must be logged in to view this page.</p>
        {/* Optionally, add a login link/button here */}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
          <CardDescription>Update your personal information and profile picture.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveProfile}>
          <CardContent className="space-y-6">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
            {successMessage && <div className="p-3 bg-green-100 text-green-700 rounded-md">{successMessage}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <Label htmlFor="email" className="md:col-span-1">Email</Label>
              <Input id="email" type="email" value={profile.email} disabled className="md:col-span-2 bg-slate-100" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <Label htmlFor="role" className="md:col-span-1">Role</Label>
              <Input id="role" type="text" value={profile.role} disabled className="md:col-span-2 bg-slate-100 capitalize" />
            </div>

            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <div className="flex items-center space-x-4">
                <Image
                  src={profile.profile_picture_url || '/images/default-avatar.png'} // Ensure you have a default avatar
                  alt="Profile Picture"
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
                <FileUploadComponent
                  onUploadSuccess={handleFileUploadSuccess}
                  onUploadError={handleFileUploadError}
                  uploadContext="profile_picture" // Backend should handle this context if needed for storage path
                  allowedMimeTypes={['image/jpeg', 'image/png', 'image/gif']}
                  maxFileSizeMB={2}
                />
              </div>
              {formData.profile_picture_file_id && <p className="text-xs text-slate-500">New picture selected (ID: {formData.profile_picture_file_id}). Click Save.</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" name="full_name" value={formData.full_name || ''} onChange={handleInputChange} placeholder="Your full name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" value={formData.bio || ''} onChange={handleInputChange} placeholder="Tell us a bit about yourself..." rows={4} />
            </div>

            <fieldset className="space-y-4 border p-4 rounded-md">
                <legend className="text-sm font-medium text-slate-700 px-1">Social Links</legend>
                <div className="space-y-2">
                    <Label htmlFor="linkedinLink">LinkedIn Profile URL</Label>
                    <Input id="linkedinLink" name="linkedinLink" type="url" value={formData.linkedinLink || ''} onChange={handleInputChange} placeholder="https://linkedin.com/in/yourprofile" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="twitterLink">Twitter Profile URL</Label>
                    <Input id="twitterLink" name="twitterLink" type="url" value={formData.twitterLink || ''} onChange={handleInputChange} placeholder="https://twitter.com/yourhandle" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="githubLink">GitHub Profile URL</Label>
                    <Input id="githubLink" name="githubLink" type="url" value={formData.githubLink || ''} onChange={handleInputChange} placeholder="https://github.com/yourusername" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="websiteLink">Personal Website URL</Label>
                    <Input id="websiteLink" name="websiteLink" type="url" value={formData.websiteLink || ''} onChange={handleInputChange} placeholder="https://yourwebsite.com" />
                </div>
            </fieldset>

          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
            <Link href="/dashboard/profile/change-password">
              <Button type="button" variant="outline">Change Password</Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default UserProfilePage;
