'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { createSuggestion } from './actions';

export function AddSuggestionForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!title.trim() || !author.trim()) {
      setErrorMessage('Vänligen fyll i titel och författare');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('description', description);

    startTransition(async () => {
      const result = await createSuggestion(formData);
      if (result.success) {
        setSuccessMessage('Förslag skapat!');
        setTitle('');
        setAuthor('');
        setDescription('');
        router.refresh();
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage(result.error || 'Ett fel uppstod');
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Lägg till bokförslag</h2>

      {/* Success message - WCAG AA compliant with green-800 */}
      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <p className="text-green-800 text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {/* Error message - WCAG AA compliant with red-800 */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-800 text-sm font-medium">{errorMessage}</p>
        </div>
      )}

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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[var(--focus-border)] focus:outline-none"
            style={{ "--tw-ring-color": "var(--focus-ring)" } as React.CSSProperties}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[var(--focus-border)] focus:outline-none"
            style={{ "--tw-ring-color": "var(--focus-ring)" } as React.CSSProperties}
            placeholder="Författarens namn"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Berätta gäran varför du vill läsa boken (frivilligt)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[var(--focus-border)] focus:outline-none resize-none"
            style={{ "--tw-ring-color": "var(--focus-ring)" } as React.CSSProperties}
            placeholder="Berätta gärna varför du vill läsa boken"
          />
          <p className="text-xs text-gray-500 mt-1">
            {description.length}/1000 tecken
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full px-6 py-3 text-lg font-medium rounded-lg bg-[var(--secondary-bg)] text-white hover:bg-white hover:text-[var(--secondary-bg)] border-2 border-[var(--secondary-bg)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Lägger till...' : 'Lägg till förslag'}
        </button>
      </form>
    </div>
  );
}
