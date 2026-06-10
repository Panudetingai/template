"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/elysia/eden-client";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import UploadAvatar from "@/module/onboarding/hooks/upload-avatar";
import {
  UpdateProfileSchema,
  type UpdateProfileSchemaType,
} from "@/module/profile/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface EditProfileDialogProps {
  userId: string;
  email: string;
  defaultUsername: string;
  defaultAvatarUrl: string;
}

export default function EditProfileDialog({
  userId,
  email,
  defaultUsername,
  defaultAvatarUrl,
}: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<UpdateProfileSchemaType>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: { username: defaultUsername, avatarUrl: defaultAvatarUrl },
  });

  const [username, avatarUrl] = useWatch({
    control: form.control,
    name: ["username", "avatarUrl"],
  });
  const initials = (username || email.split("@")[0] || "U")
    .slice(0, 2)
    .toUpperCase();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: UpdateProfileSchemaType) => {
      const response = await api.profile.update.post({
        username: data.username,
        avatarUrl: data.avatarUrl || undefined,
      });
      if (response.error) throw response.error;
      return response.data;
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutate(data, {
      onSuccess: async () => {
        // Refresh the client session so metadata-backed hooks pick up the
        // new name/avatar, and refetch the dashboard's onboarding snapshot.
        await createClient().auth.refreshSession();
        await queryClient.invalidateQueries({
          queryKey: ["onboarding", "me"],
        });
        toast.success("Profile updated");
        setOpen(false);
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update profile. Please try again.",
        );
      },
    });
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          form.reset({
            username: defaultUsername,
            avatarUrl: defaultAvatarUrl,
          });
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update your name and photo.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="flex items-center gap-4">
            <UploadAvatar
              initials={initials}
              userId={userId}
              value={avatarUrl || undefined}
              onChange={(url) =>
                form.setValue("avatarUrl", url, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            />
            <p className="min-w-0 truncate text-sm text-muted-foreground">
              {email}
            </p>
          </div>

          <FieldGroup>
            <Controller
              control={form.control}
              name="username"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Username</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      placeholder="johndoe"
                      autoComplete="username"
                      className={cn(
                        fieldState.error &&
                          "border-destructive ring-destructive",
                      )}
                    />
                  </FieldContent>
                  <FieldDescription>
                    Letters, numbers, and underscores only.
                  </FieldDescription>
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner /> : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
