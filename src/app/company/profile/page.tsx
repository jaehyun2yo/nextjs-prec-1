import { getSessionUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CompanyProfileForm } from "./CompanyProfileForm";

interface Company {
  id: number;
  username: string;
  company_name: string;
  business_registration_number: string;
  representative_name: string;
  business_type: string | null;
  business_category: string | null;
  business_address: string;
  business_registration_file_url: string | null;
  business_registration_file_name: string | null;
  manager_name: string;
  manager_position: string;
  manager_phone: string;
  manager_email: string;
  accountant_name: string | null;
  accountant_phone: string | null;
  accountant_email: string | null;
  accountant_fax: string | null;
  quote_method_email: boolean;
  quote_method_fax: boolean;
  quote_method_sms: boolean;
  created_at: string;
  updated_at: string;
}

export default async function CompanyProfilePage() {
  const user = await getSessionUser();
  if (!user?.userId) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  
  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', user.userId)
    .single();

  if (error || !company) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">정보 수정</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          업체 정보를 수정할 수 있습니다.
        </p>
      </div>

      <CompanyProfileForm company={company as Company} />
    </div>
  );
}

