import Image from "next/image";
import Link from 'next/link';

export default function Home() {
   return (
     // 전체를 감싸는 컨테이너
     <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center p-6">
       <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
         혁신을 만드는 기업, My Company
       </h1>
       <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
         우리는 최고의 기술력과 끊임없는 도전으로 고객과 함께 성장합니다. 우리
         회사의 비전을 확인해보세요.
       </p>
     </div>
   );
}
