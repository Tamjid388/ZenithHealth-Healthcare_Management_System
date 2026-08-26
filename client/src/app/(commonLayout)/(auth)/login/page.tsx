import { LoginForm } from "@/components/modules/auth";
interface LoginParams {
  searchParams: Promise<{
    redirect?: string;
  }>;
}
async function LoginPage ({searchParams}:LoginParams) {

  const params = await searchParams;
  const rawRedirect = params.redirect || "/";
  const redirect = rawRedirect.startsWith("http")
    ? new URL(rawRedirect).pathname
    : rawRedirect;

  return <LoginForm redirectUrl={redirect} />;
}

export default LoginPage;
