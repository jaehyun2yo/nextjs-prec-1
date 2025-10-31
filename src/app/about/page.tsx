export default function AboutPage() {
  return (
    <div className="w-full py-8 px-4 md:px-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">소개</h1>
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 p-8 rounded-xl shadow-md">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            소개 내용이 여기에 표시됩니다.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            추가 소개 내용을 입력할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}