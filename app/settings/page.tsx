"use client";

import type React from "react";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser, useAuthStatus } from "@/lib/auth-context";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateUser } from "@/services/user/user.queries";
import { useRouter } from "next/navigation";
import { useChangePassword } from "@/services/auth/auth.queries";
import { uploadImageToS3 } from "@/services/uploads/images";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Camera01Icon, Shield01Icon, SquareLock01Icon, UserIcon } from "@hugeicons/core-free-icons";

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name is too short" }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function SettingsPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const updateUserMutation = useUpdateUser();
  const changePasswordMutation = useChangePassword();
  const { user: currentUser } = useUser();
  const { isLoading } = useAuthStatus();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
    watch: watchPassword,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleChangePassword = (data: ChangePasswordFormValues) => {
    changePasswordMutation.mutate(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          resetPasswordForm();
          setSelectedImage(null); // Reset image if needed
          setPreviewUrl(null);
        },
      }
    );
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const formPayload = new FormData();
      formPayload.append("name", data.name);

      if (selectedImage) {
        const profileImageKey = await uploadImageToS3(
          selectedImage,
          "images/avatars",
        );
        formPayload.append("profileImageKey", profileImageKey);
      }

      updateUserMutation.mutate(formPayload, {
        onSuccess: () => {
          setSelectedImage(null); // Reset image after successful submission
          setPreviewUrl(null);
        },
      });
    } catch (error: any) {
      toast.error(error?.message || "Profile update failed");
    }
  };

  // Watch form values to detect changes
  const nameValue = watch("name");
  const passwordValues = watchPassword();

  // Check if profile form has changes
  const hasProfileChanges = useMemo(() => {
    return nameValue !== (currentUser?.name || "") || selectedImage !== null;
  }, [nameValue, currentUser?.name, selectedImage]);

  // Check if password form has changes
  const hasPasswordChanges = useMemo(() => {
    return (
      passwordValues.currentPassword !== "" ||
      passwordValues.newPassword !== "" ||
      passwordValues.confirmPassword !== ""
    );
  }, [passwordValues]);

  if (isLoading) {
    return (
      <div
        className="home-theme fixed inset-0 flex items-center justify-center z-50"
        style={{ backgroundColor: "var(--home-bg)", opacity: 0.9 }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "var(--home-accent)", borderTopColor: "transparent" }}
          ></div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--home-text)" }}
          >
            Loading Authentication...
          </h2>
          <p style={{ color: "var(--home-muted)" }}>
            Please wait while we verify your session
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="home-theme min-h-screen pt-16"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="container mx-auto px-4 py-8">
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "var(--home-text)" }}>
              Settings
            </h1>
            <p style={{ color: "var(--home-muted)" }}>
              Manage your account settings and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview */}
            <div>
              <Card
                className="border"
                style={{
                  backgroundColor: "var(--home-card)",
                  borderColor: "var(--home-border)",
                  color: "var(--home-text)",
                }}
              >
                <CardHeader>
                  <CardTitle style={{ color: "var(--home-text)" }}>
                    Profile Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={
                        previewUrl ||
                        currentUser?.profileImage ||
                        "/placeholder.svg"
                      }
                      alt={currentUser?.name}
                      className="w-20 h-20 rounded-full mx-auto object-cover"
                    />
                    <label htmlFor="fileUpload">
                      <div
                        className="absolute bottom-0 right-0 flex items-center justify-center border shadow-sm rounded-full"
                        style={{
                          backgroundColor: "var(--home-card-elevated)",
                          borderColor: "var(--home-border-strong)",
                          color: "var(--home-text)",
                        }}
                      >
                        <HugeiconsIcon icon={Camera01Icon} className="h-4 w-4" />
                      </div>
                    </label>
                    <input
                      id="fileUpload"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg" style={{ color: "var(--home-text)" }}>
                      {currentUser?.name}
                    </h3>
                    <p style={{ color: "var(--home-muted)" }}>
                      {currentUser?.email}
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Badge
                      variant={
                        currentUser?.role === "ORGANIZER"
                          ? "default"
                          : "secondary"
                      }
                      style={{
                        backgroundColor: "var(--home-card-highlight)",
                        borderColor: "var(--home-border-strong)",
                        color: "var(--home-text-highlight)",
                      }}
                    >
                      <HugeiconsIcon icon={Shield01Icon} className="h-3 w-3 mr-1" />
                      {currentUser?.role === "ORGANIZER"
                        ? "Event Organizer"
                        : "User"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile + Password Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Form */}
              <div>
                <Card
                  className="border"
                  style={{
                    backgroundColor: "var(--home-card)",
                    borderColor: "var(--home-border)",
                    color: "var(--home-text)",
                  }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <HugeiconsIcon icon={UserIcon} className="h-5 w-5" style={{ color: "var(--home-accent)" }} />
                      <span>Profile Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="name"
                            className="text-sm font-medium"
                            style={{ color: "var(--home-text)" }}
                          >
                            Full Name
                          </label>
                          <Input
                            id="name"
                            {...register("name")}
                            style={{
                              backgroundColor: "var(--home-bg)",
                              borderColor: "var(--home-border-strong)",
                              color: "var(--home-text)",
                            }}
                          />
                          {errors.name && (
                            <p className="text-sm text-red-500">
                              {errors.name.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium" style={{ color: "var(--home-text)" }}>
                          Account Type
                        </label>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              currentUser?.role === "ORGANIZER"
                                ? "default"
                                : "secondary"
                            }
                            style={{
                              backgroundColor: "var(--home-card-highlight)",
                              borderColor: "var(--home-border-strong)",
                              color: "var(--home-text-highlight)",
                            }}
                          >
                            {currentUser?.role === "ORGANIZER"
                              ? "Event Organizer"
                              : "User"}
                          </Badge>
                          <span className="text-sm" style={{ color: "var(--home-muted)" }}>
                            Contact support to change your account type
                          </span>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={
                          updateUserMutation.isPending ||
                          isSubmitting ||
                          !hasProfileChanges
                        }
                        variant="homeAccent"
                        className="mt-4 sm:mt-0 px-6"
                      >
                        Save Changes
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Change Password */}
              <div>
                <Card
                  className="border"
                  style={{
                    backgroundColor: "var(--home-card)",
                    borderColor: "var(--home-border)",
                    color: "var(--home-text)",
                  }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <HugeiconsIcon icon={SquareLock01Icon} className="h-5 w-5" style={{ color: "var(--home-accent)" }} />
                      <span>Change Password</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handlePasswordSubmit(handleChangePassword)}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <label
                          htmlFor="currentPassword"
                          className="text-sm font-medium"
                          style={{ color: "var(--home-text)" }}
                        >
                          Current Password
                        </label>
                        <Input
                          id="currentPassword"
                          type="password"
                          {...registerPassword("currentPassword")}
                          style={{
                            backgroundColor: "var(--home-bg)",
                            borderColor: "var(--home-border-strong)",
                            color: "var(--home-text)",
                          }}
                        />
                        {passwordErrors.currentPassword && (
                          <p className="text-sm text-red-500">
                            {passwordErrors.currentPassword.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="newPassword"
                          className="text-sm font-medium"
                          style={{ color: "var(--home-text)" }}
                        >
                          New Password
                        </label>
                        <Input
                          id="newPassword"
                          type="password"
                          {...registerPassword("newPassword")}
                          style={{
                            backgroundColor: "var(--home-bg)",
                            borderColor: "var(--home-border-strong)",
                            color: "var(--home-text)",
                          }}
                        />
                        {passwordErrors.newPassword && (
                          <p className="text-sm text-red-500">
                            {passwordErrors.newPassword.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="confirmPassword"
                          className="text-sm font-medium"
                          style={{ color: "var(--home-text)" }}
                        >
                          Confirm New Password
                        </label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          {...registerPassword("confirmPassword")}
                          style={{
                            backgroundColor: "var(--home-bg)",
                            borderColor: "var(--home-border-strong)",
                            color: "var(--home-text)",
                          }}
                        />
                        {passwordErrors.confirmPassword && (
                          <p className="text-sm text-red-500">
                            {passwordErrors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        disabled={
                          changePasswordMutation.isPending ||
                          !hasPasswordChanges
                        }
                        variant="homeAccent"
                        className="mt-4 sm:mt-0 px-6"
                      >
                        Update Password
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
