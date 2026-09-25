'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { readApiError, type AdminIdentity, type AdminPartnersData } from '@/lib/api';

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-TFKE3G9D2K';

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function getWhatsAppUrl(phone: string, picName: string, company: string): string {
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  } else if (clean.startsWith('8')) {
    clean = '62' + clean;
  }
  const text = `Halo Bapak/Ibu ${picName}, terima kasih telah menghubungi PT Solusi Mitra Mandiri terkait permintaan demo sistem All-In-One (AIO) untuk ${company}. Kapan waktu yang nyaman untuk sesi demonstrasi 30 menit via Google Meet/Zoom?`;
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

export default function AdminPortalDashboard() {
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

  // Tab dan Filter State
  const [activeTab, setActiveTab] = useState<'leads' | 'analytics' | 'partners'>('leads');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

      const payload: { message?: string } = await res.json();
      setStatus({ kind: 'ok', text: payload.message ?? 'Mitra berhasil dihapus.' });
      await load();
    } catch {
      setStatus({ kind: 'error', text: 'Gagal menghapus mitra. Periksa koneksi Anda lalu coba lagi.' });
    } finally {
      setBusyId(null);
    }
  }

  async function onUpdateDemoRequest(id: number, updates: { status?: string; notes?: string }) {
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/demo-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.status === 401) {
        router.replace('/admin/login');
        return;
      }

      if (!res.ok) {
        const { message } = await readApiError(res);
        setStatus({ kind: 'error', text: message });
        return;
      }

      setStatus({ kind: 'ok', text: 'Data prospek berhasil diperbarui di database pusat.' });
      await load();
    } catch {
      setStatus({ kind: 'error', text: 'Gagal memperbarui status. Periksa koneksi Anda.' });
    }
  }

  async function onPromptEditNotes(id: number, currentNotes: string) {
    const newNotes = window.prompt('Perbarui catatan tindak lanjut untuk prospek ini:', currentNotes || '');
    if (newNotes !== null && newNotes !== currentNotes) {
      await onUpdateDemoRequest(id, { notes: newNotes });
    }
  }

  async function onLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  }

  const demoRequests = data?.demoRequests ?? [];
  const partners = data?.partners ?? [];

  const pendingCount = demoRequests.filter((r) => r.status === 'pending').length;
  const contactedCount = demoRequests.filter((r) => r.status === 'contacted').length;
  const scheduledCount = demoRequests.filter((r) => r.status === 'scheduled').length;
  const completedCount = demoRequests.filter((r) => r.status === 'completed').length;

  const filteredRequests = demoRequests.filter((req) => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      req.company_name.toLowerCase().includes(q) ||
      req.pic_name.toLowerCase().includes(q) ||
      req.email.toLowerCase().includes(q) ||
      req.phone_number.includes(q) ||
      (req.notes && req.notes.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <main className="container admin-wrap">
        <p className="meta" style={{ padding: '40px 0', textAlign: 'center' }}>
          Memuat portal kontrol admin…
        </p>
      </main>
    );
  }

  return (
    <main className="container admin-wrap">
      {/* Header Utama Admin */}
      <div className="admin-head">
        <div>
          <span className="label">
            Portal Admin <span className="ix">/ All-In-One Control System</span>
          </span>
          <h1>Pusat Kontrol &amp; Manajemen Data</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {admin ? <span className="who">{admin.email}</span> : null}
          <a className="btn btn-ghost btn-sm" href="/" target="_blank" rel="noopener noreferrer">
            Lihat Situs Publik ↗
          </a>
          <button className="btn btn-ghost btn-sm" type="button" onClick={onLogout}>
            Keluar
          </button>
        </div>
      </div>

      {/* Pesan Notifikasi Status */}
      {status ? (
        <div className={status.kind === 'ok' ? 'form-status is-ok' : 'form-status is-error'} role="status" style={{ marginBottom: 24 }}>
          <span aria-hidden="true">{status.kind === 'ok' ? '✓' : '!'}</span>
          <span>{status.text}</span>
        </div>
      ) : null}

      {/* Tab Navigasi Admin */}
      <div className="admin-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'leads'}
          className={activeTab === 'leads' ? 'admin-tab is-active' : 'admin-tab'}
          onClick={() => setActiveTab('leads')}
        >
          Permintaan Demo &amp; Follow Up ({pendingCount > 0 ? `${pendingCount} Baru` : demoRequests.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'analytics'}
          className={activeTab === 'analytics' ? 'admin-tab is-active' : 'admin-tab'}
          onClick={() => setActiveTab('analytics')}
        >
          Google Analytics &amp; Pengunjung
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'partners'}
          className={activeTab === 'partners' ? 'admin-tab is-active' : 'admin-tab'}
          onClick={() => setActiveTab('partners')}
        >
          Mitra Gym Terpasang ({partners.length})
        </button>
      </div>

      {/* TAB 1: PERMINTAAN DEMO & LEADS FOLLOW UP */}
      {activeTab === 'leads' ? (
        <section aria-label="Permintaan Demo dan Follow Up">
          {/* KPI Ringkasan */}
          <div className="admin-kpi-grid">
            <div className="admin-kpi-card">
              <span className="admin-kpi-num">{demoRequests.length}</span>
              <span className="admin-kpi-label">Total Pengajuan Form</span>
            </div>
            <div className="admin-kpi-card">
              <span className="admin-kpi-num amber">{pendingCount}</span>
              <span className="admin-kpi-label">Menunggu Follow Up</span>
            </div>
            <div className="admin-kpi-card">
              <span className="admin-kpi-num blue">{contactedCount}</span>
              <span className="admin-kpi-label">Sudah Dihubungi</span>
            </div>
            <div className="admin-kpi-card">
              <span className="admin-kpi-num coral">{scheduledCount}</span>
              <span className="admin-kpi-label">Sesi Demo Terjadwal</span>
            </div>
            <div className="admin-kpi-card">
              <span className="admin-kpi-num green">{completedCount}</span>
              <span className="admin-kpi-label">Selesai / Terkonversi</span>
            </div>
          </div>

          <div className="admin-panel">
            <h2>Daftar Calon Klien &amp; Antrean Tindak Lanjut</h2>
            <p className="hint">
              Seluruh isian formulir publik tersimpan permanen di database pusat (`b2b_demo_requests`). Gunakan tombol WhatsApp untuk memulai percakapan cepat dengan template resmi.
            </p>

            {/* Filter dan Pencarian */}
            <div className="admin-filter-bar">
              <input
                type="text"
                className="search-input"
                placeholder="Cari nama gym, PIC, email, atau nomor HP…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter status prospek"
              >
                <option value="all">Semua Status ({demoRequests.length})</option>
                <option value="pending">Menunggu Follow Up ({pendingCount})</option>
                <option value="contacted">Sudah Dihubungi ({contactedCount})</option>
                <option value="scheduled">Sesi Terjadwal ({scheduledCount})</option>
                <option value="completed">Selesai / Terkonversi ({completedCount})</option>
              </select>
            </div>

            {filteredRequests.length > 0 ? (
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th scope="col">Perusahaan / Gym</th>
                      <th scope="col">Nama PIC</th>
                      <th scope="col">Kontak (HP &amp; Surel)</th>
                      <th scope="col">Catatan Tambahan</th>
                      <th scope="col">Status Prospek</th>
                      <th scope="col">Tanggal Masuk</th>
                      <th scope="col" style={{ textAlign: 'right' }}>Aksi Tindak Lanjut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="strong">{request.company_name}</td>
                        <td>{request.pic_name}</td>
                        <td className="mono">
                          {request.phone_number}
                          <br />
                          {request.email}
                        </td>
                        <td style={{ maxWidth: 220 }}>
                          <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                            {request.notes || '-'}
                          </span>
                        </td>
                        <td>
                          <select
                            className="status-select"
                            value={request.status}
                            aria-label={`Ubah status untuk ${request.company_name}`}
                            onChange={(e) => onUpdateDemoRequest(request.id, { status: e.target.value })}
                          >
                            <option value="pending">Pending (Baru)</option>
                            <option value="contacted">Sudah Dihubungi</option>
                            <option value="scheduled">Sesi Terjadwal</option>
                            <option value="completed">Selesai / Deal</option>
                            <option value="cancelled">Dibatalkan</option>
                          </select>
                        </td>
                        <td className="mono">{formatDate(request.created_at)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <a
                              className="btn-wa"
                              href={getWhatsAppUrl(request.phone_number, request.pic_name, request.company_name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Buka WhatsApp Chat dengan template resmi"
                            >
                              <span>Follow Up WA</span>
                            </a>
                            <a
                              className="btn-email"
                              href={`mailto:${request.email}?subject=${encodeURIComponent(
                                `Permintaan Demo Sistem All-In-One: PT Solusi Mitra Mandiri (${request.company_name})`
                              )}`}
                              title="Kirim surel tindak lanjut"
                            >
                              <span>Email</span>
                            </a>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '6px 10px', fontSize: 12 }}
                              onClick={() => onPromptEditNotes(request.id, request.notes)}
                              title="Tambah atau ubah catatan tindak lanjut"
                            >
                              Catatan
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>
                  {searchQuery || statusFilter !== 'all'
                    ? 'Tidak ada permintaan demo yang cocok dengan filter pencarian.'
                    : 'Belum ada permintaan demo yang masuk dari formulir situs publik.'}
                </p>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* TAB 2: ANALISIS PENGUNJUNG & GOOGLE ANALYTICS */}
      {activeTab === 'analytics' ? (
        <section aria-label="Analisis Pengunjung dan Google Analytics">
          <div className="ga-box">
            <div className="ga-status-header">
              <div>
                <span className="label">Integrasi Pelacakan Trafik</span>
                <h2 style={{ fontFamily: 'var(--sans)', fontSize: 22, marginTop: 4 }}>Google Analytics 4 (GA4)</h2>
              </div>
              <div className="ga-pill">
                <span className="ga-pill-dot" />
                <span>Terhubung &amp; Mengumpulkan Data</span>
              </div>
            </div>

            <p style={{ fontFamily: 'var(--body)', fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 680 }}>
              Situs publik PT Solusi Mitra Mandiri telah terhubung dengan Google Analytics 4 menggunakan Measurement ID resmi. Seluruh aktivitas kunjungan, sumber referensi (iklan/sosmed), dan rasio konversi form dicatat secara real-time.
            </p>

            <div style={{ display: 'flex', gap: 14, marginTop: 20, flexWrap: 'wrap' }}>
              <a
                className="btn btn-primary btn-sm"
                href="https://analytics.google.com/analytics/web/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Buka Konsol GA4 ↗
              </a>
              <a
                className="btn btn-ghost btn-sm"
                href="https://analytics.google.com/analytics/web/#/realtime"
                target="_blank"
                rel="noopener noreferrer"
              >
                Pantau Kunjungan Realtime ↗
              </a>
            </div>
          </div>

          <div className="admin-panel">
            <h2>Konfigurasi &amp; Event Telemetri Terpasang</h2>
            <p className="hint">
              Event-event berikut dikirimkan otomatis oleh antarmuka situs ke Google Analytics untuk mengukur minat pengunjung:
            </p>

            <div className="ga-events-grid">
              <div className="ga-event-item">
                <code>Measurement ID: {GA_TRACKING_ID}</code>
                <p>Properti Google Analytics 4 aktif yang disematkan di root layout situs publik.</p>
              </div>
              <div className="ga-event-item">
                <code>page_view</code>
                <p>Merekam setiap pengunjung yang membuka halaman muka, navigasi modul, dan portal admin.</p>
              </div>
              <div className="ga-event-item">
                <code>demo_request_submitted</code>
                <p>Merekam konversi berhasil saat pengunjung men-submit formulir permintaan demo.</p>
              </div>
              <div className="ga-event-item">
                <code>whatsapp_lead_outbound</code>
                <p>Merekam pengunjung yang melanjutkan obrolan langsung ke WhatsApp sales resmi.</p>
              </div>
            </div>

            <div style={{ marginTop: 24, padding: 18, background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-faint)' }}>
              <h4 style={{ fontFamily: 'var(--sans)', fontSize: 14, marginBottom: 6, color: 'var(--ink)' }}>
                Panduan Memeriksa Pengunjung di Google Analytics:
              </h4>
              <ol style={{ fontFamily: 'var(--body)', fontSize: 13, color: 'var(--ink-mute)', lineHeight: 1.7, paddingLeft: 20 }}>
                <li>Buka <strong>Konsol GA4</strong> melalui tautan di atas dan login menggunakan akun Google terdaftar.</li>
                <li>Pilih menu <strong>Laporan (Reports) &rarr; Waktu Nyata (Realtime)</strong> untuk melihat pengunjung yang sedang aktif dalam 30 menit terakhir beserta asal kota/negaranya.</li>
                <li>Pilih menu <strong>Akuisisi (Acquisition) &rarr; Akuisisi Pengguna</strong> untuk menganalisis dari mana pengunjung datang (apakah dari Instagram Ads, TikTok, pencarian Google, atau tautan langsung).</li>
                <li>Cocokkan lonjakan trafik pengunjung dengan data pengajuan form yang masuk di tab <strong>Permintaan Demo</strong>.</li>
              </ol>
            </div>
          </div>
        </section>
      ) : null}

      {/* TAB 3: MANAJEMEN MITRA GYM */}
      {activeTab === 'partners' ? (
        <section aria-label="Manajemen Mitra Gym">
          <div className="admin-panel">
            <h2>Terbitkan Logo Mitra Baru</h2>
            <p className="hint">
              Logo yang diterbitkan langsung tampil di seksi &ldquo;Mitra Gym&rdquo; pada halaman publik situs. Format berkas: PNG, JPG, atau WebP (maksimal 5 MB).
            </p>

            <form className="admin-form" onSubmit={onUpload} noValidate>
              <div>
                <label className="form-label" htmlFor="partner-name">
                  Nama Gym Mitra
                </label>
                <input
                  id="partner-name"
                  className="form-input"
                  type="text"
                  value={name}
                  maxLength={120}
                  placeholder="Contoh: FitDay Studio"
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
                  Berkas Logo Gambar
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

              <button className="btn btn-primary" type="submit" disabled={uploading} style={{ minHeight: 44 }}>
                {uploading ? 'Mengunggah…' : 'Terbitkan Logo'}
              </button>
            </form>
          </div>

          <div className="admin-panel">
            <h2>Mitra Gym Terdaftar ({partners.length})</h2>
            <p className="hint">Daftar logo gym aktif yang sedang dipublikasikan di halaman utama.</p>

            {partners.length > 0 ? (
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th scope="col">Pratinjau Logo</th>
                      <th scope="col">Nama Gym</th>
                      <th scope="col">Status</th>
                      <th scope="col">Tanggal Terbit</th>
                      <th scope="col" style={{ textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map((partner) => (
                      <tr key={partner.id}>
                        <td className="logo-cell">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={partner.logo_path} alt={`Logo ${partner.name}`} />
                        </td>
                        <td className="strong">{partner.name}</td>
                        <td>
                          <span className={partner.is_active ? 'badge is-active' : 'badge'}>
                            {partner.is_active ? 'Aktif Tayang' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="mono">{formatDate(partner.created_at)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-ghost btn-sm btn-danger"
                            type="button"
                            disabled={busyId === partner.id}
                            onClick={() => onDelete(partner.id, partner.name)}
                          >
                            {busyId === partner.id ? 'Menghapus…' : 'Hapus Mitra'}
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
          </div>
        </section>
      ) : null}
    </main>
  );
}
