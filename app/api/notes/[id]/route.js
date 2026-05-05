import prisma from "@/lib/prisma";

export async function PUT(req, { params }) {
  try {
    const { id } = await params; // ✅ THIS IS REQUIRED

    if (!id) {
      return Response.json({ error: "Missing note id" }, { status: 400 });
    }

    const { title, content } = await req.json();

    const note = await prisma.note.update({
      where: { id }, // ✅ now id is defined
      data: {
        title,
        content,
      },
    });

    return Response.json(note);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}