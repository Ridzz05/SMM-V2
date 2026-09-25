'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { readApiError } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFields({});

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.replace('/admin/gym-partners');
        return;
      }

      const { message, fields: fieldErrors } = await readApiError(res);
      setFields(fieldErrors);
      setError(message);
    } catch {
      setError('Tidak dapat menghubungi server. Periksa koneksi Anda lalu coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-wrap">
      <div className="login-card">
        <span className="label">
          All-In-One Control System<span className="ix">/ Level 0 Auth</span>
        </span>
        <h1 className="display">Portal Admin</h1>
        <p className="sub">PT Solusi Mitra Mandiri · Akses Terbatas</p>

        <form onSubmit={onSubmit} noValidate>
          <div className="login-field">
            <label className="form-label" htmlFor="admin-email">
              Email Admin
            </label>
            <input
              id="admin-email"
              className="form-input"
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              aria-invalid={fields.email ? true : undefined}
              aria-describedby={fields.email ? 'admin-email-error' : undefined}
              onChange={(event) => setEmail(event.target.value)}
            />
            {fields.email ? (
              <span className="field-error" id="admin-email-error">
                {fields.email}
              </span>
            ) : null}
          </div>

          <div className="login-field">
            <label className="form-label" htmlFor="admin-password">
              Kata Sandi
            </label>
            <input
              id="admin-password"
              className="form-input"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              aria-invalid={fields.password ? true : undefined}
              aria-describedby={fields.password ? 'admin-password-error' : undefined}
              onChange={(event) => setPassword(event.target.value)}
            />
            {fields.password ? (
              <span className="field-error" id="admin-password-error">
                {fields.password}
              </span>
            ) : null}
          </div>

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Memverifikasi…' : 'Masuk ke Dasbor'}
          </button>
        </form>

        {error ? (
          <div className="form-status is-error" role="alert">
            <span aria-hidden="true">!</span>
            <span>{error}</span>
          </div>
        ) : null}

        <p className="login-foot">
          Sesi berakhir otomatis setelah 7 hari tanpa aktivitas.
          <br />
          <a href="/">← Kembali ke halaman publik</a>
        </p>
      </div>
    </main>
  );
}
