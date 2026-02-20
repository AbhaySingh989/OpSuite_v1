'use client';

import { useState } from 'react';
import { Table, Button, Paper, Title, Stack, Badge, NumberInput, Group, Modal, Text, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { submitLabResult, overrideParam } from '@/app/actions/lab';
import { Database } from '@/types/database.types';

type LabResult = Database['public']['Tables']['lab_results']['Row'] & {
  lab_result_parameters: (Database['public']['Tables']['lab_result_parameters']['Row'] & {
    standard_parameters: Database['public']['Tables']['standard_parameters']['Row'] | null
  })[]
};

type WO = Database['public']['Tables']['work_orders']['Row'] & { items: { item_code: string } | null };

export function LabEntry({ result, wo }: { result: LabResult, wo: WO }) {
  const [values, setValues] = useState<{ [key: string]: number }>({});
  const [openedOverride, setOpenedOverride] = useState(false);
  const [selectedParam, setSelectedParam] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState('');

  const handleSave = async () => {
    const updates = Object.entries(values).map(([paramId, value]) => ({ paramId, value }));
    const res = await submitLabResult(result.id, updates);
    if (res.error) {
      notifications.show({ title: 'Error', message: res.error, color: 'red' });
    } else {
      notifications.show({ title: 'Success', message: 'Results saved', color: 'green' });
      // Refresh page
      window.location.reload();
    }
  };

  const handleOverride = async () => {
    if (!selectedParam) return;
    const res = await overrideParam(selectedParam, overrideReason);
    if (res.error) {
      notifications.show({ title: 'Error', message: res.error, color: 'red' });
    } else {
      notifications.show({ title: 'Success', message: 'Override applied', color: 'green' });
      setOpenedOverride(false);
      window.location.reload();
    }
  };

  const rows = result.lab_result_parameters.map((param) => (
    <Table.Tr key={param.id} bg={param.validation_status === 'failed' ? 'var(--mantine-color-red-0)' : undefined}>
      <Table.Td>{param.standard_parameters?.parameter_name}</Table.Td>
      <Table.Td>{param.standard_parameters?.min_value} - {param.standard_parameters?.max_value}</Table.Td>
      <Table.Td>
        <NumberInput
            value={values[param.id] ?? param.observed_value}
            onChange={(v) => setValues({ ...values, [param.id]: Number(v) })}
        />
      </Table.Td>
      <Table.Td>
        <Badge
            color={
                param.validation_status === 'passed' ? 'green' :
                param.validation_status === 'failed' ? 'red' :
                param.validation_status === 'override' ? 'orange' : 'gray'
            }
        >
            {param.validation_status}
        </Badge>
      </Table.Td>
      <Table.Td>
        {param.validation_status === 'failed' && (
            <Button size="xs" color="orange" onClick={() => { setSelectedParam(param.id); setOpenedOverride(true); }}>
                Override
            </Button>
        )}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>Lab Entry: {wo.wo_number}</Title>
        <Button onClick={handleSave}>Submit Results</Button>
      </Group>
      <Text>Item: {wo.items?.item_code}</Text>

      <Paper shadow="xs" p="md" withBorder>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Parameter</Table.Th>
              <Table.Th>Range</Table.Th>
              <Table.Th>Observed</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Paper>

      <Modal opened={openedOverride} onClose={() => setOpenedOverride(false)} title="Override Parameter">
        <Stack>
            <Textarea
                label="Reason"
                placeholder="Explain why this is accepted..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.currentTarget.value)}
            />
            <Button color="orange" onClick={handleOverride}>Confirm Override</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
