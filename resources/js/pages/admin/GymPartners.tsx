import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type GymPartner = {
  id: number;
  name: string;
  logo_url: string;
  is_active: boolean;
  created_at: string;
};

export default function GymPartners({ partners }: { partners: GymPartner[] }) {
  const form = useForm<{ name: string; logo: File | null }>({
    name: '',
    logo: null,
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    form.post('/admin/gym-partners', {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => form.reset(),
    });
  };

  const remove = (partner: GymPartner) => {
    if (window.confirm(`Hapus ${partner.name} dari daftar mitra?`)) {
      router.delete(`/admin/gym-partners/${partner.id}`, { preserveScroll: true });
    }
  };

  return (
    <>
      <Head title="Kelola Mitra Gym" />
      <main className="min-h-screen bg-[#090512] text-white">
        <header className="border-b border-white/10 bg-[#120b1c]/85 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
            <a href="/" className="flex items-center gap-3">
              <img src="/images/logo.png" alt="PT Solusi Mitra Mandiri" className="h-16 w-auto object-contain" />
              <span className="hidden md:block text-xs uppercase tracking-[0.25em] text-violet-300">Admin Dashboard</span>
            </a>
            <div className="flex items-center gap-3">
              <a href="/" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/10 transition-colors">Lihat Landing</a>
              <button type="button" onClick={() => router.post('/admin/logout')} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500 transition-colors">Logout</button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-5 py-10 grid lg:grid-cols-[380px_1fr] gap-8">
          <section className="h-fit rounded-2xl border border-violet-400/20 bg-[#120b1c] p-6 shadow-[0_0_40px_rgba(139,92,246,0.12)]">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-violet-300 mb-3">Partner Management</p>
            <h1 className="text-2xl font-bold mb-2">Tambah Mitra Gym</h1>
            <p className="text-sm text-slate-400 mb-7">Logo yang disimpan akan langsung tampil di section Mitra Gym pada landing page.</p>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-violet-100 mb-2">Nama Gym</label>
                <input
                  type="text"
                  value={form.data.name}
                  onChange={(event) => form.setData('name', event.target.value)}
                  placeholder="Contoh: Power Gym Jakarta"
                  className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
                  required
                />
                {form.errors.name && <p className="mt-2 text-xs text-red-400">{form.errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-violet-100 mb-2">Logo Gym</label>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  onChange={(event) => form.setData('logo', event.target.files?.[0] ?? null)}
                  className="block w-full rounded-xl border border-dashed border-violet-400/30 bg-black/20 p-3 text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-violet-500/20 file:px-3 file:py-2 file:text-violet-100"
                  required
                />
                <p className="mt-2 text-xs text-slate-500">PNG, JPG, atau WebP. Maksimal 2 MB.</p>
                {form.errors.logo && <p className="mt-2 text-xs text-red-400">{form.errors.logo}</p>}
              </div>
              <button type="submit" disabled={form.processing} className="w-full rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500 disabled:opacity-60 transition-colors">
                {form.processing ? 'Mengunggah...' : 'Simpan Mitra'}
              </button>
            </form>
          </section>

          <section>
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.25em] text-violet-300 mb-2">Registered Partners</p>
                <h2 className="text-3xl font-bold">Daftar Mitra Gym</h2>
              </div>
              <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-200">{partners.length} Mitra</span>
            </div>

            {partners.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {partners.map((partner) => (
                  <article key={partner.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 hover:border-violet-400/30 transition-colors">
                    <div className="h-32 rounded-xl bg-white p-4 flex items-center justify-center mb-4">
                      <img src={partner.logo_url} alt={`Logo ${partner.name}`} className="max-h-full max-w-full object-contain" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{partner.name}</h3>
                    <p className="text-xs text-slate-500 mb-4">Ditambahkan {new Date(partner.created_at).toLocaleDateString('id-ID')}</p>
                    <button type="button" onClick={() => remove(partner)} className="w-full rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-300 hover:bg-red-500/20 transition-colors">Hapus</button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-violet-400/25 bg-violet-500/[0.05] py-16 text-center text-slate-400">Belum ada mitra gym.</div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
