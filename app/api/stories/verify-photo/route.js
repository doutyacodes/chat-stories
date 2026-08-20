import { NextResponse } from 'next/server';
import axios from 'axios';
import { db } from '@/utils';
import { AI_IMAGE_TASKS, SLIDES } from '@/utils/schema';
import { eq } from 'drizzle-orm';

export const maxDuration = 60;

export async function POST(request) {
  try {
    const formData = await request.formData();

    const slideId = formData.get('slide_id');
    const file = formData.get('photo') || formData.get('image');

    if (!slideId || !file) {
      return NextResponse.json(
        { error: 'Slide ID and photo are required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // 1. Fetch task details for the given slideId
    const sId = parseInt(slideId);
    const tasks = await db
      .select()
      .from(AI_IMAGE_TASKS)
      .where(eq(AI_IMAGE_TASKS.slide_id, sId))
      .limit(1);

    const taskPrompt = tasks[0]?.description || 'a clear photo matching the story challenge';

    // 2. Convert uploaded file to base64 buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';

    // 3. Call OpenAI gpt-4o-mini vision model
    const chatGptResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an engaging photo challenge validator for an interactive story game. Your job is to verify if the photo taken or uploaded matches the requested task or item description. Always respond in JSON format with keys: {"is_valid": boolean, "feedback": "1-2 sentence friendly response explaining whether the photo satisfies the challenge"}. Be reasonably lenient and generous when evaluating real-world photos. Never mention AI, machine learning, or automated checking.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Challenge Task: "${taskPrompt}". Does this photo show what was requested?`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 300,
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const rawJsonStr = chatGptResponse.data.choices?.[0]?.message?.content?.trim();
    let parsedResult = { is_valid: false, feedback: 'Unable to verify photo. Please try again!' };

    try {
      parsedResult = JSON.parse(rawJsonStr);
    } catch (e) {
      console.error('JSON parse error from OpenAI vision response:', e);
    }

    return NextResponse.json({
      is_valid: Boolean(parsedResult.is_valid),
      feedback: parsedResult.feedback || 'Photo checked!',
    });
  } catch (error) {
    console.error('Verify photo server error:', error?.response?.data || error.message || error);
    return NextResponse.json(
      {
        error: 'Failed to verify photo',
        is_valid: false,
        feedback: 'Unable to verify photo right now. Please try taking another photo!',
      },
      { status: 500 }
    );
  }
}
