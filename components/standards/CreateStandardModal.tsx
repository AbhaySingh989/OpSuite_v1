import { Modal, TextInput, Button, Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { createStandard } from '@/app/actions/standards';

interface CreateStandardModalProps {
  opened: boolean;
  onClose: () => void;
}

export function CreateStandardModal({ opened, onClose }: CreateStandardModalProps) {
  const standardForm = useForm({
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: (value) => (value ? null : 'Name is required'),
    },
  });

  const handleCreateStandard = async (values: typeof standardForm.values) => {
    const res = await createStandard(values);
    if (res.error) {
      notifications.show({ title: 'Error', message: res.error, color: 'red' });
    } else {
      notifications.show({ title: 'Success', message: 'Standard created', color: 'green' });
      onClose();
      standardForm.reset();
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Create Standard">
      <form onSubmit={standardForm.onSubmit(handleCreateStandard)}>
        <Stack gap="sm">
          <TextInput label="Name" placeholder="ASTM A36" required {...standardForm.getInputProps('name')} />
          <TextInput label="Description" placeholder="Structural Steel" {...standardForm.getInputProps('description')} />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
