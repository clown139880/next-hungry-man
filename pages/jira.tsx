import type { GetServerSideProps, NextPage } from "next";
import {
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Heading,
  Checkbox,
  List,
  Image,
  ListItem,
  Text,
  EditableTextarea,
  ButtonGroup,
  Editable,
  EditablePreview,
  Flex,
  IconButton,
  useEditableControls,
  Link,
} from "@chakra-ui/react";

import { CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons";

import { TableData, TableDataContainer } from "lib/jira/decodeTable";
import { ReactNode, useEffect, useState } from "react";
import { atom } from "jotai";
import { useQuery } from "react-query";

type PageProps = {
  tables: TableDataContainer[];
  images?: {
    name: string;
    url: string;
  }[];
  issueId: string;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context
) => {
  return {
    props: {
      issueId: context.query.id as string,
      tables: [],
    } as PageProps, // will be passed to the page component as props
  };
};

const issueAtom = atom<PageProps | null>(null);

const Home: NextPage<PageProps> = (props: PageProps) => {
  const [{ tables, images, issueId }, setData] = useState(props);

  useQuery(
    "/api/issue?id=" + issueId,
    async () => {
      const data = await fetch("/api/issue?id=" + issueId).then((res) =>
        res.json()
      );
      return data;
    },
    {
      refetchInterval: 1000 * 60 * 5,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: true,
      refetchOnMount: false,
      refetchOnReconnect: false,
      onSuccess: (data) => {
        setData(data);
      },
    }
  );

  const onUpdate = (_tables: TableDataContainer) => {
    fetch("/api/update", {
      method: "POST",
      body: JSON.stringify({
        issueId,
        tables: _tables,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setData((prev) => ({
          ...prev,
          tables: prev.tables.map((table) => {
            if (
              table.commentId == _tables.commentId ||
              (!table.commentId && !_tables.commentId)
            ) {
              return _tables;
            }
            return table;
          }),
        }));
      });
  };

  return (
    <div className="px-10 space-y-10 max-w-screen">
      <title>{issueId}</title>
      {tables.map((tableContainer, cIdx) =>
        tableContainer.tables.map((table, idx) => (
          <TableRender
            onUpdate={(_table) => {
              onUpdate({
                ...tableContainer,
                tables: tableContainer.tables.map((table, idx) => {
                  if (idx === idx) {
                    return _table;
                  }
                  return table;
                }),
              });
            }}
            data={table}
            key={cIdx * 100 + idx}
            images={images}
          />
        ))
      )}
    </div>
  );
};

function TableRender({
  data,
  images,
  onUpdate,
}: {
  data: TableData;
  images: PageProps["images"];
  onUpdate: (tables: TableData) => void;
}) {
  return (
    <div className="">
      <Heading>{data.title}</Heading>
      <Table variant="striped" colorScheme="teal">
        <Thead>
          <Tr>
            {data.columns.map((col, idx) => (
              <Th maxWidth={"400px"} key={idx}>
                {col}
              </Th>
            ))}
          </Tr>
        </Thead>
        <tbody>
          {data.rows.map((row, rowIdx) => {
            if (row.find((cell) => cell === "fixed")) return null;
            return (
              <Tr key={rowIdx}>
                {row.map((cell, cellIdx) => (
                  <Td
                    maxWidth={"400px"}
                    borderWidth={1}
                    whiteSpace="pre-wrap"
                    key={cellIdx}
                  >
                    {cellIdx == 1 ? (
                      <TaskRender
                        data={cell}
                        images={images}
                        isTaskCompleted={(taskIdx) => {
                          const lines = cell.split("\n");
                          const lineIndex = lines.findIndex((c, i) =>
                            c.startsWith(taskIdx + " ")
                          );
                          if (lineIndex !== -1) {
                            return lines[lineIndex].endsWith("fixed");
                          }
                          return false;
                        }}
                        onTaskChange={(taskIdx, isComplete) => {
                          onUpdate({
                            ...data,
                            rows: data.rows.map((row, _rowIdx) => {
                              if (_rowIdx === rowIdx) {
                                return row.map((cell, idx) => {
                                  if (idx === row.length - 3) {
                                    const lines = cell.split("\n");
                                    const lineIndex = lines.findIndex((c, i) =>
                                      c.startsWith(taskIdx + " ")
                                    );
                                    if (lineIndex !== -1) {
                                      lines[lineIndex] = `${taskIdx} ${
                                        isComplete ? "fixed" : "unfix"
                                      }`;
                                    } else {
                                      lines.push(
                                        `${taskIdx} ${
                                          isComplete ? "fixed" : "unfix"
                                        }`
                                      );
                                    }
                                    return lines.join("\n");
                                  }
                                  return cell;
                                });
                              }
                              return row;
                            }),
                          });
                        }}
                      />
                    ) : cellIdx == row.length - 2 ? (
                      <QARender data={cell} images={images} />
                    ) : cellIdx == row.length - 3 ? (
                      <DevRender
                        data={cell}
                        onUpdate={(_data) => {
                          onUpdate({
                            ...data,
                            rows: data.rows.map((row, _rowIdx) => {
                              if (_rowIdx === rowIdx) {
                                return [
                                  ...row.map((cell, idx) => {
                                    if (idx === cellIdx) {
                                      return _data;
                                    }
                                    return cell;
                                  }),
                                ] as typeof row;
                              }
                              return row;
                            }),
                          });
                        }}
                      />
                    ) : (
                      cell
                    )}
                  </Td>
                ))}
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

function DevRender({
  data,
  onUpdate,
}: {
  data: string;
  onUpdate: (data: string) => void;
}) {
  const [value, setValue] = useState(data);

  useEffect(() => {
    setValue(data);
  }, [data]);
  /* Here's a custom control */
  function EditableControls() {
    const {
      isEditing,
      getSubmitButtonProps,
      getCancelButtonProps,
      getEditButtonProps,
    } = useEditableControls();

    return isEditing ? (
      <ButtonGroup justifyContent="center" size="sm">
        <IconButton icon={<CheckIcon />} {...(getSubmitButtonProps() as any)} />
        <IconButton icon={<CloseIcon />} {...(getCancelButtonProps() as any)} />
      </ButtonGroup>
    ) : (
      <Flex justifyContent="center">
        <IconButton
          size="sm"
          icon={<EditIcon />}
          {...(getEditButtonProps() as any)}
        />
      </Flex>
    );
  }

  return (
    <Editable
      textAlign="center"
      defaultValue="Rasengan ⚡️"
      fontSize="2xl"
      value={value}
      onChange={(nextValue) => {
        setValue(nextValue);
      }}
      onSubmit={(nextValue) => {
        onUpdate(nextValue);
        setValue(nextValue);
      }}
      isPreviewFocusable={false}
    >
      <EditablePreview />
      {/* Here is the custom input */}
      <EditableTextarea />
      <EditableControls />
    </Editable>
  );
}

function QARender({
  data,
  images,
}: {
  data: string;
  images: PageProps["images"];
}) {
  console.log(data);
  return (
    <List spacing={3}>
      {data.split("\n").map((task, idx) => {
        if (task === "") return null;
        if (task.startsWith("{color"))
          return (
            <ListItem key={idx}>
              <Text fontWeight={"bold"} fontSize="xl" color={"#ff5630"}>
                {task.replace("{color:#ff5630}", "").replace("{color}", "")}
              </Text>
            </ListItem>
          );

        return <ListItem key={idx}>{task}</ListItem>;
      })}
    </List>
  );
}

function TaskRender({
  data,
  images,
  onTaskChange,
  isTaskCompleted,
}: {
  data: string;
  isTaskCompleted: (idx: number) => boolean;
  images: PageProps["images"];
  onTaskChange: (idx: number, isCompleted: boolean) => void;
}) {
  var idx = 0;

  const tasks: ReactNode[] = [];

  data.split("\n").forEach((task) => {
    if (task === "") return null;

    if (task.startsWith("!") || task.includes("# !")) {
      const imageName = task.replace("# !", "").replace("!", "").split("?")[0];
      console.log(imageName, task, "imageName");
      tasks.push(
        <Image
          key={idx}
          objectFit="cover"
          src={"/images/" + imageName}
          alt={imageName}
        />
      );
      return;
    }

    const isCompleted = task.includes("# -");
    const isTitle = idx == 0 && (task.startsWith("*") || task.endsWith("："));

    if (idx == 0) {
      console.log(task, isTitle);
    }

    const _idx = idx;

    tasks.push(
      <ListItem key={_idx} className="flex flex-wrap">
        {!isTitle &&
          (isCompleted ? (
            <Checkbox
              colorScheme="blue"
              onClick={() => {}}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onTaskChange(_idx, e.target.checked);
              }}
              isChecked={true}
            />
          ) : (
            <Checkbox
              colorScheme="green"
              onClick={() => {}}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onTaskChange(_idx, e.target.checked);
              }}
            />
          ))}
        {_idx > 0 && _idx}
        {decodeTask(task)}
      </ListItem>
    );
    idx++;
  });

  return <List spacing={3}>{tasks}</List>;
}

function decodeTask(_row: string) {
  console.log(_row);
  let row = _row;
  const reg = /\*([\S\s]+)\*/g;
  if (reg.test(row)) {
    // split by * and replace with <strong>
    let split: ReactNode[];
    split = row.split(reg);
    console.log(_row, split);

    for (let i = 0; i < split.length; i++) {
      if (i % 2 === 1) {
        split[i] = (
          <Text fontWeight={"bold"}>
            {decodeTask((split[i] as string).replace(reg, "$1"))}
          </Text>
        );
      } else {
        split[i] = decodeTask(split[i] as string);
      }
    }
    return <>{split}</>;
  }

  const linkReg = /(\[[\S\s]+\]\([\S\s]+\))/g;
  if (linkReg.test(row)) {
    let split: ReactNode[];
    split = row.split(linkReg);
    console.log(_row, split, "link");

    for (let i = 0; i < split.length; i++) {
      if (i % 2 === 1) {
        split[i] = (
          <Link
            href={(split[i] as string).replace(
              /\[([\S\s]+)\]\(([\S\s]+)\)/g,
              "$1"
            )}
          >
            {decodeTask(
              (split[i] as string).replace(/\[([\S\s]+)\]\(([\S\s]+)\)/g, "$1")
            )}
          </Link>
        );
      } else {
        split[i] = decodeTask(split[i] as string);
      }
    }
    return <>{split}</>;
  }

  const colorReg = /\{color\:\#ff5630\}([\S\s]+)\{color\}/g;
  if (colorReg.test(row)) {
    // split by * and replace with <strong>
    let split: ReactNode[];
    split = row.split(colorReg);
    for (let i = 0; i < split.length; i++) {
      if (i % 2 === 1) {
        split[i] = (
          <Text color={"#ff5630"}>
            {decodeTask((split[i] as string).replace(colorReg, "$1"))}
          </Text>
        );
      } else {
        split[i] = decodeTask(split[i] as string);
      }
    }
    return <>{split}</>;
  }

  return row;
}

export default Home;
