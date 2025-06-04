"use client";

import { useAuth } from "@/context/auth-context";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Mail, Key, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

// Helper function to get initials
const getInitials = (name: string | null) => {
  if (!name) return "U";
  const names = name.split(" ");
  return names.map(n => n[0]).join("").toUpperCase();
};

export default function Profile() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border rounded-xl shadow-lg">
          <CardHeader>
            <Skeleton className="h-8 w-1/4 mb-2" />
            <Skeleton className="h-5 w-2/3" />
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center space-x-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-64" />
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-7 w-full" />
                </div>
              ))}
            </div>
            
            <Separator />
            
            <div className="flex justify-end">
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="border rounded-xl shadow-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">User Profile</CardTitle>
          <CardDescription className="text-lg">
            Manage your account information
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid gap-6">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white dark:border-gray-800 shadow-lg">
                <AvatarImage 
                  src={user?.photoURL || ""} 
                  alt={user?.displayName || "User"}
                />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-bold">
                  {getInitials(user?.displayName ?? user?.email ?? null)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-indigo-500 rounded-full p-2 shadow-md">
                <Pencil className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold">
                {user?.displayName || user?.email || "User"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center justify-center md:justify-start">
                <Mail className="h-4 w-4 mr-2" />
                {user?.email || "No email provided"}
              </p>
              <div className="mt-4">
                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-indigo-900 dark:text-indigo-300">
                  Verified Account
                </span>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <User className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Display Name</h3>
              </div>
              <p className="text-lg font-medium dark:text-white">
                {user?.displayName || "Not set"}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Key className="h-5 w-5 mr-2" />
                <h3 className="font-medium">User ID</h3>
              </div>
              <p className="font-mono text-sm break-all text-gray-700 dark:text-gray-300">
                {user?.uid || "Not available"}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Calendar className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Account Created</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                {user?.metadata?.creationTime 
                  ? format(new Date(user.metadata.creationTime), "MMMM d, yyyy") 
                  : "Unknown date"}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Calendar className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Last Login</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                {user?.metadata?.lastSignInTime 
                  ? format(new Date(user.metadata.lastSignInTime), "MMMM d, yyyy h:mm a") 
                  : "Unknown date"}
              </p>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {/* Security Section */}
          <div>
            <h2 className="text-xl font-bold mb-4">Security</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 dark:border-gray-700">
                <h3 className="font-medium mb-2">Password</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Last changed 2 months ago
                </p>
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
              </div>
              
              <div className="border rounded-lg p-4 dark:border-gray-700">
                <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Add an extra layer of security
                </p>
                <Button variant="outline" className="w-full">
                  Enable 2FA
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        
        <div className="p-6 flex justify-end border-t dark:border-gray-700">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Pencil className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </Card>
    </div>
  );
}