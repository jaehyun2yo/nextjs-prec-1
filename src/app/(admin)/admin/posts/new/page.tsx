// src/app/(admin)/admin/posts/new/page.tsx

"use client";

import { useState } from "react";
import { EditorState } from "lexical";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createPost } from '../_actions';
import { toast } from 'sonner';

// Editor 컴포넌트를 동적으로 가져옵니다.
const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

// Zod 스키마 정의
const postSchema = z.object({
  title: z.string()
    .min(1, '제목은 필수입니다')
    .max(100, '제목은 100자 이하여야 합니다')
    .refine((val) => val.trim().length > 0, '제목에는 공백만 입력할 수 없습니다'),
  content: z.string()
    .min(1, '내용은 필수입니다'),
});

type PostFormData = z.infer<typeof postSchema>;

export default function NewPostPage() {
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    mode: 'onChange',
  });

  const handleEditorChange = (currentEditorState: EditorState) => {
    setEditorState(currentEditorState);
    
    // 에디터 내용을 폼에 반영
    const content = JSON.stringify(currentEditorState.toJSON());
    setValue('content', content, { shouldValidate: true });
  };

  async function onSubmit(data: PostFormData) {
    if (!editorState || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createPost(data.title, data.content);
      
      if (result && !result.success) {
        toast.error('게시물 생성 실패', {
          description: '다시 시도해주세요.',
        });
      } else {
        toast.success('게시물이 생성되었습니다!');
      }
    } catch (error) {
      toast.error('오류가 발생했습니다', {
        description: '잠시 후 다시 시도해주세요.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">새 게시물 작성</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-lg shadow-md space-y-6"
      >
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            {...register('title')}
            placeholder="게시물 제목을 입력하세요"
            className={`mt-1 block w-full px-3 py-2 border rounded-md ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            내용 <span className="text-red-500">*</span>
          </label>
          <Editor onChange={handleEditorChange} />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
          )}
        </div>
        
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "작성 중..." : "작성하기"}
          </button>
          
          <button
            type="button"
            onClick={() => window.history.back()}
            className="bg-gray-200 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
