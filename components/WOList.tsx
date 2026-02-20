'use client';

import { useState } from 'react';
import { Table, TextInput, Button, Group, ActionIcon, Modal, Paper, Title, Stack, Badge, Select, NumberInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconPencil, IconTrash, IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { createWO } from '@/app/actions/wo';
import { getPOs } from '@/app/actions/po';
import { getItems } from '@/app/actions/items';
import { Database } from '@/types/database.types';
import { useEffect } from 'react';

type WO = Database['public']['Tables']['work_orders']['Row'] & {
    purchase_orders: { po_number: string } | null,
    items: { item_code: string } | null
};
type PO = Database['public']['Tables']['purchase_orders']['Row'];
type Item = Database['public']['Tables']['items']['Row'];

interface WOListProps {
  initialWOs: WO[];
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
      notifications.show({ title: 'Success', message: 'WO created', color: 'green' });
      close();
      window.location.reload();
    }
  };

  const filteredWOs = wos.filter((wo) =>
    wo.wo_number.toLowerCase().includes(search.toLowerCase()) ||
    wo.purchase_orders?.po_number?.toLowerCase().includes(search.toLowerCase())
  );

  const rows = filteredWOs.map((wo) => (
    <Table.Tr key={wo.id}>
      <Table.Td>{wo.wo_number}</Table.Td>
      <Table.Td>{wo.purchase_orders?.po_number}</Table.Td>
      <Table.Td>{wo.items?.item_code}</Table.Td>
      <Table.Td>{wo.quantity}</Table.Td>
      <Table.Td>
        <Badge color={wo.status === 'draft' ? 'gray' : 'blue'}>
          {wo.status}
        </Badge>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>Work Orders</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>Create WO</Button>
      </Group>

      <TextInput
        placeholder="Search WOs..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
      />

      <Paper shadow="xs" p="md" withBorder>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>WO Number</Table.Th>
              <Table.Th>PO Number</Table.Th>
              <Table.Th>Item</Table.Th>
              <Table.Th>Quantity</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Paper>

      <Modal opened={opened} onClose={close} title="Create Work Order">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm">
            <TextInput label="WO Number" placeholder="WO-5678" required {...form.getInputProps('wo_number')} />
            <Select
                label="Select PO"
                placeholder="Purchase Order"
                data={pos.map(p => ({ value: p.id, label: p.po_number }))}
                required
                {...form.getInputProps('po_id')}
            />
            <Select
                label="Select Item"
                placeholder="Item Code"
                data={items.map(i => ({ value: i.id, label: i.item_code }))}
                required
                {...form.getInputProps('item_id')}
            />
            <NumberInput
                label="Quantity"
                required
                min={1}
                {...form.getInputProps('quantity')}
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
