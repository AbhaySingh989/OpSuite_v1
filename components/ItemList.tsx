'use client';

import { useState } from 'react';
import { Table, TextInput, Button, Group, ActionIcon, Modal, Paper, Title, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconPencil, IconTrash, IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { createItem, updateItem, deleteItem } from '@/app/actions/items';
import { Database } from '@/types/database.types';

type Item = Database['public']['Tables']['items']['Row'];

interface ItemListProps {
  initialItems: Item[];
}

export function ItemList({ initialItems }: ItemListProps) {
  const [items, setItems] = useState(initialItems);
  const [opened, { open, close }] = useDisclosure(false);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const form = useForm({
    initialValues: {
      item_code: '',
      description: '',
      unit: '',
    },
    validate: {
      item_code: (value) => (value ? null : 'Item Code is required'),
      unit: (value) => (value ? null : 'Unit is required'),
    },
  });

  const handleOpen = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      form.setValues({
        item_code: item.item_code,
        description: item.description || '',
        unit: item.unit || '',
      });
    } else {
      setEditingItem(null);
      form.reset();
    }
    open();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingItem) {
        const res = await updateItem(editingItem.id, values);
        if (res.error) throw new Error(res.error);
        notifications.show({ title: 'Success', message: 'Item updated', color: 'green' });
      } else {
        const res = await createItem(values);
        if (res.error) throw new Error(res.error);
        notifications.show({ title: 'Success', message: 'Item created', color: 'green' });
      }
      close();
    } catch (error: any) {
      notifications.show({ title: 'Error', message: error.message || 'Operation failed', color: 'red' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const res = await deleteItem(id);
      if (res.error) {
        notifications.show({ title: 'Error', message: res.error, color: 'red' });
      } else {
        notifications.show({ title: 'Success', message: 'Item deleted', color: 'green' });
      }
    }
  };

  const filteredItems = items.filter((item) =>
    item.item_code.toLowerCase().includes(search.toLowerCase()) ||
    item.description?.toLowerCase().includes(search.toLowerCase())
  );

  const rows = filteredItems.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>{item.item_code}</Table.Td>
      <Table.Td>{item.description}</Table.Td>
      <Table.Td>{item.unit}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon variant="subtle" color="gray" onClick={() => handleOpen(item)}>
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(item.id)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>Items</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpen()}>Add Item</Button>
      </Group>

      <TextInput
        placeholder="Search items..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
      />

      <Paper shadow="xs" p="md" withBorder>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Item Code</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Unit</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Paper>

      <Modal opened={opened} onClose={close} title={editingItem ? 'Edit Item' : 'Add Item'}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm">
            <TextInput label="Item Code" placeholder="Unique Code" required {...form.getInputProps('item_code')} />
            <TextInput label="Description" placeholder="Item Description" {...form.getInputProps('description')} />
            <TextInput label="Unit" placeholder="Unit of Measure (e.g., kg)" required {...form.getInputProps('unit')} />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={close}>Cancel</Button>
              <Button type="submit">Save</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
