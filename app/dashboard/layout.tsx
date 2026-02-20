'use client';
import { AppShell, Burger, Group, UnstyledButton, Text, ThemeIcon, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconDashboard, IconDatabase, IconFileInvoice, IconFlask, IconSettings, IconLogout } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const data = [
  { icon: IconDashboard, label: 'Dashboard', link: '/dashboard' },
  { icon: IconDatabase, label: 'Master Data', link: '/dashboard/master-data/customers' },
  { icon: IconFileInvoice, label: 'Purchase Orders', link: '/dashboard/po' },
  { icon: IconSettings, label: 'Work Orders', link: '/dashboard/work-orders' },
  { icon: IconFlask, label: 'Lab Results', link: '/dashboard/lab-results' },
];

function NavLinks() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const links = data.map((item) => (
    <UnstyledButton
      component={Link}
      href={item.link}
      key={item.label}
      style={{
        display: 'block',
        width: '100%',
        padding: '10px',
        borderRadius: '8px',
        backgroundColor: pathname === item.link ? 'var(--mantine-color-blue-light)' : 'transparent',
        color: pathname === item.link ? 'var(--mantine-color-blue-filled)' : 'inherit',
      }}
    >
      <Group>
        <ThemeIcon color={pathname === item.link ? 'blue' : 'gray'} variant="light">
          <item.icon size={16} />
        </ThemeIcon>
        <Text size="sm">{item.label}</Text>
      </Group>
    </UnstyledButton>
  ));

  return (
    <Stack justify="space-between" h="100%">
        <Stack gap="xs">{links}</Stack>
        <UnstyledButton onClick={handleLogout} style={{ padding: '10px' }}>
            <Group>
                <ThemeIcon color="red" variant="light">
                    <IconLogout size={16} />
                </ThemeIcon>
                <Text size="sm" c="red">Logout</Text>
            </Group>
        </UnstyledButton>
    </Stack>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Text fw={700} size="lg">OpSuite ERP</Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLinks />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
