import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import Pill from "./Pill";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingFn,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

interface Question {
  part: string;
  id: number;
  question: string;
  themes: string[] | null;
  owner_id: string;
  public: boolean;
}

const TableRow = styled.tr`
  height: 30px;
`;

const TableHeader = styled.th`
  text-align: left;
`;

const TableData = styled.td`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default function ReactTable({ ownerId }: { ownerId: string }) {
  const [data, setData] = useState<Question[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch(`/api/questions/all?owner_id=${ownerId}`);
        if (!res.ok) throw new Error("Failed to load questions");
        const data: Question[] = await res.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    if (ownerId) {
      fetchQuestions();
    }
  }, []);

  // Define columns here, outside of the conditional rendering
  const columns = useMemo<ColumnDef<Question>[]>(
    () => [
      {
        header: "Part",
        accessorKey: "part",
        cell: ({ row }) => {
          return <Pill text={`Part ${row.original.part}`} />;
        },
        size: 100,
      },
      {
        header: "Question",
        accessorKey: "question",
        size: 300,
      },
      {
        header: "Themes",
        accessorKey: "themes",
        cell: ({ row }) => {
          return row.original?.themes?.map((theme) => {
            return <Pill text={theme} useLightPalette key={theme} />;
          });
        },
        size: 100,
      },
      {
        header: "Public",
        accessorKey: "public",
        size: 50,
      },
    ],
    []
  );

  const table = useReactTable({
    columns,
    data,
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p>Error: {error}</p>;

  // access sorting state from the table instance
  console.log(table.getState().sorting);

  return (
    <div className="p-2">
      <div className="h-2" />
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                console.log("header:", header);

                return (
                  <TableHeader
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      width: `${header.getSize()}px`,
                      maxWidth: `${header.getSize()}px`,
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                        title={
                          header.column.getCanSort()
                            ? header.column.getNextSortingOrder() === "asc"
                              ? "Sort ascending"
                              : header.column.getNextSortingOrder() === "desc"
                              ? "Sort descending"
                              : "Clear sort"
                            : undefined
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TableHeader>
                );
              })}
            </TableRow>
          ))}
        </thead>
        <tbody>
          {table
            .getRowModel()
            .rows.slice(0, 10)
            .map((row) => {
              console.log("row:", row);
              return (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    console.log("cell:", cell);
                    return (
                      <TableData
                        key={cell.id}
                        style={{
                          width: `${cell.column.getSize()}px`,
                          maxWidth: `${cell.column.getSize()}px`,
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableData>
                    );
                  })}
                </TableRow>
              );
            })}
        </tbody>
      </table>
      <div>{table.getRowModel().rows.length.toLocaleString()} Rows</div>
      <pre>{JSON.stringify(sorting, null, 2)}</pre>
    </div>
  );
}
