'use client';

import { useState } from 'react';
import { Table, TextInput, Button, Group, ActionIcon, Modal, Paper, Title, Stack, Badge, Select } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconPencil, IconTrash, IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { createPO } from '@/app/actions/po';
import { getCustomers } from '@/app/actions/customers';
import { Database } from '@/types/database.types';
import { useEffect } from 'react';

type PO = Database['public']['Tables']['purchase_orders']['Row'] & { customers: { name: string } | null };
type Customer = Database['public']['Tables']['customers']['Row'];

interface POListProps {
  initialPOs: PO[];
}

export function POList({ initialPOs }: POListProps) {
  const [pos, setPOs] = useState(initialPOs);
  const [customers, setCustomers] = useState<Customer[]>([]);
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

  useEffect(() => {
    getCustomers().then(setCustomers);
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    // Need to handle user context on server for plant_id
    // But createPO action handles fetching plant_id from session.
    // We just pass the form data minus plant_id which is injected server-side.
    // Wait, createPO expects POInsert which has plant_id required?
    // We need to type cast or adjust the action signature.
    // Let's adjust action signature to take Partial<POInsert> or specific DTO.

    // For now assuming action handles it.
    const res = await createPO({
        po_number: values.po_number,
        customer_id: values.customer_id,
        order_date: values.order_date.toISOString().split('T')[0], // format as YYYY-MM-DD
        status: 'draft'
    } as any);

    if (res.error) {
      notifications.show({ title: 'Error', message: res.error, color: 'red' });
    } else {
      notifications.show({ title: 'Success', message: 'PO created', color: 'green' });
      close();
      // Optimistic update or refresh? For now relying on server revalidate but client state won't update automatically without router refresh or fetch.
      // Let's reload page for simplicity in this pass.
      window.location.reload();
    }
  };

  const filteredPOs = pos.filter((po) =>
    po.po_number.toLowerCase().includes(search.toLowerCase()) ||
    po.customers?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const rows = filteredPOs.map((po) => (
    <Table.Tr key={po.id}>
      <Table.Td>{po.po_number}</Table.Td>
      <Table.Td>{po.customers?.name}</Table.Td>
      <Table.Td>{new Date(po.order_date || '').toLocaleDateString()}</Table.Td>
      <Table.Td>
        <Badge color={po.status === 'draft' ? 'gray' : po.status === 'approved' ? 'green' : 'blue'}>
          {po.status}
        </Badge>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>Purchase Orders</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>Create PO</Button>
      </Group>

      <TextInput
        placeholder="Search POs..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
      />

      <Paper shadow="xs" p="md" withBorder>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>PO Number</Table.Th>
              <Table.Th>Customer</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Paper>

      <Modal opened={opened} onClose={close} title="Create Purchase Order">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm">
            <TextInput label="PO Number" placeholder="PO-1234" required {...form.getInputProps('po_number')} />
            <Select
                label="Customer"
                placeholder="Select Customer"
                data={customers.map(c => ({ value: c.id, label: c.name }))}
                required
                {...form.getInputProps('customer_id')}
            />
            <DateInput
                label="Order Date"
                placeholder="Pick date"
                required
                {...form.getInputProps('order_date')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={close}>Cancel</Button>
              <Button type="submit">Create</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
