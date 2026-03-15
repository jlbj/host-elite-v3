-- Fix: Add ES (Spain) configurations for LEG features that are missing
-- This ensures Spanish users see the same Legal features as English users

-- Add ES configs for LEG_00 (Compliance Checker)
INSERT INTO public.feature_configurations (config_id, feature_id, tier_id, country_code, config_value)
VALUES (1001, 'LEG_00', 'TIER_0', 'ES', '{"view_only": true}')
ON CONFLICT (config_id) DO NOTHING;

-- Add ES configs for LEG_01 (Regulatory Checklist) 
INSERT INTO public.feature_configurations (config_id, feature_id, tier_id, country_code, config_value)
VALUES (1002, 'LEG_01', 'TIER_0', 'ES', '{"view_only": true}')
ON CONFLICT (config_id) DO NOTHING;

-- Add ES configs for LEG_02 (Zweckentfremdung - German, but show for ES too)
INSERT INTO public.feature_configurations (config_id, feature_id, tier_id, country_code, config_value)
VALUES (1003, 'LEG_02', 'TIER_0', 'ES', '{"view_only": true}')
ON CONFLICT (config_id) DO NOTHING;

-- Add ES configs for LEG_03 (Cerfa - French, but show for ES as reference)
INSERT INTO public.feature_configurations (config_id, feature_id, tier_id, country_code, config_value)
VALUES (1004, 'LEG_03', 'TIER_0', 'ES', '{"view_only": true}')
ON CONFLICT (config_id) DO NOTHING;

-- Add ES configs for LEG_05 (Impressum - German, but show for ES too)
INSERT INTO public.feature_configurations (config_id, feature_id, tier_id, country_code, config_value)
VALUES (1005, 'LEG_05', 'TIER_0', 'ES', '{"view_only": true}')
ON CONFLICT (config_id) DO NOTHING;

-- Add ES configs for LEG_06 (Company Audit)
INSERT INTO public.feature_configurations (config_id, feature_id, tier_id, country_code, config_value)
VALUES (1006, 'LEG_06', 'TIER_0', 'ES', '{"view_only": true}')
ON CONFLICT (config_id) DO NOTHING;

-- Add ES configs for LEG_07 (Mandate Generator)
INSERT INTO public.feature_configurations (config_id, feature_id, tier_id, country_code, config_value)
VALUES (1007, 'LEG_07', 'TIER_0', 'ES', '{"view_only": true}')
ON CONFLICT (config_id) DO NOTHING;

-- Add ES configs for LEG_08 (Foreign ID)
INSERT INTO public.feature_configurations (config_id, feature_id, tier_id, country_code, config_value)
VALUES (1008, 'LEG_08', 'TIER_0', 'ES', '{"view_only": true}')
ON CONFLICT (config_id) DO NOTHING;

-- Add ES configs for LEG_09 (Rental Contract)
INSERT INTO public.feature_configurations (config_id, feature_id, tier_id, country_code, config_value)
VALUES (1009, 'LEG_09', 'TIER_0', 'ES', '{"view_only": true}')
ON CONFLICT (config_id) DO NOTHING;

-- Add ES configs for LEG_10 (Property Licensing)
INSERT INTO public.feature_configurations (config_id, feature_id, tier_id, country_code, config_value)
VALUES (1010, 'LEG_10', 'TIER_0', 'ES', '{"view_only": true}')
ON CONFLICT (config_id) DO NOTHING;

-- Add ES configs for LEG_11 (Insurance Requirements)
INSERT INTO public.feature_configurations (config_id, feature_id, tier_id, country_code, config_value)
VALUES (1011, 'LEG_11', 'TIER_0', 'ES', '{"view_only": true}')
ON CONFLICT (config_id) DO NOTHING;

-- Add ES configs for LEG_12 (Tax Obligations)
INSERT INTO public.feature_configurations (config_id, feature_id, tier_id, country_code, config_value)
VALUES (1012, 'LEG_12', 'TIER_0', 'ES', '{"view_only": true}')
ON CONFLICT (config_id) DO NOTHING;

-- Also add UK configs for LEG_04, LEG_03, LEG_05 to match Spanish users' English experience
INSERT INTO public.feature_configurations (config_id, feature_id, tier_id, country_code, config_value)
VALUES 
    (1013, 'LEG_04', 'TIER_0', 'UK', '{"view_only": true}'),
    (1014, 'LEG_03', 'TIER_0', 'UK', '{"view_only": true}'),
    (1015, 'LEG_05', 'TIER_0', 'UK', '{"view_only": true}')
ON CONFLICT (config_id) DO NOTHING;
