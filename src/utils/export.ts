/**
 * Export utilities - CSV/Excel export helpers
 */

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: any[][], headers?: string[]): string {
  const csvRows: string[] = [];

  // Add headers if provided
  if (headers && headers.length > 0) {
    csvRows.push(headers.map(h => `"${h}"`).join(','));
  }

  // Add data rows
  data.forEach(row => {
    const csvRow = row.map(cell => {
      // Handle null/undefined
      if (cell === null || cell === undefined) {
        return '""';
      }
      // Convert to string and escape quotes
      const cellStr = String(cell).replace(/"/g, '""');
      return `"${cellStr}"`;
    });
    csvRows.push(csvRow.join(','));
  });

  return csvRows.join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download Excel file (as CSV with .xlsx extension - simple approach)
 * For full Excel support, use a library like xlsx or exceljs
 */
export function downloadExcel(data: any[][], filename: string, headers?: string[]): void {
  const csvContent = convertToCSV(data, headers);
  // Use CSV format but with .xlsx extension - Excel will still open it
  // For better compatibility, consider using xlsx library
  const blob = new Blob(['\ufeff' + csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

