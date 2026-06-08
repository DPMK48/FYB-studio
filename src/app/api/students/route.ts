import { NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.fullName || !body.email) {
      return NextResponse.json(
        { error: "Full name and email are required" },
        { status: 400 },
      );
    }
    const [row] = await db
      .insert(students)
      .values({
        fullName: String(body.fullName),
        nickname: body.nickname || null,
        email: String(body.email),
        matricNumber: body.matricNumber || null,
        photoUrl: body.photoUrl || null,
        favoriteQuote: body.favoriteQuote || null,
        hobbies: body.hobbies || null,
        skillset: body.skillset || null,
        toughestSemester: body.toughestSemester || null,
        mostDifficultCourse: body.mostDifficultCourse || null,
        favoriteCourse: body.favoriteCourse || null,
        messageToFamily: body.messageToFamily || null,
        socialIg: body.socialIg || null,
        socialFb: body.socialFb || null,
        dateOfBirth: body.dateOfBirth || null,
        stateOfOrigin: body.stateOfOrigin || null,
        relationshipStatus: body.relationshipStatus || null,
      })
      .returning({ id: students.id });

    return NextResponse.json({ id: row.id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
