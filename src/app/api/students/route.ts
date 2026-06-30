import { NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import fs from "fs";
import path from "path";

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

    let savedPhotoUrl = body.photoUrl || null;
    if (savedPhotoUrl && savedPhotoUrl.startsWith("data:image/")) {
      const match = savedPhotoUrl.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        let ext = match[1] === "jpeg" ? "jpg" : match[1];
        if (ext === "svg+xml") ext = "svg";
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, "base64");
        const filename = `photo_student_${Date.now()}_${Math.floor(Math.random() * 100000)}.${ext}`;
        
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, buffer);
        savedPhotoUrl = `/uploads/${filename}`;
      }
    }

    const [row] = await db
      .insert(students)
      .values({
        fullName: String(body.fullName),
        nickname: body.nickname || null,
        email: String(body.email),
        matricNumber: body.matricNumber || null,
        photoUrl: savedPhotoUrl,
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

