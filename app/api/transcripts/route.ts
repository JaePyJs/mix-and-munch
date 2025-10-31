import { NextResponse } from 'next/server';

import { getTranscriptDemo } from '@/lib/data';

export function GET() {
  return NextResponse.json({ data: getTranscriptDemo() });
}
