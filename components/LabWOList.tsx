'use client';

import { Table, Button, Paper, Title, Stack, Badge } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { Database } from '@/types/database.types';

type WO = Database['public']['Tables']['work_orders']['Row'] & { items: { item_code: string } | null };

export function LabWOList({ initialWOs }: { initialWOs: WO[] }) {
  const router = useRouter();

  const rows = initialWOs.map((wo) => (
    <Table.Tr key={wo.id}>
      <Table.Td>{wo.wo_number}</Table.Td>
      <Table.Td>{wo.items?.item_code}</Table.Td>
      <Table.Td>
        <Badge color="blue">{wo.status}</Badge>
      </Table.Td>
      <Table.Td>
        <Button size="xs" onClick={() => router.push(`/lab-results/${wo.id}`)}>
          Enter Results
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Title order={2}>Pending Lab Results</Title>
      <Paper shadow="xs" p="md" withBorder>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>WO Number</Table.Th>
              <Table.Th>Item</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
