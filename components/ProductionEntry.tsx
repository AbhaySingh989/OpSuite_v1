'use client';

import {
  Table,
  Button,
  Group,
  Card,
  Title,
  Stack,
  Text,
} from '@mantine/core';
import { IconDeviceFloppy, IconRefresh } from '@tabler/icons-react';
import { useProductionEntry, WO } from '@/hooks/useProductionEntry';
import { ProductionEntryRow } from '@/components/ProductionEntryRow';

interface ProductionEntryProps {
  initialWOs: WO[];
}

export function ProductionEntry({ initialWOs }: ProductionEntryProps) {
  const {
    wos,
    loading,
    getEditState,
    handleChange,
    toggleSelect,
    handleSave,
  } = useProductionEntry(initialWOs);

  const rows = wos.map((wo) => {
    return (
      <ProductionEntryRow
        key={wo.id}
        wo={wo}
        editState={getEditState(wo.id)}
        onToggleSelect={toggleSelect}
        onChange={handleChange}
      />
    );
  });

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title order={2}>Production Entry</Title>
        <Group>
            <Button
                variant="outline"
                leftSection={<IconRefresh size={18} />}
                onClick={() => window.location.reload()}
            >
                Refresh
            </Button>
            <Button
                leftSection={<IconDeviceFloppy size={18} />}
                onClick={handleSave}
                loading={loading}
            >
                Update Selected
            </Button>
        </Group>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
                <Table.Tr>
                    <Table.Th w={40}></Table.Th>
                    <Table.Th>WO / PO</Table.Th>
                    <Table.Th>Item</Table.Th>
                    <Table.Th>Target Qty</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Produced</Table.Th>
                    <Table.Th>Rejected</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {rows.length > 0 ? rows : (
                    <Table.Tr>
                        <Table.Td colSpan={7}>
                            <Text ta="center" c="dimmed" py="md">No active work orders found</Text>
                        </Table.Td>
                    </Table.Tr>
                )}
            </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  );
}
