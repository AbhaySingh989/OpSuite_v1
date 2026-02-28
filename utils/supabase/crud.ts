import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export function createCRUDActions<
  TInsert extends Record<string, any>,
  TUpdate extends Record<string, any>
>(tableName: string, revalidateRoute: string) {
  async function getAll() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error(`Unauthorized get ${tableName} request: missing user session`);
      return [];
    }

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      return [];
    }

    return data;
  }

  async function create(formData: TInsert) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Unauthorized. Please sign in again.' };
    }

    const { error } = await supabase.from(tableName).insert(formData);

    if (error) {
      return { error: error.message };
    }

    revalidatePath(revalidateRoute);
    return { success: true };
  }

  async function update(id: string, formData: TUpdate) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Unauthorized. Please sign in again.' };
    }

    const { error } = await supabase
      .from(tableName)
      .update(formData)
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath(revalidateRoute);
    return { success: true };
  }

  async function remove(id: string) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Unauthorized. Please sign in again.' };
    }

    // Prefer soft delete where schema supports `is_deleted`; fallback to hard delete for legacy schemas.
    const softDelete = await supabase
      .from(tableName)
      .update({ is_deleted: true } as any)
      .eq('id', id);

    if (softDelete.error) {
      const missingColumn = softDelete.error.message.toLowerCase().includes('is_deleted');
      if (!missingColumn) {
        return { error: softDelete.error.message };
      }

      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) {
        return { error: error.message };
      }
    }

    revalidatePath(revalidateRoute);
    return { success: true };
  }

  return {
    getAll,
    create,
    update,
    remove,
  };
}
