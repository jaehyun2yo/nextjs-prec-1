/**
 * 문의하기 폼 테스트 스크립트
 * Node.js 환경에서 실행하여 폼 데이터 구조를 검증합니다.
 */

// 테스트 데이터 생성
function createTestFormData(scenario = 'basic') {
  const formData = new Map();
  
  if (scenario === 'company') {
    // 업체 문의 테스트 데이터
    formData.set('contact_type', 'company');
    formData.set('company_name', '테스트 회사');
    formData.set('name', '홍길동');
    formData.set('position', '대표');
    formData.set('phone', '010-1234-5678');
    formData.set('email', 'test@example.com');
    formData.set('service_mold_request', '0');
    formData.set('service_delivery_brokerage', '0');
    
    // 도면 및 샘플
    formData.set('drawing_type', 'create');
    formData.set('has_physical_sample', '0');
    formData.set('has_reference_photos', '0');
    formData.set('drawing_modification', '');
    formData.set('box_shape', '직사각형');
    formData.set('length', '100');
    formData.set('width', '50');
    formData.set('height', '30');
    formData.set('material', '종이');
    formData.set('drawing_notes', '테스트 유의사항');
    formData.set('sample_notes', '');
    
    // 일정 조율
    formData.set('receipt_method', 'visit');
    formData.set('visit_date', '2024-12-20');
    formData.set('visit_time_slot', '14:00-15:00');
    formData.set('delivery_type', '');
    formData.set('delivery_address', '');
    formData.set('delivery_name', '');
    formData.set('delivery_phone', '');
  } else if (scenario === 'individual') {
    // 개인 문의 테스트 데이터
    formData.set('contact_type', 'individual');
    formData.set('company_name', '김개인');
    formData.set('name', '김개인');
    formData.set('position', '개인');
    formData.set('phone', '010-9876-5432');
    formData.set('email', 'individual@example.com');
    formData.set('service_mold_request', '1');
    formData.set('service_delivery_brokerage', '1');
    
    // 도면 및 샘플
    formData.set('drawing_type', 'have');
    formData.set('has_physical_sample', '0');
    formData.set('has_reference_photos', '0');
    formData.set('drawing_modification', 'needed');
    formData.set('box_shape', '');
    formData.set('length', '');
    formData.set('width', '');
    formData.set('height', '');
    formData.set('material', '');
    formData.set('drawing_notes', '');
    formData.set('sample_notes', '');
    
    // 일정 조율
    formData.set('receipt_method', 'delivery');
    formData.set('visit_date', '');
    formData.set('visit_time_slot', '');
    formData.set('delivery_type', 'parcel');
    formData.set('delivery_address', '서울시 강남구 테스트동 123');
    formData.set('delivery_name', '김개인');
    formData.set('delivery_phone', '010-9876-5432');
  }
  
  return formData;
}

// 필수 필드 검증 함수
function validateRequiredFields(formData) {
  const errors = [];
  
  // 기본 필수 필드
  if (!formData.get('company_name')) errors.push('company_name is required');
  if (!formData.get('phone')) errors.push('phone is required');
  if (!formData.get('email')) errors.push('email is required');
  
  // 업체일 때 추가 필수 필드
  if (formData.get('contact_type') === 'company') {
    if (!formData.get('name')) errors.push('name is required for company');
    if (!formData.get('position')) errors.push('position is required for company');
  }
  
  // 이메일 형식 검증
  const email = formData.get('email');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.push('Invalid email format');
  }
  
  return errors;
}

// 데이터 구조 검증
function validateDataStructure(formData) {
  console.log('\n=== 데이터 구조 검증 ===');
  console.log('Contact Type:', formData.get('contact_type'));
  console.log('Company Name:', formData.get('company_name'));
  console.log('Name:', formData.get('name'));
  console.log('Position:', formData.get('position'));
  console.log('Phone:', formData.get('phone'));
  console.log('Email:', formData.get('email'));
  console.log('Service Mold Request:', formData.get('service_mold_request'));
  console.log('Service Delivery Brokerage:', formData.get('service_delivery_brokerage'));
  console.log('Drawing Type:', formData.get('drawing_type'));
  console.log('Receipt Method:', formData.get('receipt_method'));
  
  const errors = validateRequiredFields(formData);
  if (errors.length > 0) {
    console.error('\n❌ 검증 실패:');
    errors.forEach(error => console.error('  -', error));
    return false;
  } else {
    console.log('\n✅ 모든 필수 필드 검증 통과');
    return true;
  }
}

// Supabase Insert 데이터 구조 생성
function createInsertData(formData) {
  const contact_type = formData.get('contact_type') || 'company';
  const service_mold_request = formData.get('service_mold_request') === '1';
  const service_delivery_brokerage = formData.get('service_delivery_brokerage') === '1';
  
  const insertData = {
    company_name: formData.get('company_name'),
    name: formData.get('name'),
    position: formData.get('position'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    contact_type: contact_type || null,
    service_mold_request: service_mold_request || false,
    service_delivery_brokerage: service_delivery_brokerage || false,
    drawing_type: formData.get('drawing_type') || null,
    has_physical_sample: formData.get('has_physical_sample') === '1',
    has_reference_photos: formData.get('has_reference_photos') === '1',
    drawing_modification: formData.get('drawing_modification') || null,
    box_shape: formData.get('box_shape') || null,
    length: formData.get('length') || null,
    width: formData.get('width') || null,
    height: formData.get('height') || null,
    material: formData.get('material') || null,
    drawing_notes: formData.get('drawing_notes') || null,
    sample_notes: formData.get('sample_notes') || null,
    receipt_method: formData.get('receipt_method') || null,
    visit_date: formData.get('visit_date') || null,
    visit_time_slot: formData.get('visit_time_slot') || null,
    delivery_type: formData.get('delivery_type') || null,
    delivery_address: formData.get('delivery_address') || null,
    delivery_name: formData.get('delivery_name') || null,
    delivery_phone: formData.get('delivery_phone') || null,
    status: 'new',
  };
  
  return insertData;
}

// 테스트 실행
console.log('=== 문의하기 폼 테스트 시작 ===\n');

// 시나리오 1: 업체 문의
console.log('📋 시나리오 1: 업체 문의');
const companyFormData = createTestFormData('company');
const companyValid = validateDataStructure(companyFormData);
if (companyValid) {
  const insertData = createInsertData(companyFormData);
  console.log('\n📤 Supabase Insert 데이터:');
  console.log(JSON.stringify(insertData, null, 2));
}

console.log('\n' + '='.repeat(50) + '\n');

// 시나리오 2: 개인 문의
console.log('📋 시나리오 2: 개인 문의');
const individualFormData = createTestFormData('individual');
const individualValid = validateDataStructure(individualFormData);
if (individualValid) {
  const insertData = createInsertData(individualFormData);
  console.log('\n📤 Supabase Insert 데이터:');
  console.log(JSON.stringify(insertData, null, 2));
}

console.log('\n=== 테스트 완료 ===');

