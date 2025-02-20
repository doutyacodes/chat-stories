import { NextResponse } from 'next/server';
import { db } from '@/utils';
import {
  EPISODES,
  SLIDES,
  SLIDE_CONTENT,
  CHAT_MESSAGES,
  CHARACTERS,
  QUIZZES,
  QUIZ_OPTIONS,
  LOCATION_TASKS,
  PEDOMETER_TASKS,
} from '@/utils/schema';
import { authenticate } from '@/lib/jwtMiddleware';
import { eq, and, gte, lt } from 'drizzle-orm';

export async function GET(request, { params }) {
  const { id: episodeId } = params; // Extract `episodeId` from the route parameters

  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    // Fetch episode details
    const episode = await db
      .select()
      .from(EPISODES)
      .where(eq(EPISODES.id, episodeId));
    if (!episode.length) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    // Fetch slides with their content
    const slides = await db
      .select()
      .from(SLIDES)
      .where(eq(SLIDES.episode_id, episodeId))
      .orderBy(SLIDES.position);

    // Process each slide to include its specific content
    const processedSlides = await Promise.all(
      slides.map(async (slide) => {
        if (slide.slide_type === 'image') {
          const content = await db
            .select()
            .from(SLIDE_CONTENT)
            .where(eq(SLIDE_CONTENT.slide_id, slide.id))
            .limit(1);

          return {
            id: slide.id,
            type: 'image',
            position: slide.position,
            content: {
              media: content[0]?.media_url ? { preview: content[0].media_url, type: content[0].media_type } : null,
              description: content[0]?.description || '',
              audio: content[0]?.audio_url ? { name: content[0].audio_url } : null,
            },
          };
        } else if (slide.slide_type === 'chat') {

          const content = await db
          .select()
          .from(SLIDE_CONTENT)
          .where(eq(SLIDE_CONTENT.slide_id, slide.id))
          .limit(1);

          // Fetch chat messages and characters for this slide
          const messages = await db
            .select({
              id: CHAT_MESSAGES.id,
              message: CHAT_MESSAGES.message,
              sequence: CHAT_MESSAGES.sequence,
              characterId: CHARACTERS.id,
              characterName: CHARACTERS.name,
              isSender: CHARACTERS.is_sender,
            })
            .from(CHAT_MESSAGES)
            .leftJoin(CHARACTERS, eq(CHAT_MESSAGES.character_id, CHARACTERS.id))
            .where(
              and(
                eq(CHAT_MESSAGES.story_id, slide.story_id),
                eq(CHAT_MESSAGES.episode_id, episodeId),
                // gte(CHAT_MESSAGES.sequence, slide.position * 100),
                // lt(CHAT_MESSAGES.sequence, (slide.position + 1) * 100)
              )
            )
            .orderBy(CHAT_MESSAGES.sequence);

          // Get unique characters
          const characters = [...new Map(messages.map((m) => [m.characterId, { name: m.characterName, isSender: m.isSender }])).values()];

          return {
            id: slide.id,
            type: 'chat',
            position: slide.position,
            content: {
              characters,
              inputType: 'manual',
              storyLines: messages.map((m) => ({
                id: m.id,
                character: m.characterName,
                line: m.message,
              })),
              pdfFile: null, // Add support for PDF uploads if needed
              audio: content[0]?.audio_url ? { name: content[0].audio_url } : null,
            },
          };
        } else if (slide.slide_type === 'conversation') {

          const content = await db
          .select()
          .from(SLIDE_CONTENT)
          .where(eq(SLIDE_CONTENT.slide_id, slide.id))
          .limit(1);

          const oldFormatMessages = await db
            .select({
              id: CHAT_MESSAGES.id
            })
            .from(CHAT_MESSAGES)
            .where(
              and(
                eq(CHAT_MESSAGES.story_id, slide.story_id),
                eq(CHAT_MESSAGES.episode_id, episodeId),
                eq(CHAT_MESSAGES.slide_id, 0)
              )
            )
            .limit(1);
        
            let messages;

            if (oldFormatMessages.length > 0) {
              // Fetch chat messages and characters for this slide
              messages = await db
              .select({
                id: CHAT_MESSAGES.id,
                message: CHAT_MESSAGES.message,
                sequence: CHAT_MESSAGES.sequence,
                characterId: CHARACTERS.id,
                characterName: CHARACTERS.name,
                isSender: CHARACTERS.is_sender,
              })
              .from(CHAT_MESSAGES)
              .leftJoin(CHARACTERS, eq(CHAT_MESSAGES.character_id, CHARACTERS.id))
              .where(
                and(
                  eq(CHAT_MESSAGES.story_id, slide.story_id),
                  eq(CHAT_MESSAGES.episode_id, episodeId),
                  // gte(CHAT_MESSAGES.sequence, slide.position * 100),
                  // lt(CHAT_MESSAGES.sequence, (slide.position + 1) * 100)
                )
              )
              .orderBy(CHAT_MESSAGES.sequence);
            }  else {   
              // Use the new format with slide_id
              messages = await db
                .select({
                  id: CHAT_MESSAGES.id,
                  message: CHAT_MESSAGES.message,
                  sequence: CHAT_MESSAGES.sequence,
                  characterId: CHARACTERS.id,
                  characterName: CHARACTERS.name,
                  isSender: CHARACTERS.is_sender,
                })
                .from(CHAT_MESSAGES)
                .leftJoin(CHARACTERS, eq(CHAT_MESSAGES.character_id, CHARACTERS.id))
                .where(eq(CHAT_MESSAGES.slide_id, slide.id)) // Removed extra closing parenthesis
                .orderBy(CHAT_MESSAGES.sequence);
            }

          // Get unique characters
          const characters = [...new Map(messages.map((m) => [m.characterId, { name: m.characterName, isSender: m.isSender }])).values()];

          return {
            id: slide.id,
            type: 'conversation',
            position: slide.position,
            content: {
              characters,
              inputType: 'manual',
              storyLines: messages.map((m) => ({
                id: m.id,
                character: m.characterName,
                line: m.message,
              })),
              pdfFile: null, // Add support for PDF uploads if needed
              audio: content[0]?.audio_url ? { name: content[0].audio_url } : null,
              backgroundImage : content[0]?.media_url ? { preview: content[0].media_url } : null,
            },
          };
        } else if (slide.slide_type === 'quiz') {
          // Fetch quiz details
          const quiz = await db
            .select()
            .from(QUIZZES)
            .where(eq(QUIZZES.slide_id, slide.id))
            .limit(1);

          if (!quiz.length) {
            throw new Error('Quiz data not found for slide');
          }

          // Fetch quiz options
          const options = await db
            .select()
            .from(QUIZ_OPTIONS)
            .where(eq(QUIZ_OPTIONS.quiz_id, quiz[0].id));

          const content = await db
            .select()
            .from(SLIDE_CONTENT)
            .where(eq(SLIDE_CONTENT.slide_id, slide.id))
            .limit(1);

          return {
            id: slide.id,
            type: 'quiz',
            position: slide.position,
            content: {
              media: content[0]?.media_url ? { preview: content[0].media_url, type: content[0].media_type } : null,
              // media: content[0]?.media_url ? { preview: content[0].media_url } : null,
              question: quiz[0].question,
              options: options.map((opt) => ({
                text: opt.option_text,
                is_correct: opt.is_correct,
              })),
              audio: content[0]?.audio_url ? { name: content[0].audio_url } : null,
            },
          };
        } else if (slide.slide_type === 'pedometer') {
          const pedometerTask = await db
            .select()
            .from(PEDOMETER_TASKS)
            .where(eq(PEDOMETER_TASKS.slide_id, slide.id))
            .limit(1);

          const content = await db
            .select()
            .from(SLIDE_CONTENT)
            .where(eq(SLIDE_CONTENT.slide_id, slide.id))
            .limit(1);

          return {
            id: slide.id,
            type: 'pedometer',
            position: slide.position,
            content: {
              targetSteps: pedometerTask[0]?.required_steps || 0,
              description: pedometerTask[0]?.description || '',
              audio: content[0]?.audio_url ? { name: content[0].audio_url } : null,
            },
          };
        } else if (slide.slide_type === 'location') {
          const locationTask = await db
            .select()
            .from(LOCATION_TASKS)
            .where(eq(LOCATION_TASKS.slide_id, slide.id))
            .limit(1);

          const content = await db
            .select()
            .from(SLIDE_CONTENT)
            .where(eq(SLIDE_CONTENT.slide_id, slide.id))
            .limit(1);

          return {
            id: slide.id,
            type: 'location',
            position: slide.position,
            content: {
              latitude: locationTask[0]?.latitude || 0,
              longitude: locationTask[0]?.longitude || 0,
              radius: locationTask[0]?.radius || 0,
              description: locationTask[0]?.description || '',
              audio: content[0]?.audio_url ? { name: content[0].audio_url } : null,
            },
          };
        }
      })
    );

    return NextResponse.json({
      id: episode[0].id,
      name: episode[0].name,
      synopsis: episode[0].synopsis,
      audio: episode[0].audio_url ? { name: episode[0].audio_url } : null,
      slides: processedSlides,
    });
  } catch (error) {
    console.error('Error fetching episode details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch episode details', details: error.message },
      { status: 500 }
    );
  }
}