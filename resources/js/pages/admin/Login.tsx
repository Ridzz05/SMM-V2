import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

export default function AdminLogin() {
  const form = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    form.post('/admin/login');
  };

  return (
    <>
      <Head title="Admin Login - PT Solusi Mitra Mandiri" />
      <main className="min-h-screen bg-[#090512] text-white flex items-center justify-center px-4 py-12">
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.22),transparent_50%)]" />
        <div className="relative w-full max-w-md rounded-3xl border border-violet-400/20 bg-[#120b1c]/90 p-8 shadow-[0_0_70px_rgba(139,92,246,0.18)] backdrop-blur-xl">
          <a href="/" className="inline-flex mb-8">
            <img src="/images/logo.png" alt="PT Solusi Mitra Mandiri" className="h-20 w-auto object-contain" />
          </a>
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-violet-300 mb-3">Secure Administration</p>
          <h1 className="text-3xl font-bold mb-2">Login Admin</h1>
          <p className="text-sm text-slate-400 mb-8">Masuk untuk mengelola daftar dan logo gym partner.</p>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-violet-100 mb-2">Email</label>
              <input
                type="email"
                value={form.data.email}
                onChange={(event) => form.setData('email', event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
                required
                autoFocus
              />
              {form.errors.email && <p className="mt-2 text-xs text-red-400">{form.errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-violet-100 mb-2">Password</label>
              <input
                type="password"
                value={form.data.password}
                onChange={(event) => form.setData('password', event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
                required
              />
              {form.errors.password && <p className="mt-2 text-xs text-red-400">{form.errors.password}</p>}
            </div>
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.data.remember}
                onChange={(event) => form.setData('remember', event.target.checked)}
                className="accent-violet-500"
              />
              Ingat saya
            </label>
            <button type="submit" disabled={form.processing} className="w-full rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500 disabled:opacity-60 transition-colors">
              {form.processing ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
