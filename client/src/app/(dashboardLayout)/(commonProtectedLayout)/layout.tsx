import { Fragment } from "react";

export default function CommonProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <Fragment>
    {children}
  </Fragment>
  );
}
