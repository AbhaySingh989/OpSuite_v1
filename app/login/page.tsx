'use client';
import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Text,
  Container,
  Button,
} from '@mantine/core';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { notifications } from '@mantine/notifications';

export default function AuthenticationTitle() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async () => {
    if (!email || !password) {
        notifications.show({
            title: 'Error',
            message: 'Please enter both email and password',
            color: 'red',
        });
        return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      notifications.show({
        title: 'Login Failed',
        message: error.message,
        color: 'red',
      });
      setLoading(false);
    } else {
      // Successful login, redirect handled by router or middleware usually,
      // but explicit push here ensures client navigation.
      // Wait, router.push might need a hard refresh for session update if no middleware.
      // But we use createClient which handles cookies.
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">
        OpSuite ERP
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Production-Grade Enterprise System
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <TextInput
            label="Email"
            placeholder="admin@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
        />
        <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
        />

        <Button fullWidth mt="xl" loading={loading} onClick={handleLogin}>
          Sign in
        </Button>
      </Paper>
    </Container>
  );
}
