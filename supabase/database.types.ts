/**
 * Checked-in Supabase type snapshot for the army import aggregate.
 * Regenerate the full project snapshot after applying migrations with:
 *   supabase gen types typescript --linked > supabase/database.types.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      army_lists: {
        Row: {
          id: string;
          user_id: string;
          profile_id: string | null;
          name: string | null;
          game_system: string | null;
          game_key: string | null;
          description: string | null;
          faction: string | null;
          subfaction: string | null;
          points_total: number | null;
          datasheet_count: number | null;
          model_count: number | null;
          detachment_names: string[];
          detachment_points: number | null;
          raw_text: string;
          parsed_json: Json | null;
          playstyle_tags: string[];
          tactical_summary: Json | null;
          parser_status: "pending" | "succeeded" | "failed";
          parser_error: string | null;
          visibility: "private" | "shareable" | "matched_only";
          locked_at: string | null;
          visual_identity_json: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          profile_id?: string | null;
          name?: string | null;
          game_system?: string | null;
          game_key?: string | null;
          description?: string | null;
          faction?: string | null;
          subfaction?: string | null;
          points_total?: number | null;
          datasheet_count?: number | null;
          model_count?: number | null;
          detachment_names?: string[];
          detachment_points?: number | null;
          raw_text: string;
          parsed_json?: Json | null;
          playstyle_tags?: string[];
          tactical_summary?: Json | null;
          parser_status?: "pending" | "succeeded" | "failed";
          parser_error?: string | null;
          visibility?: "private" | "shareable" | "matched_only";
          locked_at?: string | null;
          visual_identity_json?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["army_lists"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
