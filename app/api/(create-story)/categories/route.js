import { NextResponse } from 'next/server';
import { CATEGORIES } from '../../../../utils/schema';
import { db } from '../../../../utils';

// GET Categories
export async function GET() {
    try {
      const categoryList = await db
        .select({
          id: CATEGORIES.id,
          name: CATEGORIES.name,
        })
        .from(CATEGORIES);
  
      return NextResponse.json(categoryList, { status: 200 });
    } catch (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }
  }
  