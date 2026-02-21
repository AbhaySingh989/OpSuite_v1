'use client';

import { useState } from 'react';
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
  Text,
  Popover,
  Stepper,
  rem
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconPlus, IconCheck, IconClock } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { createPO } from '@/app/actions/po';
import { Database } from '@/types/database.types';

type PO = Database['public']['Tables']['purchase_orders']['Row'] & { customers: { name: string } | null };
type Customer = Database['public']['Tables']['customers']['Row'];

interface POListProps {
  initialPOs: PO[];
  initialCustomers: Customer[];
}

const STATUS_STEPS = ['draft', 'approved', 'completed'];

function StatusPipeline({ status }: { status: string }) {
  // Simple logic: if status is not in list, default to 0
  let activeStep = STATUS_STEPS.indexOf(status);
  if (activeStep === -1) activeStep = 0;

  return (
    <Stepper active={activeStep} orientation="vertical" size="xs" iconSize={22}>
      <Stepper.Step label="Draft" description="PO Created" icon={<IconClock size={12} />} />
      <Stepper.Step label="Approved" description="Validated" icon={<IconCheck size={12} />} />
      <Stepper.Step label="Completed" description="Fulfilled" icon={<IconCheck size={12} />} />
    </Stepper>
  );
}

function StatusBadge({ status }: { status: string }) {
  const [opened, { close, open }] = useDisclosure(false);

  let color = 'gray';
  if (status === 'approved') color = 'blue';
  if (status === 'completed') color = 'green';

  return (
    <Popover width={200} position="bottom" withArrow shadow="md" opened={opened}>
      <Popover.Target>
        <div onMouseEnter={open} onMouseLeave={close} style={{ display: 'inline-block' }}>
          <Badge
            color={color}
            variant="light"
            style={{ cursor: 'default' }}
          >
            {status.toUpperCase()}
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

export function POList({ initialPOs, initialCustomers }: POListProps) {
  const [pos, setPOs] = useState(initialPOs);
  const [customers] = useState<Customer[]>(initialCustomers);
  const [opened, { open, close }] = useDisclosure(false);
  const [search, setSearch] = useState('');

  const form = useForm({
    initialValues: {
      po_number: '',
      customer_id: '',
      order_date: new Date(),
    },
    validate: {
      po_number: (value) => (value ? null : 'PO Number is required'),
      customer_id: (value) => (value ? null : 'Customer is required'),
      order_date: (value) => (value ? null : 'Date is required'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
        const res = await createPO({
            po_number: values.po_number,
            customer_id: values.customer_id,
            order_date: values.order_date.toISOString().split('T')[0],
            status: 'draft'
        } as any);

        if (res.error) {
            notifications.show({ title: 'Error', message: res.error, color: 'red' });
        } else {
            notifications.show({ title: 'Success', message: 'PO created successfully', color: 'green' });
            close();
            // In a real app we'd optimistically update or revalidate.
            // Reloading to ensure state consistency for this MVP step.
            window.location.reload();
        }
    } catch (e: any) {
         notifications.show({ title: 'Error', message: e.message || 'An unexpected error occurred', color: 'red' });
    }
  };

  const filteredPOs = pos.filter((po) =>
    po.po_number.toLowerCase().includes(search.toLowerCase()) ||
    po.customers?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const rows = filteredPOs.map((po) => (
    <Table.Tr key={po.id}>
      <Table.Td>
        <Text fw={500}>{po.po_number}</Text>
      </Table.Td>
      <Table.Td>{po.customers?.name}</Table.Td>
      <Table.Td>{new Date(po.order_date || '').toLocaleDateString()}</Table.Td>
      <Table.Td>
        <StatusBadge status={po.status || 'draft'} />
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title order={2}>Purchase Orders</Title>
        <Button leftSection={<IconPlus size={18} />} onClick={open}>Create PO</Button>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
            <TextInput
                placeholder="Search by PO Number or Customer..."
                leftSection={<IconSearch size={16} stroke={1.5} />}
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                style={{ maxWidth: 400 }}
            />

            <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
                <Table.Tr>
                <Table.Th>PO Number</Table.Th>
                <Table.Th>Customer</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Status</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {rows.length > 0 ? rows : (
                    <Table.Tr>
                        <Table.Td colSpan={4}>
                            <Text ta="center" c="dimmed" py="md">No purchase orders found</Text>
                        </Table.Td>
                    </Table.Tr>
                )}
            </Table.Tbody>
            </Table>
        </Stack>
      </Card>

      <Modal opened={opened} onClose={close} title="Create Purchase Order" size="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
                label="PO Number"
                placeholder="e.g. PO-2024-001"
                required
                {...form.getInputProps('po_number')}
            />
            <Select
                label="Customer"
                placeholder="Select Customer"
                data={customers.map(c => ({ value: c.id, label: c.name }))}
                required
                {...form.getInputProps('customer_id')}
                searchable
            />
            <DateInput
                label="Order Date"
                placeholder="Pick date"
                required
                {...form.getInputProps('order_date')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={close}>Cancel</Button>
              <Button type="submit">Create PO</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
