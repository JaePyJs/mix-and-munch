import { NextResponse } from 'next/server';

import { getAllRecipes } from '@/lib/data';

export function GET() {
  const recipes = getAllRecipes();
  return NextResponse.json({ data: recipes });
}
