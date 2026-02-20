'use client';

import { useState } from 'react';
import { Table, Button, Paper, Title, Stack, Modal, Select, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { assignRole } from '@/app/actions/users';
import { Database } from '@/types/database.types';

type User = Database['public']['Tables']['users']['Row'];

export function UserList({ initialUsers, plantNames }: { initialUsers: User[], plantNames: string[] }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [plant, setPlant] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const handleAssign = async () => {
    if (!selectedUser || !role || !plant) return;
    const res = await assignRole(selectedUser.id, role as any, plant);
    if (res.error) {
      notifications.show({ title: 'Error', message: res.error, color: 'red' });
    } else {
      notifications.show({ title: 'Success', message: 'Role assigned', color: 'green' });
      close();
    }
  };

  const rows = initialUsers.map((user) => (
    <Table.Tr key={user.id}>
      <Table.Td>{user.email}</Table.Td>
      <Table.Td>{user.full_name}</Table.Td>
      <Table.Td>
        <Button size="xs" onClick={() => { setSelectedUser(user); open(); }}>Assign Role</Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Title order={2}>User Management</Title>
      <Paper shadow="xs" p="md" withBorder>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Email</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Paper>

      <Modal opened={opened} onClose={close} title="Assign Role">
        <Stack>
            <Text fw={500}>User: {selectedUser?.email}</Text>
            <Select
                label="Role"
                data={['admin', 'qa', 'store']}
                value={role}
                onChange={setRole}
            />
            <Select
                label="Plant"
                data={plantNames}
                value={plant}
                onChange={setPlant}
            />
            <Button onClick={handleAssign}>Save Assignment</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
