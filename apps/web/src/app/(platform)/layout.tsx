import { PlatformShell } from "@/components/platform/PlatformShell";

export default function PlatformLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PlatformShell>{children}</PlatformShell>;
}
