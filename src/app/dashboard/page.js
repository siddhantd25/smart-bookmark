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

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen">
      <Header user={user} />
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <BookmarkList initialBookmarks={bookmarks || []} userId={user.id} />
      </main>
    </div>
  )
}
