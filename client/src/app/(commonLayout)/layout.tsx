
import { Fragment } from "react";




export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <Fragment>
    <h1 className="text-green-500 font-bold text-2xl">Common Layout</h1>
    {children}
  </Fragment>
  );
}
