import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { updateProduction, ProductionUpdate } from '@/app/actions/production';
import { Database } from '@/types/database.types';

export type WO = Database['public']['Tables']['work_orders']['Row'] & {
    purchase_orders: { po_number: string } | null,
    items: { item_code: string, description: string | null } | null
};

export type EditState = {
    produced: number;
    rejected: number;
    selected: boolean;
};

export function useProductionEntry(initialWOs: WO[]) {
  const [wos, setWOs] = useState(initialWOs);
  // Store edits: key is wo_id
  const [edits, setEdits] = useState<Record<string, EditState>>({});
  const [loading, setLoading] = useState(false);

  const getEditState = (id: string): EditState => {
    return edits[id] || {
        produced: (wos.find(w => w.id === id) as any).produced_quantity || 0,
        rejected: (wos.find(w => w.id === id) as any).rejected_quantity || 0,
        selected: false
    };
  };

  const handleChange = (id: string, field: 'produced' | 'rejected', value: number | string) => {
    const val = typeof value === 'number' ? value : 0;
    const current = getEditState(id);

    setEdits({
      ...edits,
      [id]: {
        ...current,
        [field]: val,
        selected: true // Auto-select if modified
      }
    });
  };

  const toggleSelect = (id: string) => {
    const current = getEditState(id);
    setEdits({
      ...edits,
      [id]: {
        ...current,
        selected: !current.selected
      }
    });
  };

  const handleSave = async () => {
    const updates: ProductionUpdate[] = [];

    // Iterate over edits and only pick selected ones
    Object.keys(edits).forEach(id => {
      const edit = edits[id];
      if (edit.selected) {
        // Find original WO to check planned qty vs produced
        const wo = wos.find(w => w.id === id);
        if (!wo) return;

        // Logic: if produced >= quantity, status = lab_pending
        // else status = in_production

        const totalProduced = edit.produced;
        let newStatus = wo.status;

        if (totalProduced >= (wo.quantity || 0)) {
            newStatus = 'lab_pending';
        } else if (totalProduced > 0 && wo.status === 'draft') {
            newStatus = 'in_production';
        }
        // If already 'in_production', keep it unless finished.

        updates.push({
          wo_id: id,
          produced_qty: edit.produced,
          rejection_qty: edit.rejected,
          status: newStatus
        });
      }
    });

    if (updates.length === 0) {
        notifications.show({ title: 'Info', message: 'No records selected for update', color: 'blue' });
        return;
    }

    setLoading(true);
    try {
        const res = await updateProduction(updates);
        if (res.error) {
            notifications.show({ title: 'Error', message: 'Failed to update production records', color: 'red' });
        } else {
            notifications.show({ title: 'Success', message: 'Production updated successfully', color: 'green' });
            window.location.reload();
        }
    } catch (e) {
        notifications.show({ title: 'Error', message: 'An unexpected error occurred', color: 'red' });
    } finally {
        setLoading(false);
    }
  };

  return {
    wos,
    edits,
    loading,
    getEditState,
    handleChange,
    toggleSelect,
    handleSave,
  };
}
