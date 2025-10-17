// src/app/(admin)/admin/posts/new/page.tsx

"use client";

import { useState } from "react";
import { EditorState } from "lexical";
import dynamic from "next/dynamic";
import { createPost } from '../_actions';

// Editor 컴포넌트를 동적으로 가져옵니다.
const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  // 1. Lexical의 에디터 상태를 저장합니다.
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  // 로딩 상태를 추가하여 사용자가 중복 클릭하는 것을 방지합니다.
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditorChange = (currentEditorState: EditorState) => {
    setEditorState(currentEditorState);
  };

 async function handleSubmit(e: React.FormEvent) {
   e.preventDefault();

   if (!editorState || isSubmitting) {
     return;
   }

   setIsSubmitting(true);

   const content = JSON.stringify(editorState.toJSON());
   // 서버 액션을 호출하고 그 결과를 result 변수에 저장합니다.
   const result = await createPost(title, content);

   // 만약 서버 액션이 실패해서 에러 객체를 반환했을 경우에만 알림을 띄웁니다.
   if (result && !result.success) {
     alert(result.success || "게시물 생성에 실패했습니다.");
   }

   // 성공 시에는 서버 액션에서 redirect가 모든 것을 처리합니다.
   // 실패했을 경우를 대비해 로딩 상태를 풀어줍니다.
   setIsSubmitting(false);
 }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">새 게시물 작성</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md space-y-6"
      >
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            제목
          </label>
          <input
            type="text"
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            내용
          </label>
          {/* 3. Editor 컴포넌트에 onChange 핸들러를 연결합니다. */}
          <Editor onChange={handleEditorChange} />
        </div>
        <button
          type="submit"
          disabled={isSubmitting} // 이 부분을 추가해주세요!
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? "작성 중..." : "작성하기"}
        </button>
      </form>
    </div>
  );
}
