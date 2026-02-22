import { useFinanceAlerts } from './use-finance-alerts'

/**
 * Returns the number of active (non-dismissed) finance alerts.
 * Used by the nav badge in AppLayout to show a count without subscribing
 * to the full finance alerts hook.
 */
export function useFinanceAlertCount(): number {
  const alerts = useFinanceAlerts()
  return alerts.length
}
