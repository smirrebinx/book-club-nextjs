export default function AdminMeetingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Möteshantering</h1>
        <p className="text-gray-600 mt-2">Skapa, redigera och ta bort möten</p>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">
          Möteshantering kommer snart. Du kan fortfarande använda befintliga API-rutter för att
          hantera möten via Server Actions i /app/meetings/actions.ts
        </p>
      </div>
    </div>
  );
}
