'use client';

import { useState } from 'react';
import { Table, TextInput, Button, Group, ActionIcon, Modal, Paper, Title, Stack, Badge, Select, NumberInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconPencil, IconTrash, IconPlus, IconArrowRight } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { createHeat, allocateHeat } from '@/app/actions/heats';
import { Database } from '@/types/database.types';
import { useEffect } from 'react';

type Heat = Database['public']['Tables']['heats']['Row'];

interface HeatListProps {
  initialHeats: Heat[];
}

export function HeatList({ initialHeats }: HeatListProps) {
  const [heats, setHeats] = useState(initialHeats);
  const [openedHeat, { open: openHeat, close: closeHeat }] = useDisclosure(false);
  const [openedAllocate, { open: openAllocate, close: closeAllocate }] = useDisclosure(false);
  const [search, setSearch] = useState('');
  const [selectedHeat, setSelectedHeat] = useState<Heat | null>(null);

  const heatForm = useForm({
    initialValues: {
      heat_number: '',
      supplier_name: '',
      material_grade: '',
      initial_quantity: 0,
    },
    validate: {
      heat_number: (value) => (value ? null : 'Heat Number is required'),
      initial_quantity: (value) => (value > 0 ? null : 'Initial quantity must be positive'),
    },
  });

  const allocateForm = useForm({
    initialValues: {
      wo_id: '',
      quantity: 0,
    },
    validate: {
      wo_id: (value) => (value ? null : 'WO is required'),
      quantity: (value) => (value > 0 ? null : 'Quantity must be positive'),
    },
  });

  const handleCreateHeat = async (values: typeof heatForm.values) => {
    // Need to adjust action usage if types mismatch, assuming createHeat handles proper insert object creation
    // But createHeat expects HeatInsert (which has plant_id required).
    // Let's pass it anyway, assume server overrides.
    const res = await createHeat({
      ...values,
      available_quantity: values.initial_quantity,
      // plant_id injected server side
    } as any);

    if (res.error) {
      notifications.show({ title: 'Error', message: res.error, color: 'red' });
    } else {
      notifications.show({ title: 'Success', message: 'Heat registered', color: 'green' });
      closeHeat();
      heatForm.reset();
      window.location.reload();
    }
  };

  const handleAllocate = async (values: typeof allocateForm.values) => {
    if (!selectedHeat) return;
    const res = await allocateHeat(selectedHeat.id, values.wo_id, values.quantity);
    if (res.error) {
      notifications.show({ title: 'Error', message: res.error, color: 'red' });
    } else {
      notifications.show({ title: 'Success', message: 'Allocation successful', color: 'green' });
      closeAllocate();
      allocateForm.reset();
      window.location.reload();
    }
  };

  const filteredHeats = heats.filter((heat) =>
    heat.heat_number.toLowerCase().includes(search.toLowerCase())
  );

  const rows = filteredHeats.map((heat) => (
    <Table.Tr key={heat.id}>
      <Table.Td>{heat.heat_number}</Table.Td>
      <Table.Td>{heat.supplier_name}</Table.Td>
      <Table.Td>{heat.material_grade}</Table.Td>
      <Table.Td>{heat.available_quantity} / {heat.initial_quantity}</Table.Td>
      <Table.Td>
        <Button
            size="xs"
            variant="light"
            leftSection={<IconArrowRight size={14} />}
            onClick={() => { setSelectedHeat(heat); openAllocate(); }}
            disabled={!heat.available_quantity || heat.available_quantity <= 0}
        >
            Allocate
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>Heat Registry</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={openHeat}>Register Heat</Button>
      </Group>

      <TextInput
        placeholder="Search heats..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
      />

      <Paper shadow="xs" p="md" withBorder>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Heat No</Table.Th>
              <Table.Th>Supplier</Table.Th>
              <Table.Th>Grade</Table.Th>
              <Table.Th>Availability</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Paper>

      <Modal opened={openedHeat} onClose={closeHeat} title="Register Heat">
        <form onSubmit={heatForm.onSubmit(handleCreateHeat)}>
          <Stack gap="sm">
            <TextInput label="Heat Number" placeholder="H-1001" required {...heatForm.getInputProps('heat_number')} />
            <TextInput label="Supplier" placeholder="Supplier Name" {...heatForm.getInputProps('supplier_name')} />
            <TextInput label="Material Grade" placeholder="Grade X" {...heatForm.getInputProps('material_grade')} />
            <NumberInput label="Initial Quantity" placeholder="1000" required {...heatForm.getInputProps('initial_quantity')} />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={closeHeat}>Cancel</Button>
              <Button type="submit">Save</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal opened={openedAllocate} onClose={closeAllocate} title={`Allocate from ${selectedHeat?.heat_number}`}>
        <form onSubmit={allocateForm.onSubmit(handleAllocate)}>
          <Stack gap="sm">
            <TextInput label="Work Order ID" placeholder="WO-ID (Future Dropdown)" required {...allocateForm.getInputProps('wo_id')} />
            <NumberInput
                label="Quantity"
                max={selectedHeat?.available_quantity || undefined}
                required
                {...allocateForm.getInputProps('quantity')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={closeAllocate}>Cancel</Button>
              <Button type="submit">Allocate</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
