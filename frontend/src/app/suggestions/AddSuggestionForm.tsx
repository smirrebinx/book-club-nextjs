'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { BookSearchInput } from '@/components/BookSearchInput';

import { createSuggestion } from './actions';

interface BookData {
  title: string;
  author: string;
  isbn?: string;
  coverImage?: string;
  googleBooksId?: string;
}

export function AddSuggestionForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [isbn, setIsbn] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [googleBooksId, setGoogleBooksId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleBookSelect = (book: BookData) => {
    setTitle(book.title);
    setAuthor(book.author);
    setIsbn(book.isbn || '');
    setCoverImage(book.coverImage || '');
    setGoogleBooksId(book.googleBooksId || '');
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setDescription('');
    setIsbn('');
    setCoverImage('');
    setGoogleBooksId('');
  };

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
    if (isbn) formData.append('isbn', isbn);
    if (coverImage) formData.append('coverImage', coverImage);
    if (googleBooksId) formData.append('googleBooksId', googleBooksId);

    startTransition(async () => {
      const result = await createSuggestion(formData);
      if (result.success) {
        setSuccessMessage('Förslag skapat!');
        resetForm();
        router.refresh();
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
        {/* Book Search */}
        {!showManualInput && (
          <BookSearchInput
            onSelectBook={handleBookSelect}
            disabled={isPending}
          />
        )}

        {/* Toggle between search and manual input */}
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-sm text-[var(--secondary-bg)] hover:underline focus:outline-2 focus:outline-offset-2"
          style={{ outlineColor: 'var(--focus-ring)' }}
        >
          {showManualInput ? '← Tillbaka till sökning' : 'Hittar du inte boken? Skriv in den manuellt →'}
        </button>

        {/* Title field - always visible */}
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
            disabled={isPending}
          />
        </div>

        {/* Author field - always visible */}
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
            disabled={isPending}
          />
        </div>

        {/* Show cover preview if available */}
        {coverImage && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="relative w-16 h-20 flex-shrink-0">
              <Image
                src={coverImage}
                alt={`Omslag för ${title}`}
                fill
                sizes="64px"
                className="object-cover rounded"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Bok vald från Google Books</p>
              {isbn && (
                <p className="text-xs text-gray-600 mt-1">ISBN: {isbn}</p>
              )}
            </div>
          </div>
        )}

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
