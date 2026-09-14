export type Founder = {
  id: number;
  name: string;
  role: string;
  image_path: string;
  description: string;
};

export type GymPartner = {
  id: number;
  name: string;
  logo_path: string;
  is_active: boolean;
  created_at: string;
};

export type DemoRequest = {
  id: number;
  company_name: string;
  pic_name: string;
  phone_number: string;
  email: string;
  notes: string;
  status: string;
  created_at: string;
};

export type AdminIdentity = {
  id: number;
  name: string;
  email: string;
};

export type LandingData = {
  founders: Founder[];
  partners: GymPartner[];
};

export type AdminPartnersData = {
  partners: GymPartner[];
  demoRequests: DemoRequest[];
};

export type ApiErrorBody = {
  error?: string;
  fields?: Record<string, string>;
};

/** Membaca amplop error JSON dari server Go, dengan fallback pesan umum. */
export async function readApiError(res: Response): Promise<{ message: string; fields: Record<string, string> }> {
  try {
    const body: ApiErrorBody = await res.json();
    return {
      message: body.error ?? 'Terjadi kesalahan yang tidak diketahui.',
      fields: body.fields ?? {},
    };
  } catch {
    return { message: 'Terjadi kesalahan yang tidak diketahui.', fields: {} };
  }
}
