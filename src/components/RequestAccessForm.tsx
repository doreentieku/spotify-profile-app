'use client';

import { useState } from 'react';

export default function RequestAccessForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch('/api/request-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });

    if (res.ok) {
      setStatus('Request submitted! I’ll get back to you soon.');
      setName('');
      setEmail('');
    } else {
      setStatus('Something went wrong. Please try again.');
    }
  }

  return (
    <main className="relative flex flex-grow h-screen overflow-hidden">
      <div className="relative bg-gray-800 w-full h-screen flex flex-col items-center justify-center px-10 lg:px-24 py-10 space-y-6">
        <div className="text-white text-center space-y-4">
          <h2 className="text-3xl font-bold">Request Access to spoticizr</h2>
          <p className="text-gray-300 text-sm">
            Fill out the form and to be added to the allowlist.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-gray-700/30 backdrop-blur-md p-6 rounded-lg space-y-4"
        >
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full p-3 rounded bg-gray-900 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded bg-gray-900 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            className="w-full bg-green-500/20 hover:bg-green-700/30 text-white py-3 rounded-lg font-bold cursor-pointer"
          >
            Submit Request
          </button>
          {status && (
            <p className="text-sm text-center text-gray-300">{status}</p>
          )}
        </form>
      </div>
    </main>
  );
}
