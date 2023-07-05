import { getAttachment, getImage } from "lib/jira/getIssue";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const name = req.query.name;
  console.log("name", name);

  const attachment = getAttachment(name as string);

  if (!attachment) {
    res.status(404).send("Not found");
    return;
  }

  getImage(attachment).then((image) => {
    res.status(200).send(image);
  });
}
