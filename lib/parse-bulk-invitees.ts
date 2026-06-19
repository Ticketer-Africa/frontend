// Parses text pasted from a spreadsheet (Excel/Sheets copy = tab-separated rows)
// into invitee objects. Falls back to comma-separated and single-column input.
//
// Header detection: if the first row contains recognizable headers
// (name / phone / email / admits), columns are mapped by header in any order.
// Otherwise columns are positional: first = name, second = phone.
// The sheet's "Category"/"Status"/"Notes" columns are ignored.

export interface ParsedInvitee {
  name?: string;
  email?: string;
  phone?: string;
  admitsCount?: number;
}

const HEADER_ALIASES: Record<keyof ParsedInvitee, string[]> = {
  name: ["name", "full name", "fullname", "guest", "guest name", "guestname"],
  phone: ["phone", "phone number", "phonenumber", "mobile", "tel", "number", "contact"],
  email: ["email", "e-mail", "mail", "email address"],
  admitsCount: [
    "admits",
    "admit",
    "admitscount",
    "admits count",
    "quantity",
    "qty",
    "pax",
    "seats",
    "no of people",
    "number of people",
    "how many",
  ],
};

const norm = (s: string) => s.trim().toLowerCase();

const splitCells = (line: string, delimiter: string): string[] =>
  line.split(delimiter).map((c) => c.trim());

function detectDelimiter(lines: string[]): string {
  if (lines.some((l) => l.includes("\t"))) return "\t";
  if (lines.some((l) => l.includes(","))) return ",";
  return "\t"; // single column → whole line is one cell
}

function matchHeader(cell: string): keyof ParsedInvitee | null {
  const c = norm(cell);
  for (const field of Object.keys(HEADER_ALIASES) as Array<keyof ParsedInvitee>) {
    if (HEADER_ALIASES[field].includes(c)) return field;
  }
  return null;
}

const looksLikePhone = (s: string) => /^\+?[0-9()\-\s]{7,20}$/.test(s.trim());
const looksLikeEmail = (s: string) => /\S+@\S+\.\S+/.test(s.trim());

// Infer columns from cell content when headers are missing or incomplete.
// - phone/email: the column whose values most often look like a phone/email.
// - name: the remaining text column with the most distinct values (names are
//   varied, unlike Category/Status which repeat) — this skips the leading
//   "Category" column and "Status" columns automatically.
function inferColumns(
  rows: string[][],
): Partial<Record<keyof ParsedInvitee, number>> {
  const ncol = rows.reduce((m, r) => Math.max(m, r.length), 0);
  const col = (i: number) => rows.map((r) => (r[i] ?? "").trim());

  let phoneIdx = -1;
  let phoneScore = 0;
  let emailIdx = -1;
  let emailScore = 0;
  for (let i = 0; i < ncol; i++) {
    const cells = col(i).filter(Boolean);
    const ph = cells.filter(looksLikePhone).length;
    const em = cells.filter(looksLikeEmail).length;
    if (ph > phoneScore) {
      phoneScore = ph;
      phoneIdx = i;
    }
    if (em > emailScore) {
      emailScore = em;
      emailIdx = i;
    }
  }

  let nameIdx = -1;
  let nameScore = -1;
  for (let i = 0; i < ncol; i++) {
    if (i === phoneIdx || i === emailIdx) continue;
    const cells = col(i).filter(
      (c) =>
        c && !looksLikePhone(c) && !looksLikeEmail(c) && !/^\d+$/.test(c),
    );
    const distinct = new Set(cells.map((c) => c.toLowerCase())).size;
    if (distinct > nameScore) {
      nameScore = distinct;
      nameIdx = i;
    }
  }

  const map: Partial<Record<keyof ParsedInvitee, number>> = {};
  if (nameIdx >= 0) map.name = nameIdx;
  if (phoneIdx >= 0) map.phone = phoneIdx;
  if (emailIdx >= 0) map.email = emailIdx;
  return map;
}

function toInvitee(
  cells: string[],
  map: Partial<Record<keyof ParsedInvitee, number>>,
): ParsedInvitee | null {
  const at = (i?: number) =>
    i !== undefined && i >= 0 && cells[i] ? cells[i].trim() : "";

  const name = at(map.name);
  const phone = at(map.phone);
  const email = at(map.email);
  const admitsRaw = at(map.admitsCount);
  const admits = parseInt(admitsRaw, 10);

  if (!name && !phone && !email) return null;

  const invitee: ParsedInvitee = {};
  if (name) invitee.name = name;
  if (phone) invitee.phone = phone;
  if (email) invitee.email = email;
  invitee.admitsCount = Number.isFinite(admits) && admits > 0 ? admits : 1;
  return invitee;
}

export interface ParseResult {
  invitees: ParsedInvitee[];
  skipped: number; // non-empty rows that produced no usable invitee
  hadHeader: boolean;
}

export function parseBulkInvitees(raw: string): ParseResult {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+$/, ""))
    .filter((l) => l.trim().length > 0);

  if (!lines.length) return { invitees: [], skipped: 0, hadHeader: false };

  const delimiter = detectDelimiter(lines);
  const rows = lines.map((l) => splitCells(l, delimiter));

  // Header detection on the first row.
  const headerCells = rows[0];
  const headerMap: Partial<Record<keyof ParsedInvitee, number>> = {};
  headerCells.forEach((cell, idx) => {
    const field = matchHeader(cell);
    if (field && headerMap[field] === undefined) headerMap[field] = idx;
  });
  const hadHeader = Object.keys(headerMap).length > 0;

  const dataRows = hadHeader ? rows.slice(1) : rows;

  // Always infer from content, then let explicit headers win. This fills in any
  // column an unrecognized header missed and handles header-less pastes.
  const inferred = inferColumns(dataRows);
  const map: Partial<Record<keyof ParsedInvitee, number>> = {
    ...inferred,
    ...headerMap,
  };

  const invitees: ParsedInvitee[] = [];
  let skipped = 0;
  for (const cells of dataRows) {
    const inv = toInvitee(cells, map);
    if (inv) invitees.push(inv);
    else skipped += 1;
  }

  return { invitees, skipped, hadHeader };
}
