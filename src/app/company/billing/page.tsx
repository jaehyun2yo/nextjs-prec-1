import { getSessionUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BillingList } from "./BillingList";

export default async function BillingPage() {
  const user = await getSessionUser();
  if (!user?.userId) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  
  // 업체 정보 가져오기
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('company_name')
    .eq('id', user.userId)
    .single();

  if (companyError || !company) {
    redirect("/login");
  }

  // 해당 업체의 완료된 문의사항 가져오기 (청구서 발행 가능한 것들)
  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('*')
    .eq('company_name', company.company_name)
    .eq('status', 'completed')
    .neq('status', 'deleting')
    .order('created_at', { ascending: false });

  if (contactsError) {
    console.error('Error fetching contacts:', contactsError);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">청구서 / 전자세금계산서 발행</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          완료된 주문에 대한 청구서 및 전자세금계산서를 발행할 수 있습니다.
        </p>
      </div>

      <BillingList contacts={contacts || []} />
    </div>
  );
}

