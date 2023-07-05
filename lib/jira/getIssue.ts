import { existsSync, writeFileSync } from "fs";
import JiraApi from "jira-client";
import {
  TableData,
  TableDataContainer,
  decodeTablesFromComment,
  encodeTablesToComment,
} from "./decodeTable";

const config = {
  baseUrl: process.env.NEXT_PUBLIC_JIRA_BASE_URL,
  username: process.env.NEXT_PUBLIC_JIRA_USERNAME,
  apiToken: process.env.NEXT_PUBLIC_JIRA_API_TOKEN,
  password: "",
  port: "443",
};

let api: JiraApi;

let attachments: {
  [key: string]: any;
} = {};

function getApi() {
  if (api) {
    return api;
  }

  if (!config.baseUrl) {
    throw new Error(
      "Missing configuration jira.baseUrl. Please update vscode settings"
    );
  }
  if (!config.username) {
    throw new Error(
      "Missing configuration jira.username. Please update vscode settings."
    );
  }
  if (!config.apiToken && !config.password) {
    throw new Error(
      "Missing configuration jira.apiToken. Please update vscode settings."
    );
  }
  const baseUrl = config.baseUrl.endsWith("/")
    ? config.baseUrl.slice(0, -1)
    : config.baseUrl;
  const [protocol, host] = baseUrl.split("://");
  if (!host || (protocol !== "http" && protocol != "https")) {
    throw new Error("Please provide a valid base url");
  }
  api = new JiraApi({
    protocol,
    host,
    port: config.port,
    username: config.username,
    password: config.apiToken || config.password,
    apiVersion: "2",
    strictSSL: false,
  });
  return api;
}

export async function getIssue(issueId: string) {
  return getApi().getIssue(issueId);
}

export async function getImage(attachment: any) {
  return getApi().downloadAttachment(attachment);
}

export function getAttachment(name: string) {
  console.log(attachments);

  return attachments[name];
}

export async function updateIssueTable(
  issueId: string,
  tables: TableData[],
  commentId?: string
) {
  if (commentId == "") {
    getApi().addComment(
      issueId,
      tables.map((t) => encodeTablesToComment(t)).join("\n\n")
    );
    return;
  }
  if (commentId) {
    getApi().updateComment(
      issueId,
      commentId,
      tables.map((t) => encodeTablesToComment(t)).join("\n\n")
    );
  } else {
    getApi().updateIssue(issueId, {
      update: {
        description: [
          {
            set: tables.map((t) => encodeTablesToComment(t)).join("\n\n"),
          },
        ],
      },
    });
  }
}

export async function getIssueTable(issueId: string) {
  return getIssue(issueId).then((data) => {
    const tables: TableDataContainer[] = [];

    // writeFileSync("desc.json", data.fields.description);

    if (data.fields.description?.includes("||")) {
      tables.push({
        tables: decodeTablesFromComment(data.fields.description),
      });
    }

    for (const comment of data.fields.comment.comments) {
      if (
        comment.body.includes("||") &&
        comment.author.displayName !== "joker2"
      ) {
        tables.push({
          tables: decodeTablesFromComment(comment.body),
          commentId: comment.id,
        });
      }
    }

    data.fields.attachment?.forEach((a: any) => {
      attachments[a.filename] = a;
      const filename = "./public/images/" + a.filename.split("#")[0];
      if (existsSync(filename)) {
        // console.log("exists", filename);
      } else {
        getImage(a).then((image) => {
          console.log("download", filename);
          writeFileSync(filename, image as unknown as string);
        });
      }
    });

    return {
      tables,
      images: data.fields.attachment?.map(
        (a: { filename: string; content: string }) => ({
          name: a.filename,
          url: a.content,
          ...a,
        })
      ) as { name: string; url: string }[],
      issueId,
    };
  });
}
