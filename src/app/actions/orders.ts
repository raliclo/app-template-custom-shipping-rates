// 'use server';
/**
 *  if your deployment provider supports it, you can uncomment the line above to use server actions
 *  This will decrease the bundle size and improve performance by moving the server code to the server.
 */
import { createSdk } from '@/app/utils/wix-sdk';

import { OrderSummary } from '@/app/types/order';
import { isTestingToken } from '@/app/utils/access-token';

export async function getLastOrders({ accessToken }: { accessToken: string }): Promise<OrderSummary[]> {
  const sdk = createSdk(accessToken);
  return (
    isTestingToken(accessToken)
      ? (await import('@/app/utils/mocks-server')).getTestOrders()
      : sdk.orders.searchOrders({
        cursorPaging: {
          limit: 3,
        },
      })
  )
    .then((res) => {
      return (
        res.orders?.map(
          (order) =>
            ({
              id: order.number ?? '',
              createdDate: order?._createdDate ?? '',
              totalPrice: order?.priceSummary?.total?.amount ?? 0,
              currency: order?.currency ?? 'USD',
            }) as OrderSummary,
        ) ?? []
      );
    })
    .catch((e) => {
      const errorCode = e?.details?.applicationError?.code;
      if (errorCode === 'READ_ORDER_FORBIDDEN') {
        console.error(
          'Permission denied: Your app does not have permission to read orders. ' +
          'Please ensure "ecom.orders" scope is granted in your Wix App Dashboard settings.',
          e
        );
      } else {
        console.error('Failed to fetch orders: ', e);
      }
      return [];
    });
}
