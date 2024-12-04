export default function RepoPage({ params }: { params: { name: string } }) {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Repository: {params.name}</h1>
    </div>
  )
} 