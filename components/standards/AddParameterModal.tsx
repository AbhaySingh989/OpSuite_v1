import { Modal, TextInput, Select, NumberInput, Button, Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { createParameter } from '@/app/actions/standards';

interface AddParameterModalProps {
  opened: boolean;
  onClose: () => void;
  standardId: string | null;
}

export function AddParameterModal({ opened, onClose, standardId }: AddParameterModalProps) {
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

  const handleCreateParam = async (values: typeof paramForm.values) => {
    if (!standardId) return;
    const res = await createParameter({ ...values, standard_id: standardId });
    if (res.error) {
      notifications.show({ title: 'Error', message: res.error, color: 'red' });
    } else {
      notifications.show({ title: 'Success', message: 'Parameter added', color: 'green' });
      onClose();
      paramForm.reset();
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Add Parameter">
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
            <Button variant="default" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
