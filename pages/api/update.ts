import { updateIssueTable } from "lib/jira/getIssue";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // console.log(req.body);

  const params = JSON.parse(req.body);

  await updateIssueTable(
    params.issueId,
    params.tables.tables,
    params.tables.commentId
  );

  res.status(200).json({ name: "John Doe" });
}
