'use client';

import { useState } from 'react';
import { Table, Button, Paper, Title, Stack, Badge, Group, Select, Modal, Anchor } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { generateTC, issueTC } from '@/app/actions/tc';
import { useRouter } from 'next/navigation';

type TC = {
  id: string;
  status: string;
  current_version: number;
  wo_number: string;
  customer_name: string;
  pdf_url: string | null;
};

type WOOption = {
  id: string;
  wo_number: string;
  status: string;
};

export function TCDashboard({ initialTCs, availableWOs }: { initialTCs: TC[]; availableWOs: WOOption[] }) {
  const router = useRouter();
  const [selectedWO, setSelectedWO] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const handleGenerate = async () => {
    if (!selectedWO) {
      notifications.show({ title: 'Error', message: 'Select a work order first', color: 'red' });
      return;
    }

    const res = await generateTC(selectedWO);
    if (res.error) {
      notifications.show({ title: 'Error', message: res.error, color: 'red' });
      return;
    }

    notifications.show({ title: 'Success', message: 'Test Certificate generated', color: 'green' });
    close();
    setSelectedWO(null);
    router.refresh();
  };

  const handleIssue = async (id: string) => {
    const res = await issueTC(id);
    if (res.error) {
      notifications.show({ title: 'Error', message: res.error, color: 'red' });
    } else {
      notifications.show({ title: 'Success', message: 'TC Issued', color: 'green' });
      router.refresh();
    }
  };

  const rows = initialTCs.map((tc) => (
    <Table.Tr key={tc.id}>
      <Table.Td>{tc.wo_number}</Table.Td>
      <Table.Td>{tc.customer_name}</Table.Td>
      <Table.Td>v{tc.current_version}</Table.Td>
      <Table.Td>
        {tc.pdf_url ? (
          <Anchor href={tc.pdf_url} target="_blank" rel="noreferrer">
            Preview
          </Anchor>
        ) : (
          '-'
        )}
      </Table.Td>
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
      <Group justify="space-between">
        <Title order={2}>Test Certificates</Title>
        <Button onClick={open}>Generate TC</Button>
      </Group>

      <Paper shadow="xs" p="md" withBorder>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>WO Number</Table.Th>
              <Table.Th>Customer</Table.Th>
              <Table.Th>Version</Table.Th>
              <Table.Th>PDF</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Paper>

      <Modal opened={opened} onClose={close} title="Generate Test Certificate">
        <Stack>
          <Select
            label="Work Order"
            placeholder="Select WO"
            searchable
            data={availableWOs.map((wo) => ({ value: wo.id, label: `${wo.wo_number} (${wo.status})` }))}
            value={selectedWO}
            onChange={setSelectedWO}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={close}>
              Cancel
            </Button>
            <Button onClick={handleGenerate}>Generate</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
