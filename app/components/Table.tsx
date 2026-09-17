import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { Pill, Actions } from "./ui";
import { THEME_VALUES_FOR_PILLS, PART_VALUES_FOR_PILLS } from "@/constants";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
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

/* Scrolls rather than squeezing the columns to nothing on a narrow screen. */
const Scroller = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const StyledTable = styled.table`
  /* Was an unsized table inside a centring flex column, so it shrank to its
     contents and floated away from the toolbar above it. */
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  table-layout: fixed;
`;

const TableRow = styled.tr`
  font-size: var(--text-sm);

  tbody &:not(:last-child) {
    border-bottom: 1px solid var(--verylightgrey);
  }

  tbody &:hover {
    background: var(--green-tint);
  }

  &:hover .actions {
    opacity: 1;
  }
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 0 0.75rem 0.6rem;
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-faint);
  border-bottom: 1px solid var(--field-edge);

  &:first-child {
    padding-left: 0;
  }
`;

const SortToggle = styled.div<{ $sortable: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  cursor: ${({ $sortable }) => ($sortable ? "pointer" : "default")};
  user-select: none;

  /* Was 🔼 and 🔽, which render as full-colour emoji at the size of the label
     and sit on the baseline differently in every browser. */
  span {
    font-size: 0.7em;
    color: var(--green-600);
  }
`;

const TableData = styled.td`
  padding: 0.7rem 0.75rem;
  vertical-align: middle;
  color: var(--text-body);
  /* Questions are the point of the table, so they wrap rather than truncate. */
  overflow-wrap: anywhere;

  &:first-child {
    padding-left: 0;
  }
`;

export default function Table({
  ownerId,
  filters
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
        const res = await fetch(`/api/u/${ownerId}/questions/all`);
        if (!res.ok) throw new Error("Failed to load questions");
        const data: Question[] = await res.json();
        setData(data);
      } else {
        const partApiString = filters.part !== "all" ? `/${filters.part}` : "";
        const res = await fetch(
          `/api/u/${ownerId}/questions/${filters.level}${partApiString}`
        );
        if (!res.ok) throw new Error("Failed to load questions");
        const data: Question[] = await res.json();
        const dataWithPart = data?.map((data) => {
          if (!data?.part) {
            return {
              ...data,
              part: filters.part
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
  }, [filters, ownerId]);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: "DELETE"
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
        size: 12
      },
      {
        header: "Question",
        accessorKey: "statement",
        size: 38
      },
      {
        header: "Themes",
        accessorKey: "themes",
        cell: ({ row }) => {
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
        size: 28
      },
      {
        header: "Public",
        accessorKey: "public",
        size: 10,
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
        }
      },
      {
        header: "",
        accessorKey: "actions",
        size: 12,
        cell: ({ row }) => {
          // console.log("filters:", filters);
          return (
            // The row's own level, not the filter's. Every question carries
            // its level, and using the filter breaks as soon as a listing can
            // span levels.
            <Actions
              questionId={row.original.id}
              level={row.original.level}
              handleDelete={handleDelete}
            />
          );
        }
      }
    ],
    [data]
  );

  const table = useReactTable({
    columns,
    data,
    // debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting
    }
  });

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p>Error: {error}</p>;
  if (data.length === 0) return <p>No questions found for this selection.</p>;

  return (
    <Scroller>
      <StyledTable>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHeader
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ width: `${header.getSize()}%` }}
                  >
                    {header.isPlaceholder ? null : (
                      <SortToggle
                        $sortable={header.column.getCanSort()}
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
                          asc: <span aria-hidden>{"\u25B2"}</span>,
                          desc: <span aria-hidden>{"\u25BC"}</span>
                        }[header.column.getIsSorted() as string] ?? null}
                      </SortToggle>
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
                          textAlign:
                            cell.column.id === "public" ? "center" : "left"
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
      </StyledTable>
    </Scroller>
  );
}
