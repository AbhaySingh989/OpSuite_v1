'use client';

import { AppShell, Burger, Group, NavLink, Text, ThemeIcon, Stack, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDashboard,
  IconDatabase,
  IconFileInvoice,
  IconFlask,
  IconSettings,
  IconLogout,
  IconHammer,
  IconBuildingFactory
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const data = [
  { icon: IconDashboard, label: 'Dashboard', link: '/dashboard' },
  { icon: IconDatabase, label: 'Master Data', link: '/dashboard/master-data' },
  { icon: IconFileInvoice, label: 'Purchase Orders', link: '/dashboard/po' },
  { icon: IconSettings, label: 'Work Orders', link: '/dashboard/work-orders' },
  { icon: IconHammer, label: 'Production Entry', link: '/dashboard/production-entry' },
  { icon: IconFlask, label: 'Lab Results', link: '/dashboard/lab-results' },
];

function NavLinks({ closeMobile }: { closeMobile: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const links = data.map((item) => (
    <NavLink
      component={Link}
      href={item.link}
      key={item.label}
      active={pathname === item.link}
      label={item.label}
      leftSection={<item.icon size={20} stroke={1.5} />}
      onClick={closeMobile}
      variant="light"
      color="blue"
      style={{ borderRadius: 'var(--mantine-radius-md)' }}
    />
  ));

  return (
    <Stack justify="space-between" h="100%">
        <Stack gap="xs">
          {links}
        </Stack>
        <NavLink
            label="Logout"
            leftSection={<IconLogout size={20} stroke={1.5} />}
            onClick={handleLogout}
            color="red"
            variant="subtle"
            style={{ borderRadius: 'var(--mantine-radius-md)' }}
            c="red"
        />
    </Stack>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, { toggle, close }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <ThemeIcon size="lg" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
                <IconBuildingFactory size={20} />
            </ThemeIcon>
            <Text fw={700} size="lg">OpSuite ERP</Text>
          </Group>
          {/* Add user avatar or profile here later */}
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <ScrollArea>
           <NavLinks closeMobile={close} />
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
