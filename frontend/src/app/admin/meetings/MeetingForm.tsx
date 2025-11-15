'use client';

import { useState } from 'react';

import type { Meeting } from '@/types/meeting';

interface MeetingFormProps {
  meeting?: Meeting;
  onSubmit: (formData: FormData) => Promise<void>;
  isPending: boolean;
  onCancel: () => void;
}

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helpText?: string;
  minLength?: number;
  min?: string;
}

function FormField({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder,
  helpText,
  minLength,
  min,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--primary-text)] mb-1">
        {label} {required && '*'}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        aria-required={required}
        disabled={disabled}
        minLength={minLength}
        min={min}
        className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-[var(--focus-border)] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ "--tw-ring-color": "var(--focus-ring)" } as React.CSSProperties}
        placeholder={placeholder}
        aria-describedby={helpText ? `${id}-help` : undefined}
      />
      {helpText && (
        <p id={`${id}-help`} className="text-xs text-[var(--color-muted)] mt-1">
          {helpText}
        </p>
      )}
    </div>
  );
}

interface MeetingBasicFieldsProps {
  formData: {
    id: string;
    date: string;
    time: string;
    location: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isEditing: boolean;
  isPending: boolean;
  today: string;
}

function MeetingBasicFields({ formData, handleChange, isEditing, isPending, today }: MeetingBasicFieldsProps) {
  return (
    <>
      <FormField
        id="meeting-id"
        name="id"
        label="Mötes-ID"
        value={formData.id}
        onChange={handleChange}
        disabled={isEditing || isPending}
        placeholder="next-meeting"
        helpText='Unikt ID för mötet, t.ex. "next-meeting" för nästa möte'
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="meeting-date"
          name="date"
          label="Datum"
          type="date"
          value={formData.date}
          onChange={handleChange}
          disabled={isPending}
          min={today}
          helpText="Datum för mötet"
        />

        <FormField
          id="meeting-time"
          name="time"
          label="Tid (24-timmarsformat)"
          type="time"
          value={formData.time}
          onChange={handleChange}
          disabled={isPending}
          placeholder="18:00"
          helpText="Ange tid i 24-timmarsformat, t.ex. 18:00"
        />
      </div>

      <FormField
        id="meeting-location"
        name="location"
        label="Plats"
        value={formData.location}
        onChange={handleChange}
        disabled={isPending}
        placeholder="Biblioteket, Stockholm"
      />
    </>
  );
}

interface BookFieldsProps {
  formData: {
    bookTitle: string;
    bookAuthor: string;
    bookId: string;
    bookIsbn: string;
    bookCoverImage: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isPending: boolean;
}

function BookFields({ formData, handleChange, isPending }: BookFieldsProps) {
  return (
    <div className="border-t border-[var(--primary-border)] pt-6">
      <h3 className="text-base font-medium text-[var(--primary-text)] mb-4">Bokinformation</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="book-title"
            name="bookTitle"
            label="Boktitel"
            value={formData.bookTitle}
            onChange={handleChange}
            disabled={isPending}
          />

          <FormField
            id="book-author"
            name="bookAuthor"
            label="Författare"
            value={formData.bookAuthor}
            onChange={handleChange}
            disabled={isPending}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="book-id"
            name="bookId"
            label="Bok-ID"
            value={formData.bookId}
            onChange={handleChange}
            disabled={isPending}
            placeholder="unique-book-id"
            helpText="Unikt ID för boken i systemet"
          />

          <FormField
            id="book-isbn"
            name="bookIsbn"
            label="ISBN"
            value={formData.bookIsbn}
            onChange={handleChange}
            disabled={isPending}
            placeholder="978-3-16-148410-0"
          />
        </div>

        <FormField
          id="book-cover"
          name="bookCoverImage"
          label="Omslagsbild URL"
          type="url"
          value={formData.bookCoverImage}
          onChange={handleChange}
          disabled={isPending}
          placeholder="https://example.com/image.jpg"
          helpText="URL till bokens omslagsbild"
        />
      </div>
    </div>
  );
}

interface FormActionsProps {
  isPending: boolean;
  isEditing: boolean;
  onCancel: () => void;
}

function FormActions({ isPending, isEditing, onCancel }: FormActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
      <button
        type="button"
        onClick={onCancel}
        disabled={isPending}
        className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-2 focus:outline-offset-2 transition-colors order-2 sm:order-1"
        style={{ outlineColor: 'var(--focus-ring)' }}
      >
        Avbryt
      </button>
      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-2.5 bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] rounded-md hover:bg-[var(--button-primary-hover)] border-2 border-[var(--button-primary-bg)] hover:border-[var(--button-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-2 focus:outline-offset-2 transition-all order-1 sm:order-2"
        style={{ outlineColor: 'var(--focus-ring)' }}
      >
        {isPending ? 'Sparar...' : isEditing ? 'Uppdatera möte' : 'Skapa möte'}
      </button>
    </div>
  );
}

const EMPTY_FORM_DATA = {
  id: '',
  date: '',
  time: '',
  location: '',
  bookId: '',
  bookTitle: '',
  bookAuthor: '',
  bookCoverImage: '',
  bookIsbn: '',
  additionalInfo: '',
};

function getInitialFormData(meeting?: Meeting) {
  if (!meeting) {
    return EMPTY_FORM_DATA;
  }

  const book = meeting.book || {};

  return {
    id: meeting.id || '',
    date: meeting.date || '',
    time: meeting.time || '',
    location: meeting.location || '',
    bookId: book.id || '',
    bookTitle: book.title || '',
    bookAuthor: book.author || '',
    bookCoverImage: book.coverImage || '',
    bookIsbn: book.isbn || '',
    additionalInfo: meeting.additionalInfo || '',
  };
}

export function MeetingForm({ meeting, onSubmit, isPending, onCancel }: MeetingFormProps) {
  const isEditing = !!meeting;
  const [formData, setFormData] = useState(getInitialFormData(meeting));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void onSubmit(new FormData(e.currentTarget));
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <MeetingBasicFields
        formData={formData}
        handleChange={handleChange}
        isEditing={isEditing}
        isPending={isPending}
        today={today}
      />

      <BookFields
        formData={formData}
        handleChange={handleChange}
        isPending={isPending}
      />

      <div>
        <label htmlFor="additional-info" className="block text-sm font-medium text-[var(--primary-text)] mb-1">
          Ytterligare information
        </label>
        <textarea
          id="additional-info"
          name="additionalInfo"
          value={formData.additionalInfo}
          onChange={handleChange}
          rows={3}
          disabled={isPending}
          className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-[var(--focus-border)] focus:outline-none disabled:opacity-50"
          style={{ "--tw-ring-color": "var(--focus-ring)" } as React.CSSProperties}
          placeholder="Extra information om mötet..."
          aria-describedby="info-help"
        />
        <p id="info-help" className="text-xs text-[var(--color-muted)] mt-1">
          Valfri tillägginformation om mötet
        </p>
      </div>

      <FormActions isPending={isPending} isEditing={isEditing} onCancel={onCancel} />
    </form>
  );
}
