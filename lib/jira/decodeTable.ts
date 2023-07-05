export type Task = {
  title: string;
  description: string;
  QA: string;
  DEV: string;
  subtasks: Task[];
};

export type TableDataContainer = {
  tables: TableData[];
  commentId?: string;
};

export type TableData = {
  title: string;
  columns: string[];
  rows: string[][]; // [row][column]
};

export function decodeTablesFromComment(comment: string) {
  const tables: TableData[] = [];

  const lines = comment
    .replace(/\r\n/g, "\r")
    .replace(/\n+/g, "\r")
    .split(/\r/);

  let table: TableData = {
    title: "",
    columns: [],
    rows: [],
  };

  let inTable = false;
  let isRows = false;

  for (let i = 0; i < lines.length; i++) {
    var row = lines[i];
    if (row.includes("|width=")) {
      row = row.replace("|width=", "?width=");
    }

    if (row.includes("smart-link")) {
      row = row.replace(/\[([^\|\]]+)\|([^\|\]]+)\|smart-link\]/g, "[$1]($2)");
    }

    if (row.startsWith("【")) {
      console.log(inTable, row, lines[i - 1]);
      if (inTable) {
        if (table.rows[table.rows.length - 1]?.length) {
          const last = table.rows[table.rows.length - 1].pop();
          table.rows[table.rows.length - 1].push(last + "\n" + row);
        } else {
          console.log(row, table.rows[table.rows.length - 1]);
        }
      } else {
        if (table.title !== "") {
          tables.push(table);
        }
        table = {
          title: "",
          columns: [],
          rows: [],
        };
        table.title = row.replace("【", "").replace("】", "");
      }
    } else if (row.startsWith("||")) {
      table.columns = row.split("||");
      inTable = true;
    } else if (row.startsWith("|")) {
      table.rows.push(row.split("|"));
      if (table.rows[table.rows.length - 1].length == table.columns.length) {
        inTable = false;
      }
    } else {
      if (table.rows[table.rows.length - 1]?.length) {
        const last = table.rows[table.rows.length - 1].pop();
        const cells = row.split("|");
        table.rows[table.rows.length - 1].push(
          last + "\n" + cells[0],
          ...cells.slice(1)
        );

        if (table.rows[table.rows.length - 1].length == table.columns.length) {
          inTable = false;
        }
      } else {
        console.log(row, table.rows[table.rows.length - 1]);
      }
    }
  }
  tables.push(table);

  return tables;
}

export function encodeTablesToComment(table: TableData) {
  let comment = table.title ? "【" + table.title + "】\n" : "";
  comment += table.columns.join("||") + "\n";
  for (const row of table.rows) {
    var text =
      row
        .map((cell) => {
          if (cell.startsWith("\n") || cell.startsWith(" \n")) {
            return cell.replace("\n", "");
          } else {
            return cell;
          }
        })
        .join("|") + "\n";

    comment += text;
  }
  return comment
    .replaceAll("?width=", "|width=")
    .replace(/\[([\S\s]+)\]\(([\S\s]+)\)/g, "[$1|$2|smart-link]");
}
