/**
 * csv-export.ts — Generic CSV export utility for AgroField (F-017)
 *
 * Features:
 * - UTF-8 BOM for Excel compatibility
 * - Semicolon separator for es-AR locale
 * - Proper quoting and internal quote escaping
 * - No external dependencies
 */

interface CsvColumn<T> {
  header: string
  accessor: (row: T) => string | number | null | undefined
}

/**
 * Wraps a value in double quotes and escapes any internal double quotes.
 * Empty/null/undefined values produce an empty quoted cell.
 */
function escapeCsvValue(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return ''
  const str = String(v)
  // Wrap in double quotes, escape internal quotes by doubling them
  return `"${str.replace(/"/g, '""')}"`
}

/**
 * Converts an array of objects to a CSV string.
 * - Uses UTF-8 BOM (\uFEFF) so Excel opens it with correct encoding
 * - Uses semicolon (;) as separator, standard for es-AR locale
 */
export function toCsvString<T>(data: T[], columns: CsvColumn<T>[]): string {
  const BOM = '\uFEFF'  // UTF-8 BOM for Excel
  const SEP = ';'       // Semicolon for es-AR locale
  const header = columns.map(c => escapeCsvValue(c.header)).join(SEP)
  const rows = data.map(row =>
    columns.map(c => escapeCsvValue(c.accessor(row))).join(SEP)
  )
  return BOM + [header, ...rows].join('\n')
}

/**
 * Triggers a browser download of a CSV string as a file.
 * Creates a temporary anchor element, clicks it, then revokes the object URL.
 */
export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Builds a filename with the format: prefix_YYYYMMDD.csv
 * Uses the current local date so filenames are unique per day.
 */
export function getCsvFilename(prefix: string): string {
  return `${prefix}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.csv`
}
