import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { Checkbox, Pill, Actions } from "./ui";
import { THEME_VALUES_FOR_PILLS, PART_VALUES_FOR_PILLS } from "@/constants";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable
} from "@tanstack/react-table";

/* The table has never paginated: it draws the first twenty rows of whatever
   the filter returns. Select-all has to mean those twenty, or it would hand
   bulk actions rows nobody on this screen can see. */
const VISIBLE_ROWS = 20;

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
  vertical-align: middle;
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-faint);
  border-bottom: 1px solid var(--field-edge);

  &:first-child {
    padding-left: 0;
    padding-right: 0;
  }
`;

const SortToggle = styled.div<{ $sortable: boolean }>`
  /* Full width rather than shrink-to-fit: a label still sits at the start of
     the cell, the whole heading becomes the target for sorting rather than
     just its words, and a header whose content centres itself — the select-all
     box — can actually do so. */
  display: flex;
  width: 100%;
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

/* Appears only when something is selected, so the table looks the same as it
   always did until you start choosing. */
const BulkBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
  padding: 0.6rem 0.85rem;
  border: 1.5px solid var(--green-edge);
  border-radius: var(--radius-control);
  background: var(--green-tint);

  strong {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-heading);
  }

  /* Pushes everything after it to the right-hand end of the bar. */
  .spacer {
    margin-left: auto;
  }
`;

const BulkButton = styled.button<{ $danger?: boolean }>`
  appearance: none;
  border: 1.5px solid
    ${({ $danger }) => ($danger ? "var(--danger)" : "var(--green-edge)")};
  background: #fff;
  border-radius: var(--radius-control);
  padding: 0.4rem 0.9rem;
  cursor: pointer;
  font-family: var(--font-body), sans-serif;
  font-size: var(--text-sm);
  font-weight: 500;
  color: ${({ $danger }) => ($danger ? "var(--danger)" : "var(--text-body)")};
  transition: background-color 0.12s ease;

  &:hover {
    background: ${({ $danger }) => ($danger ? "rgba(198, 64, 47, 0.08)" : "#fff")};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid
      ${({ $danger }) => ($danger ? "var(--danger)" : "var(--green-600)")};
    outline-offset: 1px;
  }
`;

const PlainButton = styled(BulkButton)`
  border-color: transparent;
  background: none;
  color: var(--text-muted);

  &:hover {
    background: none;
    color: var(--text-heading);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

const DeleteError = styled.p`
  margin: 0 0 0.75rem;
  font-size: var(--text-sm);
  color: var(--danger);
`;

const TableData = styled.td`
  padding: 0.7rem 0.75rem;
  vertical-align: middle;
  color: var(--text-body);
  /* Questions are the point of the table, so they wrap rather than truncate. */
  overflow-wrap: anywhere;

  &:first-child {
    padding-left: 0;
    padding-right: 0;
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
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [confirmingBulk, setConfirmingBulk] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);

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

  // A selection is a set of question ids, and the ids on screen change with
  // the filter, so keeping it would act on rows nobody can see.
  useEffect(() => {
    setRowSelection({});
    setConfirmingBulk(false);
  }, [filters]);

  /* No alert on success: the row disappearing is the confirmation, and a
     native dialog in the middle of a designed page is a jolt. A failure does
     need saying, so it is said in the page rather than in a browser box. */
  const handleDelete = async (id: number) => {
    setDeleteError(null);
    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        fetchQuestions();
      } else {
        const body = await response.json().catch(() => null);
        setDeleteError(body?.error ?? "Could not delete that question.");
      }
    } catch {
      setDeleteError("Could not delete that question. Please try again.");
    }
  };

  /* One request per question rather than a bulk endpoint: the API has none
     yet, and adding one for a handful of ids would be inventing a surface
     before there is a reason for it. allSettled so one refusal does not hide
     the rest, and the count of failures is reported rather than swallowed. */
  const handleBulkDelete = async (ids: number[]) => {
    setDeleteError(null);
    setBulkBusy(true);

    const results = await Promise.allSettled(
      ids.map((id) => fetch(`/api/questions/${id}`, { method: "DELETE" }))
    );
    const failed = results.filter(
      (r) => r.status === "rejected" || !r.value.ok
    ).length;

    if (failed > 0) {
      setDeleteError(
        failed === ids.length
          ? "Could not delete those questions."
          : `${failed} of ${ids.length} could not be deleted.`
      );
    }

    setRowSelection({});
    setConfirmingBulk(false);
    setBulkBusy(false);
    await fetchQuestions();
  };

  // Define columns here, outside of the conditional rendering
  const columns = useMemo<ColumnDef<Question>[]>(
    () => [
      {
        id: "select",
        size: 4,
        enableSorting: false,
        header: ({ table }) => {
          const shown = table.getRowModel().rows.slice(0, VISIBLE_ROWS);
          const selected = shown.filter((row) => row.getIsSelected()).length;

          return (
            <Checkbox
              checked={shown.length > 0 && selected === shown.length}
              indeterminate={selected > 0 && selected < shown.length}
              onChange={(value) =>
                shown.forEach((row) => row.toggleSelected(value))
              }
              ariaLabel="Select every question shown"
            />
          );
        },
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onChange={(value) => row.toggleSelected(value)}
            ariaLabel={`Select "${row.original.statement}"`}
          />
        )
      },
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
        size: 9
      },
      {
        header: "Question",
        accessorKey: "statement",
        size: 46
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
        size: 27
      },
      {
        header: "Public",
        accessorKey: "public",
        size: 8,
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
        // Just wide enough for the kebab and the cell's own padding.
        size: 6,
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
    /* The sizes above are percentages of the table, not pixels. Without this
       they were silently clamped to TanStack's default minSize of 20, so every
       column asking for less came out the same width — which is why Part,
       Public and the actions column were all identical however they were
       declared. */
    defaultColumn: { minSize: 0, maxSize: 100 },
    // Keyed on the question id, so a selection survives a re-sort and means
    // the same thing after a refetch.
    getRowId: (row) => String(row.id),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    // debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      rowSelection
    }
  });

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p>Error: {error}</p>;
  if (data.length === 0) return <p>No questions found for this selection.</p>;

  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.id);

  return (
    <Scroller>
      {selectedIds.length > 0 ? (
        <BulkBar>
          <strong>
            {selectedIds.length === 1
              ? "1 question selected"
              : `${selectedIds.length} questions selected`}
          </strong>

          {/* More actions belong here as they arrive — adding the selection to
              a practice is the next one. */}
          <span className="spacer" />

          {confirmingBulk ? (
            <>
              <span style={{ fontSize: "var(--text-sm)" }}>
                {selectedIds.length === 1
                  ? "Delete this question?"
                  : `Delete these ${selectedIds.length} questions?`}
              </span>
              <PlainButton
                type="button"
                onClick={() => setConfirmingBulk(false)}
                disabled={bulkBusy}
              >
                Cancel
              </PlainButton>
              <BulkButton
                type="button"
                $danger
                disabled={bulkBusy}
                onClick={() => handleBulkDelete(selectedIds)}
              >
                {bulkBusy ? "Deleting..." : "Yes, delete"}
              </BulkButton>
            </>
          ) : (
            <>
              <PlainButton type="button" onClick={() => setRowSelection({})}>
                Clear
              </PlainButton>
              {/* Asked once, unlike the single delete in the row menu: this
                  one can take the whole table with it. */}
              <BulkButton
                type="button"
                $danger
                onClick={() => setConfirmingBulk(true)}
              >
                Delete
              </BulkButton>
            </>
          )}
        </BulkBar>
      ) : null}

      {deleteError ? (
        <DeleteError role="alert">{deleteError}</DeleteError>
      ) : null}
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
            .rows.slice(0, VISIBLE_ROWS)
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
