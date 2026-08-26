"use client";
import { loginAction } from "@/app/(commonLayout)/(auth)/login/_action";
import AppField from "@/components/shared/form/Appfield";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { loginZodSchema, TLogin } from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { useState } from "react";

const DEMO_CREDENTIALS = [
  {
    label: "Super Admin",
    email: "tamjidahmed388@gmail.com",
    password: "password",
  },
  {
    label: "Doctor",
    email: "arafat.hossain@gmail.com",
    password: "Arafat@123",
  },
] as const;

export const LoginForm = ({redirectUrl}:{redirectUrl?:string}) => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync } = useMutation({
    mutationFn: async (data: TLogin) => loginAction(data,redirectUrl),
  });
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },

    onSubmit: async ({ value }) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = (await mutateAsync(value)) as any;
        if (!result.success) {
          setServerError(result.message);
          return;
        }
        queryClient.invalidateQueries({ queryKey: ["user"] });
        form.reset();
        setServerError(null);
      } catch (error) {
        unstable_rethrow(error);
        console.error((error as Error).message);
        setServerError((error as Error).message || "Login failed");
      }
    },
  });

  const loginWithDemoCredentials = async (credentials: TLogin) => {
    form.setFieldValue("email", credentials.email);
    form.setFieldValue("password", credentials.password);
    await form.handleSubmit();
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-md my-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>
          Enter your email and password to login
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          method="POST"
          action="#"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Subscribe
            selector={(state) => state.isSubmitting}
          >
            {(isSubmitting) => (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Quick login with demo credentials
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_CREDENTIALS.map((credential) => (
                    <Button
                      key={credential.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() =>
                        loginWithDemoCredentials({
                          email: credential.email,
                          password: credential.password,
                        })
                      }
                    >
                      {credential.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </form.Subscribe>

          <form.Field
            name="email"
            validators={{ onChange: loginZodSchema.shape.email }}
          >
            {(field) => (
              <AppField
                field={field}
                label="Email"
                type="email"
                placeholder="Enter your email"
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{ onChange: loginZodSchema.shape.password }}
          >
            {(field) => (
              <AppField
                field={field}
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                append={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4" aria-hidden="true" />
                    ) : (
                      <EyeIcon className="size-4" aria-hidden="true" />
                    )}
                  </Button>
                }
              />
            )}
          </form.Field>

          <div className="text-right text-gray-500 mt-2 hover:underline underline-offset-4">
            <Link href="/forgot-password">Forgot password?</Link>
          </div>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
          >
            {([canSubmit, isSubmitting]) => (
              <AppSubmitButton
                disabled={!canSubmit || isSubmitting}
                isPending={isSubmitting}
              >
                Login
              </AppSubmitButton>
            )}
          </form.Subscribe>
          {serverError && (
            <Alert variant="destructive" className="text-red-500 text-sm">
              {serverError}
            </Alert>
          )}
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            // todo: redirect to google login
            const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
            window.location.href = url;
          }}
        >
          <svg className="mr-2 size-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>
      </CardContent>
      <CardFooter>
        <div className="text-center text-gray-500 text-sm">
          Don&apos;t have an account? 
          <Link className="hover:underline underline-offset-4" href="/register">Register</Link>
        </div>
      </CardFooter>
    </Card>
  );
};
export default LoginForm;
