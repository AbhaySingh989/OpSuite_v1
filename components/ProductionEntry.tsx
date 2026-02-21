'use client';

import { useState } from 'react';
import {
  Table,
  NumberInput,
  Button,
  Group,
  Card,
  Title,
  Stack,
  Badge,
  Text,
  Checkbox
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy, IconRefresh } from '@tabler/icons-react';
import { updateProduction, ProductionUpdate } from '@/app/actions/production';
import { Database } from '@/types/database.types';

type WO = Database['public']['Tables']['work_orders']['Row'] & {
    purchase_orders: { po_number: string } | null,
    items: { item_code: string, description: string | null } | null
};

interface ProductionEntryProps {
  initialWOs: WO[];
}

export function ProductionEntry({ initialWOs }: ProductionEntryProps) {
  const [wos, setWOs] = useState(initialWOs);
  // Store edits: key is wo_id
  const [edits, setEdits] = useState<Record<string, { produced: number, rejected: number, selected: boolean }>>({});
  const [loading, setLoading] = useState(false);

  const getEditState = (id: string) => {
    return edits[id] || {
        produced: (wos.find(w => w.id === id) as any).produced_quantity || 0,
        rejected: (wos.find(w => w.id === id) as any).rejected_quantity || 0,
        selected: false
    };
  };

  const handleChange = (id: string, field: 'produced' | 'rejected', value: number | string) => {
    const val = typeof value === 'number' ? value : 0;
    const current = getEditState(id);

    setEdits({
      ...edits,
      [id]: {
        ...current,
        [field]: val,
        selected: true // Auto-select if modified
      }
    });
  };

  const toggleSelect = (id: string) => {
    const current = getEditState(id);
    setEdits({
      ...edits,
      [id]: {
        ...current,
        selected: !current.selected
      }
    });
  };

  const handleSave = async () => {
    const updates: ProductionUpdate[] = [];

    // Iterate over edits and only pick selected ones
    Object.keys(edits).forEach(id => {
      const edit = edits[id];
      if (edit.selected) {
        // Find original WO to check planned qty vs produced
        const wo = wos.find(w => w.id === id);
        if (!wo) return;

        // Logic: if produced >= quantity, status = lab_pending
        // else status = in_production

        const totalProduced = edit.produced;
        let newStatus = wo.status;

        if (totalProduced >= (wo.quantity || 0)) {
            newStatus = 'lab_pending';
        } else if (totalProduced > 0 && wo.status === 'draft') {
            newStatus = 'in_production';
        }
        // If already 'in_production', keep it unless finished.

        updates.push({
          wo_id: id,
          produced_qty: edit.produced,
          rejection_qty: edit.rejected,
          status: newStatus
        });
      }
    });

    if (updates.length === 0) {
        notifications.show({ title: 'Info', message: 'No records selected for update', color: 'blue' });
        return;
    }

    setLoading(true);
    try {
        const res = await updateProduction(updates);
        if (res.error) {
            notifications.show({ title: 'Error', message: 'Failed to update production records', color: 'red' });
        } else {
            notifications.show({ title: 'Success', message: 'Production updated successfully', color: 'green' });
            window.location.reload();
        }
    } catch (e) {
        notifications.show({ title: 'Error', message: 'An unexpected error occurred', color: 'red' });
    } finally {
        setLoading(false);
    }
  };

  const rows = wos.map((wo) => {
    const edit = getEditState(wo.id);

    return (
      <Table.Tr key={wo.id} bg={edit.selected ? 'var(--mantine-color-blue-light)' : undefined}>
        <Table.Td>
            <Checkbox
                checked={edit.selected}
                onChange={() => toggleSelect(wo.id)}
                aria-label="Select row"
            />
        </Table.Td>
        <Table.Td>
            <Text fw={500}>{wo.wo_number}</Text>
            <Text size="xs" c="dimmed">{wo.purchase_orders?.po_number}</Text>
        </Table.Td>
        <Table.Td>
            <Text>{wo.items?.item_code}</Text>
            <Text size="xs" c="dimmed">{wo.items?.description}</Text>
        </Table.Td>
        <Table.Td>{wo.quantity}</Table.Td>
        <Table.Td>
            <Badge color={wo.status === 'in_production' ? 'blue' : 'gray'}>{wo.status}</Badge>
        </Table.Td>
        <Table.Td>
            <NumberInput
                value={edit.produced}
                onChange={(val) => handleChange(wo.id, 'produced', val)}
                min={0}
                style={{ maxWidth: 100 }}
            />
        </Table.Td>
        <Table.Td>
            <NumberInput
                value={edit.rejected}
                onChange={(val) => handleChange(wo.id, 'rejected', val)}
                min={0}
                style={{ maxWidth: 100 }}
            />
        </Table.Td>
      </Table.Tr>
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
