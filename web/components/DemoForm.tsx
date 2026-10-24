'use client';

import { useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/motion';
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
  hint?: string;
  autoComplete?: string;
}> = [
  {
    name: 'company_name',
    label: 'Nama gym atau perusahaan',
    type: 'text',
    placeholder: 'FitClub Indonesia',
    autoComplete: 'organization',
  },
  { name: 'pic_name', label: 'Nama Anda', type: 'text', placeholder: 'Nama lengkap', autoComplete: 'name' },
  {
    name: 'phone_number',
    label: 'Nomor WhatsApp',
    type: 'tel',
    placeholder: '0812xxxxxxx',
    autoComplete: 'tel',
    hint: 'Dipakai untuk mengirim jadwal demo.',
  },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'nama@gym.com', autoComplete: 'email' },
  {
    name: 'notes',
    label: 'Kondisi gym Anda sekarang (opsional)',
    type: 'textarea',
    full: true,
    placeholder: 'Jumlah cabang, jumlah member aktif, dan bagian mana yang masih dicatat manual.',
  },
];

/** Permintaan tersimpan di server lebih dulu, lalu percakapan pindah ke WhatsApp. */
function forwardToWhatsApp(values: FormState) {
  const url = whatsappLink(
    [
      'Halo, saya ingin menjadwalkan demo sistem manajemen gym.',
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
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<FormState>(EMPTY);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { contextSafe } = useGSAP({ scope: formRef });

  // Getar halus pada field yang ditolak server: satu-satunya gerak di form,
  // dan hanya muncul saat ada kesalahan yang perlu ditunjuk.
  const shakeInvalid = contextSafe((names: string[]) => {
    names.forEach((name) => {
      const el = formRef.current?.querySelector<HTMLElement>(`#demo-${name}`);
      if (!el) return;
      gsap.fromTo(
        el,
        { x: -5 },
        { x: 0, duration: 0.42, ease: 'elastic.out(1, 0.32)', clearProps: 'x' },
      );
    });
  });

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
        setStatus({ kind: 'ok', text: body.message ?? 'Permintaan terkirim. Kami hubungi Anda untuk menjadwalkan demo.' });
        forwardToWhatsApp(values);
        setValues(EMPTY);
        return;
      }

      const { message, fields: fieldErrors } = await readApiError(res);
      setFields(fieldErrors);
      setStatus({ kind: 'error', text: message });
      const invalid = Object.keys(fieldErrors);
      if (invalid.length > 0) shakeInvalid(invalid);
    } catch {
      setStatus({
        kind: 'error',
        text: 'Koneksi bermasalah. Periksa internet Anda, lalu kirim ulang.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <form ref={formRef} className="form-grid" onSubmit={onSubmit} noValidate>
        {FIELDS.map((field) => {
          const error = fields[field.name];
          const inputId = `demo-${field.name}`;
          const shared = {
            id: inputId,
            name: field.name,
            value: values[field.name],
            placeholder: field.placeholder,
            autoComplete: field.autoComplete,
            'aria-invalid': error ? true : undefined,
            'aria-describedby': error ? `${inputId}-error` : undefined,
            onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              update(field.name, event.target.value),
          };

          return (
            <div className={field.full ? 'field field-full' : 'field'} key={field.name}>
              <label htmlFor={inputId}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea className="textarea" rows={4} {...shared} />
              ) : (
                <input className="input" type={field.type} {...shared} />
              )}
              {field.hint && !error ? <span className="hint-line">{field.hint}</span> : null}
              {error ? (
                <span className="field-error" id={`${inputId}-error`}>
                  {error}
                </span>
              ) : null}
            </div>
          );
        })}

        <div className="field field-full">
          <div className="form-foot">
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? 'Mengirim…' : 'Kirim dan lanjut ke WhatsApp'}
            </button>
            <a className="btn btn-quiet" href={mailtoLink('Pertanyaan soal sistem manajemen gym')}>
              Kirim lewat email
            </a>
          </div>

          {status ? (
            <div className={status.kind === 'ok' ? 'form-status is-ok' : 'form-status is-error'} role="status">
              <span>{status.text}</span>
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
}
