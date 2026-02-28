import { Table, Checkbox, Text, Badge, NumberInput } from '@mantine/core';
import { WO, EditState } from '@/hooks/useProductionEntry';

interface ProductionEntryRowProps {
  wo: WO;
  editState: EditState;
  onToggleSelect: (id: string) => void;
  onChange: (id: string, field: 'produced' | 'rejected', value: number | string) => void;
}

export function ProductionEntryRow({ wo, editState, onToggleSelect, onChange }: ProductionEntryRowProps) {
  return (
    <Table.Tr bg={editState.selected ? 'var(--mantine-color-blue-light)' : undefined}>
      <Table.Td>
          <Checkbox
              checked={editState.selected}
              onChange={() => onToggleSelect(wo.id)}
              aria-label="Select row"
          />
      </Table.Td>
      <Table.Td>
          <Text fw={500}>{wo.wo_number}</Text>
          <Text size="xs" c="dimmed">{wo.purchase_orders?.po_number}</Text>
      </Table.Td>
      <Table.Td>
          <Text>{wo.items?.item_code}</Text>
          <Text size="xs" c="dimmed">{wo.items?.description}</Text>
      </Table.Td>
      <Table.Td>{wo.quantity}</Table.Td>
      <Table.Td>
          <Badge color={wo.status === 'in_production' ? 'blue' : 'gray'}>{wo.status}</Badge>
      </Table.Td>
      <Table.Td>
          <NumberInput
              value={editState.produced}
              onChange={(val) => onChange(wo.id, 'produced', val)}
              min={0}
              style={{ maxWidth: 100 }}
          />
      </Table.Td>
      <Table.Td>
          <NumberInput
              value={editState.rejected}
              onChange={(val) => onChange(wo.id, 'rejected', val)}
              min={0}
              style={{ maxWidth: 100 }}
          />
      </Table.Td>
    </Table.Tr>
  );
}
