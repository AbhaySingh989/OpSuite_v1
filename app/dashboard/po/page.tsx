import { Card, Text, Title } from '@mantine/core';

export default function PurchaseOrdersPage() {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Title order={2} mb="xs">Purchase Orders</Title>
      <Text c="dimmed">This module is available, but detailed screens are not implemented yet.</Text>
    </Card>
  );
}
