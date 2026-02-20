'use server';

import { createClient } from '@/utils/supabase/server';
import { Table, Paper, Title, Stack, Badge, Text } from '@mantine/core';

export default async function MovementsPage() {
  const supabase = createClient();
  const { data: movements } = await supabase
    .from('inventory_movements')
    .select('*, heats(heat_number), work_orders(wo_number)')
    .order('movement_date', { ascending: false });

  const rows = (movements || []).map((m) => (
    <Table.Tr key={m.id}>
      <Table.Td>{new Date(m.movement_date).toLocaleDateString()}</Table.Td>
      <Table.Td>{m.heats?.heat_number}</Table.Td>
      <Table.Td>{m.work_orders?.wo_number || '-'}</Table.Td>
      <Table.Td>
        <Badge color={m.movement_type === 'allocation' ? 'orange' : 'blue'}>{m.movement_type}</Badge>
      </Table.Td>
      <Table.Td>
        <Text c={m.quantity < 0 ? 'red' : 'green'}>{m.quantity}</Text>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Title order={2}>Inventory Movements</Title>
      <Paper shadow="xs" p="md" withBorder>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Heat</Table.Th>
              <Table.Th>WO</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Quantity</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
