import AppLayout from "@/components/ui/AppLayout";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
