'use client';

import { useState } from 'react';
import { Table, Button, Paper, Title, Stack, Modal, Select, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { assignRole } from '@/app/actions/users';
import { Database } from '@/types/database.types';
import { useRouter } from 'next/navigation';

type User = Database['public']['Tables']['users']['Row'];
type PlantOption = { id: string; name: string };
type AssignmentMap = Record<string, { roles: string[]; plants: string[] }>;

export function UserList({
  initialUsers,
  plants,
  assignments,
}: {
  initialUsers: User[];
  plants: PlantOption[];
  assignments: AssignmentMap;
}) {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [plantId, setPlantId] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const handleAssign = async () => {
    if (!selectedUser || !role || !plantId) return;
    const res = await assignRole(selectedUser.id, role as any, plantId);
    if (res.error) {
      notifications.show({ title: 'Error', message: res.error, color: 'red' });
    } else {
      notifications.show({ title: 'Success', message: 'Role assigned', color: 'green' });
      close();
      router.refresh();
    }
  };

  const rows = initialUsers.map((user) => (
    <Table.Tr key={user.id}>
      <Table.Td>{user.email}</Table.Td>
      <Table.Td>{user.full_name}</Table.Td>
      <Table.Td>{assignments[user.id]?.roles.join(', ') || '-'}</Table.Td>
      <Table.Td>{assignments[user.id]?.plants.join(', ') || '-'}</Table.Td>
      <Table.Td>
        <Button size="xs" onClick={() => { setSelectedUser(user); setRole(null); setPlantId(null); open(); }}>
          Assign Role
        </Button>
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
              <Table.Th>Roles</Table.Th>
              <Table.Th>Plants</Table.Th>
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
                data={plants.map((p) => ({ value: p.id, label: p.name }))}
                value={plantId}
                onChange={setPlantId}
            />
            <Button onClick={handleAssign}>Save Assignment</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
