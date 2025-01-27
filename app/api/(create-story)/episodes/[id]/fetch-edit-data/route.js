import { NextResponse } from 'next/server';
import { db } from '@/utils';
import { EPISODES, SLIDES, SLIDE_CONTENT, CHAT_MESSAGES, CHARACTERS } from '@/utils/schema';
import { authenticate } from '@/lib/jwtMiddleware';
import { eq, and, gte, lt } from 'drizzle-orm';

export async function GET(request, { params }) {
  const { id:episodeId } = params; // Extract `storyId` from the route parameters
  
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {

    // Fetch episode details
    const episode = await db
      .select()
      .from(EPISODES)
      .where(eq(EPISODES.id, episodeId))

    if (!episode.length) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      );
    }

    console.log("log 1");
    

    // Fetch slides with their content
    const slides = await db
      .select()
      .from(SLIDES)
      .where(eq(SLIDES.episode_id, episodeId))
      .orderBy(SLIDES.position);
      console.log("log 2");

    // Process each slide to include its specific content
    const processedSlides = await Promise.all(slides.map(async (slide) => {
        console.log("log 3");

      if (slide.slide_type === 'image') {
        const content = await db
          .select()
          .from(SLIDE_CONTENT)
          .where(eq(SLIDE_CONTENT.slide_id, slide.id))
          .limit(1);
          console.log("log 4");

        return {
          id: slide.id,
          type: 'image',
          position: slide.position,
          content: {
            media: content[0]?.media_url ? { preview: content[0].media_url } : null,
            description: content[0]?.description || ''
          }
        };
      } else if (slide.slide_type === 'chat') {
        // Fetch chat messages and characters for this slide based on story_id and episode_id
        const messages = await db
          .select({
            message: CHAT_MESSAGES.message,
            sequence: CHAT_MESSAGES.sequence,
            characterId: CHARACTERS.id,
            characterName: CHARACTERS.name,
            isSender: CHARACTERS.is_sender
          })
          .from(CHAT_MESSAGES)
          .leftJoin(CHARACTERS, eq(CHAT_MESSAGES.character_id, CHARACTERS.id))
          .where(
            and(
              eq(CHAT_MESSAGES.story_id, slide.story_id),
              eq(CHAT_MESSAGES.episode_id, episodeId),
              // If you need to match specific messages to specific slides,
              // you might want to add sequence ranges or other identifiers
              // based on the slide position
              gte(CHAT_MESSAGES.sequence, slide.position * 100),
              lt(CHAT_MESSAGES.sequence, (slide.position + 1) * 100)
            )
          )
          .orderBy(CHAT_MESSAGES.sequence);
      
        // Get unique characters
        const characters = [...new Map(messages.map(m => 
          [m.characterId, { name: m.characterName, isSender: m.isSender }]
        )).values()];
      
        return {
          id: slide.id,
          type: 'chat',
          position: slide.position,
          content: {
            characters,
            inputType: 'manual',
            storyLines: messages.map(m => ({
              character: m.characterName,
              line: m.message
            }))
          }
        };
      }
    }));

    return NextResponse.json({
      id: episode[0].id,
      name: episode[0].name,
      synopsis: episode[0].synopsis,
      slides: processedSlides
    });

  } catch (error) {
    console.error('Error fetching episode details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch episode details' },
      { status: 500 }
    );
  }
}