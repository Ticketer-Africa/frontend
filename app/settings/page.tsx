"use client";

import type React from "react";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { User, Lock, Camera, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateUser } from "@/services/user/user.queries";
import { useRouter } from "next/navigation";
import { useChangePassword } from "@/services/auth/auth.queries";

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
  const { isLoading, user: currentUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
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

  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push(
        `/login?returnUrl=${encodeURIComponent(window.location.href)}`
      );
      return;
    }
  }, [currentUser, router, isLoading]);

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

  const onSubmit = (data: ProfileFormValues) => {
    const formPayload = new FormData();
    formPayload.append("name", data.name);
    if (selectedImage) {
      formPayload.append("file", selectedImage);
    }
    updateUserMutation.mutate(formPayload, {
      onSuccess: () => {
        setSelectedImage(null); // Reset image after successful submission
        setPreviewUrl(null);
      },
    });
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 bg-gray-50 bg-opacity-90 flex items-center justify-center z-50"
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Authentication...
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your session
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Profile Overview</CardTitle>
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
                      <div className="absolute bottom-0 right-0 flex items-center justify-center border border-gray-300 bg-white shadow-sm rounded-full">
                        <Camera className="h-4 w-4" />
                      </div>
                    </label>
                    <input
                      id="fileUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {currentUser?.name}
                    </h3>
                    <p className="text-muted-foreground">
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
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {currentUser?.role === "ORGANIZER"
                        ? "Event Organizer"
                        : "User"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Profile + Password Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
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
                          <label htmlFor="name" className="text-sm font-medium">
                            Full Name
                          </label>
                          <Input id="name" {...register("name")} />
                          {errors.name && (
                            <p className="text-sm text-red-500">
                              {errors.name.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Account Type
                        </label>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              currentUser?.role === "ORGANIZER"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {currentUser?.role === "ORGANIZER"
                              ? "Event Organizer"
                              : "User"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Contact support to change your account type
                          </span>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={
                          updateUserMutation.isPending || !hasProfileChanges
                        }
                        className="mt-4 sm:mt-0 bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Save Changes
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Change Password */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lock className="h-5 w-5" />
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
                        >
                          Current Password
                        </label>
                        <Input
                          id="currentPassword"
                          type="password"
                          {...registerPassword("currentPassword")}
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
                        >
                          New Password
                        </label>
                        <Input
                          id="newPassword"
                          type="password"
                          {...registerPassword("newPassword")}
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
                        >
                          Confirm New Password
                        </label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          {...registerPassword("confirmPassword")}
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
                        variant="outline"
                        className="mt-4 sm:mt-0 bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Update Password
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
