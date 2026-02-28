'use client';

import { useState } from 'react';
import { Table, TextInput, Button, Group, ActionIcon, Modal, Title, Stack, Text, NumberInput, Select, Accordion } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconTrash, IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { createStandard, createParameter, deleteStandard, deleteParameter } from '@/app/actions/standards';
import { Database } from '@/types/database.types';

type StandardWithParams = Database['public']['Tables']['standards']['Row'] & {
  standard_parameters: Database['public']['Tables']['standard_parameters']['Row'][];
};

interface StandardListProps {
  initialStandards: StandardWithParams[];
}

export function StandardList({ initialStandards }: StandardListProps) {
  const [standards, setStandards] = useState(initialStandards);
  const [openedStandard, { open: openStandard, close: closeStandard }] = useDisclosure(false);
  const [openedParam, { open: openParam, close: closeParam }] = useDisclosure(false);
  const [selectedStandardId, setSelectedStandardId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const standardForm = useForm({
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: (value) => (value ? null : 'Name is required'),
    },
  });

  const paramForm = useForm({
    initialValues: {
      parameter_name: '',
      category: 'chemical' as const,
      unit: '',
      min_value: undefined as number | undefined,
      max_value: undefined as number | undefined,
    },
    validate: {
      parameter_name: (value) => (value ? null : 'Name is required'),
      unit: (value) => (value ? null : 'Unit is required'),
      max_value: (value, values) =>
        (values.min_value !== undefined && value !== undefined && value < values.min_value) ? 'Max must be > Min' : null
    },
  });

  const handleCreateStandard = async (values: typeof standardForm.values) => {
    const res = await createStandard(values);
    if (res.error) {
      notifications.show({ title: 'Error', message: res.error, color: 'red' });
    } else {
      notifications.show({ title: 'Success', message: 'Standard created', color: 'green' });
      closeStandard();
      standardForm.reset();
    }
  };

  const handleCreateParam = async (values: typeof paramForm.values) => {
    if (!selectedStandardId) return;
    const res = await createParameter({ ...values, standard_id: selectedStandardId });
    if (res.error) {
      notifications.show({ title: 'Error', message: res.error, color: 'red' });
    } else {
      notifications.show({ title: 'Success', message: 'Parameter added', color: 'green' });
      closeParam();
      paramForm.reset();
    }
  };

  const handleDeleteStandard = async (id: string) => {
    if (confirm('Delete this standard and all parameters?')) {
      const res = await deleteStandard(id);
      if (res.error) {
        notifications.show({ title: 'Error', message: res.error, color: 'red' });
      } else {
        notifications.show({ title: 'Success', message: 'Standard deleted', color: 'green' });
      }
    }
  };

  const handleDeleteParam = async (id: string) => {
    if (confirm('Delete this parameter?')) {
      const res = await deleteParameter(id);
      if (res.error) {
        notifications.show({ title: 'Error', message: res.error, color: 'red' });
      } else {
        notifications.show({ title: 'Success', message: 'Parameter deleted', color: 'green' });
      }
    }
  };

  const filteredStandards = standards.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>Standards</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={openStandard}>Add Standard</Button>
      </Group>

      <TextInput
        placeholder="Search standards..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
      />

      <Accordion variant="separated">
        {filteredStandards.map((standard) => (
          <Accordion.Item key={standard.id} value={standard.id}>
            <Accordion.Control>
              <Group justify="space-between" mr="xl">
                <Text fw={500}>{standard.name}</Text>
                <Text size="sm" c="dimmed">{standard.description}</Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Group justify="flex-end" mb="md">
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => { setSelectedStandardId(standard.id); openParam(); }}
                >
                  Add Parameter
                </Button>
                <Button
                    size="xs"
                    variant="light"
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => handleDeleteStandard(standard.id)}
                >
                    Delete Standard
                </Button>
              </Group>
              <Table withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Parameter</Table.Th>
                    <Table.Th>Category</Table.Th>
                    <Table.Th>Unit</Table.Th>
                    <Table.Th>Min</Table.Th>
                    <Table.Th>Max</Table.Th>
                    <Table.Th>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {standard.standard_parameters.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={6} align="center">No parameters defined</Table.Td>
                    </Table.Tr>
                  ) : (
                    standard.standard_parameters.map((param) => (
                      <Table.Tr key={param.id}>
                        <Table.Td>{param.parameter_name}</Table.Td>
                        <Table.Td>{param.category}</Table.Td>
                        <Table.Td>{param.unit}</Table.Td>
                        <Table.Td>{param.min_value}</Table.Td>
                        <Table.Td>{param.max_value}</Table.Td>
                        <Table.Td>
                          <ActionIcon color="red" variant="subtle" onClick={() => handleDeleteParam(param.id)}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>

      {/* Create Standard Modal */}
      <Modal opened={openedStandard} onClose={closeStandard} title="Create Standard">
        <form onSubmit={standardForm.onSubmit(handleCreateStandard)}>
          <Stack gap="sm">
            <TextInput label="Name" placeholder="ASTM A36" required {...standardForm.getInputProps('name')} />
            <TextInput label="Description" placeholder="Structural Steel" {...standardForm.getInputProps('description')} />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={closeStandard}>Cancel</Button>
              <Button type="submit">Save</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Add Parameter Modal */}
      <Modal opened={openedParam} onClose={closeParam} title="Add Parameter">
        <form onSubmit={paramForm.onSubmit(handleCreateParam)}>
          <Stack gap="sm">
            <TextInput label="Parameter Name" placeholder="Carbon" required {...paramForm.getInputProps('parameter_name')} />
            <Select
              label="Category"
              data={['chemical', 'mechanical', 'dimensional']}
              required
              {...paramForm.getInputProps('category')}
            />
            <TextInput label="Unit" placeholder="%" required {...paramForm.getInputProps('unit')} />
            <NumberInput label="Min Value" placeholder="0.1" {...paramForm.getInputProps('min_value')} />
            <NumberInput label="Max Value" placeholder="0.5" {...paramForm.getInputProps('max_value')} />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={closeParam}>Cancel</Button>
              <Button type="submit">Save</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
