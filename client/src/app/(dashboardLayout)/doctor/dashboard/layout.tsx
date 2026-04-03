
import { Fragment } from "react";




export default function DoctorDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <Fragment>
    <h1 className="text-green-500 font-bold text-2xl">Doctor Dashboard Layout</h1>
    {children}
  </Fragment>
  );
}
