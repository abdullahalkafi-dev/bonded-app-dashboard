"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} from "@/store/api/profile-api";
import { useGetInterestsQuery } from "@/store/api/interests-api";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Non-binary", value: "non-binary" },
  { label: "Prefer not to say", value: "prefer-not-to-say" },
];

const CONNECTION_TYPE_OPTIONS = [
  { label: "Small Group Hangouts", value: "small_group_hangouts" },
  { label: "One-on-One Friendship", value: "one_on_one_friendship" },
  { label: "Event-based Meetups", value: "event_based_meetups" },
];

export default function ProfilePage() {
  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery();
  const { data: interestsData } = useGetInterestsQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    bio: "",
    phone: "",
    phoneCountryCode: "",
    dateOfBirth: "",
    gender: "",
    country: "",
    city: "",
    address: "",
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedConnectionTypes, setSelectedConnectionTypes] = useState<string[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (profileData?.data) {
      const p = profileData.data;
      setForm({
        fullName: p.fullName ?? "",
        username: p.username ?? "",
        bio: p.bio ?? "",
        phone: p.phone ?? "",
        phoneCountryCode: p.phoneCountryCode ?? "",
        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split("T")[0] : "",
        gender: p.gender ?? "",
        country: p.country ?? "",
        city: p.city ?? "",
        address: p.address ?? "",
      });
      setSelectedInterests(p.interests?.map((i) => i.slug) ?? []);
      setSelectedConnectionTypes(p.connectionType ?? []);
      if (p.avatar) setAvatarPreview(p.avatar);
    }
  }, [profileData]);

  const interests = interestsData?.data ?? [];

  function handleFieldChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      await uploadAvatar(file).unwrap();
      toast.success("Avatar updated successfully");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Avatar upload failed";
      toast.error(message);
      if (profileData?.data?.avatar) {
        setAvatarPreview(profileData.data.avatar);
      }
    }
  }

  function toggleInterest(interestSlug: string) {
    setSelectedInterests((prev) =>
      prev.includes(interestSlug) ? prev.filter((s) => s !== interestSlug) : [...prev, interestSlug],
    );
  }

  function toggleConnectionType(value: string) {
    setSelectedConnectionTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload: Record<string, unknown> = {
        fullName: form.fullName || undefined,
        username: form.username || undefined,
        bio: form.bio || undefined,
        phone: form.phone || undefined,
        phoneCountryCode: form.phoneCountryCode || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        country: form.country || undefined,
        city: form.city || undefined,
        address: form.address || undefined,
        interests: selectedInterests.length > 0 ? selectedInterests : undefined,
        connectionType: selectedConnectionTypes.length > 0 ? selectedConnectionTypes : undefined,
      };

      await updateProfile(payload).unwrap();
      toast.success("Profile updated successfully");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Update failed";
      toast.error(message);
    }
  }

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile. Complete your profile to create bonded events.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-muted" />
                )}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="avatar" className="cursor-pointer">
                  <div className="flex items-center gap-2 rounded-md border border-dashed px-4 py-2 text-sm hover:bg-muted">
                    <Upload className="h-4 w-4" />
                    Upload Avatar
                  </div>
                </Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => handleFieldChange("fullName", e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(e) => handleFieldChange("username", e.target.value)}
                placeholder="johndoe"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => handleFieldChange("bio", e.target.value)}
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phoneCountryCode">Phone Country Code</Label>
              <Input
                id="phoneCountryCode"
                value={form.phoneCountryCode}
                onChange={(e) => handleFieldChange("phoneCountryCode", e.target.value)}
                placeholder="+1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                placeholder="555-1234"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => handleFieldChange("dateOfBirth", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(val: string | null) => handleFieldChange("gender", val ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => handleFieldChange("city", e.target.value)}
                placeholder="New York"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) => handleFieldChange("country", e.target.value)}
                placeholder="US"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => handleFieldChange("address", e.target.value)}
                placeholder="123 Main St"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connection Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {CONNECTION_TYPE_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={selectedConnectionTypes.includes(opt.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleConnectionType(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest: { _id: string; name: string; slug: string }) => (
                <Button
                  key={interest._id}
                  type="button"
                  variant={selectedInterests.includes(interest.slug) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleInterest(interest.slug)}
                >
                  {interest.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isUpdating}>
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Profile
        </Button>
      </form>
    </div>
  );
}
