'use client';

import { Table, Button, Paper, Title, Stack, Badge, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { issueTC } from '@/app/actions/tc';
import { Database } from '@/types/database.types';

type TC = Database['public']['Tables']['test_certificates']['Row'] & {
  work_orders: { wo_number: string, customers: { name: string } | null } | null
};

export function TCDashboard({ initialTCs }: { initialTCs: TC[] }) {

  const handleIssue = async (id: string) => {
    const res = await issueTC(id);
    if (res.error) {
      notifications.show({ title: 'Error', message: res.error, color: 'red' });
    } else {
      notifications.show({ title: 'Success', message: 'TC Issued', color: 'green' });
      window.location.reload();
    }
  };

  const rows = initialTCs.map((tc) => (
    <Table.Tr key={tc.id}>
      <Table.Td>{tc.work_orders?.wo_number}</Table.Td>
      <Table.Td>{tc.work_orders?.customers?.name}</Table.Td>
      <Table.Td>v{tc.current_version}</Table.Td>
      <Table.Td>
        <Badge color={tc.status === 'issued' ? 'green' : 'blue'}>{tc.status}</Badge>
      </Table.Td>
      <Table.Td>
        {tc.status !== 'issued' && (
            <Button size="xs" color="green" onClick={() => handleIssue(tc.id)}>
                Issue TC
            </Button>
        )}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Title order={2}>Test Certificates</Title>
      <Paper shadow="xs" p="md" withBorder>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>WO Number</Table.Th>
              <Table.Th>Customer</Table.Th>
              <Table.Th>Version</Table.Th>
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
