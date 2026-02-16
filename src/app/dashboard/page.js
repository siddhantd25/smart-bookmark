import { createClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import BookmarkList from '@/components/BookmarkList'
import Header from '@/components/Header'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch initial bookmarks
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header user={user} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <BookmarkList initialBookmarks={bookmarks || []} userId={user.id} />
      </main>
    </div>
  )
}
