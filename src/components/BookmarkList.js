'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

export default function BookmarkList({ initialBookmarks, userId }) {
  const [bookmarks, setBookmarks] = useState(initialBookmarks)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  // Real-time sync using Supabase Broadcast
  useEffect(() => {
    const channel = supabase
      .channel(`user-${userId}-bookmarks`)
      .on('broadcast', { event: 'bookmark-added' }, (payload) => {
        const newBookmark = payload.payload
        setBookmarks((prev) => {
          const exists = prev.some((b) => b.id === newBookmark.id)
          if (exists) return prev
          return [newBookmark, ...prev]
        })
      })
      .on('broadcast', { event: 'bookmark-deleted' }, (payload) => {
        const deletedId = payload.payload.id
        setBookmarks((prev) => prev.filter((b) => b.id !== deletedId))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return

    setLoading(true)
    
    const tempId = `temp-${Date.now()}`
    const newBookmark = {
      id: tempId,
      title,
      url,
      user_id: userId,
      created_at: new Date().toISOString()
    }
    setBookmarks((prev) => [newBookmark, ...prev])
    
    const { data, error } = await supabase
      .from('bookmarks')
      .insert([{ title, url, user_id: userId }])
      .select()

    if (!error && data) {
      setBookmarks((prev) => prev.map(b => b.id === tempId ? data[0] : b))
      
      await supabase.channel(`user-${userId}-bookmarks`).send({
        type: 'broadcast',
        event: 'bookmark-added',
        payload: data[0]
      })
      
      setTitle('')
      setUrl('')
    } else {
      setBookmarks((prev) => prev.filter(b => b.id !== tempId))
      console.error('Error adding bookmark:', error)
      alert('Failed to add bookmark. Please try again.')
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
    
    const { error } = await supabase.from('bookmarks').delete().eq('id', id)
    
    if (!error) {
      await supabase.channel(`user-${userId}-bookmarks`).send({
        type: 'broadcast',
        event: 'bookmark-deleted',
        payload: { id }
      })
    } else {
      console.error('Error deleting bookmark:', error)
      alert('Failed to delete bookmark. Please refresh the page.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Bookmark</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Website"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Bookmark'}
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Your Bookmarks</h2>
        {bookmarks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-500">No bookmarks yet. Add your first one above!</p>
          </div>
        ) : (
          bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="bg-white rounded-xl shadow-md p-4 flex justify-between items-center hover:shadow-lg transition-shadow"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{bookmark.title}</h3>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {bookmark.url}
                </a>
              </div>
              <button
                onClick={() => handleDelete(bookmark.id)}
                className="ml-4 text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
