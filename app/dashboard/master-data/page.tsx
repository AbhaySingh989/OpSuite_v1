'use server';

import { Card, Tabs, Text, Title } from '@mantine/core';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { CustomerList } from '@/components/CustomerList';
import { ItemList } from '@/components/ItemList';
import { StandardList } from '@/components/StandardList';

export default async function MasterDataPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [{ data: customers, error: customersError }, { data: items, error: itemsError }, { data: standards, error: standardsError }] =
    await Promise.all([
      supabase.from('customers').select('*').order('created_at', { ascending: false }),
      supabase.from('items').select('*').order('created_at', { ascending: false }),
      supabase.from('standards').select('*, standard_parameters(*)').order('created_at', { ascending: false }),
    ]);

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
          {customersError ? <Text c="red">Failed to load customers: {customersError.message}</Text> : <CustomerList initialCustomers={customers || []} />}
        </Tabs.Panel>

        <Tabs.Panel value="items" pt="md">
          {itemsError ? <Text c="red">Failed to load items: {itemsError.message}</Text> : <ItemList initialItems={items || []} />}
        </Tabs.Panel>

        <Tabs.Panel value="standards" pt="md">
          {standardsError ? (
            <Text c="red">Failed to load standards: {standardsError.message}</Text>
          ) : (
            <StandardList initialStandards={(standards as any) || []} />
          )}
        </Tabs.Panel>
      </Tabs>
    </Card>
  );
}
