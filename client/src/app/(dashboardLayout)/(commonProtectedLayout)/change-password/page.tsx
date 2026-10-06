import { ChangePasswordForm } from "@/components/modules/profile/ChangePasswordForm";

function ChangePasswordPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-heading text-2xl tracking-tight text-zh-blue-deep">
          Change Password
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the password for your account.
        </p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}

export default ChangePasswordPage;
