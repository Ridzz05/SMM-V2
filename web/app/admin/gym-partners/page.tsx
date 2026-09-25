'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { readApiError, type AdminIdentity, type AdminPartnersData } from '@/lib/api';

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function GymPartnersDashboard() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [admin, setAdmin] = useState<AdminIdentity | null>(null);
  const [data, setData] = useState<AdminPartnersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/partners', { cache: 'no-store' });
    if (res.status === 401) {
      router.replace('/admin/login');
      return;
    }
    if (!res.ok) {
      const { message } = await readApiError(res);
      setStatus({ kind: 'error', text: message });
      setLoading(false);
      return;
    }
    setData(await res.json());
    setLoading(false);
  }, [router]);

  useEffect(() => {
    let active = true;

    (async () => {
      const meRes = await fetch('/api/admin/me', { cache: 'no-store' });
      if (meRes.status === 401) {
        router.replace('/admin/login');
        return;
      }
      if (meRes.ok && active) {
        const body: { admin: AdminIdentity } = await meRes.json();
        setAdmin(body.admin);
      }
      if (active) await load();
    })();

    return () => {
      active = false;
    };
  }, [load, router]);

  async function onUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = fileRef.current;
    const file = input?.files?.[0];

    setStatus(null);
    setFieldErrors({});

    if (!name.trim()) {
      setFieldErrors({ name: 'Nama gym mitra wajib diisi.' });
      return;
    }
    if (!file) {
      setFieldErrors({ logo: 'Pilih berkas logo terlebih dahulu.' });
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setFieldErrors({ logo: 'Ukuran berkas logo maksimal 5 MB.' });
      return;
    }

    const form = new FormData();
    form.append('name', name.trim());
    form.append('logo', file);

    setUploading(true);
    try {
      const res = await fetch('/api/admin/partners', { method: 'POST', body: form });

      if (res.status === 401) {
        router.replace('/admin/login');
        return;
      }

      if (!res.ok) {
        const { message, fields } = await readApiError(res);
        setFieldErrors(fields);
        setStatus({ kind: 'error', text: message });
        return;
      }

      const payload: { message?: string } = await res.json();
      setStatus({ kind: 'ok', text: payload.message ?? 'Logo mitra berhasil diterbitkan.' });
      setName('');
      if (input) input.value = '';
      await load();
    } catch {
      setStatus({ kind: 'error', text: 'Unggahan gagal. Periksa koneksi Anda lalu coba lagi.' });
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(id: number, partnerName: string) {
    if (!window.confirm(`Hapus mitra "${partnerName}"? Logo akan ikut dihapus dari server.`)) {
      return;
    }

    setBusyId(id);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/partners/${id}`, { method: 'DELETE' });

      if (res.status === 401) {
        router.replace('/admin/login');
        return;
      }

      if (!res.ok) {
        const { message } = await readApiError(res);
        setStatus({ kind: 'error', text: message });
        return;
      }

      const body: { message?: string } = await res.json();
      setStatus({ kind: 'ok', text: body.message ?? 'Mitra berhasil dihapus.' });
      await load();
    } catch {
      setStatus({ kind: 'error', text: 'Penghapusan gagal. Periksa koneksi Anda lalu coba lagi.' });
    } finally {
      setBusyId(null);
    }
  }

  async function onLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  }

  if (loading) {
    return (
      <main className="container admin-wrap">
        <p className="meta">Memuat dasbor…</p>
      </main>
    );
  }

  return (
    <main className="container admin-wrap">
      <div className="admin-head">
        <div>
          <span className="label">
            Portal Admin<span className="ix">/ AIO</span>
          </span>
          <h1>Dasbor Mitra Gym</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          {admin ? <span className="who">{admin.email}</span> : null}
          <a className="btn btn-ghost btn-sm" href="/">
            Lihat Situs
          </a>
          <button className="btn btn-ghost btn-sm" type="button" onClick={onLogout}>
            Keluar
          </button>
        </div>
      </div>

      {status ? (
        <div className={status.kind === 'ok' ? 'form-status is-ok' : 'form-status is-error'} role="status">
          <span aria-hidden="true">{status.kind === 'ok' ? '✓' : '!'}</span>
          <span>{status.text}</span>
        </div>
      ) : null}

      <section className="admin-panel">
        <h2>Terbitkan Logo Mitra</h2>
        <p className="hint">
          Logo langsung tampil di bagian &ldquo;Jaringan Mitra&rdquo; pada halaman publik. Format PNG, JPG, atau
          WebP, maksimal 5 MB.
        </p>

        <form className="admin-form" onSubmit={onUpload} noValidate>
          <div>
            <label className="form-label" htmlFor="partner-name">
              Nama Gym
            </label>
            <input
              id="partner-name"
              className="form-input"
              type="text"
              value={name}
              maxLength={120}
              aria-invalid={fieldErrors.name ? true : undefined}
              aria-describedby={fieldErrors.name ? 'partner-name-error' : undefined}
              onChange={(event) => {
                setName(event.target.value);
                setFieldErrors((prev) => {
                  if (!prev.name) return prev;
                  const next = { ...prev };
                  delete next.name;
                  return next;
                });
              }}
            />
            {fieldErrors.name ? (
              <span className="field-error" id="partner-name-error">
                {fieldErrors.name}
              </span>
            ) : null}
          </div>

          <div>
            <label className="form-label" htmlFor="partner-logo">
              Berkas Logo
            </label>
            <input
              id="partner-logo"
              ref={fileRef}
              className="file-input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              aria-invalid={fieldErrors.logo ? true : undefined}
              aria-describedby={fieldErrors.logo ? 'partner-logo-error' : undefined}
            />
            {fieldErrors.logo ? (
              <span className="field-error" id="partner-logo-error">
                {fieldErrors.logo}
              </span>
            ) : null}
          </div>

          <button className="btn btn-primary" type="submit" disabled={uploading}>
            {uploading ? 'Mengunggah…' : 'Terbitkan'}
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <h2>Mitra Terdaftar</h2>
        <p className="hint">{data?.partners.length ?? 0} mitra aktif tampil di halaman publik.</p>

        {data && data.partners.length > 0 ? (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">Logo</th>
                  <th scope="col">Nama</th>
                  <th scope="col">Status</th>
                  <th scope="col">Diterbitkan</th>
                  <th scope="col">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.partners.map((partner) => (
                  <tr key={partner.id}>
                    <td className="logo-cell">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={partner.logo_path} alt={`Logo ${partner.name}`} />
                    </td>
                    <td className="strong">{partner.name}</td>
                    <td>
                      <span className={partner.is_active ? 'badge is-active' : 'badge'}>
                        {partner.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="mono">{formatDate(partner.created_at)}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm btn-danger"
                        type="button"
                        disabled={busyId === partner.id}
                        onClick={() => onDelete(partner.id, partner.name)}
                      >
                        {busyId === partner.id ? 'Menghapus…' : 'Hapus'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>Belum ada mitra terdaftar. Terbitkan logo pertama lewat formulir di atas.</p>
          </div>
        )}
      </section>

      <section className="admin-panel">
        <h2>Permintaan Demo Masuk</h2>
        <p className="hint">{data?.demoRequests.length ?? 0} pengajuan dari formulir halaman publik.</p>

        {data && data.demoRequests.length > 0 ? (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">Perusahaan</th>
                  <th scope="col">PIC</th>
                  <th scope="col">Kontak</th>
                  <th scope="col">Catatan</th>
                  <th scope="col">Status</th>
                  <th scope="col">Masuk</th>
                </tr>
              </thead>
              <tbody>
                {data.demoRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="strong">{request.company_name}</td>
                    <td>{request.pic_name}</td>
                    <td className="mono">
                      {request.phone_number}
                      <br />
                      {request.email}
                    </td>
                    <td>{request.notes || '-'}</td>
                    <td>
                      <span className={request.status === 'pending' ? 'badge is-pending' : 'badge'}>
                        {request.status}
                      </span>
                    </td>
                    <td className="mono">{formatDate(request.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>Belum ada permintaan demo yang masuk.</p>
          </div>
        )}
      </section>
    </main>
  );
}
