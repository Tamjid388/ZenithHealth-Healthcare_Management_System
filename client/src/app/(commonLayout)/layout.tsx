import { Fragment } from "react";

import SiteFooter from "@/components/shared/SiteFooter";
import SiteHeader from "@/components/shared/SiteHeader";

export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Fragment>
      <SiteHeader />
      {children}
      <SiteFooter />
    </Fragment>
  );
}
