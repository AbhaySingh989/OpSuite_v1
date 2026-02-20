import { SimpleGrid, Card, Text, Title, Badge, Group } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconClock } from '@tabler/icons-react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [{ count: pendingPOs }, { count: activeWOs }, { count: pendingLab }] = await Promise.all([
    supabase
      .from('purchase_orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'draft')
      .eq('is_deleted', false),
    supabase
      .from('work_orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['draft', 'approved', 'in_production', 'lab_pending', 'on_hold', 'reopened'])
      .eq('is_deleted', false),
    supabase
      .from('lab_results')
      .select('id', { count: 'exact', head: true })
      .eq('validation_status', 'pending')
      .eq('is_deleted', false),
  ]);

  return (
    <div>
        <Title order={2} mb="md">Overview</Title>
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500}>Pending POs</Text>
                    <IconClock size={20} color="var(--mantine-color-orange-6)" />
                </Group>
                <Text size="xl" fw={700}>{pendingPOs || 0}</Text>
                <Badge color="orange" mt="md">Action Required</Badge>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500}>Active Work Orders</Text>
                    <IconAlertCircle size={20} color="var(--mantine-color-blue-6)" />
                </Group>
                <Text size="xl" fw={700}>{activeWOs || 0}</Text>
                <Badge color="blue" mt="md">In Progress</Badge>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500}>Pending Lab Results</Text>
                    <IconCheck size={20} color="var(--mantine-color-teal-6)" />
                </Group>
                <Text size="xl" fw={700}>{pendingLab || 0}</Text>
                <Badge color="teal" mt="md">Review Needed</Badge>
            </Card>
        </SimpleGrid>
    </div>
  );
}
