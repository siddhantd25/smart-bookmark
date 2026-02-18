'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ExternalLink, Copy, Plus, Search, Check } from 'lucide-react'

export default function BookmarkList({ initialBookmarks, userId }) {
  const [bookmarks, setBookmarks] = useState(initialBookmarks)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState(null)

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
    
    // Reset form immediately for better UX
    setTitle('')
    setUrl('')

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
    } else {
      setBookmarks((prev) => prev.filter(b => b.id !== tempId))
      console.error('Error adding bookmark:', error)
      // Restore form if failed
      setTitle(newBookmark.title)
      setUrl(newBookmark.url)
      alert('Failed to add bookmark. Please try again.')
    }
    setLoading(false)
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation() // Prevent triggering card click if we add that later
    if(!confirm('Are you sure you want to delete this bookmark?')) return

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

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const filteredBookmarks = bookmarks.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Add New Bookmark Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 rounded-2xl"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            Add New Bookmark
          </h2>
          {/* Search Bar - hidden on mobile initially or can be expanded */}
           <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2 md:space-y-0 md:space-x-4 md:flex">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bookmark Title"
              className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all"
              required
            />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? 'Adding...' : 'Add Bookmark'}
          </button>
        </form>
      </motion.div>

      {/* Bookmarks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredBookmarks.length === 0 ? (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="col-span-full py-20 text-center"
             >
               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                 <Search className="w-8 h-8 text-gray-500" />
               </div>
               <p className="text-gray-400 text-lg">No bookmarks found.</p>
               <p className="text-gray-600 text-sm mt-2">Try adding one or changing your search.</p>
             </motion.div>
          ) : (
            filteredBookmarks.map((bookmark) => (
              <motion.div
                key={bookmark.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="glass-panel p-5 rounded-2xl group hover:border-indigo-500/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-semibold text-white truncate text-lg" title={bookmark.title}>
                      {bookmark.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button
                      onClick={() => copyToClipboard(bookmark.url, bookmark.id)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Copy URL"
                    >
                      {copiedId === bookmark.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => handleDelete(bookmark.id, e)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-400 hover:text-indigo-300 truncate flex items-center gap-1.5 hover:underline decoration-indigo-400/30 underline-offset-4 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {bookmark.url}
                </a>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
