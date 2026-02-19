import { Button, Container, Title, Text } from '@mantine/core';
import Link from 'next/link';

export default function Home() {
  return (
    <Container>
      <Title>Welcome to OpSuite</Title>
      <Text>Production-Grade ERP System</Text>
      <Button component={Link} href="/login">Login</Button>
    </Container>
  );
}
