export default function StoriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 max-w-6xl mx-auto">
      {children}
    </div>
  )
}