import { NextResponse } from 'next/server';
import { db } from '@/utils';
import { SLIDES, SLIDE_CONTENT, CHAT_MESSAGES } from '@/utils/schema';
import { authenticate } from '@/lib/jwtMiddleware';
import { eq } from 'drizzle-orm';

export async function DELETE(request, { params }) {
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const slideId = parseInt(params.slideId);

    await db.transaction(async (trx) => {
      // Delete chat messages if they exist
      await trx
        .delete(CHAT_MESSAGES)
        .where(eq(CHAT_MESSAGES.slide_id, slideId));

      // Delete slide content
      await trx
        .delete(SLIDE_CONTENT)
        .where(eq(SLIDE_CONTENT.slide_id, slideId));

      // Delete the slide itself
      await trx
        .delete(SLIDES)
        .where(eq(SLIDES.id, slideId));
    });

    return NextResponse.json({ 
      message: 'Slide deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting slide:', error);
    return NextResponse.json(
      { error: 'Failed to delete slide' },
      { status: 500 }
    );
  }
}
