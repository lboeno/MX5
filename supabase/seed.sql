-- Seed data for development/demo
-- 2026-07-18

-- Categories (already seeded by migration 007, this is supplemental)

-- Championships
INSERT INTO championships (id, name, slug, organization, season) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Campeonato Brasileiro de Motocross', 'cbmx-2025', 'CBMX', '2025')
ON CONFLICT (id) DO NOTHING;

-- Tracks
INSERT INTO tracks (id, name, city, state) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Moto Parque Cianorte', 'Cianorte', 'PR'),
  ('a0000000-0000-0000-0000-000000000002', 'Autódromo de Piracicaba', 'Piracicaba', 'SP')
ON CONFLICT (id) DO NOTHING;

-- Events
INSERT INTO events (id, slug, title, championship_id, track_id, city, state, start_date, end_date, entry_fee, max_pilots, publication_status, event_status, is_featured) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'cbmx-2025-etapa-1', 'CBMX 2025 — Etapa 1', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Cianorte', 'PR', '2025-08-15', '2025-08-17', 380.00, 100, 'published', 'finished', true),
  ('e0000000-0000-0000-0000-000000000002', 'cbmx-2025-etapa-2', 'CBMX 2025 — Etapa 2', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Piracicaba', 'SP', '2025-09-12', '2025-09-14', 380.00, 100, 'published', 'registration_open', true),
  ('e0000000-0000-0000-0000-000000000003', 'mx-internacional-sp', 'MX Internacional de São Paulo', NULL, NULL, 'São Paulo', 'SP', '2025-12-05', '2025-12-07', 450.00, 120, 'draft', 'upcoming', false)
ON CONFLICT (id) DO NOTHING;

-- Event Categories (N:N)
INSERT INTO event_categories (event_id, category_id)
SELECT e.id, c.id
FROM (VALUES
  ('e0000000-0000-0000-0000-000000000001'::uuid, 'MX1'),
  ('e0000000-0000-0000-0000-000000000001'::uuid, 'MX2'),
  ('e0000000-0000-0000-0000-000000000002'::uuid, 'MX1'),
  ('e0000000-0000-0000-0000-000000000002'::uuid, 'MX2'),
  ('e0000000-0000-0000-0000-000000000002'::uuid, 'MXF'),
  ('e0000000-0000-0000-0000-000000000003'::uuid, 'MX1'),
  ('e0000000-0000-0000-0000-000000000003'::uuid, 'MX2')
) AS data(event_id, cat_name)
JOIN categories c ON c.name = data.cat_name
JOIN events e ON e.id = data.event_id
ON CONFLICT DO NOTHING;

-- Event Schedule (for Etapa 2 - registration_open)
INSERT INTO event_schedule (event_id, day, start_time, title, type) VALUES
  ('e0000000-0000-0000-0000-000000000002', 1, '08:00', 'Treino Livre MX1', 'practice'),
  ('e0000000-0000-0000-0000-000000000002', 1, '09:30', 'Treino Livre MX2', 'practice'),
  ('e0000000-0000-0000-0000-000000000002', 1, '11:00', 'Classificatório MX1', 'qualifying'),
  ('e0000000-0000-0000-0000-000000000002', 1, '14:00', 'Classificatório MX2', 'qualifying'),
  ('e0000000-0000-0000-0000-000000000002', 2, '09:00', 'Corrida 1 — MX1', 'race'),
  ('e0000000-0000-0000-0000-000000000002', 2, '10:30', 'Corrida 1 — MX2', 'race'),
  ('e0000000-0000-0000-0000-000000000002', 2, '14:00', 'Corrida 2 — MX1', 'race'),
  ('e0000000-0000-0000-0000-000000000002', 2, '15:30', 'Corrida 2 — MX2', 'race'),
  ('e0000000-0000-0000-0000-000000000002', 2, '17:00', 'Cerimônia de Pódio', 'ceremony')
ON CONFLICT DO NOTHING;

-- Event Sponsors (for Etapa 2)
INSERT INTO event_sponsors (event_id, name, tier) VALUES
  ('e0000000-0000-0000-0000-000000000002', 'Fox Racing', 'platinum'),
  ('e0000000-0000-0000-0000-000000000002', 'Alpinestars', 'gold'),
  ('e0000000-0000-0000-0000-000000000002', 'KTM Factory', 'silver')
ON CONFLICT DO NOTHING;
