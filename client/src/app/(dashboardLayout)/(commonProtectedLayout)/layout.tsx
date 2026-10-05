
import { Fragment } from "react";




export default function CommonProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <Fragment>
    <h1 className="text-primary font-bold text-2xl">Common Protected Layout</h1>
    {children}
  </Fragment>
  );
}
