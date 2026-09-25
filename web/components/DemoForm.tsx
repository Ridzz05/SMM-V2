'use client';

import { useState } from 'react';
import { readApiError } from '@/lib/api';
import { mailtoLink, whatsappLink } from '@/lib/site';

type FormState = {
  company_name: string;
  pic_name: string;
  phone_number: string;
  email: string;
  notes: string;
};

const EMPTY: FormState = {
  company_name: '',
  pic_name: '',
  phone_number: '',
  email: '',
  notes: '',
};

const FIELDS: Array<{
  name: keyof FormState;
  label: string;
  type: string;
  full?: boolean;
  placeholder: string;
}> = [
  { name: 'company_name', label: 'Nama Gym / Perusahaan', type: 'text', placeholder: 'Contoh: FitClub Indonesia' },
  { name: 'pic_name', label: 'Nama Penanggung Jawab', type: 'text', placeholder: 'Contoh: Budi Santoso' },
  { name: 'phone_number', label: 'Nomor WhatsApp', type: 'tel', placeholder: '08xxxxxxxxxx' },
  { name: 'email', label: 'Email Korporat', type: 'email', placeholder: 'nama@perusahaan.com' },
  {
    name: 'notes',
    label: 'Kebutuhan & Jumlah Cabang',
    type: 'textarea',
    full: true,
    placeholder: 'Ceritakan jumlah cabang, jumlah member aktif, dan proses operasional yang paling menyita waktu.',
  },
];

/**
 * Pengajuan sudah tersimpan di server, lalu percakapan dilanjutkan di WhatsApp sales.
 * Isian formulir disalin apa adanya ke badan pesan supaya pengunjung tidak mengetik ulang.
 * Tab baru dipakai agar halaman tetap terbuka; kalau diblokir, tab yang sama yang
 * dipindahkan supaya pengunjung tetap sampai ke WhatsApp.
 */
function forwardToWhatsApp(values: FormState) {
  const url = whatsappLink(
    [
      'Permintaan demo sistem All-In-One: PT Solusi Mitra Mandiri',
      '',
      ...FIELDS.filter((field) => values[field.name].trim() !== '').map(
        (field) => `${field.label}: ${values[field.name]}`,
      ),
    ].join('\n'),
  );

  const tab = window.open(url, '_blank');
  if (!tab) window.location.href = url;
}

export default function DemoForm() {
  const [values, setValues] = useState<FormState>(EMPTY);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (name: keyof FormState, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setFields((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);
    setFields({});

    try {
      const res = await fetch('/api/demo-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        const body: { message?: string } = await res.json();
        setStatus({ kind: 'ok', text: body.message ?? 'Permintaan demo berhasil dikirim.' });
        forwardToWhatsApp(values);
        setValues(EMPTY);
        return;
      }

      const { message, fields: fieldErrors } = await readApiError(res);
      setFields(fieldErrors);
      setStatus({ kind: 'error', text: message });
    } catch {
      setStatus({
        kind: 'error',
        text: 'Tidak dapat menghubungi server. Periksa koneksi Anda lalu coba lagi.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form className="cta-form" onSubmit={onSubmit} noValidate>
        {FIELDS.map((field) => {
          const error = fields[field.name];
          const inputId = `demo-${field.name}`;
          const shared = {
            id: inputId,
            name: field.name,
            value: values[field.name],
            placeholder: field.placeholder,
            'aria-invalid': error ? true : undefined,
            'aria-describedby': error ? `${inputId}-error` : undefined,
            onChange: (
              event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            ) => update(field.name, event.target.value),
          };

          return (
            <div className={field.full ? 'form-group full' : 'form-group'} key={field.name}>
              <label className="form-label" htmlFor={inputId}>
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea className="form-textarea" rows={4} {...shared} />
              ) : (
                <input className="form-input" type={field.type} {...shared} />
              )}
              {error ? (
                <span className="field-error" id={`${inputId}-error`}>
                  {error}
                </span>
              ) : null}
            </div>
          );
        })}

        <div className="form-group full" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Mengirim…' : 'Kirim & Buka WhatsApp'}
            <span className="arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </button>
          <a
            className="btn btn-ghost"
            href={mailtoLink('Permintaan demo sistem All-In-One: PT Solusi Mitra Mandiri')}
          >
            Konsultasi via Email
          </a>
        </div>
      </form>

      {status ? (
        <div className={status.kind === 'ok' ? 'form-status is-ok' : 'form-status is-error'} role="status">
          <span aria-hidden="true">{status.kind === 'ok' ? '✓' : '!'}</span>
          <span>{status.text}</span>
        </div>
      ) : null}
    </>
  );
}
