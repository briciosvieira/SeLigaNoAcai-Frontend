type PageContainerProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export function PageContainer({ children, style }: PageContainerProps) {
  return (
    <main
      style={{
        flex: 1,
        paddingBottom: 'calc(var(--bnav) + 16px)',
        overflowY: 'auto',
        ...style,
      }}
    >
      {children}
    </main>
  );
}
