import { NextResponse } from 'next/server';
import { SLIDE_CONTENT, QUIZZES, QUIZ_OPTIONS } from '@/utils/schema';
import { db } from '@/utils';
import { eq, and } from 'drizzle-orm';

export async function GET(request, { params }) {
  const { slideId } = params;

  try {
    // Get slide content with quiz reference
    const slideContent = await db
      .select({
        media_type: SLIDE_CONTENT.media_type,
        media_url: SLIDE_CONTENT.media_url,
        quiz_id: SLIDE_CONTENT.quiz_id,
        audio_url: SLIDE_CONTENT.audio_url,
      })
      .from(SLIDE_CONTENT)
      .where(eq(SLIDE_CONTENT.slide_id, slideId));

    if (!slideContent || slideContent.length === 0) {
      return NextResponse.json(
        { error: 'Slide content not found' },
        { status: 404 }
      );
    }

    // Get quiz details
    const quiz = await db
      .select({
        id: QUIZZES.id,
        question: QUIZZES.question,
        answer_type: QUIZZES.answer_type,
        correct_answer: QUIZZES.correct_answer
      })
      .from(QUIZZES)
      .where(eq(QUIZZES.id, slideContent[0].quiz_id));

    if (!quiz || quiz.length === 0) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Get quiz options if multiple choice
    let options = [];
    if (quiz[0].answer_type === 'multiple_choice') {
      options = await db
        .select({
          id: QUIZ_OPTIONS.id,
          option_text: QUIZ_OPTIONS.option_text,
          is_correct: QUIZ_OPTIONS.is_correct
        })
        .from(QUIZ_OPTIONS)
        .where(eq(QUIZ_OPTIONS.quiz_id, quiz[0].id));
    }

    return NextResponse.json({
      ...slideContent[0],
      quiz: {
        ...quiz[0],
        options
      }
    });
  } catch (error) {
    console.error('Quiz Content Fetch Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz content' },
      { status: 500 }
    );
  }
}