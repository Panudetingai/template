"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useUsers from "@/lib/supabase/hooks/use-users";
import EditProfileDialog from "./edit-profile-dialog";

export default function Profile() {
  const { user, user_metadata, isLoading } = useUsers();

  const name =
    user_metadata?.username ??
    user_metadata?.name ??
    user_metadata?.email?.split("@")[0] ??
    "User";
  const email = user_metadata?.email ?? "";
  const avatarUrl = user_metadata?.avatar_url ?? "";
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Your personal information and account overview.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          {isLoading ? (
            <Skeleton className="size-16 rounded-full" />
          ) : (
            <Avatar className="size-16">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
          )}
          <div className="min-w-0 flex-1">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            ) : (
              <>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {name}
                  <Badge variant="secondary">Free</Badge>
                </CardTitle>
                <CardDescription>{email}</CardDescription>
              </>
            )}
          </div>
          {user?.id && (
            <EditProfileDialog
              userId={user.id}
              email={email}
              defaultUsername={user_metadata?.username ?? user_metadata?.name ?? ""}
              defaultAvatarUrl={avatarUrl}
            />
          )}
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-0.5">
              <dt className="text-xs text-muted-foreground">Username</dt>
              <dd className="text-sm font-medium">{name}</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd className="text-sm font-medium">{email || "—"}</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-xs text-muted-foreground">Plan</dt>
              <dd className="text-sm font-medium">Free</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd className="text-sm font-medium">Active</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
