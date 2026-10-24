'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Pager from '@/components/Pager';
import ThemeToggle from '@/components/ThemeToggle';
import { gsap, useGSAP } from '@/lib/motion';
import { usePagination } from '@/lib/use-pagination';
import { readApiError, type AdminIdentity, type AdminPartnersData, type DemoRequest } from '@/lib/api';

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-TF3KE3G9D2K';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Belum dihubungi',
  contacted: 'Sudah dihubungi',
  scheduled: 'Demo terjadwal',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const STATUS_FILTERS = ['all', 'pending', 'contacted', 'scheduled', 'completed', 'cancelled'] as const;

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
  const text = `Halo Bapak/Ibu ${picName}, terima kasih sudah menghubungi PT Solusi Mitra Mandiri soal permintaan demo sistem manajemen gym untuk ${company}. Kapan waktu yang nyaman untuk sesi demonstrasi 30 menit lewat Google Meet atau Zoom?`;
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

type Tab = 'leads' | 'analytics' | 'partners';

export default function AdminPortalDashboard() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const inkRef = useRef<HTMLSpanElement>(null);

  const [admin, setAdmin] = useState<AdminIdentity | null>(null);
  const [data, setData] = useState<AdminPartnersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [activeTab, setActiveTab] = useState<Tab>('leads');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState('');

  const { contextSafe } = useGSAP({ scope: tabsRef });

  const moveInk = contextSafe((tab: Tab) => {
    const container = tabsRef.current;
    const ink = inkRef.current;
    if (!container || !ink) return;
    const button = container.querySelector<HTMLButtonElement>(`[data-tab="${tab}"]`);
    if (!button) return;
    gsap.to(ink, {
      x: button.offsetLeft,
      width: button.offsetWidth,
      duration: 0.42,
      ease: 'power3.out',
    });
  });

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/partners', { cache: 'no-store' });
    if (res.status === 401) {
      router.replace('/admin/login');
      return;
    }
    if (!res.ok) {
      const { message } = await readApiError(res);
      setLoadError(message);
      setLoading(false);
      return;
    }
    setData(await res.json());
    setLoadError(null);
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

  // Indikator tab harus menempel pada tombol aktif, termasuk setelah resize dan
  // saat font selesai dimuat (lebar tombol berubah beberapa piksel).
  useEffect(() => {
    moveInk(activeTab);
    const onResize = () => moveInk(activeTab);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeTab, moveInk, loading]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function onUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = fileRef.current;
    const file = input?.files?.[0];

    setToast(null);
    setFieldErrors({});

    if (!name.trim()) {
      setFieldErrors({ name: 'Isi dulu nama gym mitra.' });
      return;
    }
    if (!file) {
      setFieldErrors({ logo: 'Pilih dulu berkas logo yang mau diunggah.' });
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setFieldErrors({ logo: 'Logo terlalu besar. Maksimal 5 MB.' });
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
        setToast({ kind: 'error', text: message });
        return;
      }

      const payload: { message?: string } = await res.json();
      setToast({ kind: 'ok', text: payload.message ?? 'Logo mitra sudah tayang di halaman publik.' });
      setName('');
      if (input) input.value = '';
      await load();
    } catch {
      setToast({ kind: 'error', text: 'Unggahan gagal. Periksa koneksi lalu coba lagi.' });
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(id: number, partnerName: string) {
    if (!window.confirm(`Hapus mitra "${partnerName}"? Logo juga ikut terhapus.`)) return;

    setBusyId(id);
    setToast(null);

    try {
      const res = await fetch(`/api/admin/partners/${id}`, { method: 'DELETE' });

      if (res.status === 401) {
        router.replace('/admin/login');
        return;
      }

      if (!res.ok) {
        const { message } = await readApiError(res);
        setToast({ kind: 'error', text: message });
        return;
      }

      const payload: { message?: string } = await res.json();
      setToast({ kind: 'ok', text: payload.message ?? 'Mitra sudah dihapus.' });
      await load();
    } catch {
      setToast({ kind: 'error', text: 'Gagal menghapus mitra. Periksa koneksi lalu coba lagi.' });
    } finally {
      setBusyId(null);
    }
  }

  async function onUpdateDemoRequest(id: number, updates: { status?: string; notes?: string }) {
    setToast(null);
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
        setToast({ kind: 'error', text: message });
        return;
      }

      setToast({ kind: 'ok', text: 'Perubahan tersimpan.' });
      setEditingId(null);
      await load();
    } catch {
      setToast({ kind: 'error', text: 'Gagal menyimpan perubahan. Periksa koneksi lalu coba lagi.' });
    }
  }

  async function onLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  }

  const demoRequests: DemoRequest[] = data?.demoRequests ?? [];
  const partners = data?.partners ?? [];

  const counts = {
    pending: demoRequests.filter((r) => r.status === 'pending').length,
    contacted: demoRequests.filter((r) => r.status === 'contacted').length,
    scheduled: demoRequests.filter((r) => r.status === 'scheduled').length,
    completed: demoRequests.filter((r) => r.status === 'completed').length,
  };

  const filteredRequests = demoRequests.filter((req) => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      req.company_name.toLowerCase().includes(q) ||
      req.pic_name.toLowerCase().includes(q) ||
      req.email.toLowerCase().includes(q) ||
      req.phone_number.includes(q) ||
      (req.notes ?? '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const leadsPage = usePagination(filteredRequests, 8);
  const partnersPage = usePagination(partners, 8);

  return (
    <>
      <header className="admin-bar">
        <div className="wrap">
          <div className="admin-bar-inner">
            <a className="brand" href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/brand/logo-mark-96.webp" width={82} height={96} alt="" />
              <span className="brand-text">
                <strong>Solusi Mitra Mandiri</strong>
                <span>Portal admin</span>
              </span>
            </a>

            <div className="nav-actions">
              <span className="admin-who">{admin?.email ?? ''}</span>
              <ThemeToggle />
              <a className="link-quiet" href="/" target="_blank" rel="noopener noreferrer">
                Situs publik
              </a>
              <button className="btn btn-quiet btn-sm" type="button" onClick={onLogout}>
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="wrap admin-main" id="main">
        <div className="admin-title">
          <div>
            <p className="eyebrow">Portal admin</p>
            <h1>Dasbor operasional</h1>
            <p>Permintaan demo, pengunjung situs, dan logo mitra dalam satu layar.</p>
          </div>
        </div>

        <div className="tabs" role="tablist" ref={tabsRef}>
          <button
            type="button"
            role="tab"
            data-tab="leads"
            aria-selected={activeTab === 'leads'}
            className="tab"
            onClick={() => setActiveTab('leads')}
          >
            Permintaan demo
            <span className="tab-count">{demoRequests.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            data-tab="analytics"
            aria-selected={activeTab === 'analytics'}
            className="tab"
            onClick={() => setActiveTab('analytics')}
          >
            Pengunjung situs
          </button>
          <button
            type="button"
            role="tab"
            data-tab="partners"
            aria-selected={activeTab === 'partners'}
            className="tab"
            onClick={() => setActiveTab('partners')}
          >
            Mitra gym
            <span className="tab-count">{partners.length}</span>
          </button>
          <span className="tab-ink" ref={inkRef} aria-hidden="true" />
        </div>

        {loading ? (
          <div className="panel empty" role="status">
            <strong>Memuat data</strong>
            <p>Menghubungi server untuk permintaan demo dan daftar mitra.</p>
          </div>
        ) : loadError ? (
          <div className="panel empty" role="alert">
            <strong>Data gagal dimuat</strong>
            <p>{loadError}</p>
            <button
              className="btn btn-sm"
              type="button"
              onClick={() => {
                setLoading(true);
                void load();
              }}
            >
              Coba lagi
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'leads' ? (
              <section className="panel" aria-label="Permintaan demo">
                <dl className="ledger-strip">
                  <div>
                    <dt>Total</dt>
                    <dd>{demoRequests.length}</dd>
                  </div>
                  <div>
                    <dt>Belum dihubungi</dt>
                    <dd data-tone="attention">{counts.pending}</dd>
                  </div>
                  <div>
                    <dt>Sudah dihubungi</dt>
                    <dd>{counts.contacted}</dd>
                  </div>
                  <div>
                    <dt>Terjadwal</dt>
                    <dd>{counts.scheduled}</dd>
                  </div>
                  <div>
                    <dt>Selesai</dt>
                    <dd>{counts.completed}</dd>
                  </div>
                </dl>

                <div className="toolbar">
                  <input
                    type="search"
                    className="search"
                    placeholder="Cari nama gym, nama orang, email, atau nomor HP"
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      leadsPage.setPage(1);
                    }}
                    aria-label="Cari permintaan demo"
                  />
                  <div className="seg" role="group" aria-label="Filter status">
                    {STATUS_FILTERS.map((status) => (
                      <button
                        key={status}
                        type="button"
                        aria-pressed={statusFilter === status}
                        onClick={() => {
                          setStatusFilter(status);
                          leadsPage.setPage(1);
                        }}
                      >
                        {status === 'all' ? 'Semua' : STATUS_LABEL[status]}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredRequests.length > 0 ? (
                  <>
                    <div className="table-scroll">
                      <table className="data">
                        <thead>
                          <tr>
                            <th scope="col">Gym</th>
                            <th scope="col">Kontak</th>
                            <th scope="col">Status</th>
                            <th scope="col">Catatan</th>
                            <th scope="col">Masuk</th>
                            <th scope="col" style={{ textAlign: 'right' }}>
                              Tindakan
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {leadsPage.rows.map((request) => (
                            <tr key={request.id}>
                              <td>
                                <span className="cell-strong">{request.company_name}</span>
                                <span className="cell-sub">{request.pic_name}</span>
                              </td>
                              <td>
                                <span className="cell-sub">{request.phone_number}</span>
                                <span className="cell-sub">{request.email}</span>
                              </td>
                              <td>
                                <select
                                  className="status-select"
                                  data-status={request.status}
                                  value={request.status}
                                  aria-label={`Ubah status untuk ${request.company_name}`}
                                  onChange={(event) => onUpdateDemoRequest(request.id, { status: event.target.value })}
                                >
                                  {Object.entries(STATUS_LABEL).map(([value, label]) => (
                                    <option key={value} value={value}>
                                      {label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <p className="cell-notes">{request.notes || 'Belum ada catatan.'}</p>
                              </td>
                              <td>
                                <span className="cell-sub">{formatDate(request.created_at)}</span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div className="row-actions">
                                  <a
                                    className="btn btn-quiet btn-sm"
                                    href={getWhatsAppUrl(request.phone_number, request.pic_name, request.company_name)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    WhatsApp
                                  </a>
                                  <a
                                    className="btn btn-quiet btn-sm"
                                    href={`mailto:${request.email}?subject=${encodeURIComponent(
                                      `Permintaan demo sistem manajemen gym (${request.company_name})`,
                                    )}`}
                                  >
                                    Email
                                  </a>
                                  <button
                                    className="btn btn-quiet btn-sm"
                                    type="button"
                                    aria-expanded={editingId === request.id}
                                    onClick={() => {
                                      setEditingId(editingId === request.id ? null : request.id);
                                      setEditingNotes(request.notes ?? '');
                                    }}
                                  >
                                    Catatan
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {editingId !== null && leadsPage.rows.some((r) => r.id === editingId) ? (
                            <tr className="row-notes">
                              <td colSpan={6}>
                                <div className="row-notes-inner">
                                  <label className="field" htmlFor="lead-notes">
                                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>
                                      Catatan tindak lanjut
                                    </span>
                                    <textarea
                                      id="lead-notes"
                                      value={editingNotes}
                                      onChange={(event) => setEditingNotes(event.target.value)}
                                      placeholder="Hasil panggilan, jadwal yang disepakati, atau kendala calon member."
                                    />
                                  </label>
                                  <div className="row-notes-actions">
                                    <button
                                      className="btn btn-sm"
                                      type="button"
                                      onClick={() => onUpdateDemoRequest(editingId, { notes: editingNotes })}
                                    >
                                      Simpan catatan
                                    </button>
                                    <button
                                      className="btn btn-quiet btn-sm"
                                      type="button"
                                      onClick={() => setEditingId(null)}
                                    >
                                      Batal
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>

                    <Pager
                      page={leadsPage.page}
                      pageCount={leadsPage.pageCount}
                      range={leadsPage.range}
                      total={leadsPage.total}
                      unit="permintaan"
                      onPage={leadsPage.setPage}
                    />
                  </>
                ) : (
                  <div className="empty">
                    <strong>
                      {searchQuery || statusFilter !== 'all' ? 'Tidak ada yang cocok' : 'Belum ada permintaan demo'}
                    </strong>
                    <p>
                      {searchQuery || statusFilter !== 'all'
                        ? 'Ubah kata kunci atau pilih status lain untuk melihat permintaan yang tersimpan.'
                        : 'Setiap formulir yang dikirim dari halaman publik akan muncul di sini.'}
                    </p>
                    {searchQuery || statusFilter !== 'all' ? (
                      <button
                        className="btn btn-sm"
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('all');
                        }}
                      >
                        Hapus filter
                      </button>
                    ) : null}
                  </div>
                )}
              </section>
            ) : null}

            {activeTab === 'analytics' ? (
              <section className="panel" aria-label="Pengunjung situs">
                <div className="admin-card">
                  <div className="ga-head">
                    <div>
                      <h2>Google Analytics</h2>
                      <p className="hint">
                        Situs ini mengirim data kunjungan ke properti Google Analytics berikut. Angka
                        pengunjung tidak disalin ke dasbor ini karena API pelaporan butuh kredensial
                        terpisah; tautan di bawah membuka laporan aslinya.
                      </p>
                    </div>
                    <span className="ga-live">Laporan asli</span>
                  </div>

                  <div className="form-foot">
                    <a
                      className="btn btn-sm"
                      href="https://analytics.google.com/analytics/web/#/realtime"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Buka laporan waktu nyata
                    </a>
                    <a
                      className="btn btn-quiet btn-sm"
                      href="https://analytics.google.com/analytics/web/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Semua laporan
                    </a>
                  </div>

                  <div className="ga-events">
                    <div className="ga-event">
                      <code>Measurement ID: {GA_TRACKING_ID}</code>
                      <p>Pengenal properti yang dipasang di semua halaman, termasuk portal admin.</p>
                    </div>
                    <div className="ga-event">
                      <code>page_view</code>
                      <p>Setiap halaman dibuka, beserta kota dan sumber kunjungannya.</p>
                    </div>
                    <div className="ga-event">
                      <code>demo_request_submitted</code>
                      <p>Terkirim saat formulir permintaan demo berhasil disimpan server.</p>
                    </div>
                    <div className="ga-event">
                      <code>whatsapp_lead_outbound</code>
                      <p>Terkirim saat pengunjung memilih langsung menghubungi lewat WhatsApp.</p>
                    </div>
                  </div>

                  <ol className="ga-steps">
                    <li>Buka laporan waktu nyata untuk melihat siapa yang sedang membuka situs.</li>
                    <li>Buka Akuisisi untuk melihat asal pengunjung: iklan, media sosial, atau pencarian.</li>
                    <li>Bandingkan kenaikan pengunjung dengan jumlah permintaan di tab permintaan demo.</li>
                  </ol>
                </div>
              </section>
            ) : null}

            {activeTab === 'partners' ? (
              <section className="panel" aria-label="Mitra gym">
                <div className="admin-card">
                  <h2>Tambah logo mitra</h2>
                  <p className="hint">
                    Logo langsung tampil di bagian mitra pada halaman publik. Berkas PNG, JPG, atau WebP,
                    maksimal 5 MB.
                  </p>

                  <form onSubmit={onUpload} noValidate>
                    <div className="upload-row">
                      <div className="field">
                        <label htmlFor="partner-name">Nama gym</label>
                        <input
                          id="partner-name"
                          className="input"
                          type="text"
                          value={name}
                          maxLength={120}
                          placeholder="Nama gym atau studio"
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

                      <div className="field">
                        <label htmlFor="partner-logo">Berkas logo</label>
                        <input
                          id="partner-logo"
                          ref={fileRef}
                          className="file"
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

                      <button className="btn" type="submit" disabled={uploading}>
                        {uploading ? 'Mengunggah…' : 'Unggah logo'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="admin-card">
                  <h2>Mitra terdaftar</h2>
                  <p className="hint">Logo yang saat ini tampil di halaman utama situs.</p>

                  {partners.length > 0 ? (
                    <>
                      <div className="table-scroll" style={{ marginTop: 16 }}>
                        <table className="data">
                          <thead>
                            <tr>
                              <th scope="col">Logo</th>
                              <th scope="col">Nama gym</th>
                              <th scope="col">Status</th>
                              <th scope="col">Diunggah</th>
                              <th scope="col" style={{ textAlign: 'right' }}>
                                Tindakan
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {partnersPage.rows.map((partner) => (
                              <tr key={partner.id}>
                                <td>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img className="partner-thumb" src={partner.logo_path} alt={`Logo ${partner.name}`} />
                                </td>
                                <td className="cell-strong">{partner.name}</td>
                                <td>
                                  <span className="chip" data-status={partner.is_active ? 'completed' : 'cancelled'}>
                                    {partner.is_active ? 'Tampil' : 'Disembunyikan'}
                                  </span>
                                </td>
                                <td>
                                  <span className="cell-sub">{formatDate(partner.created_at)}</span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <button
                                    className="btn btn-quiet btn-sm"
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

                      <Pager
                        page={partnersPage.page}
                        pageCount={partnersPage.pageCount}
                        range={partnersPage.range}
                        total={partnersPage.total}
                        unit="mitra"
                        onPage={partnersPage.setPage}
                      />
                    </>
                  ) : (
                    <div className="empty" style={{ marginTop: 16 }}>
                      <strong>Belum ada mitra</strong>
                      <p>Unggah logo pertama lewat formulir di atas, dan logo itu langsung tampil di situs.</p>
                    </div>
                  )}
                </div>
              </section>
            ) : null}
          </>
        )}
      </main>

      {toast ? (
        <div className="toast" data-kind={toast.kind} role="status">
          <span>{toast.text}</span>
          <button type="button" onClick={() => setToast(null)} aria-label="Tutup notifikasi">
            ×
          </button>
        </div>
      ) : null}
    </>
  );
}
