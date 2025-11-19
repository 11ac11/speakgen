import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { Pill, Actions } from "./ui";
import { THEME_VALUES_FOR_PILLS, PART_VALUES_FOR_PILLS } from "@/constants";
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
  level: string;
  statement: string;
  themes: string[] | null;
  owner_id: string;
  public: boolean;
}

const TableRow = styled.tr`
  height: 30px;
  font-size: 14px;

  &:hover .actions {
    opacity: 1;
  }
`;

const TableHeader = styled.th`
  text-align: left;
  font-size: 12px;
  text-transform: uppercase;
`;

const TableData = styled.td`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default function Table({
  ownerId,
  filters,
}: {
  ownerId: string;
  filters: any;
}) {
  const [data, setData] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  async function fetchQuestions() {
    try {
      setError(null);
      if (filters.level === "all" && filters.part === "all") {
        const res = await fetch(`/api/u/questions/all`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load questions");
        const data: Question[] = await res.json();
        setData(data);
        console.log("res:", res);
      } else {
        const partApiString = filters.part !== "all" ? `/${filters.part}` : "";
        console.log("partApiString:", partApiString);
        console.log("filters.level:", filters.level);
        const res = await fetch(
          `/api/u/questions/${filters.level}${partApiString}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Failed to load questions");
        const data: Question[] = await res.json();
        console.log("data:", data);
        const dataWithPart = data?.map((data) => {
          if (!data?.part) {
            return {
              ...data,
              part: filters.part,
            };
          }
          return data;
        });
        // console.log("dataWithPart:", dataWithPart);
        setData(dataWithPart);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (ownerId) {
      fetchQuestions();
    }
  }, [filters]);

  const handleDelete = async (level: string, part: string, id: number) => {
    try {
      const response = await fetch(`/api/questions/${level}/${part}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message); // Show a success message (can be customized)
        fetchQuestions();
      } else {
        const error = await response.json();
        alert(error.error); // Show an error message
      }
    } catch (error) {
      console.error("Error deleting the question:", error);
      alert("Failed to delete the question. Please try again.");
    }
  };

  // Define columns here, outside of the conditional rendering
  const columns = useMemo<ColumnDef<Question>[]>(
    () => [
      {
        header: "Part",
        accessorKey: "part",
        cell: ({ row }) => {
          // console.log("row:", row);
          const storedPart = PART_VALUES_FOR_PILLS.find((part) =>
            part.value.includes(row.original?.part)
          );
          if (storedPart) {
            return (
              <Pill
                key={storedPart.value}
                text={storedPart.label}
                bgColor={storedPart.colors.bg}
                textColor={storedPart.colors.text}
              />
            );
          }
        },
        size: 70,
      },
      {
        header: "Question",
        accessorKey: "statement",
        size: 400,
      },
      {
        header: "Themes",
        accessorKey: "themes",
        cell: ({ row }) => {
          console.log("row.original.themes:", row.original.themes);
          return row.original?.themes?.map((themeFromData) => {
            // match the value so we can apply the correct colours to the pill
            const storedTheme = THEME_VALUES_FOR_PILLS.find(
              (theme) => theme.value === themeFromData
            );
            if (storedTheme) {
              return (
                <Pill
                  key={storedTheme.value}
                  text={storedTheme.label}
                  bgColor={storedTheme.colors.bg}
                  textColor={storedTheme.colors.text}
                />
              );
            }
          });
        },
        size: 200,
      },
      {
        header: "Public",
        accessorKey: "public",
        size: 50,
        cell: ({ row }) => {
          if (row.original.public) {
            return (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#67cd55"
                width="20"
                height="20"
              >
                <path d="M9 16.17l-4.24-4.24-1.41 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            );
          }
          return null;
        },
      },
      {
        header: "",
        accessorKey: "actions",
        size: 100,
        cell: ({ row }) => {
          // console.log("filters:", filters);
          return (
            <Actions
              questionId={row.original.id}
              part={row.original.part}
              level={filters?.level}
              handleDelete={handleDelete}
            />
          );
        },
      },
    ],
    [filters?.level, data]
  );

  const table = useReactTable({
    columns,
    data,
    // debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-2">
      <div className="h-2" />
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
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
            .rows.slice(0, 20)
            .map((row) => {
              return (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableData
                        key={cell.id}
                        style={{
                          width: `${cell.column.getSize()}px`,
                          maxWidth: `${cell.column.getSize()}px`,
                          textAlign:
                            cell.column.id === "public" ? "center" : "left",
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
    </div>
  );
}
