import { writeFileSync } from "fs";
import {
  getAttachment,
  getImage,
  getIssue,
  getIssueTable,
} from "lib/jira/getIssue";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id;

  getIssueTable(id as string).then((data) => {
    res.status(200).json(data);
  });
}
