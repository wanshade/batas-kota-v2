/**
 * Format number as Indonesian Rupiah
 * @param amount - Amount in numbers
 * @returns Formatted Indonesian Rupiah string
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Simple rupiah formatting for display
 * @param amount - Amount in numbers
 * @returns Formatted string with Rp prefix
 */
export function formatRupiahSimple(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`
}