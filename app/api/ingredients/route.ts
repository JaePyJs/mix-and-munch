import { NextResponse } from 'next/server';

import { getAllIngredients } from '@/lib/data';

export function GET() {
  return NextResponse.json({ data: getAllIngredients() });
}
