export default function AboutPage() {
  return (
    <div className="w-full py-8 px-4 md:px-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">회사소개</h1>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          회사소개 내용이 여기에 표시됩니다.
        </p>
      </div>
    </div>
  );
}