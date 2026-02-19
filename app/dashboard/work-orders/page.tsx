import { Card, Text, Title } from '@mantine/core';

export default function WorkOrdersPage() {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Title order={2} mb="xs">Work Orders</Title>
      <Text c="dimmed">This module is available, but detailed screens are not implemented yet.</Text>
    </Card>
  );
}
