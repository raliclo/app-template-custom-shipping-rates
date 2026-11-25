'use client';
import { Box, Breadcrumbs, Button, Cell, Layout, Loader, Page } from '@wix/design-system';
import { useSDK } from '@/app/utils/wix-sdk.client-only';
import { useCallback, useState } from 'react';
import { ActivationDetailsCard } from '@/app/dashboard/parts/ActivationDetailsCard';
import { ShippingDeliveryMethodForm } from '@/app/dashboard/parts/ShippingDeliveryMethodForm';
import { ShippingAppData, ShippingCosts, ShippingUnitOfMeasure } from '@/app/types/app-data.model';
import { ShippingMethodSummary } from '@/app/dashboard/parts/ShippingMethodSummary';
import { WixPageId } from '@/app/utils/navigation.const';
import { useSetShippingAppData, useShippingAppData } from '@/app/client-hooks/app-data';
import testIds from '@/app/utils/test-ids';

export const ShippingRatesPageContent = () => {
  const {
    dashboard: { showToast, navigate },
  } = useSDK();
  const persistShippingAppData = useSetShippingAppData();
  const { data: persistedShippingAppData, isLoading: isLoadingAppData } = useShippingAppData();
  const [draftShippingAppData, setDraftShippingAppData] = useState<ShippingAppData | undefined>(undefined);
  const currentShippingAppData = draftShippingAppData ?? persistedShippingAppData;

  const [loading, setLoading] = useState(false);
  const onSave = useCallback(() => {
    if (!currentShippingAppData || loading) {
      return;
    }
    setLoading(true);
    persistShippingAppData(currentShippingAppData)
      .then(() => {
        setDraftShippingAppData(undefined);
        showToast?.({
          message: 'Shipping rates saved successfully.',
          type: 'success',
        });
      })
      .catch(() => {
        showToast?.({
          message: 'Failed to save shipping rates.',
          type: 'error',
        });
      })
      .finally(() => setLoading(false));
  }, [persistShippingAppData, currentShippingAppData, loading, showToast]);
  const setUomForMethod = useCallback(
    (code: string) => (type: ShippingUnitOfMeasure) => {
      setDraftShippingAppData((prev) => {
        const base = prev ?? persistedShippingAppData;
        return base
          ? {
              ...base,
              shippingMethods: base.shippingMethods.map((m) => (m.code === code ? { ...m, unitOfMeasure: type } : m)),
            }
          : base;
      });
    },
    [persistedShippingAppData],
  );
  const setCostsForMethod = useCallback(
    (code: string) => (costs: ShippingCosts) => {
      setDraftShippingAppData((prev) => {
        const base = prev ?? persistedShippingAppData;
        return base
          ? {
              ...base,
              shippingMethods: base.shippingMethods.map((m) => (m.code === code ? { ...m, costs } : m)),
            }
          : base;
      });
    },
    [persistedShippingAppData],
  );
  const actionsBar = (
    <Box gap='SP2'>
      <Button
        skin='standard'
        priority='secondary'
        disabled={loading}
        onClick={() => setDraftShippingAppData(undefined)}
      >
        Cancel
      </Button>
      <Button disabled={loading || !currentShippingAppData} onClick={onSave}>
        {loading ? <Loader size='tiny' /> : 'Save'}
      </Button>
    </Box>
  );
  return (
    <Page height='100vh' dataHook={testIds.DASHBOARD.WRAPPER}>
      <Page.Header
        actionsBar={actionsBar}
        breadcrumbs={
          <Breadcrumbs
            activeId='shipping-app-page'
            items={[
              { id: WixPageId.MANAGE_APPS, value: 'Apps' },
              { id: 'shipping-app-page', value: 'Shipping Rate App', disabled: true },
            ]}
            onClick={({ id }) => navigate?.(id as string)}
          />
        }
        title='Shipping Rate App'
        subtitle='Customize shipping fees based on item quantity, weight, and delivery speed, ensuring a flexible and cost-effective solution for your business.'
      />
      <Page.Content>
        <Layout>
          <Cell span={8}>
            {isLoadingAppData ? (
              <Layout cols={1} alignItems='center' justifyItems='center'>
                <Cell>
                  <Box width='100%' height='20vh' verticalAlign='middle'>
                    <Loader size='large' />
                  </Box>
                </Cell>
              </Layout>
            ) : (
              <Layout>
                {currentShippingAppData?.shippingMethods.map((method, index) => (
                  <Cell key={method.code}>
                    <ShippingDeliveryMethodForm
                      expandByDefault={index === 0}
                      title={method.title}
                      unitOfMeasure={method.unitOfMeasure}
                      onUnitOfMeasureSelected={setUomForMethod(method.code)}
                      shippingCosts={method.costs}
                      onShippingCostsChanged={setCostsForMethod(method.code)}
                      methodType={method.type}
                    />
                  </Cell>
                ))}
                <Cell>
                  <ActivationDetailsCard />
                </Cell>
              </Layout>
            )}
          </Cell>
          <Cell span={4}>
            <Page.Sticky>
              <ShippingMethodSummary />
            </Page.Sticky>
          </Cell>
        </Layout>
      </Page.Content>
    </Page>
  );
};
