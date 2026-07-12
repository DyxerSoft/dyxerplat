export default function PlatformLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-muted/40">
      <div className="section-container py-8">{children}</div>
    </main>
  );
}
