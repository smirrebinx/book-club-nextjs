'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { useToast } from '@/components/Toast';

import { createSuggestion } from './actions';


export function AddSuggestionForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('description', description);

    startTransition(async () => {
      const result = await createSuggestion(formData);
      if (result.success) {
        showToast('Förslag skapat!', 'success');
        setTitle('');
        setAuthor('');
        setDescription('');
        router.refresh();
      } else {
        showToast(result.error || 'Ett fel uppstod', 'error');
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Lägg till bokförslag</h2>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Titel <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#94b1aa] focus:border-transparent"
            placeholder="Bokens titel"
          />
        </div>

        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
            Författare <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            maxLength={100}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#94b1aa] focus:border-transparent"
            placeholder="Författarens namn"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Beskrivning <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={10}
            maxLength={1000}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#94b1aa] focus:border-transparent resize-none"
            placeholder="Varför vill du läsa den här boken?"
          />
          <p className="text-xs text-gray-500 mt-1">
            {description.length}/1000 tecken
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#94b1aa] hover:bg-[#568b7f] text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Lägger till...' : 'Lägg till förslag'}
        </button>
      </form>
    </div>
  );
}
