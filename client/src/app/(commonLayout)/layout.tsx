import { Fragment } from "react";

import SiteFooter from "@/components/shared/SiteFooter";
import SiteHeader from "@/components/shared/SiteHeader";
import { getUserInfo } from "@/services/auth.service";

export default async function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userInfo = await getUserInfo()

  return (
    <Fragment>
      <SiteHeader userInfo={userInfo} />
      {children}
      <SiteFooter />
    </Fragment>
  );
}
