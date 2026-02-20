export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .wtb-theme {
              --primary: 177 82% 24%;
              --primary-foreground: 0 0% 100%;
              --accent: 20 66% 56%;
              --accent-foreground: 0 0% 100%;
              --ring: 177 82% 24%;
            }
          `,
        }}
      />
      <div className="wtb-theme">{children}</div>
    </>
  );
}
