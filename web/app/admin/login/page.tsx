'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap, useGSAP } from '@/lib/motion';
import { readApiError } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { contextSafe } = useGSAP({ scope: formRef });

  const shake = contextSafe((names: string[]) => {
    const targets = names
      .map((name) => formRef.current?.querySelector<HTMLElement>(`#admin-${name}`))
      .filter((el): el is HTMLElement => Boolean(el));
    if (targets.length === 0) return;
    gsap.fromTo(targets, { x: -5 }, { x: 0, duration: 0.42, ease: 'elastic.out(1, 0.32)', clearProps: 'x' });
  });

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
      const invalid = Object.keys(fieldErrors);
      if (invalid.length > 0) shake(invalid);
    } catch {
      setError('Koneksi bermasalah. Periksa internet Anda, lalu coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-shell">
      <aside className="login-aside">
        <a className="brand" href="/" aria-label="Kembali ke situs publik">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/brand/logo-mark-96.webp" width={82} height={96} alt="" />
          <span className="brand-text">
            <strong>Solusi Mitra Mandiri</strong>
            <span>Sistem Gym</span>
          </span>
        </a>

        <div>
          <h1>
            Portal <em>admin</em> operasional gym.
          </h1>
          <p>
            Satu pintu masuk untuk permintaan demo, data pengunjung situs, dan logo mitra. Khusus staf
            PT Solusi Mitra Mandiri.
          </p>
        </div>

        <p className="login-meta">Sesi berakhir otomatis setelah 7 hari tidak dipakai</p>
      </aside>

      <div className="login-main">
        <form className="login-form" ref={formRef} onSubmit={onSubmit} noValidate>
          <h2>Masuk</h2>
          <p className="sub">Gunakan email dan kata sandi yang diberikan tim teknis.</p>

          <div className="field">
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              className="input"
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

          <div className="field">
            <label htmlFor="admin-password">Kata sandi</label>
            <input
              id="admin-password"
              className="input"
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

          <button className="btn btn-block" type="submit" disabled={submitting}>
            {submitting ? 'Sedang masuk…' : 'Masuk ke portal'}
          </button>

          {error ? (
            <div className="form-status is-error" role="alert">
              <span>{error}</span>
            </div>
          ) : null}

          <p className="login-foot">
            <a href="/">Kembali ke situs publik</a>
          </p>
        </form>
      </div>
    </main>
  );
}
