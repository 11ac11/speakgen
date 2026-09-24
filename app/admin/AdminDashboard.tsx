"use client";

import React from "react";
import styled from "styled-components";
import type { Metrics } from "@/lib/metrics";

/**
 * Stat tiles for the headline numbers and plain tables for the rest. None of
 * it is a chart: each figure is read on its own, and the weekly trend is eight
 * rows a table shows exactly. Numbers wear text colours, not series colours.
 */

const Page = styled.div`
  padding-top: 3rem;
  padding-bottom: 4rem;

  h1 {
    margin: 0 0 0.25rem;
  }

  h2 {
    font-size: var(--text-lg);
    margin: 2.25rem 0 0.75rem;
  }
`;

const Sub = styled.p`
  && {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
`;

const Tiles = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 0.75rem;
`;

const Tile = styled.div`
  padding: 1rem 1.1rem;
  border-radius: var(--radius-card);
`;

const Value = styled.div`
  font-family: var(--font-display), sans-serif;
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.1;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
`;

const Label = styled.div`
  margin-top: 0.3rem;
  font-size: var(--text-sm);
  color: var(--text-body);
`;

const Detail = styled.div`
  margin-top: 0.2rem;
  font-size: var(--text-xs);
  color: var(--text-muted);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);

  th,
  td {
    padding: 0.55rem 0.7rem;
    border-bottom: 1px solid var(--verylightgrey);
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  th:first-child,
  td:first-child {
    text-align: left;
  }

  th {
    font-weight: 600;
    color: var(--text-heading);
  }

  td {
    color: var(--text-body);
  }
`;

const Scroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Empty = styled.p`
  && {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
`;

function StatTile({
  value,
  label,
  detail
}: {
  value: number;
  label: string;
  detail?: string;
}) {
  return (
    <Tile className="glass">
      <Value>{value.toLocaleString("en-GB")}</Value>
      <Label>{label}</Label>
      {detail ? <Detail>{detail}</Detail> : null}
    </Tile>
  );
}

function weekLabel(iso: string, index: number) {
  if (index === 0) return "This week";
  return `w/c ${new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short"
  })}`;
}

export default function AdminDashboard({
  metrics,
  generatedAt
}: {
  metrics: Metrics;
  generatedAt: string;
}) {
  const { teachers, plans, content, usage, weeks, topShared, byLevel } =
    metrics;
  const free = Math.max(
    0,
    teachers.total - plans.proPersonal - plans.coveredBySchools
  );

  return (
    <Page className="page">
      <h1>Metrics</h1>
      <Sub>{`As of ${generatedAt}. Test accounts are left out.`}</Sub>

      <h2>Teachers</h2>
      <Tiles>
        <StatTile
          value={teachers.total}
          label="Teachers"
          detail={`+${teachers.new7} this week · +${teachers.new30} in 30 days`}
        />
        <StatTile
          value={teachers.active7}
          label="Active in the last 7 days"
          detail={`${teachers.active30} in the last 30 days`}
        />
      </Tiles>

      <h2>Plans</h2>
      <Tiles>
        <StatTile value={free} label="On the free plan" />
        <StatTile value={plans.proPersonal} label="Paying for Pro" />
        <StatTile
          value={plans.academySchools}
          label="Schools on Academy"
          detail={`${plans.coveredBySchools} ${plans.coveredBySchools === 1 ? "teacher" : "teachers"} covered · ${plans.schools} ${plans.schools === 1 ? "school" : "schools"} in all`}
        />
      </Tiles>

      <h2>What teachers make</h2>
      <Tiles>
        <StatTile
          value={content.questions}
          label="Questions"
          detail={`+${content.questions30} in 30 days`}
        />
        <StatTile
          value={content.exams}
          label="Exams"
          detail={`+${content.exams30} in 30 days`}
        />
        <StatTile
          value={content.practices}
          label="Practices"
          detail={`+${content.practices30} in 30 days`}
        />
        <StatTile
          value={content.liveShareLinks}
          label="Live share links"
          detail={`${content.shareLinks30} made in 30 days`}
        />
      </Tiles>

      <h2>How it is used</h2>
      <Tiles>
        <StatTile
          value={usage.shareViews30}
          label="Share-link views, 30 days"
          detail={`${usage.shareViews7} this week · ${usage.shareViewsAll} in all`}
        />
        <StatTile
          value={usage.pdfExports30}
          label="PDF exports, 30 days"
          detail={`${usage.pdfExports7} this week · ${usage.pdfExportsAll} in all`}
        />
      </Tiles>

      <h2>Week by week</h2>
      <Scroll>
        <Table>
          <thead>
            <tr>
              <th>Week</th>
              <th>New teachers</th>
              <th>Exams made</th>
              <th>Share-link views</th>
              <th>PDF exports</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, index) => (
              <tr key={week.week}>
                <td>{weekLabel(week.week, index)}</td>
                <td>{week.signups}</td>
                <td>{week.exams}</td>
                <td>{week.shareViews}</td>
                <td>{week.pdfExports}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Scroll>

      <h2>Most-viewed share links, 30 days</h2>
      {topShared.length ? (
        <Scroll>
          <Table>
            <thead>
              <tr>
                <th>Exam or practice</th>
                <th>Level</th>
                <th>Views</th>
              </tr>
            </thead>
            <tbody>
              {topShared.map((row) => (
                <tr key={`${row.title}-${row.level}`}>
                  <td>{row.title}</td>
                  <td>{row.level.toUpperCase()}</td>
                  <td>{row.views}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Scroll>
      ) : (
        <Empty>No share links have been opened in the last 30 days.</Empty>
      )}

      <h2>By level</h2>
      <Scroll>
        <Table>
          <thead>
            <tr>
              <th>Level</th>
              <th>Teachers&apos; questions</th>
              <th>Teachers&apos; exams</th>
            </tr>
          </thead>
          <tbody>
            {byLevel.map((row) => (
              <tr key={row.level}>
                <td>{row.label}</td>
                <td>{row.questions}</td>
                <td>{row.exams}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Scroll>
    </Page>
  );
}
