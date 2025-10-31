import { NextResponse } from 'next/server';

import { getRecipeBySlug } from '@/lib/data';

export function GET(_: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const recipe = getRecipeBySlug(slug);

  if (!recipe) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ data: recipe });
}
