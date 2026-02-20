'use client';

import { Card, Tabs, Text, Title } from '@mantine/core';
import { CustomerList } from '@/components/CustomerList';
import { ItemList } from '@/components/ItemList';
import { StandardList } from '@/components/StandardList';
import { Database } from '@/types/database.types';

type Customer = Database['public']['Tables']['customers']['Row'];
type Item = Database['public']['Tables']['items']['Row'];
type StandardWithParams = Database['public']['Tables']['standards']['Row'] & {
  standard_parameters: Database['public']['Tables']['standard_parameters']['Row'][];
};

export function MasterDataTabs({
  customers,
  items,
  standards,
  customersError,
  itemsError,
  standardsError,
}: {
  customers: Customer[];
  items: Item[];
  standards: StandardWithParams[];
  customersError: string | null;
  itemsError: string | null;
  standardsError: string | null;
}) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Title order={2} mb="md">
        Master Data
      </Title>
      <Tabs defaultValue="customers">
        <Tabs.List>
          <Tabs.Tab value="customers">Customers</Tabs.Tab>
          <Tabs.Tab value="items">Items</Tabs.Tab>
          <Tabs.Tab value="standards">Standards</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="customers" pt="md">
          {customersError ? <Text c="red">Failed to load customers: {customersError}</Text> : <CustomerList initialCustomers={customers} />}
        </Tabs.Panel>

        <Tabs.Panel value="items" pt="md">
          {itemsError ? <Text c="red">Failed to load items: {itemsError}</Text> : <ItemList initialItems={items} />}
        </Tabs.Panel>

        <Tabs.Panel value="standards" pt="md">
          {standardsError ? <Text c="red">Failed to load standards: {standardsError}</Text> : <StandardList initialStandards={standards} />}
        </Tabs.Panel>
      </Tabs>
    </Card>
  );
}
