'use client';

import { useState } from 'react';
import { Table, TextInput, Button, Group, ActionIcon, Modal, Paper, Title, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconPencil, IconTrash, IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { createCustomer, updateCustomer, deleteCustomer } from '@/app/actions/customers';
import { Database } from '@/types/database.types';

type Customer = Database['public']['Tables']['customers']['Row'];

interface CustomerListProps {
  initialCustomers: Customer[];
}

export function CustomerList({ initialCustomers }: CustomerListProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [opened, { open, close }] = useDisclosure(false);
  const [search, setSearch] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      address: '',
      gst_number: '',
      contact_person: '',
      email: '',
      phone: '',
    },
    validate: {
      name: (value) => (value ? null : 'Name is required'),
      email: (value) => (value && !/^\S+@\S+$/.test(value) ? 'Invalid email' : null),
    },
  });

  const handleOpen = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      form.setValues({
        name: customer.name,
        address: customer.address || '',
        gst_number: customer.gst_number || '',
        contact_person: customer.contact_person || '',
        email: customer.email || '',
        phone: customer.phone || '',
      });
    } else {
      setEditingCustomer(null);
      form.reset();
    }
    open();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingCustomer) {
        const res = await updateCustomer(editingCustomer.id, values);
        if (res.error) throw new Error(res.error);
        notifications.show({ title: 'Success', message: 'Customer updated', color: 'green' });
      } else {
        const res = await createCustomer(values);
        if (res.error) throw new Error(res.error);
        notifications.show({ title: 'Success', message: 'Customer created', color: 'green' });
      }
      close();
    } catch (error: any) {
      notifications.show({ title: 'Error', message: error.message || 'Operation failed', color: 'red' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      const res = await deleteCustomer(id);
      if (res.error) {
        notifications.show({ title: 'Error', message: res.error, color: 'red' });
      } else {
        notifications.show({ title: 'Success', message: 'Customer deleted', color: 'green' });
      }
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.email?.toLowerCase().includes(search.toLowerCase())
  );

  const rows = filteredCustomers.map((customer) => (
    <Table.Tr key={customer.id}>
      <Table.Td>{customer.name}</Table.Td>
      <Table.Td>{customer.contact_person}</Table.Td>
      <Table.Td>{customer.email}</Table.Td>
      <Table.Td>{customer.phone}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon variant="subtle" color="gray" onClick={() => handleOpen(customer)}>
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(customer.id)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>Customers</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpen()}>Add Customer</Button>
      </Group>

      <TextInput
        placeholder="Search customers..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
      />

      <Paper shadow="xs" p="md" withBorder>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Contact Person</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Phone</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Paper>

      <Modal opened={opened} onClose={close} title={editingCustomer ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm">
            <TextInput label="Name" placeholder="Company Name" required {...form.getInputProps('name')} />
            <TextInput label="Address" placeholder="Full Address" {...form.getInputProps('address')} />
            <TextInput label="GST Number" placeholder="GST Number" {...form.getInputProps('gst_number')} />
            <TextInput label="Contact Person" placeholder="Name" {...form.getInputProps('contact_person')} />
            <TextInput label="Email" placeholder="contact@example.com" {...form.getInputProps('email')} />
            <TextInput label="Phone" placeholder="+1234567890" {...form.getInputProps('phone')} />
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
