'use client';
import { SimpleGrid, Card, Text, Title, Badge, Group } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconClock } from '@tabler/icons-react';

export default function DashboardPage() {
  return (
    <div>
        <Title order={2} mb="md">Overview</Title>
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500}>Pending POs</Text>
                    <IconClock size={20} color="var(--mantine-color-orange-6)" />
                </Group>
                <Text size="xl" fw={700}>12</Text>
                <Badge color="orange" mt="md">Action Required</Badge>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500}>Active Work Orders</Text>
                    <IconAlertCircle size={20} color="var(--mantine-color-blue-6)" />
                </Group>
                <Text size="xl" fw={700}>5</Text>
                <Badge color="blue" mt="md">In Progress</Badge>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500}>Pending Lab Results</Text>
                    <IconCheck size={20} color="var(--mantine-color-teal-6)" />
                </Group>
                <Text size="xl" fw={700}>3</Text>
                <Badge color="teal" mt="md">Review Needed</Badge>
            </Card>
        </SimpleGrid>
    </div>
  );
}
