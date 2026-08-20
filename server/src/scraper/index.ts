import { db } from "../db/client.js";
import { jobPostings } from "../db/schema.js";
import { findLatestWhoIsHiringThread, fetchThreadTree } from "./hn.js";
import { parseComment } from "./parse.js";

async function run() {
  const thread = await findLatestWhoIsHiringThread();
  console.log(`Found thread: "${thread.title}" (id ${thread.id})`);

  const tree = await fetchThreadTree(thread.id);
  const comments = (tree.children ?? []).filter(
    (c) => c.text && c.text.trim().length > 0,
  );
  console.log(`Found ${comments.length} top-level comments`);

  let inserted = 0;
  for (const comment of comments) {
    if (!comment.text) continue;
    const parsed = parseComment(comment.text);

    await db
      .insert(jobPostings)
      .values({
        hnItemId: comment.id,
        hnThreadId: thread.id,
        company: parsed.company,
        role: parsed.role,
        skills: parsed.skills,
        location: parsed.location,
        remote: parsed.remote,
        rawText: comment.text,
        postedAt: new Date(comment.created_at),
      })
      .onConflictDoNothing({ target: jobPostings.hnItemId });

    inserted++;
  }

  console.log(`Done. Processed ${inserted} postings.`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
