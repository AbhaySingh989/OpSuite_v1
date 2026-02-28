'use client';

import { useState, useEffect } from 'react';
import { Container, Paper, Title, Select, Button, Group, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { getCompletedWorkOrders, generateTCPreview, issueTC } from '@/app/actions/tc';

export default function TCGeneratePage() {
  const [wos, setWos] = useState<any[]>([]);
  const [selectedWO, setSelectedWO] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    async function fetchWOs() {
      setLoading(true);
      const res = await getCompletedWorkOrders();
      if (res.data) {
        setWos(res.data);
      } else if (res.error) {
        notifications.show({ title: 'Error', message: res.error, color: 'red' });
      }
      setLoading(false);
    }
    fetchWOs();
  }, []);

  const handleGeneratePreview = async () => {
    if (!selectedWO || !selectedType) return;
    setGenerating(true);
    setPreviewUrl(null);
    setApproved(false);

    const res = await generateTCPreview(selectedWO, selectedType);
    if (res.error) {
       notifications.show({ title: 'Error', message: res.error, color: 'red' });
    } else if (res.pdfBase64) {
       setPreviewUrl(`data:application/pdf;base64,${res.pdfBase64}`);
       notifications.show({ title: 'Success', message: 'Preview generated', color: 'green' });
    }
    setGenerating(false);
  };

  const handleIssue = async () => {
     if (!selectedWO || !selectedType) return;
     if (!confirm('Are you sure you want to ISSUE this TC? This action is irreversible.')) return;

     setIssuing(true);
     const res = await issueTC(selectedWO, selectedType);
     if (res.error) {
        notifications.show({ title: 'Error', message: res.error, color: 'red' });
     } else {
        notifications.show({ title: 'Success', message: 'TC Issued successfully', color: 'green' });
        // Reset or redirect
        setSelectedWO(null);
        setPreviewUrl(null);
        setApproved(false);
        // Refresh WOs
        const wosRes = await getCompletedWorkOrders();
        if (wosRes.data) setWos(wosRes.data);
     }
     setIssuing(false);
  };

  const woOptions = wos.map(wo => ({
    value: wo.id,
    label: `${wo.wo_number} - ${wo.items?.item_code} (${wo.purchase_orders?.customers?.name})`
  }));

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Title order={2}>Generate Test Certificate</Title>

        <Paper p="md" withBorder>
          <Stack gap="md">
            <Group grow align="flex-end">
              <Select
                label="Select Work Order"
                placeholder="Search completed WO..."
                data={woOptions}
                value={selectedWO}
                onChange={setSelectedWO}
                searchable
                disabled={loading || generating || issuing}
              />
              <Select
                label="TC Type"
                placeholder="Select Type"
                data={['3.1', '3.2', '3C', '3G']}
                value={selectedType}
                onChange={setSelectedType}
                disabled={loading || generating || issuing}
              />
              <Button
                onClick={handleGeneratePreview}
                loading={generating}
                disabled={!selectedWO || !selectedType || issuing}
              >
                Generate Preview
              </Button>
            </Group>
          </Stack>
        </Paper>

        {previewUrl && (
          <Paper p="md" withBorder h={800} style={{ display: 'flex', flexDirection: 'column' }}>
            <Group justify="space-between" mb="md">
               <Title order={4}>Preview</Title>
               <Group>
                 <Button
                   color="blue"
                   variant={approved ? 'filled' : 'outline'}
                   onClick={() => setApproved(true)}
                   disabled={approved || issuing}
                 >
                   {approved ? 'Approved' : 'Approve'}
                 </Button>
                 <Button
                   color="green"
                   onClick={handleIssue}
                   loading={issuing}
                   disabled={!approved}
                 >
                   Issue TC
                 </Button>
               </Group>
            </Group>
            <iframe
              src={previewUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="TC Preview"
            />
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
