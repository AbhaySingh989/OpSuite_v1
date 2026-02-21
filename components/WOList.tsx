'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TextInput,
  Button,
  Group,
  Modal,
  Card,
  Title,
  Stack,
  Badge,
  Select,
  NumberInput,
  Text,
  Popover,
  Stepper
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconPlus, IconCheck, IconClock, IconFlask, IconHammer } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { createWO } from '@/app/actions/wo';
import { getPOs } from '@/app/actions/po';
import { getItems } from '@/app/actions/items';
import { Database } from '@/types/database.types';

type WO = Database['public']['Tables']['work_orders']['Row'] & {
    purchase_orders: { po_number: string } | null,
    items: { item_code: string } | null
};
type PO = Database['public']['Tables']['purchase_orders']['Row'];
type Item = Database['public']['Tables']['items']['Row'];

interface WOListProps {
  initialWOs: WO[];
}

const STATUS_STEPS = ['draft', 'in_production', 'lab_pending', 'completed'];

function StatusPipeline({ status }: { status: string }) {
  let activeStep = STATUS_STEPS.indexOf(status);
  // If status is passed or issued, treat as completed for this simple view
  if (status === 'passed' || status === 'issued') activeStep = 3;
  if (activeStep === -1) activeStep = 0;

  return (
    <Stepper active={activeStep} orientation="vertical" size="xs" iconSize={22}>
      <Stepper.Step label="Draft" description="Planned" icon={<IconClock size={12} />} />
      <Stepper.Step label="Production" description="In Progress" icon={<IconHammer size={12} />} />
      <Stepper.Step label="QC Pending" description="Lab Testing" icon={<IconFlask size={12} />} />
      <Stepper.Step label="Completed" description="Finished" icon={<IconCheck size={12} />} />
    </Stepper>
  );
}

function StatusBadge({ status }: { status: string }) {
  const [opened, { close, open }] = useDisclosure(false);

  let color = 'gray';
  if (status === 'in_production') color = 'blue';
  if (status === 'lab_pending') color = 'orange';
  if (status === 'passed' || status === 'issued' || status === 'completed') color = 'green';
  if (status === 'failed') color = 'red';

  return (
    <Popover width={200} position="bottom" withArrow shadow="md" opened={opened}>
      <Popover.Target>
        <div onMouseEnter={open} onMouseLeave={close} style={{ display: 'inline-block' }}>
          <Badge
            color={color}
            variant="light"
            style={{ cursor: 'default' }}
          >
            {status.toUpperCase().replace('_', ' ')}
          </Badge>
        </div>
      </Popover.Target>
      <Popover.Dropdown style={{ pointerEvents: 'none' }}>
        <Text size="xs" fw={700} mb="xs">Workflow Progress</Text>
        <StatusPipeline status={status} />
      </Popover.Dropdown>
    </Popover>
  );
}

export function WOList({ initialWOs }: WOListProps) {
  const [wos, setWOs] = useState(initialWOs);
  const [pos, setPOs] = useState<PO[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [search, setSearch] = useState('');

  const form = useForm({
    initialValues: {
      wo_number: '',
      po_id: '',
      item_id: '',
      quantity: 0,
    },
    validate: {
      wo_number: (value) => (value ? null : 'WO Number is required'),
      po_id: (value) => (value ? null : 'PO is required'),
      item_id: (value) => (value ? null : 'Item is required'),
      quantity: (value) => (value > 0 ? null : 'Quantity must be positive'),
    },
  });

  useEffect(() => {
    getPOs().then(setPOs);
    getItems().then(setItems);
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    try {
        const res = await createWO({
            wo_number: values.wo_number,
            po_id: values.po_id,
            item_id: values.item_id,
            quantity: values.quantity,
            status: 'draft'
        } as any);

        if (res.error) {
            notifications.show({ title: 'Error', message: res.error, color: 'red' });
        } else {
            notifications.show({ title: 'Success', message: 'WO created successfully', color: 'green' });
            close();
            window.location.reload();
        }
    } catch (e: any) {
        notifications.show({ title: 'Error', message: e.message || 'An unexpected error occurred', color: 'red' });
    }
  };

  const filteredWOs = wos.filter((wo) =>
    wo.wo_number.toLowerCase().includes(search.toLowerCase()) ||
    wo.purchase_orders?.po_number?.toLowerCase().includes(search.toLowerCase())
  );

  const rows = filteredWOs.map((wo) => (
    <Table.Tr key={wo.id}>
      <Table.Td>
        <Text fw={500}>{wo.wo_number}</Text>
      </Table.Td>
      <Table.Td>{wo.purchase_orders?.po_number}</Table.Td>
      <Table.Td>{wo.items?.item_code}</Table.Td>
      <Table.Td>{wo.quantity}</Table.Td>
      <Table.Td>
        <StatusBadge status={wo.status || 'draft'} />
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title order={2}>Work Orders</Title>
        <Button leftSection={<IconPlus size={18} />} onClick={open}>Create WO</Button>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
            <TextInput
                placeholder="Search by WO Number or PO Number..."
                leftSection={<IconSearch size={16} stroke={1.5} />}
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                style={{ maxWidth: 400 }}
            />

            <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
                <Table.Tr>
                <Table.Th>WO Number</Table.Th>
                <Table.Th>PO Number</Table.Th>
                <Table.Th>Item</Table.Th>
                <Table.Th>Quantity</Table.Th>
                <Table.Th>Status</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {rows.length > 0 ? rows : (
                    <Table.Tr>
                        <Table.Td colSpan={5}>
                            <Text ta="center" c="dimmed" py="md">No work orders found</Text>
                        </Table.Td>
                    </Table.Tr>
                )}
            </Table.Tbody>
            </Table>
        </Stack>
      </Card>

      <Modal opened={opened} onClose={close} title="Create Work Order" size="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
                label="WO Number"
                placeholder="e.g. WO-2024-001"
                required
                {...form.getInputProps('wo_number')}
            />
            <Select
                label="Select PO"
                placeholder="Purchase Order"
                data={pos.map(p => ({ value: p.id, label: p.po_number }))}
                required
                {...form.getInputProps('po_id')}
                searchable
            />
            <Select
                label="Select Item"
                placeholder="Item Code"
                data={items.map(i => ({ value: i.id, label: i.item_code }))}
                required
                {...form.getInputProps('item_id')}
                searchable
            />
            <NumberInput
                label="Quantity"
                required
                min={1}
                {...form.getInputProps('quantity')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={close}>Cancel</Button>
              <Button type="submit">Create WO</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
