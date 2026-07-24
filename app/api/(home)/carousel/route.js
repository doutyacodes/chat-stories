import { NextResponse } from 'next/server';
import { CAROUSEL_STORIES, STORIES, TAGS, STORY_TAGS } from '../../../../utils/schema';
import { db } from '../../../../utils';
import { eq, gte, and, or, isNull, sql, inArray } from 'drizzle-orm';

export async function GET(request) {
  try {
    const rawCarouselStories = await db
      .select({
        id: CAROUSEL_STORIES.id,
        title: STORIES.title,
        synopsis: STORIES.synopsis,
        cover_img: STORIES.cover_img,
        trailer: STORIES.trailer,
        age_rating: STORIES.age_rating,
        language: STORIES.language,
        story_type: STORIES.story_type,
        story_id: CAROUSEL_STORIES.story_id,
        episode_count: sql`(SELECT COUNT(*) FROM episodes WHERE episodes.story_id = ${STORIES.id})`.as('episode_count'),
      })
      .from(CAROUSEL_STORIES)
      .innerJoin(STORIES, eq(CAROUSEL_STORIES.story_id, STORIES.id))
      .where(
        and(
          gte(new Date(), CAROUSEL_STORIES.start_date),
          or(
            isNull(CAROUSEL_STORIES.end_date),
            gte(CAROUSEL_STORIES.end_date, new Date())
          ),
          eq(CAROUSEL_STORIES.is_visible, true),
          eq(STORIES.is_published, true)
        )
      )
      .orderBy(CAROUSEL_STORIES.position);

    const storyIds = rawCarouselStories.map(s => s.story_id).filter(Boolean);

    let tagsMap = {};
    if (storyIds.length > 0) {
      const allTags = await db
        .select({
          story_id: STORY_TAGS.story_id,
          name: TAGS.name
        })
        .from(STORY_TAGS)
        .innerJoin(TAGS, eq(STORY_TAGS.tag_id, TAGS.id))
        .where(inArray(STORY_TAGS.story_id, storyIds));

      allTags.forEach(({ story_id, name }) => {
        if (!tagsMap[story_id]) tagsMap[story_id] = [];
        tagsMap[story_id].push(name);
      });
    }

    const carouselStories = rawCarouselStories.map(story => ({
      ...story,
      genres: tagsMap[story.story_id] || []
    }));

    return NextResponse.json({ carouselStories }, { status: 200 });
  } catch (error) {
    console.error('Error fetching carousel data:', error);
    return NextResponse.json({ error: 'Failed to fetch carousel data' }, { status: 500 });
  }
}
