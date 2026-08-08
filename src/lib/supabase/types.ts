/**
 * Database types, mirroring supabase/migrations/0001_content_schema.sql.
 *
 * Hand-written because there is no provisioned project to generate against yet.
 * Once one exists, this file can be regenerated instead of maintained:
 *
 *   npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts
 *
 * Until then, a schema change means editing both the migration and this file.
 *
 * `Relationships: []` on every table and `CompositeTypes` on the schema are not
 * decorative. supabase-js resolves the Insert/Update generics only when the full
 * shape is present; without them every write infers as `never` and
 * `.update()`/`.insert()` fail to typecheck. Reads still work, so the omission
 * stays invisible until the first write path is built — which is exactly when it
 * surfaced here.
 * The Zod schemas in src/lib/schemas.ts are validated against these types at
 * compile time, so a mismatch between the two surfaces as a type error rather
 * than a runtime surprise.
 */

type Timestamp = string;
type DateString = string;

export type Database = {
  public: {
    Tables: {
      profile: {
        Row: {
          id: string;
          name: string;
          headline: string;
          bio: string;
          location: string | null;
          contact_email: string | null;
          github_url: string | null;
          linkedin_url: string | null;
          resume_url: string | null;
          avatar_url: string | null;
          updated_at: Timestamp;
        };
        Insert: Omit<Database["public"]["Tables"]["profile"]["Row"], "id" | "updated_at"> & {
          id?: string;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["profile"]["Insert"]>;
        Relationships: [];
      };

      experience: {
        Row: {
          id: string;
          role: string;
          company: string;
          start_date: DateString;
          end_date: DateString | null;
          summary: string | null;
          highlights: string[];
          sort_order: number;
          updated_at: Timestamp;
        };
        Insert: Omit<
          Database["public"]["Tables"]["experience"]["Row"],
          "id" | "updated_at" | "highlights" | "sort_order"
        > & {
          id?: string;
          updated_at?: Timestamp;
          highlights?: string[];
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["experience"]["Insert"]>;
        Relationships: [];
      };

      projects: {
        Row: {
          id: string;
          slug: string;
          title: string;
          pitch: string;
          description: string | null;
          stack: string[];
          demo_url: string | null;
          source_url: string | null;
          impact: string | null;
          featured: boolean;
          sort_order: number;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: Omit<
          Database["public"]["Tables"]["projects"]["Row"],
          "id" | "created_at" | "updated_at" | "stack" | "featured" | "sort_order"
        > & {
          id?: string;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          stack?: string[];
          featured?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
        Relationships: [];
      };

      skills: {
        Row: {
          id: string;
          category: string;
          items: string[];
          sort_order: number;
          updated_at: Timestamp;
        };
        Insert: Omit<
          Database["public"]["Tables"]["skills"]["Row"],
          "id" | "updated_at" | "items" | "sort_order"
        > & {
          id?: string;
          updated_at?: Timestamp;
          items?: string[];
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["skills"]["Insert"]>;
        Relationships: [];
      };
    };

    Views: Record<string, never>;

    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };

    Enums: Record<string, never>;

    CompositeTypes: Record<string, never>;
  };
};

/** Convenience row aliases used across the app. */
export type ProfileRow = Database["public"]["Tables"]["profile"]["Row"];
export type ExperienceRow = Database["public"]["Tables"]["experience"]["Row"];
export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
export type SkillRow = Database["public"]["Tables"]["skills"]["Row"];
