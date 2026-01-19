
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

const isConfigured = () => {
  return (
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project')
  );
};

export const supabase: SupabaseClient | null = isConfigured() 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const saveDataset = async (dataset: any) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('datasets')
    .upsert([{ id: dataset.id, name: dataset.name, content: dataset, updated_at: new Date() }]);
  return error ? null : data;
};

export const saveLead = async (email: string, datasetName: string, context: string) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('leads')
    .insert([{ email, dataset_name: datasetName, business_context: context, created_at: new Date() }]);
  return error ? null : data;
};

export const getSavedDatasets = async () => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('datasets')
      .select('*')
      .order('updated_at', { ascending: false });
    return error ? [] : data?.map(d => d.content) || [];
  } catch (err) {
    return [];
  }
};
