// frontend/app/page.tsx

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center z-10">
        <div className="flex justify-center mb-8">
          <img 
            src="/logo.png" 
            alt="MySchedulink Logo" 
            className="h-40 w-auto"
          />
        </div>

        <h1 className="text-4xl font-bold mb-4 sm:text-5xl">
          Καλώς ήρθες στην Εφαρμογή Κρατήσεων!
        </h1>

        <p className="text-lg mb-8 mt-6">
          Συνδέσου για να διαχειριστείς τις υπηρεσίες και το ημερολόγιό σου.
        </p>

        <a
          href={`${apiUrl}/api/auth/google`}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105"
        >
          Σύνδεση με Google
        </a>
      </div>
    </main>
  );
}