--
-- PostgreSQL database dump
--


-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: postgres
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: postgres
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: postgres
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    parent_id integer,
    level integer DEFAULT 1,
    system_module character varying(50) NOT NULL,
    account_type character varying(50) DEFAULT 'detail'::character varying,
    nature character varying(50) NOT NULL,
    is_parent boolean DEFAULT false,
    is_active boolean DEFAULT true,
    is_cash_account boolean DEFAULT false,
    is_bank_account boolean DEFAULT false,
    currency character varying(10) DEFAULT 'SAR'::character varying,
    opening_balance numeric(18,2) DEFAULT '0'::numeric,
    current_balance numeric(18,2) DEFAULT '0'::numeric,
    description text,
    linked_entity_type character varying(50),
    linked_entity_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- Name: accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accounts_id_seq OWNER TO postgres;

--
-- Name: accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accounts_id_seq OWNED BY public.accounts.id;


--
-- Name: ai_models; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_models (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_ar character varying(200) NOT NULL,
    name_en character varying(200),
    description text,
    model_type character varying(50) NOT NULL,
    provider character varying(50) DEFAULT 'internal'::character varying,
    model_version character varying(50),
    endpoint character varying(500),
    input_schema jsonb,
    output_schema jsonb,
    accuracy numeric(5,2),
    last_trained_at timestamp without time zone,
    training_data_count integer,
    is_active boolean DEFAULT true,
    config jsonb,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ai_models OWNER TO postgres;

--
-- Name: ai_models_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_models_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_models_id_seq OWNER TO postgres;

--
-- Name: ai_models_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_models_id_seq OWNED BY public.ai_models.id;


--
-- Name: ai_predictions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_predictions (
    id integer NOT NULL,
    model_id integer NOT NULL,
    business_id integer NOT NULL,
    prediction_type character varying(50) NOT NULL,
    target_entity character varying(50),
    target_entity_id integer,
    input_data jsonb NOT NULL,
    prediction jsonb NOT NULL,
    confidence numeric(5,2),
    prediction_date date NOT NULL,
    valid_from timestamp without time zone,
    valid_to timestamp without time zone,
    actual_value jsonb,
    accuracy numeric(5,2),
    is_verified boolean DEFAULT false,
    verified_at timestamp without time zone,
    verified_by integer,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ai_predictions OWNER TO postgres;

--
-- Name: ai_predictions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_predictions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_predictions_id_seq OWNER TO postgres;

--
-- Name: ai_predictions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_predictions_id_seq OWNED BY public.ai_predictions.id;


--
-- Name: alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alerts (
    id integer NOT NULL,
    business_id integer NOT NULL,
    station_id integer,
    equipment_id integer,
    sensor_id integer,
    "alertType" character varying(50) NOT NULL,
    category character varying(50),
    title character varying(255) NOT NULL,
    message text,
    value numeric(15,4),
    threshold numeric(15,4),
    status character varying(50) DEFAULT 'active'::character varying,
    triggered_at timestamp without time zone DEFAULT now() NOT NULL,
    acknowledged_by integer,
    acknowledged_at timestamp without time zone,
    resolved_by integer,
    resolved_at timestamp without time zone,
    resolution text,
    work_order_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.alerts OWNER TO postgres;

--
-- Name: alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alerts_id_seq OWNER TO postgres;

--
-- Name: alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.alerts_id_seq OWNED BY public.alerts.id;


--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.api_keys (
    id integer NOT NULL,
    business_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    key_hash character varying(255) NOT NULL,
    key_prefix character varying(20) NOT NULL,
    permissions jsonb,
    allowed_ips jsonb,
    allowed_origins jsonb,
    rate_limit_per_minute integer DEFAULT 60,
    rate_limit_per_day integer DEFAULT 10000,
    expires_at timestamp without time zone,
    last_used_at timestamp without time zone,
    usage_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.api_keys OWNER TO postgres;

--
-- Name: api_keys_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.api_keys_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.api_keys_id_seq OWNER TO postgres;

--
-- Name: api_keys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.api_keys_id_seq OWNED BY public.api_keys.id;


--
-- Name: api_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.api_logs (
    id integer NOT NULL,
    api_key_id integer,
    business_id integer NOT NULL,
    endpoint character varying(500) NOT NULL,
    method character varying(10) NOT NULL,
    request_headers jsonb,
    request_body jsonb,
    response_status integer,
    response_time integer,
    ip_address character varying(50),
    user_agent character varying(500),
    error_message text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.api_logs OWNER TO postgres;

--
-- Name: api_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.api_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.api_logs_id_seq OWNER TO postgres;

--
-- Name: api_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.api_logs_id_seq OWNED BY public.api_logs.id;


--
-- Name: areas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.areas (
    id integer NOT NULL,
    business_id integer NOT NULL,
    project_id integer,
    code character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    name_en character varying(255),
    description text,
    address text,
    latitude numeric(10,8),
    longitude numeric(11,8),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.areas OWNER TO postgres;

--
-- Name: areas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.areas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.areas_id_seq OWNER TO postgres;

--
-- Name: areas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.areas_id_seq OWNED BY public.areas.id;


--
-- Name: asset_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_categories (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    parent_id integer,
    "depreciationMethod" character varying(50) DEFAULT 'straight_line'::character varying,
    useful_life integer,
    salvage_percentage numeric(5,2) DEFAULT '0'::numeric,
    asset_account_id integer,
    depreciation_account_id integer,
    accumulated_dep_account_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.asset_categories OWNER TO postgres;

--
-- Name: asset_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_categories_id_seq OWNER TO postgres;

--
-- Name: asset_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_categories_id_seq OWNED BY public.asset_categories.id;


--
-- Name: asset_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_movements (
    id integer NOT NULL,
    asset_id integer NOT NULL,
    movement_type character varying(50) NOT NULL,
    movement_date date NOT NULL,
    from_branch_id integer,
    to_branch_id integer,
    from_station_id integer,
    to_station_id integer,
    amount numeric(18,2),
    description text,
    reference_type character varying(50),
    reference_id integer,
    journal_entry_id integer,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.asset_movements OWNER TO postgres;

--
-- Name: asset_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_movements_id_seq OWNER TO postgres;

--
-- Name: asset_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_movements_id_seq OWNED BY public.asset_movements.id;


--
-- Name: assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assets (
    id integer NOT NULL,
    business_id integer NOT NULL,
    branch_id integer,
    station_id integer,
    category_id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    description text,
    serial_number character varying(100),
    model character varying(100),
    manufacturer character varying(100),
    purchase_date date,
    commission_date date,
    purchase_cost numeric(18,2) DEFAULT '0'::numeric,
    current_value numeric(18,2) DEFAULT '0'::numeric,
    accumulated_depreciation numeric(18,2) DEFAULT '0'::numeric,
    salvage_value numeric(18,2) DEFAULT '0'::numeric,
    useful_life integer,
    "depreciationMethod" character varying(50),
    status character varying(50) DEFAULT 'active'::character varying,
    location character varying(255),
    latitude numeric(10,8),
    longitude numeric(11,8),
    warranty_expiry date,
    supplier_id integer,
    purchase_order_id integer,
    parent_asset_id integer,
    qr_code character varying(255),
    barcode character varying(100),
    image text,
    specifications jsonb,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.assets OWNER TO postgres;

--
-- Name: assets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assets_id_seq OWNER TO postgres;

--
-- Name: assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assets_id_seq OWNED BY public.assets.id;


--
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    business_id integer NOT NULL,
    attendance_date date NOT NULL,
    check_in_time timestamp without time zone,
    check_in_location character varying(255),
    check_in_latitude numeric(10,8),
    check_in_longitude numeric(11,8),
    "checkInMethod" character varying(50) DEFAULT 'manual'::character varying,
    check_out_time timestamp without time zone,
    check_out_location character varying(255),
    check_out_latitude numeric(10,8),
    check_out_longitude numeric(11,8),
    "checkOutMethod" character varying(50) DEFAULT 'manual'::character varying,
    total_hours numeric(5,2),
    overtime_hours numeric(5,2) DEFAULT '0'::numeric,
    late_minutes integer DEFAULT 0,
    early_leave_minutes integer DEFAULT 0,
    status character varying(50) DEFAULT 'present'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attendance_id_seq OWNER TO postgres;

--
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    business_id integer,
    user_id integer,
    action character varying(50) NOT NULL,
    module character varying(50) NOT NULL,
    entity_type character varying(50),
    entity_id integer,
    old_values jsonb,
    new_values jsonb,
    ip_address character varying(50),
    user_agent text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: billing_periods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.billing_periods (
    id integer NOT NULL,
    business_id integer NOT NULL,
    project_id integer,
    name character varying(100) NOT NULL,
    period_number integer,
    month integer,
    year integer,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    reading_start_date date,
    reading_end_date date,
    billing_date date,
    due_date date,
    total_meters integer DEFAULT 0,
    read_meters integer DEFAULT 0,
    billed_meters integer DEFAULT 0,
    created_by integer,
    closed_by integer,
    closed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.billing_periods OWNER TO postgres;

--
-- Name: billing_periods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.billing_periods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.billing_periods_id_seq OWNER TO postgres;

--
-- Name: billing_periods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.billing_periods_id_seq OWNED BY public.billing_periods.id;


--
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    type character varying(20) DEFAULT 'local'::character varying NOT NULL,
    parent_id integer,
    address text,
    city character varying(100),
    region character varying(100),
    country character varying(100) DEFAULT 'Saudi Arabia'::character varying,
    latitude numeric(10,8),
    longitude numeric(11,8),
    phone character varying(50),
    email character varying(255),
    manager_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.branches OWNER TO postgres;

--
-- Name: branches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.branches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.branches_id_seq OWNER TO postgres;

--
-- Name: branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.branches_id_seq OWNED BY public.branches.id;


--
-- Name: businesses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.businesses (
    id integer NOT NULL,
    code character varying(20) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    type character varying(20) DEFAULT 'subsidiary'::character varying NOT NULL,
    system_type character varying(20) DEFAULT 'both'::character varying NOT NULL,
    parent_id integer,
    logo text,
    address text,
    phone character varying(50),
    email character varying(255),
    website character varying(255),
    tax_number character varying(50),
    commercial_register character varying(50),
    currency character varying(10) DEFAULT 'SAR'::character varying,
    fiscal_year_start integer DEFAULT 1,
    timezone character varying(50) DEFAULT 'Asia/Riyadh'::character varying,
    is_active boolean DEFAULT true,
    settings jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.businesses OWNER TO postgres;

--
-- Name: businesses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.businesses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.businesses_id_seq OWNER TO postgres;

--
-- Name: businesses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.businesses_id_seq OWNED BY public.businesses.id;


--
-- Name: cabinets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cabinets (
    id integer NOT NULL,
    business_id integer NOT NULL,
    square_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    name_en character varying(255),
    "cabinetType" character varying(50) DEFAULT 'distribution'::character varying,
    capacity integer,
    current_load integer DEFAULT 0,
    latitude numeric(10,8),
    longitude numeric(11,8),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cabinets OWNER TO postgres;

--
-- Name: cabinets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cabinets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cabinets_id_seq OWNER TO postgres;

--
-- Name: cabinets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cabinets_id_seq OWNED BY public.cabinets.id;


--
-- Name: cashboxes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cashboxes (
    id integer NOT NULL,
    business_id integer NOT NULL,
    branch_id integer,
    code character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    name_en character varying(255),
    balance numeric(18,2) DEFAULT '0'::numeric,
    currency character varying(10) DEFAULT 'SAR'::character varying,
    assigned_to integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cashboxes OWNER TO postgres;

--
-- Name: cashboxes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cashboxes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cashboxes_id_seq OWNER TO postgres;

--
-- Name: cashboxes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cashboxes_id_seq OWNED BY public.cashboxes.id;


--
-- Name: cost_centers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cost_centers (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    parent_id integer,
    level integer DEFAULT 1,
    type character varying(50),
    station_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cost_centers OWNER TO postgres;

--
-- Name: cost_centers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cost_centers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cost_centers_id_seq OWNER TO postgres;

--
-- Name: cost_centers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cost_centers_id_seq OWNED BY public.cost_centers.id;


--
-- Name: custom_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_accounts (
    id integer NOT NULL,
    business_id integer NOT NULL,
    account_number character varying(50) NOT NULL,
    account_name character varying(255) NOT NULL,
    account_type character varying(50) NOT NULL,
    parent_id integer,
    balance numeric(15,2) DEFAULT '0'::numeric,
    currency character varying(10) DEFAULT 'SAR'::character varying,
    description text,
    is_active boolean DEFAULT true,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.custom_accounts OWNER TO postgres;

--
-- Name: custom_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_accounts_id_seq OWNER TO postgres;

--
-- Name: custom_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_accounts_id_seq OWNED BY public.custom_accounts.id;


--
-- Name: custom_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_categories (
    id integer NOT NULL,
    business_id integer NOT NULL,
    sub_system_id integer,
    code character varying(20) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    "categoryType" character varying(50) NOT NULL,
    parent_id integer,
    level integer DEFAULT 1,
    color character varying(20),
    icon character varying(50),
    description text,
    linked_account_id integer,
    is_active boolean DEFAULT true,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.custom_categories OWNER TO postgres;

--
-- Name: custom_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_categories_id_seq OWNER TO postgres;

--
-- Name: custom_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_categories_id_seq OWNED BY public.custom_categories.id;


--
-- Name: custom_intermediary_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_intermediary_accounts (
    id integer NOT NULL,
    business_id integer NOT NULL,
    from_sub_system_id integer NOT NULL,
    to_sub_system_id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    balance numeric(18,2) DEFAULT '0'::numeric,
    currency character varying(10) DEFAULT 'SAR'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.custom_intermediary_accounts OWNER TO postgres;

--
-- Name: custom_intermediary_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_intermediary_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_intermediary_accounts_id_seq OWNER TO postgres;

--
-- Name: custom_intermediary_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_intermediary_accounts_id_seq OWNED BY public.custom_intermediary_accounts.id;


--
-- Name: custom_memos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_memos (
    id integer NOT NULL,
    business_id integer NOT NULL,
    memo_number character varying(50) NOT NULL,
    memo_date date NOT NULL,
    subject character varying(255) NOT NULL,
    content text,
    "memoType" character varying(50) DEFAULT 'internal'::character varying,
    from_department character varying(255),
    to_department character varying(255),
    status character varying(50) DEFAULT 'draft'::character varying,
    priority character varying(50) DEFAULT 'medium'::character varying,
    attachments jsonb,
    response_required boolean DEFAULT false,
    response_deadline date,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.custom_memos OWNER TO postgres;

--
-- Name: custom_memos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_memos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_memos_id_seq OWNER TO postgres;

--
-- Name: custom_memos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_memos_id_seq OWNED BY public.custom_memos.id;


--
-- Name: custom_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_notes (
    id integer NOT NULL,
    business_id integer NOT NULL,
    title character varying(255) NOT NULL,
    content text,
    category character varying(100),
    priority character varying(50) DEFAULT 'medium'::character varying,
    color character varying(20),
    is_pinned boolean DEFAULT false,
    is_archived boolean DEFAULT false,
    tags jsonb,
    attachments jsonb,
    reminder_date timestamp without time zone,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.custom_notes OWNER TO postgres;

--
-- Name: custom_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_notes_id_seq OWNER TO postgres;

--
-- Name: custom_notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_notes_id_seq OWNED BY public.custom_notes.id;


--
-- Name: custom_parties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_parties (
    id integer NOT NULL,
    business_id integer NOT NULL,
    sub_system_id integer,
    code character varying(20) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    "partyType" character varying(50) NOT NULL,
    phone character varying(50),
    mobile character varying(50),
    email character varying(255),
    address text,
    city character varying(100),
    country character varying(100) DEFAULT 'Saudi Arabia'::character varying,
    tax_number character varying(50),
    commercial_register character varying(50),
    credit_limit numeric(18,2) DEFAULT '0'::numeric,
    current_balance numeric(18,2) DEFAULT '0'::numeric,
    currency character varying(10) DEFAULT 'SAR'::character varying,
    contact_person character varying(255),
    notes text,
    tags jsonb,
    is_active boolean DEFAULT true,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.custom_parties OWNER TO postgres;

--
-- Name: custom_parties_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_parties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_parties_id_seq OWNER TO postgres;

--
-- Name: custom_parties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_parties_id_seq OWNED BY public.custom_parties.id;


--
-- Name: custom_party_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_party_transactions (
    id integer NOT NULL,
    business_id integer NOT NULL,
    party_id integer NOT NULL,
    transaction_type character varying(50) NOT NULL,
    transaction_date date NOT NULL,
    amount numeric(18,2) NOT NULL,
    balance_before numeric(18,2) NOT NULL,
    balance_after numeric(18,2) NOT NULL,
    currency character varying(10) DEFAULT 'SAR'::character varying,
    reference_type character varying(50),
    reference_id integer,
    reference_number character varying(50),
    description text,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.custom_party_transactions OWNER TO postgres;

--
-- Name: custom_party_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_party_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_party_transactions_id_seq OWNER TO postgres;

--
-- Name: custom_party_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_party_transactions_id_seq OWNED BY public.custom_party_transactions.id;


--
-- Name: custom_payment_voucher_lines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_payment_voucher_lines (
    id integer NOT NULL,
    business_id integer NOT NULL,
    payment_voucher_id integer NOT NULL,
    line_order integer DEFAULT 0 NOT NULL,
    account_type character varying(50),
    account_sub_type_id integer,
    account_id integer NOT NULL,
    analytic_account_id integer,
    analytic_treasury_id integer,
    cost_center_id integer,
    description text,
    amount numeric(18,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.custom_payment_voucher_lines OWNER TO postgres;

--
-- Name: custom_payment_voucher_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_payment_voucher_lines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_payment_voucher_lines_id_seq OWNER TO postgres;

--
-- Name: custom_payment_voucher_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_payment_voucher_lines_id_seq OWNED BY public.custom_payment_voucher_lines.id;


--
-- Name: custom_payment_vouchers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_payment_vouchers (
    id integer NOT NULL,
    business_id integer NOT NULL,
    sub_system_id integer NOT NULL,
    voucher_number character varying(50) NOT NULL,
    voucher_date date NOT NULL,
    amount numeric(18,2) NOT NULL,
    currency character varying(10) DEFAULT 'SAR'::character varying,
    currency_id integer,
    treasury_id integer NOT NULL,
    "destinationType" character varying(50) NOT NULL,
    destination_name character varying(255),
    destination_intermediary_id integer,
    party_id integer,
    category_id integer,
    "paymentMethod" character varying(50) DEFAULT 'cash'::character varying,
    check_number character varying(50),
    check_date date,
    check_bank character varying(100),
    bank_reference character varying(100),
    description text,
    attachments jsonb,
    status character varying(50) DEFAULT 'draft'::character varying,
    edit_count integer DEFAULT 0 NOT NULL,
    is_reconciled boolean DEFAULT false,
    reconciled_with integer,
    reconciled_at timestamp without time zone,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.custom_payment_vouchers OWNER TO postgres;

--
-- Name: custom_payment_vouchers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_payment_vouchers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_payment_vouchers_id_seq OWNER TO postgres;

--
-- Name: custom_payment_vouchers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_payment_vouchers_id_seq OWNED BY public.custom_payment_vouchers.id;


--
-- Name: custom_receipt_vouchers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_receipt_vouchers (
    id integer NOT NULL,
    business_id integer NOT NULL,
    sub_system_id integer NOT NULL,
    voucher_number character varying(50) NOT NULL,
    voucher_date date NOT NULL,
    amount numeric(18,2) NOT NULL,
    currency character varying(10) DEFAULT 'SAR'::character varying,
    "sourceType" character varying(50) NOT NULL,
    source_name character varying(255),
    source_intermediary_id integer,
    party_id integer,
    category_id integer,
    "paymentMethod" character varying(50) DEFAULT 'cash'::character varying,
    check_number character varying(50),
    check_date date,
    check_bank character varying(100),
    bank_reference character varying(100),
    treasury_id integer NOT NULL,
    description text,
    attachments jsonb,
    status character varying(50) DEFAULT 'draft'::character varying,
    is_reconciled boolean DEFAULT false,
    reconciled_with integer,
    reconciled_at timestamp without time zone,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.custom_receipt_vouchers OWNER TO postgres;

--
-- Name: custom_receipt_vouchers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_receipt_vouchers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_receipt_vouchers_id_seq OWNER TO postgres;

--
-- Name: custom_receipt_vouchers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_receipt_vouchers_id_seq OWNED BY public.custom_receipt_vouchers.id;


--
-- Name: custom_reconciliations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_reconciliations (
    id integer NOT NULL,
    business_id integer NOT NULL,
    payment_voucher_id integer NOT NULL,
    receipt_voucher_id integer NOT NULL,
    amount numeric(18,2) NOT NULL,
    currency character varying(10) DEFAULT 'SAR'::character varying,
    "confidenceScore" character varying(50) DEFAULT 'medium'::character varying,
    status character varying(50) DEFAULT 'pending'::character varying,
    notes text,
    confirmed_by integer,
    confirmed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.custom_reconciliations OWNER TO postgres;

--
-- Name: custom_reconciliations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_reconciliations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_reconciliations_id_seq OWNER TO postgres;

--
-- Name: custom_reconciliations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_reconciliations_id_seq OWNED BY public.custom_reconciliations.id;


--
-- Name: custom_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_settings (
    id integer NOT NULL,
    business_id integer NOT NULL,
    sub_system_id integer,
    setting_key character varying(100) NOT NULL,
    setting_value text,
    "settingType" character varying(50) DEFAULT 'string'::character varying,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.custom_settings OWNER TO postgres;

--
-- Name: custom_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_settings_id_seq OWNER TO postgres;

--
-- Name: custom_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_settings_id_seq OWNED BY public.custom_settings.id;


--
-- Name: custom_sub_systems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_sub_systems (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    description text,
    color character varying(20),
    icon character varying(50),
    is_active boolean DEFAULT true,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.custom_sub_systems OWNER TO postgres;

--
-- Name: custom_sub_systems_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_sub_systems_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_sub_systems_id_seq OWNER TO postgres;

--
-- Name: custom_sub_systems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_sub_systems_id_seq OWNED BY public.custom_sub_systems.id;


--
-- Name: custom_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_transactions (
    id integer NOT NULL,
    business_id integer NOT NULL,
    transaction_number character varying(50) NOT NULL,
    transaction_date date NOT NULL,
    account_id integer NOT NULL,
    transaction_type character varying(50) NOT NULL,
    amount numeric(15,2) NOT NULL,
    description text,
    reference_type character varying(50),
    reference_id integer,
    attachments jsonb,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.custom_transactions OWNER TO postgres;

--
-- Name: custom_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_transactions_id_seq OWNER TO postgres;

--
-- Name: custom_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_transactions_id_seq OWNED BY public.custom_transactions.id;


--
-- Name: custom_treasuries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_treasuries (
    id integer NOT NULL,
    business_id integer NOT NULL,
    sub_system_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    treasury_type character varying(50) NOT NULL,
    account_id integer,
    bank_name character varying(255),
    account_number character varying(100),
    iban character varying(50),
    swift_code character varying(20),
    wallet_provider character varying(100),
    wallet_number character varying(100),
    currency character varying(10) DEFAULT 'SAR'::character varying,
    opening_balance numeric(18,2) DEFAULT '0'::numeric,
    current_balance numeric(18,2) DEFAULT '0'::numeric,
    description text,
    is_active boolean DEFAULT true,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.custom_treasuries OWNER TO postgres;

--
-- Name: custom_treasuries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_treasuries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_treasuries_id_seq OWNER TO postgres;

--
-- Name: custom_treasuries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_treasuries_id_seq OWNED BY public.custom_treasuries.id;


--
-- Name: custom_treasury_currencies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_treasury_currencies (
    id integer NOT NULL,
    business_id integer NOT NULL,
    treasury_id integer NOT NULL,
    currency_id integer NOT NULL,
    is_default boolean DEFAULT false,
    is_active boolean DEFAULT true,
    opening_balance numeric(15,2) DEFAULT '0'::numeric,
    current_balance numeric(15,2) DEFAULT '0'::numeric,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.custom_treasury_currencies OWNER TO postgres;

--
-- Name: custom_treasury_currencies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_treasury_currencies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_treasury_currencies_id_seq OWNER TO postgres;

--
-- Name: custom_treasury_currencies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_treasury_currencies_id_seq OWNED BY public.custom_treasury_currencies.id;


--
-- Name: custom_treasury_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_treasury_movements (
    id integer NOT NULL,
    business_id integer NOT NULL,
    treasury_id integer NOT NULL,
    movement_type character varying(50) NOT NULL,
    movement_date date NOT NULL,
    amount numeric(18,2) NOT NULL,
    balance_before numeric(18,2) NOT NULL,
    balance_after numeric(18,2) NOT NULL,
    currency character varying(10) DEFAULT 'SAR'::character varying,
    reference_type character varying(50),
    reference_id integer,
    reference_number character varying(50),
    description text,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.custom_treasury_movements OWNER TO postgres;

--
-- Name: custom_treasury_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_treasury_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_treasury_movements_id_seq OWNER TO postgres;

--
-- Name: custom_treasury_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_treasury_movements_id_seq OWNED BY public.custom_treasury_movements.id;


--
-- Name: custom_treasury_transfers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_treasury_transfers (
    id integer NOT NULL,
    business_id integer NOT NULL,
    sub_system_id integer NOT NULL,
    transfer_number character varying(50) NOT NULL,
    transfer_date date NOT NULL,
    from_treasury_id integer NOT NULL,
    to_treasury_id integer NOT NULL,
    amount numeric(18,2) NOT NULL,
    currency character varying(10) DEFAULT 'SAR'::character varying,
    exchange_rate numeric(10,6) DEFAULT '1'::numeric,
    fees numeric(18,2) DEFAULT '0'::numeric,
    description text,
    status character varying(50) DEFAULT 'draft'::character varying,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.custom_treasury_transfers OWNER TO postgres;

--
-- Name: custom_treasury_transfers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_treasury_transfers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_treasury_transfers_id_seq OWNER TO postgres;

--
-- Name: custom_treasury_transfers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_treasury_transfers_id_seq OWNED BY public.custom_treasury_transfers.id;


--
-- Name: customer_quotas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_quotas (
    id integer NOT NULL,
    business_id integer NOT NULL,
    customer_id integer NOT NULL,
    program_id integer NOT NULL,
    quota_amount numeric(18,2) NOT NULL,
    consumed_amount numeric(18,2) DEFAULT 0.00,
    remaining_amount numeric(18,2),
    quota_period character varying(50),
    start_date date,
    end_date date,
    status character varying(20) DEFAULT 'active'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT customer_quotas_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'exhausted'::character varying, 'expired'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.customer_quotas OWNER TO postgres;

--
-- Name: customer_quotas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_quotas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_quotas_id_seq OWNER TO postgres;

--
-- Name: customer_quotas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customer_quotas_id_seq OWNED BY public.customer_quotas.id;


--
-- Name: customer_transactions_new; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_transactions_new (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    wallet_id integer,
    transaction_type character varying(50) NOT NULL,
    amount numeric(18,2) NOT NULL,
    balance_before numeric(18,2),
    balance_after numeric(18,2),
    reference_type character varying(50),
    reference_id integer,
    description text,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customer_transactions_new OWNER TO postgres;

--
-- Name: customer_transactions_new_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_transactions_new_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_transactions_new_id_seq OWNER TO postgres;

--
-- Name: customer_transactions_new_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customer_transactions_new_id_seq OWNED BY public.customer_transactions_new.id;


--
-- Name: customer_wallets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_wallets (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    balance numeric(18,2) DEFAULT '0'::numeric,
    currency character varying(10) DEFAULT 'SAR'::character varying,
    last_transaction_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customer_wallets OWNER TO postgres;

--
-- Name: customer_wallets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_wallets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_wallets_id_seq OWNER TO postgres;

--
-- Name: customer_wallets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customer_wallets_id_seq OWNED BY public.customer_wallets.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    business_id integer NOT NULL,
    branch_id integer,
    station_id integer,
    account_number character varying(50) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    type character varying(50) DEFAULT 'residential'::character varying,
    category character varying(50),
    "idType" character varying(50),
    id_number character varying(50),
    phone character varying(50),
    mobile character varying(50),
    email character varying(255),
    address text,
    city character varying(100),
    district character varying(100),
    postal_code character varying(20),
    latitude numeric(10,8),
    longitude numeric(11,8),
    tariff_id integer,
    connection_date date,
    status character varying(50) DEFAULT 'active'::character varying,
    current_balance numeric(18,2) DEFAULT '0'::numeric,
    deposit_amount numeric(18,2) DEFAULT '0'::numeric,
    credit_limit numeric(18,2),
    account_id integer,
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: customers_enhanced; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers_enhanced (
    id integer NOT NULL,
    business_id integer NOT NULL,
    project_id integer,
    full_name character varying(255) NOT NULL,
    mobile_no character varying(50),
    phone character varying(50),
    email character varying(255),
    address text,
    national_id character varying(50),
    "customerType" character varying(50) DEFAULT 'residential'::character varying,
    "serviceTier" character varying(50) DEFAULT 'basic'::character varying,
    status character varying(50) DEFAULT 'active'::character varying,
    balance_due numeric(18,2) DEFAULT '0'::numeric,
    user_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customers_enhanced OWNER TO postgres;

--
-- Name: customers_enhanced_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_enhanced_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_enhanced_id_seq OWNER TO postgres;

--
-- Name: customers_enhanced_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_enhanced_id_seq OWNED BY public.customers_enhanced.id;


--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name_ar character varying(100) NOT NULL,
    name_en character varying(100),
    parent_id integer,
    manager_id integer,
    cost_center_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_id_seq OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: diesel_pipes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diesel_pipes (
    id integer NOT NULL,
    business_id integer NOT NULL,
    station_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    pipe_material character varying(50) DEFAULT 'iron'::character varying,
    diameter numeric(6,2),
    length numeric(8,2),
    condition character varying(50) DEFAULT 'good'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.diesel_pipes OWNER TO postgres;

--
-- Name: diesel_pipes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.diesel_pipes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.diesel_pipes_id_seq OWNER TO postgres;

--
-- Name: diesel_pipes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.diesel_pipes_id_seq OWNED BY public.diesel_pipes.id;


--
-- Name: diesel_pump_meters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diesel_pump_meters (
    id integer NOT NULL,
    business_id integer NOT NULL,
    station_id integer,
    supplier_id integer,
    code character varying(20) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    pump_type character varying(50) NOT NULL,
    serial_number character varying(100),
    current_reading numeric(15,2) DEFAULT '0'::numeric,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.diesel_pump_meters OWNER TO postgres;

--
-- Name: diesel_pump_meters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.diesel_pump_meters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.diesel_pump_meters_id_seq OWNER TO postgres;

--
-- Name: diesel_pump_meters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.diesel_pump_meters_id_seq OWNED BY public.diesel_pump_meters.id;


--
-- Name: diesel_pump_readings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diesel_pump_readings (
    id integer NOT NULL,
    business_id integer NOT NULL,
    pump_meter_id integer NOT NULL,
    task_id integer,
    reading_date timestamp without time zone NOT NULL,
    reading_value numeric(15,2) NOT NULL,
    "readingType" character varying(50) NOT NULL,
    reading_image text,
    quantity numeric(10,2),
    recorded_by integer,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.diesel_pump_readings OWNER TO postgres;

--
-- Name: diesel_pump_readings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.diesel_pump_readings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.diesel_pump_readings_id_seq OWNER TO postgres;

--
-- Name: diesel_pump_readings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.diesel_pump_readings_id_seq OWNED BY public.diesel_pump_readings.id;


--
-- Name: diesel_receiving_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diesel_receiving_tasks (
    id integer NOT NULL,
    business_id integer NOT NULL,
    station_id integer NOT NULL,
    task_number character varying(50) NOT NULL,
    task_date date NOT NULL,
    employee_id integer NOT NULL,
    tanker_id integer NOT NULL,
    supplier_id integer NOT NULL,
    task_status character varying(50) DEFAULT 'pending'::character varying,
    start_time timestamp without time zone,
    arrival_at_supplier_time timestamp without time zone,
    loading_start_time timestamp without time zone,
    loading_end_time timestamp without time zone,
    departure_from_supplier_time timestamp without time zone,
    arrival_at_station_time timestamp without time zone,
    unloading_start_time timestamp without time zone,
    unloading_end_time timestamp without time zone,
    completion_time timestamp without time zone,
    supplier_pump_id integer,
    supplier_pump_reading_before numeric(15,2),
    supplier_pump_reading_after numeric(15,2),
    supplier_pump_reading_before_image text,
    supplier_pump_reading_after_image text,
    supplier_invoice_number character varying(50),
    supplier_invoice_image text,
    supplier_invoice_amount numeric(18,2),
    quantity_from_supplier numeric(10,2),
    compartment1_quantity numeric(10,2),
    compartment2_quantity numeric(10,2),
    intake_pump_id integer,
    intake_pump_reading_before numeric(15,2),
    intake_pump_reading_after numeric(15,2),
    intake_pump_reading_before_image text,
    intake_pump_reading_after_image text,
    quantity_received_at_station numeric(10,2),
    receiving_tank_id integer,
    quantity_difference numeric(10,2),
    difference_notes text,
    notes text,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.diesel_receiving_tasks OWNER TO postgres;

--
-- Name: diesel_receiving_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.diesel_receiving_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.diesel_receiving_tasks_id_seq OWNER TO postgres;

--
-- Name: diesel_receiving_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.diesel_receiving_tasks_id_seq OWNED BY public.diesel_receiving_tasks.id;


--
-- Name: diesel_suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diesel_suppliers (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    phone character varying(50),
    address text,
    latitude numeric(10,8),
    longitude numeric(11,8),
    contact_person character varying(100),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.diesel_suppliers OWNER TO postgres;

--
-- Name: diesel_suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.diesel_suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.diesel_suppliers_id_seq OWNER TO postgres;

--
-- Name: diesel_suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.diesel_suppliers_id_seq OWNED BY public.diesel_suppliers.id;


--
-- Name: diesel_tank_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diesel_tank_movements (
    id integer NOT NULL,
    business_id integer NOT NULL,
    station_id integer NOT NULL,
    movement_date timestamp without time zone NOT NULL,
    movement_type character varying(50) NOT NULL,
    from_tank_id integer,
    to_tank_id integer,
    quantity numeric(10,2) NOT NULL,
    task_id integer,
    output_pump_id integer,
    output_pump_reading_before numeric(15,2),
    output_pump_reading_after numeric(15,2),
    generator_id integer,
    notes text,
    recorded_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.diesel_tank_movements OWNER TO postgres;

--
-- Name: diesel_tank_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.diesel_tank_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.diesel_tank_movements_id_seq OWNER TO postgres;

--
-- Name: diesel_tank_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.diesel_tank_movements_id_seq OWNED BY public.diesel_tank_movements.id;


--
-- Name: diesel_tank_openings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diesel_tank_openings (
    id integer NOT NULL,
    tank_id integer NOT NULL,
    opening_number integer NOT NULL,
    "position" character varying(50) NOT NULL,
    usage character varying(50) NOT NULL,
    diameter numeric(6,2),
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.diesel_tank_openings OWNER TO postgres;

--
-- Name: diesel_tank_openings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.diesel_tank_openings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.diesel_tank_openings_id_seq OWNER TO postgres;

--
-- Name: diesel_tank_openings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.diesel_tank_openings_id_seq OWNED BY public.diesel_tank_openings.id;


--
-- Name: diesel_tankers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diesel_tankers (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(20) NOT NULL,
    plate_number character varying(20) NOT NULL,
    capacity numeric(10,2) NOT NULL,
    compartment1_capacity numeric(10,2),
    compartment2_capacity numeric(10,2),
    driver_name character varying(100),
    driver_phone character varying(50),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.diesel_tankers OWNER TO postgres;

--
-- Name: diesel_tankers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.diesel_tankers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.diesel_tankers_id_seq OWNER TO postgres;

--
-- Name: diesel_tankers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.diesel_tankers_id_seq OWNED BY public.diesel_tankers.id;


--
-- Name: diesel_tanks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diesel_tanks (
    id integer NOT NULL,
    business_id integer NOT NULL,
    station_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    tank_type character varying(50) NOT NULL,
    tank_material character varying(50) DEFAULT 'plastic'::character varying,
    brand character varying(100),
    color character varying(50),
    capacity numeric(10,2) NOT NULL,
    height numeric(8,2),
    diameter numeric(8,2),
    dead_stock numeric(10,2) DEFAULT '0'::numeric,
    effective_capacity numeric(10,2),
    current_level numeric(10,2) DEFAULT '0'::numeric,
    min_level numeric(10,2) DEFAULT '0'::numeric,
    openings_count integer DEFAULT 1,
    linked_generator_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.diesel_tanks OWNER TO postgres;

--
-- Name: diesel_tanks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.diesel_tanks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.diesel_tanks_id_seq OWNER TO postgres;

--
-- Name: diesel_tanks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.diesel_tanks_id_seq OWNED BY public.diesel_tanks.id;


--
-- Name: employee_contracts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_contracts (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    business_id integer NOT NULL,
    contract_number character varying(50) NOT NULL,
    "contractType" character varying(50) DEFAULT 'permanent'::character varying,
    start_date date NOT NULL,
    end_date date,
    basic_salary numeric(15,2),
    probation_period_days integer DEFAULT 90,
    notice_period_days integer DEFAULT 30,
    document_path character varying(500),
    status character varying(50) DEFAULT 'active'::character varying,
    termination_date date,
    termination_reason text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.employee_contracts OWNER TO postgres;

--
-- Name: employee_contracts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_contracts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_contracts_id_seq OWNER TO postgres;

--
-- Name: employee_contracts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_contracts_id_seq OWNED BY public.employee_contracts.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    business_id integer NOT NULL,
    employee_number character varying(20) NOT NULL,
    first_name character varying(100) NOT NULL,
    middle_name character varying(100),
    last_name character varying(100) NOT NULL,
    full_name_ar character varying(200),
    full_name_en character varying(200),
    "idType" character varying(50) DEFAULT 'national_id'::character varying,
    id_number character varying(50) NOT NULL,
    id_expiry_date date,
    nationality character varying(50),
    gender character varying(50) DEFAULT 'male'::character varying,
    date_of_birth date,
    place_of_birth character varying(100),
    "maritalStatus" character varying(50) DEFAULT 'single'::character varying,
    phone character varying(20),
    mobile character varying(20) NOT NULL,
    email character varying(100),
    personal_email character varying(100),
    address text,
    city character varying(100),
    district character varying(100),
    emergency_contact_name character varying(100),
    emergency_contact_phone character varying(20),
    emergency_contact_relation character varying(50),
    photo_path character varying(500),
    hire_date date NOT NULL,
    probation_end_date date,
    "contractType" character varying(50) DEFAULT 'permanent'::character varying,
    contract_start_date date,
    contract_end_date date,
    job_title_id integer,
    department_id integer,
    manager_id integer,
    is_manager boolean DEFAULT false,
    work_location character varying(100),
    station_id integer,
    branch_id integer,
    "workSchedule" character varying(50) DEFAULT 'full_time'::character varying,
    working_hours_per_week numeric(5,2) DEFAULT '40'::numeric,
    field_worker_id integer,
    status character varying(50) DEFAULT 'active'::character varying,
    termination_date date,
    termination_reason text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_id_seq OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment (
    id integer NOT NULL,
    business_id integer NOT NULL,
    station_id integer NOT NULL,
    asset_id integer,
    code character varying(50) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    type character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'unknown'::character varying,
    manufacturer character varying(100),
    model character varying(100),
    serial_number character varying(100),
    rated_capacity numeric(15,2),
    capacity_unit character varying(20),
    voltage_rating character varying(50),
    current_rating character varying(50),
    installation_date date,
    last_maintenance_date date,
    next_maintenance_date date,
    location character varying(255),
    latitude numeric(10,8),
    longitude numeric(11,8),
    is_controllable boolean DEFAULT false,
    is_monitored boolean DEFAULT true,
    communication_protocol character varying(50),
    ip_address character varying(50),
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.equipment OWNER TO postgres;

--
-- Name: equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_id_seq OWNER TO postgres;

--
-- Name: equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_id_seq OWNED BY public.equipment.id;


--
-- Name: equipment_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_movements (
    id integer NOT NULL,
    equipment_id integer NOT NULL,
    "movementType" character varying(50) NOT NULL,
    from_holder_id integer,
    to_holder_id integer,
    operation_id integer,
    movement_date timestamp without time zone DEFAULT now() NOT NULL,
    "conditionBefore" character varying(50),
    "conditionAfter" character varying(50),
    notes text,
    recorded_by integer
);


ALTER TABLE public.equipment_movements OWNER TO postgres;

--
-- Name: equipment_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_movements_id_seq OWNER TO postgres;

--
-- Name: equipment_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_movements_id_seq OWNED BY public.equipment_movements.id;


--
-- Name: event_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_subscriptions (
    id integer NOT NULL,
    business_id integer NOT NULL,
    subscriber_name character varying(100) NOT NULL,
    event_type character varying(100) NOT NULL,
    "handlerType" character varying(50) NOT NULL,
    handler_config jsonb NOT NULL,
    filter_expression jsonb,
    is_active boolean DEFAULT true,
    priority integer DEFAULT 0,
    max_retries integer DEFAULT 3,
    retry_delay_seconds integer DEFAULT 60,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.event_subscriptions OWNER TO postgres;

--
-- Name: event_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.event_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.event_subscriptions_id_seq OWNER TO postgres;

--
-- Name: event_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.event_subscriptions_id_seq OWNED BY public.event_subscriptions.id;


--
-- Name: fee_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fee_types (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    name_en character varying(255),
    description text,
    "feeType" character varying(50) DEFAULT 'fixed'::character varying,
    amount numeric(18,2) DEFAULT '0'::numeric,
    is_recurring boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.fee_types OWNER TO postgres;

--
-- Name: fee_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fee_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fee_types_id_seq OWNER TO postgres;

--
-- Name: fee_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fee_types_id_seq OWNED BY public.fee_types.id;


--
-- Name: field_equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.field_equipment (
    id integer NOT NULL,
    business_id integer NOT NULL,
    equipment_code character varying(30) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    "equipmentType" character varying(50) NOT NULL,
    serial_number character varying(100),
    model character varying(100),
    brand character varying(100),
    status character varying(50) DEFAULT 'available'::character varying,
    current_holder_id integer,
    assigned_team_id integer,
    purchase_date date,
    purchase_cost numeric(12,2),
    warranty_end date,
    last_maintenance date,
    next_maintenance date,
    condition character varying(50) DEFAULT 'good'::character varying,
    notes text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.field_equipment OWNER TO postgres;

--
-- Name: field_equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.field_equipment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.field_equipment_id_seq OWNER TO postgres;

--
-- Name: field_equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.field_equipment_id_seq OWNED BY public.field_equipment.id;


--
-- Name: field_operations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.field_operations (
    id integer NOT NULL,
    business_id integer NOT NULL,
    station_id integer,
    operation_number character varying(30) NOT NULL,
    operation_type character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'draft'::character varying,
    priority character varying(50) DEFAULT 'medium'::character varying,
    title character varying(255) NOT NULL,
    description text,
    reference_type character varying(50),
    reference_id integer,
    customer_id integer,
    asset_id integer,
    location_lat numeric(10,8),
    location_lng numeric(11,8),
    address text,
    scheduled_date date,
    scheduled_time character varying(10),
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    assigned_team_id integer,
    assigned_worker_id integer,
    estimated_duration integer,
    actual_duration integer,
    notes text,
    completion_notes text,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.field_operations OWNER TO postgres;

--
-- Name: field_operations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.field_operations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.field_operations_id_seq OWNER TO postgres;

--
-- Name: field_operations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.field_operations_id_seq OWNED BY public.field_operations.id;


--
-- Name: field_teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.field_teams (
    id integer NOT NULL,
    business_id integer NOT NULL,
    branch_id integer,
    code character varying(20) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    team_type character varying(50) DEFAULT 'mixed'::character varying,
    leader_id integer,
    max_members integer DEFAULT 10,
    current_members integer DEFAULT 0,
    status character varying(50) DEFAULT 'active'::character varying,
    working_area text,
    notes text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.field_teams OWNER TO postgres;

--
-- Name: field_teams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.field_teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.field_teams_id_seq OWNER TO postgres;

--
-- Name: field_teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.field_teams_id_seq OWNED BY public.field_teams.id;


--
-- Name: field_workers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.field_workers (
    id integer NOT NULL,
    business_id integer NOT NULL,
    user_id integer,
    employee_id integer,
    employee_number character varying(30) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    phone character varying(50),
    email character varying(255),
    team_id integer,
    worker_type character varying(50) DEFAULT 'technician'::character varying,
    specialization character varying(100),
    skills jsonb,
    status character varying(50) DEFAULT 'available'::character varying,
    current_location_lat numeric(10,8),
    current_location_lng numeric(11,8),
    last_location_update timestamp without time zone,
    hire_date date,
    daily_rate numeric(10,2),
    operation_rate numeric(10,2),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.field_workers OWNER TO postgres;

--
-- Name: field_workers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.field_workers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.field_workers_id_seq OWNER TO postgres;

--
-- Name: field_workers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.field_workers_id_seq OWNED BY public.field_workers.id;


--
-- Name: fiscal_periods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fiscal_periods (
    id integer NOT NULL,
    business_id integer NOT NULL,
    year integer NOT NULL,
    period integer NOT NULL,
    name_ar character varying(100) NOT NULL,
    name_en character varying(100),
    start_date date NOT NULL,
    end_date date NOT NULL,
    status character varying(50) DEFAULT 'open'::character varying,
    closed_by integer,
    closed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.fiscal_periods OWNER TO postgres;

--
-- Name: fiscal_periods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fiscal_periods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fiscal_periods_id_seq OWNER TO postgres;

--
-- Name: fiscal_periods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fiscal_periods_id_seq OWNED BY public.fiscal_periods.id;


--
-- Name: generator_diesel_consumption; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.generator_diesel_consumption (
    id integer NOT NULL,
    business_id integer NOT NULL,
    station_id integer NOT NULL,
    generator_id integer NOT NULL,
    consumption_date date NOT NULL,
    rocket_tank_id integer,
    start_level numeric(10,2),
    end_level numeric(10,2),
    quantity_consumed numeric(10,2) NOT NULL,
    running_hours numeric(8,2),
    consumption_rate numeric(8,2),
    notes text,
    recorded_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.generator_diesel_consumption OWNER TO postgres;

--
-- Name: generator_diesel_consumption_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.generator_diesel_consumption_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.generator_diesel_consumption_id_seq OWNER TO postgres;

--
-- Name: generator_diesel_consumption_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.generator_diesel_consumption_id_seq OWNED BY public.generator_diesel_consumption.id;


--
-- Name: government_customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.government_customers (
    id integer NOT NULL,
    business_id integer NOT NULL,
    customer_id integer NOT NULL,
    national_id character varying(50),
    support_category character varying(100),
    eligibility_status character varying(50) DEFAULT 'pending'::character varying,
    approval_date date,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT government_customers_eligibility_status_check CHECK (((eligibility_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'suspended'::character varying])::text[])))
);


ALTER TABLE public.government_customers OWNER TO postgres;

--
-- Name: government_customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.government_customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.government_customers_id_seq OWNER TO postgres;

--
-- Name: government_customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.government_customers_id_seq OWNED BY public.government_customers.id;


--
-- Name: incoming_webhooks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.incoming_webhooks (
    id integer NOT NULL,
    integration_id integer NOT NULL,
    business_id integer NOT NULL,
    webhook_type character varying(100) NOT NULL,
    payload jsonb NOT NULL,
    headers jsonb,
    signature character varying(255),
    is_valid boolean DEFAULT true,
    status character varying(50) DEFAULT 'received'::character varying,
    processed_at timestamp without time zone,
    error_message text,
    retry_count integer DEFAULT 0,
    source_ip character varying(50),
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.incoming_webhooks OWNER TO postgres;

--
-- Name: incoming_webhooks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.incoming_webhooks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.incoming_webhooks_id_seq OWNER TO postgres;

--
-- Name: incoming_webhooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.incoming_webhooks_id_seq OWNED BY public.incoming_webhooks.id;


--
-- Name: inspection_checklists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inspection_checklists (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(30) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    operation_type character varying(50),
    items jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.inspection_checklists OWNER TO postgres;

--
-- Name: inspection_checklists_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inspection_checklists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inspection_checklists_id_seq OWNER TO postgres;

--
-- Name: inspection_checklists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inspection_checklists_id_seq OWNED BY public.inspection_checklists.id;


--
-- Name: inspection_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inspection_items (
    id integer NOT NULL,
    inspection_id integer NOT NULL,
    checklist_item_id integer,
    item_name character varying(255) NOT NULL,
    is_passed boolean,
    score numeric(5,2),
    notes text,
    photo_url character varying(500)
);


ALTER TABLE public.inspection_items OWNER TO postgres;

--
-- Name: inspection_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inspection_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inspection_items_id_seq OWNER TO postgres;

--
-- Name: inspection_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inspection_items_id_seq OWNED BY public.inspection_items.id;


--
-- Name: inspections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inspections (
    id integer NOT NULL,
    business_id integer NOT NULL,
    operation_id integer NOT NULL,
    inspection_number character varying(30) NOT NULL,
    "inspectionType" character varying(50) NOT NULL,
    inspector_id integer,
    inspection_date timestamp without time zone DEFAULT now() NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    overall_score numeric(5,2),
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.inspections OWNER TO postgres;

--
-- Name: inspections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inspections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inspections_id_seq OWNER TO postgres;

--
-- Name: inspections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inspections_id_seq OWNED BY public.inspections.id;


--
-- Name: installation_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.installation_details (
    id integer NOT NULL,
    operation_id integer NOT NULL,
    customer_id integer,
    meter_serial_number character varying(100),
    "meterType" character varying(50),
    seal_number character varying(50),
    seal_color character varying(30),
    seal_type character varying(50),
    breaker_type character varying(50),
    breaker_capacity character varying(20),
    breaker_brand character varying(50),
    cable_length numeric(10,2),
    cable_type character varying(50),
    cable_size character varying(20),
    initial_reading numeric(15,3),
    installation_date date,
    installation_time character varying(10),
    technician_id integer,
    notes text,
    customer_signature text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.installation_details OWNER TO postgres;

--
-- Name: installation_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.installation_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.installation_details_id_seq OWNER TO postgres;

--
-- Name: installation_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.installation_details_id_seq OWNED BY public.installation_details.id;


--
-- Name: installation_photos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.installation_photos (
    id integer NOT NULL,
    installation_id integer,
    operation_id integer NOT NULL,
    photo_type character varying(50),
    photo_url character varying(500) NOT NULL,
    caption character varying(200),
    latitude numeric(10,8),
    longitude numeric(11,8),
    captured_at timestamp without time zone,
    uploaded_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.installation_photos OWNER TO postgres;

--
-- Name: installation_photos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.installation_photos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.installation_photos_id_seq OWNER TO postgres;

--
-- Name: installation_photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.installation_photos_id_seq OWNED BY public.installation_photos.id;


--
-- Name: integration_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.integration_configs (
    id integer NOT NULL,
    integration_id integer NOT NULL,
    config_key character varying(100) NOT NULL,
    config_value text,
    is_encrypted boolean DEFAULT false,
    "valueType" character varying(50) DEFAULT 'string'::character varying,
    environment character varying(50) DEFAULT 'production'::character varying,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.integration_configs OWNER TO postgres;

--
-- Name: integration_configs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.integration_configs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.integration_configs_id_seq OWNER TO postgres;

--
-- Name: integration_configs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.integration_configs_id_seq OWNED BY public.integration_configs.id;


--
-- Name: integration_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.integration_logs (
    id integer NOT NULL,
    integration_id integer NOT NULL,
    business_id integer NOT NULL,
    request_id character varying(100),
    direction character varying(50) NOT NULL,
    method character varying(10),
    endpoint character varying(500),
    request_headers jsonb,
    request_body jsonb,
    response_status integer,
    response_headers jsonb,
    response_body jsonb,
    duration_ms integer,
    status character varying(50) NOT NULL,
    error_message text,
    retry_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.integration_logs OWNER TO postgres;

--
-- Name: integration_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.integration_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.integration_logs_id_seq OWNER TO postgres;

--
-- Name: integration_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.integration_logs_id_seq OWNED BY public.integration_logs.id;


--
-- Name: integrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.integrations (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_ar character varying(200) NOT NULL,
    name_en character varying(200),
    description text,
    integration_type character varying(50) NOT NULL,
    category character varying(50) DEFAULT 'local'::character varying,
    provider character varying(100),
    base_url character varying(500),
    api_version character varying(20),
    "authType" character varying(50) DEFAULT 'api_key'::character varying,
    is_active boolean DEFAULT true,
    is_primary boolean DEFAULT false,
    priority integer DEFAULT 1,
    last_health_check timestamp without time zone,
    "healthStatus" character varying(50) DEFAULT 'unknown'::character varying,
    webhook_url character varying(500),
    webhook_secret character varying(255),
    rate_limit_per_minute integer DEFAULT 60,
    timeout_seconds integer DEFAULT 30,
    retry_attempts integer DEFAULT 3,
    metadata jsonb,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.integrations OWNER TO postgres;

--
-- Name: integrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.integrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.integrations_id_seq OWNER TO postgres;

--
-- Name: integrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.integrations_id_seq OWNED BY public.integrations.id;


--
-- Name: invoice_fees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_fees (
    id integer NOT NULL,
    invoice_id integer NOT NULL,
    fee_type_id integer NOT NULL,
    amount numeric(18,2) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.invoice_fees OWNER TO postgres;

--
-- Name: invoice_fees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoice_fees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoice_fees_id_seq OWNER TO postgres;

--
-- Name: invoice_fees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoice_fees_id_seq OWNED BY public.invoice_fees.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id integer NOT NULL,
    business_id integer NOT NULL,
    branch_id integer,
    customer_id integer NOT NULL,
    meter_id integer,
    invoice_number character varying(50) NOT NULL,
    invoice_date date NOT NULL,
    due_date date NOT NULL,
    period_start date,
    period_end date,
    reading_id integer,
    consumption numeric(15,3),
    consumption_amount numeric(18,2) DEFAULT '0'::numeric,
    fixed_charges numeric(18,2) DEFAULT '0'::numeric,
    tax_amount numeric(18,2) DEFAULT '0'::numeric,
    other_charges numeric(18,2) DEFAULT '0'::numeric,
    discount_amount numeric(18,2) DEFAULT '0'::numeric,
    previous_balance numeric(18,2) DEFAULT '0'::numeric,
    total_amount numeric(18,2) DEFAULT '0'::numeric,
    paid_amount numeric(18,2) DEFAULT '0'::numeric,
    balance_due numeric(18,2) DEFAULT '0'::numeric,
    status character varying(50) DEFAULT 'draft'::character varying,
    journal_entry_id integer,
    notes text,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: invoices_enhanced; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices_enhanced (
    id integer NOT NULL,
    business_id integer NOT NULL,
    customer_id integer NOT NULL,
    meter_id integer,
    meter_reading_id integer,
    billing_period_id integer,
    invoice_no character varying(50) NOT NULL,
    invoice_date date NOT NULL,
    due_date date,
    period_start date,
    period_end date,
    meter_number character varying(50),
    previous_reading numeric(15,3),
    current_reading numeric(15,3),
    total_consumption_kwh numeric(15,3),
    price_kwh numeric(10,4),
    consumption_amount numeric(18,2) DEFAULT '0'::numeric,
    fixed_charges numeric(18,2) DEFAULT '0'::numeric,
    total_fees numeric(18,2) DEFAULT '0'::numeric,
    vat_rate numeric(5,2) DEFAULT '15'::numeric,
    vat_amount numeric(18,2) DEFAULT '0'::numeric,
    total_amount numeric(18,2) DEFAULT '0'::numeric,
    previous_balance_due numeric(18,2) DEFAULT '0'::numeric,
    final_amount numeric(18,2) DEFAULT '0'::numeric,
    paid_amount numeric(18,2) DEFAULT '0'::numeric,
    balance_due numeric(18,2) DEFAULT '0'::numeric,
    status character varying(50) DEFAULT 'generated'::character varying,
    "invoiceType" character varying(50) DEFAULT 'final'::character varying,
    approved_by integer,
    approved_at timestamp without time zone,
    created_by integer,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.invoices_enhanced OWNER TO postgres;

--
-- Name: invoices_enhanced_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoices_enhanced_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoices_enhanced_id_seq OWNER TO postgres;

--
-- Name: invoices_enhanced_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoices_enhanced_id_seq OWNED BY public.invoices_enhanced.id;


--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoices_id_seq OWNER TO postgres;

--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: item_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_categories (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    parent_id integer,
    inventory_account_id integer,
    cogs_account_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.item_categories OWNER TO postgres;

--
-- Name: item_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.item_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.item_categories_id_seq OWNER TO postgres;

--
-- Name: item_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.item_categories_id_seq OWNED BY public.item_categories.id;


--
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    id integer NOT NULL,
    business_id integer NOT NULL,
    category_id integer,
    code character varying(50) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    description text,
    type character varying(50) DEFAULT 'spare_part'::character varying,
    unit character varying(20) NOT NULL,
    barcode character varying(100),
    min_stock numeric(15,3) DEFAULT '0'::numeric,
    max_stock numeric(15,3),
    reorder_point numeric(15,3),
    reorder_qty numeric(15,3),
    standard_cost numeric(18,4) DEFAULT '0'::numeric,
    last_purchase_price numeric(18,4),
    average_cost numeric(18,4),
    is_active boolean DEFAULT true,
    image text,
    specifications jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.items OWNER TO postgres;

--
-- Name: items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.items_id_seq OWNER TO postgres;

--
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;


--
-- Name: job_titles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_titles (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(20) NOT NULL,
    title_ar character varying(100) NOT NULL,
    title_en character varying(100),
    department_id integer,
    grade_id integer,
    level integer DEFAULT 1,
    description text,
    responsibilities text,
    requirements text,
    headcount integer DEFAULT 1,
    current_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.job_titles OWNER TO postgres;

--
-- Name: job_titles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_titles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_titles_id_seq OWNER TO postgres;

--
-- Name: job_titles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.job_titles_id_seq OWNED BY public.job_titles.id;


--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journal_entries (
    id integer NOT NULL,
    business_id integer NOT NULL,
    branch_id integer,
    entry_number character varying(50) NOT NULL,
    entry_date date NOT NULL,
    period_id integer NOT NULL,
    type character varying(50) DEFAULT 'manual'::character varying,
    source_module character varying(50),
    source_id integer,
    description text,
    total_debit numeric(18,2) DEFAULT '0'::numeric,
    total_credit numeric(18,2) DEFAULT '0'::numeric,
    status character varying(50) DEFAULT 'draft'::character varying,
    posted_by integer,
    posted_at timestamp without time zone,
    reversed_by integer,
    reversed_at timestamp without time zone,
    reversal_entry_id integer,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.journal_entries OWNER TO postgres;

--
-- Name: journal_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.journal_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.journal_entries_id_seq OWNER TO postgres;

--
-- Name: journal_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.journal_entries_id_seq OWNED BY public.journal_entries.id;


--
-- Name: journal_entry_lines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journal_entry_lines (
    id integer NOT NULL,
    entry_id integer NOT NULL,
    line_number integer NOT NULL,
    account_id integer NOT NULL,
    cost_center_id integer,
    description text,
    debit numeric(18,2) DEFAULT '0'::numeric,
    credit numeric(18,2) DEFAULT '0'::numeric,
    currency character varying(10) DEFAULT 'SAR'::character varying,
    exchange_rate numeric(10,6) DEFAULT '1'::numeric,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.journal_entry_lines OWNER TO postgres;

--
-- Name: journal_entry_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.journal_entry_lines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.journal_entry_lines_id_seq OWNER TO postgres;

--
-- Name: journal_entry_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.journal_entry_lines_id_seq OWNED BY public.journal_entry_lines.id;


--
-- Name: leave_balances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_balances (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    leave_type_id integer NOT NULL,
    year integer NOT NULL,
    opening_balance integer DEFAULT 0,
    earned_balance integer DEFAULT 0,
    used_balance integer DEFAULT 0,
    adjustment_balance integer DEFAULT 0,
    remaining_balance integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.leave_balances OWNER TO postgres;

--
-- Name: leave_balances_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leave_balances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leave_balances_id_seq OWNER TO postgres;

--
-- Name: leave_balances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leave_balances_id_seq OWNED BY public.leave_balances.id;


--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_requests (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    business_id integer NOT NULL,
    leave_type_id integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_days integer NOT NULL,
    reason text,
    attachment_path character varying(500),
    status character varying(50) DEFAULT 'pending'::character varying,
    approved_by integer,
    approved_at timestamp without time zone,
    rejection_reason text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.leave_requests OWNER TO postgres;

--
-- Name: leave_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leave_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leave_requests_id_seq OWNER TO postgres;

--
-- Name: leave_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leave_requests_id_seq OWNED BY public.leave_requests.id;


--
-- Name: leave_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_types (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name_ar character varying(100) NOT NULL,
    name_en character varying(100),
    annual_balance integer DEFAULT 0,
    is_paid boolean DEFAULT true,
    requires_approval boolean DEFAULT true,
    allows_carry_over boolean DEFAULT false,
    max_carry_over_days integer DEFAULT 0,
    color character varying(20) DEFAULT '#3B82F6'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.leave_types OWNER TO postgres;

--
-- Name: leave_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leave_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leave_types_id_seq OWNER TO postgres;

--
-- Name: leave_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leave_types_id_seq OWNED BY public.leave_types.id;


--
-- Name: maintenance_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_plans (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    description text,
    asset_category_id integer,
    frequency character varying(50) NOT NULL,
    interval_days integer,
    "basedOn" character varying(50) DEFAULT 'calendar'::character varying,
    meter_type character varying(50),
    meter_interval numeric(15,2),
    estimated_hours numeric(8,2),
    estimated_cost numeric(18,2),
    is_active boolean DEFAULT true,
    tasks jsonb,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.maintenance_plans OWNER TO postgres;

--
-- Name: maintenance_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maintenance_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_plans_id_seq OWNER TO postgres;

--
-- Name: maintenance_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maintenance_plans_id_seq OWNED BY public.maintenance_plans.id;


--
-- Name: material_request_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.material_request_items (
    id integer NOT NULL,
    request_id integer NOT NULL,
    item_id integer NOT NULL,
    requested_qty numeric(12,3) NOT NULL,
    approved_qty numeric(12,3),
    issued_qty numeric(12,3),
    returned_qty numeric(12,3),
    unit character varying(20),
    notes text
);


ALTER TABLE public.material_request_items OWNER TO postgres;

--
-- Name: material_request_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.material_request_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.material_request_items_id_seq OWNER TO postgres;

--
-- Name: material_request_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.material_request_items_id_seq OWNED BY public.material_request_items.id;


--
-- Name: material_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.material_requests (
    id integer NOT NULL,
    business_id integer NOT NULL,
    request_number character varying(30) NOT NULL,
    operation_id integer,
    worker_id integer,
    team_id integer,
    warehouse_id integer,
    request_date date NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    notes text,
    approved_by integer,
    approved_at timestamp without time zone,
    issued_by integer,
    issued_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.material_requests OWNER TO postgres;

--
-- Name: material_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.material_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.material_requests_id_seq OWNER TO postgres;

--
-- Name: material_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.material_requests_id_seq OWNED BY public.material_requests.id;


--
-- Name: meter_readings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meter_readings (
    id integer NOT NULL,
    meter_id integer NOT NULL,
    reading_date date NOT NULL,
    reading_value numeric(15,3) NOT NULL,
    previous_reading numeric(15,3),
    consumption numeric(15,3),
    "readingType" character varying(50) DEFAULT 'actual'::character varying,
    read_by integer,
    image text,
    notes text,
    status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.meter_readings OWNER TO postgres;

--
-- Name: meter_readings_enhanced; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meter_readings_enhanced (
    id integer NOT NULL,
    meter_id integer NOT NULL,
    billing_period_id integer NOT NULL,
    current_reading numeric(15,3) NOT NULL,
    previous_reading numeric(15,3),
    consumption numeric(15,3),
    reading_date date NOT NULL,
    "readingType" character varying(50) DEFAULT 'actual'::character varying,
    status character varying(50) DEFAULT 'entered'::character varying,
    is_estimated boolean DEFAULT false,
    images jsonb,
    read_by integer,
    approved_by integer,
    approved_at timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.meter_readings_enhanced OWNER TO postgres;

--
-- Name: meter_readings_enhanced_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meter_readings_enhanced_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meter_readings_enhanced_id_seq OWNER TO postgres;

--
-- Name: meter_readings_enhanced_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meter_readings_enhanced_id_seq OWNED BY public.meter_readings_enhanced.id;


--
-- Name: meter_readings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meter_readings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meter_readings_id_seq OWNER TO postgres;

--
-- Name: meter_readings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meter_readings_id_seq OWNED BY public.meter_readings.id;


--
-- Name: meters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meters (
    id integer NOT NULL,
    business_id integer NOT NULL,
    customer_id integer NOT NULL,
    meter_number character varying(50) NOT NULL,
    type character varying(50) DEFAULT 'single_phase'::character varying,
    status character varying(50) DEFAULT 'active'::character varying,
    installation_date date,
    last_reading_date date,
    last_reading numeric(15,3),
    multiplier numeric(10,4) DEFAULT '1'::numeric,
    max_load numeric(10,2),
    location character varying(255),
    latitude numeric(10,8),
    longitude numeric(11,8),
    manufacturer character varying(100),
    model character varying(100),
    serial_number character varying(100),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.meters OWNER TO postgres;

--
-- Name: meters_enhanced; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meters_enhanced (
    id integer NOT NULL,
    business_id integer NOT NULL,
    customer_id integer,
    cabinet_id integer,
    tariff_id integer,
    project_id integer,
    meter_number character varying(50) NOT NULL,
    serial_number character varying(100),
    "meterType" character varying(50) DEFAULT 'electricity'::character varying,
    brand character varying(100),
    model character varying(100),
    category character varying(50) DEFAULT 'offline'::character varying,
    current_reading numeric(15,3) DEFAULT '0'::numeric,
    previous_reading numeric(15,3) DEFAULT '0'::numeric,
    balance numeric(18,2) DEFAULT '0'::numeric,
    balance_due numeric(18,2) DEFAULT '0'::numeric,
    installation_date date,
    "installationStatus" character varying(50) DEFAULT 'new'::character varying,
    sign_number character varying(50),
    sign_color character varying(50),
    status character varying(50) DEFAULT 'active'::character varying,
    is_active boolean DEFAULT true,
    iot_device_id character varying(100),
    last_sync_time timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.meters_enhanced OWNER TO postgres;

--
-- Name: meters_enhanced_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meters_enhanced_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meters_enhanced_id_seq OWNER TO postgres;

--
-- Name: meters_enhanced_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meters_enhanced_id_seq OWNED BY public.meters_enhanced.id;


--
-- Name: meters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meters_id_seq OWNER TO postgres;

--
-- Name: meters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meters_id_seq OWNED BY public.meters.id;


--
-- Name: note_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.note_categories (
    id integer NOT NULL,
    business_id integer NOT NULL,
    name character varying(100) NOT NULL,
    color character varying(20),
    icon character varying(50),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.note_categories OWNER TO postgres;

--
-- Name: note_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.note_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.note_categories_id_seq OWNER TO postgres;

--
-- Name: note_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.note_categories_id_seq OWNED BY public.note_categories.id;


--
-- Name: operation_approvals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operation_approvals (
    id integer NOT NULL,
    operation_id integer NOT NULL,
    approval_level integer DEFAULT 1,
    approver_id integer,
    status character varying(50) DEFAULT 'pending'::character varying,
    decision_date timestamp without time zone,
    notes text,
    signature_url character varying(500)
);


ALTER TABLE public.operation_approvals OWNER TO postgres;

--
-- Name: operation_approvals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.operation_approvals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.operation_approvals_id_seq OWNER TO postgres;

--
-- Name: operation_approvals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.operation_approvals_id_seq OWNED BY public.operation_approvals.id;


--
-- Name: operation_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operation_payments (
    id integer NOT NULL,
    business_id integer NOT NULL,
    operation_id integer NOT NULL,
    worker_id integer NOT NULL,
    "paymentType" character varying(50) DEFAULT 'per_operation'::character varying,
    base_amount numeric(12,2) DEFAULT '0'::numeric,
    bonus_amount numeric(12,2) DEFAULT '0'::numeric,
    deduction_amount numeric(12,2) DEFAULT '0'::numeric,
    net_amount numeric(12,2) DEFAULT '0'::numeric,
    status character varying(50) DEFAULT 'calculated'::character varying,
    calculated_at timestamp without time zone DEFAULT now() NOT NULL,
    approved_by integer,
    approved_at timestamp without time zone,
    paid_at timestamp without time zone
);


ALTER TABLE public.operation_payments OWNER TO postgres;

--
-- Name: operation_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.operation_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.operation_payments_id_seq OWNER TO postgres;

--
-- Name: operation_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.operation_payments_id_seq OWNED BY public.operation_payments.id;


--
-- Name: operation_status_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operation_status_log (
    id integer NOT NULL,
    operation_id integer NOT NULL,
    from_status character varying(30),
    to_status character varying(30) NOT NULL,
    changed_by integer,
    changed_at timestamp without time zone DEFAULT now() NOT NULL,
    reason text,
    notes text
);


ALTER TABLE public.operation_status_log OWNER TO postgres;

--
-- Name: operation_status_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.operation_status_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.operation_status_log_id_seq OWNER TO postgres;

--
-- Name: operation_status_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.operation_status_log_id_seq OWNED BY public.operation_status_log.id;


--
-- Name: payment_gateway_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_gateway_config (
    id integer NOT NULL,
    gateway_id integer NOT NULL,
    business_id integer NOT NULL,
    config_key character varying(100) NOT NULL,
    config_value text,
    config_type character varying(20) DEFAULT 'string'::character varying,
    description text,
    is_encrypted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT payment_gateway_config_config_type_check CHECK (((config_type)::text = ANY ((ARRAY['string'::character varying, 'number'::character varying, 'boolean'::character varying, 'json'::character varying])::text[])))
);


ALTER TABLE public.payment_gateway_config OWNER TO postgres;

--
-- Name: payment_gateway_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_gateway_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_gateway_config_id_seq OWNER TO postgres;

--
-- Name: payment_gateway_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_gateway_config_id_seq OWNED BY public.payment_gateway_config.id;


--
-- Name: payment_gateways; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_gateways (
    id integer NOT NULL,
    business_id integer NOT NULL,
    gateway_name character varying(100) NOT NULL,
    gateway_type character varying(20) DEFAULT 'credit_card'::character varying,
    api_key character varying(255),
    api_secret character varying(255),
    merchant_id character varying(100),
    webhook_secret character varying(255),
    api_url character varying(255),
    test_mode boolean DEFAULT false,
    sandbox_api_key character varying(255),
    sandbox_api_secret character varying(255),
    config jsonb,
    is_active boolean DEFAULT true,
    is_default boolean DEFAULT false,
    description text,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT payment_gateways_gateway_type_check CHECK (((gateway_type)::text = ANY ((ARRAY['credit_card'::character varying, 'bank_transfer'::character varying, 'wallet'::character varying, 'crypto'::character varying, 'other'::character varying])::text[])))
);


ALTER TABLE public.payment_gateways OWNER TO postgres;

--
-- Name: payment_gateways_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_gateways_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_gateways_id_seq OWNER TO postgres;

--
-- Name: payment_gateways_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_gateways_id_seq OWNED BY public.payment_gateways.id;


--
-- Name: payment_methods_new; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_methods_new (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    name_en character varying(255),
    "methodType" character varying(50) DEFAULT 'cash'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payment_methods_new OWNER TO postgres;

--
-- Name: payment_methods_new_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_methods_new_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_methods_new_id_seq OWNER TO postgres;

--
-- Name: payment_methods_new_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_methods_new_id_seq OWNED BY public.payment_methods_new.id;


--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_transactions (
    id integer NOT NULL,
    business_id integer NOT NULL,
    customer_id integer NOT NULL,
    invoice_id integer,
    gateway_id integer NOT NULL,
    transaction_number character varying(100) NOT NULL,
    gateway_transaction_id character varying(100),
    amount numeric(18,2) NOT NULL,
    currency character varying(10) DEFAULT 'SAR'::character varying,
    status character varying(20) DEFAULT 'pending'::character varying,
    payment_method character varying(50),
    card_last4 character varying(4),
    card_brand character varying(50),
    request_data jsonb,
    response_data jsonb,
    webhook_received boolean DEFAULT false,
    webhook_data jsonb,
    error_message text,
    error_code character varying(50),
    initiated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone,
    failed_at timestamp without time zone,
    customer_email character varying(255),
    customer_phone character varying(50),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT payment_transactions_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying, 'cancelled'::character varying, 'refunded'::character varying])::text[])))
);


ALTER TABLE public.payment_transactions OWNER TO postgres;

--
-- Name: payment_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_transactions_id_seq OWNER TO postgres;

--
-- Name: payment_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_transactions_id_seq OWNED BY public.payment_transactions.id;


--
-- Name: payment_webhooks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_webhooks (
    id integer NOT NULL,
    gateway_id integer NOT NULL,
    transaction_id integer,
    event_type character varying(100) NOT NULL,
    payload jsonb NOT NULL,
    signature character varying(255),
    is_valid boolean DEFAULT false,
    processed boolean DEFAULT false,
    processed_at timestamp without time zone,
    error_message text,
    ip_address character varying(50),
    user_agent character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.payment_webhooks OWNER TO postgres;

--
-- Name: payment_webhooks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_webhooks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_webhooks_id_seq OWNER TO postgres;

--
-- Name: payment_webhooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_webhooks_id_seq OWNED BY public.payment_webhooks.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    business_id integer NOT NULL,
    branch_id integer,
    customer_id integer NOT NULL,
    payment_number character varying(50) NOT NULL,
    payment_date date NOT NULL,
    amount numeric(18,2) NOT NULL,
    "paymentMethod" character varying(50) DEFAULT 'cash'::character varying,
    reference_number character varying(100),
    bank_account_id integer,
    status character varying(50) DEFAULT 'completed'::character varying,
    notes text,
    journal_entry_id integer,
    received_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_enhanced; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments_enhanced (
    id integer NOT NULL,
    business_id integer NOT NULL,
    customer_id integer NOT NULL,
    meter_id integer,
    invoice_id integer,
    cashbox_id integer,
    payment_method_id integer,
    payment_number character varying(50) NOT NULL,
    payment_date date NOT NULL,
    amount numeric(18,2) NOT NULL,
    balance_due_before numeric(18,2),
    balance_due_after numeric(18,2),
    payer_name character varying(255),
    reference_number character varying(100),
    status character varying(50) DEFAULT 'completed'::character varying,
    notes text,
    received_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payments_enhanced OWNER TO postgres;

--
-- Name: payments_enhanced_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_enhanced_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_enhanced_id_seq OWNER TO postgres;

--
-- Name: payments_enhanced_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_enhanced_id_seq OWNED BY public.payments_enhanced.id;


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: payroll_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payroll_items (
    id integer NOT NULL,
    payroll_run_id integer NOT NULL,
    employee_id integer NOT NULL,
    basic_salary numeric(15,2) NOT NULL,
    working_days integer DEFAULT 30,
    actual_days integer DEFAULT 30,
    housing_allowance numeric(15,2) DEFAULT '0'::numeric,
    transport_allowance numeric(15,2) DEFAULT '0'::numeric,
    other_allowances numeric(15,2) DEFAULT '0'::numeric,
    total_allowances numeric(15,2) DEFAULT '0'::numeric,
    overtime_hours numeric(10,2) DEFAULT '0'::numeric,
    overtime_amount numeric(15,2) DEFAULT '0'::numeric,
    bonuses numeric(15,2) DEFAULT '0'::numeric,
    total_additions numeric(15,2) DEFAULT '0'::numeric,
    absence_days integer DEFAULT 0,
    absence_deduction numeric(15,2) DEFAULT '0'::numeric,
    late_deduction numeric(15,2) DEFAULT '0'::numeric,
    social_insurance numeric(15,2) DEFAULT '0'::numeric,
    tax_deduction numeric(15,2) DEFAULT '0'::numeric,
    loan_deduction numeric(15,2) DEFAULT '0'::numeric,
    other_deductions numeric(15,2) DEFAULT '0'::numeric,
    total_deductions numeric(15,2) DEFAULT '0'::numeric,
    gross_salary numeric(15,2),
    net_salary numeric(15,2),
    status character varying(50) DEFAULT 'calculated'::character varying,
    paid_at timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payroll_items OWNER TO postgres;

--
-- Name: payroll_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payroll_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payroll_items_id_seq OWNER TO postgres;

--
-- Name: payroll_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payroll_items_id_seq OWNED BY public.payroll_items.id;


--
-- Name: payroll_runs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payroll_runs (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(20) NOT NULL,
    period_year integer NOT NULL,
    period_month integer NOT NULL,
    period_start_date date NOT NULL,
    period_end_date date NOT NULL,
    total_basic_salary numeric(15,2) DEFAULT '0'::numeric,
    total_allowances numeric(15,2) DEFAULT '0'::numeric,
    total_deductions numeric(15,2) DEFAULT '0'::numeric,
    total_net_salary numeric(15,2) DEFAULT '0'::numeric,
    employee_count integer DEFAULT 0,
    status character varying(50) DEFAULT 'draft'::character varying,
    journal_entry_id integer,
    calculated_at timestamp without time zone,
    calculated_by integer,
    approved_at timestamp without time zone,
    approved_by integer,
    paid_at timestamp without time zone,
    paid_by integer,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payroll_runs OWNER TO postgres;

--
-- Name: payroll_runs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payroll_runs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payroll_runs_id_seq OWNER TO postgres;

--
-- Name: payroll_runs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payroll_runs_id_seq OWNED BY public.payroll_runs.id;


--
-- Name: performance_evaluations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.performance_evaluations (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    business_id integer NOT NULL,
    evaluation_period character varying(50) NOT NULL,
    period_start_date date NOT NULL,
    period_end_date date NOT NULL,
    overall_score numeric(5,2),
    "performanceRating" character varying(50),
    quality_score numeric(5,2),
    productivity_score numeric(5,2),
    attendance_score numeric(5,2),
    teamwork_score numeric(5,2),
    initiative_score numeric(5,2),
    strengths text,
    areas_for_improvement text,
    goals text,
    manager_comments text,
    employee_comments text,
    evaluated_by integer NOT NULL,
    evaluated_at timestamp without time zone,
    status character varying(50) DEFAULT 'draft'::character varying,
    acknowledged_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.performance_evaluations OWNER TO postgres;

--
-- Name: performance_evaluations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.performance_evaluations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.performance_evaluations_id_seq OWNER TO postgres;

--
-- Name: performance_evaluations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.performance_evaluations_id_seq OWNED BY public.performance_evaluations.id;


--
-- Name: performance_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.performance_metrics (
    id integer NOT NULL,
    business_id integer NOT NULL,
    metric_type character varying(50) NOT NULL,
    source character varying(100),
    value numeric(15,4) NOT NULL,
    unit character varying(20),
    tags jsonb,
    recorded_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.performance_metrics OWNER TO postgres;

--
-- Name: performance_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.performance_metrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.performance_metrics_id_seq OWNER TO postgres;

--
-- Name: performance_metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.performance_metrics_id_seq OWNED BY public.performance_metrics.id;


--
-- Name: period_settlements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.period_settlements (
    id integer NOT NULL,
    business_id integer NOT NULL,
    settlement_number character varying(30) NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    total_operations integer DEFAULT 0,
    total_amount numeric(15,2) DEFAULT '0'::numeric,
    total_bonuses numeric(15,2) DEFAULT '0'::numeric,
    total_deductions numeric(15,2) DEFAULT '0'::numeric,
    net_amount numeric(15,2) DEFAULT '0'::numeric,
    status character varying(50) DEFAULT 'draft'::character varying,
    approved_by integer,
    approved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.period_settlements OWNER TO postgres;

--
-- Name: period_settlements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.period_settlements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.period_settlements_id_seq OWNER TO postgres;

--
-- Name: period_settlements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.period_settlements_id_seq OWNED BY public.period_settlements.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    module character varying(50) NOT NULL,
    code character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    name_en character varying(100),
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: prepaid_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prepaid_codes (
    id integer NOT NULL,
    business_id integer NOT NULL,
    meter_id integer,
    code character varying(100) NOT NULL,
    amount numeric(18,2) NOT NULL,
    status character varying(50) DEFAULT 'active'::character varying,
    used_at timestamp without time zone,
    expires_at timestamp without time zone,
    generated_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.prepaid_codes OWNER TO postgres;

--
-- Name: prepaid_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prepaid_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prepaid_codes_id_seq OWNER TO postgres;

--
-- Name: prepaid_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prepaid_codes_id_seq OWNED BY public.prepaid_codes.id;


--
-- Name: pricing_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pricing_rules (
    id integer NOT NULL,
    business_id integer NOT NULL,
    meter_type character varying(20) NOT NULL,
    usage_type character varying(20) NOT NULL,
    subscription_fee numeric(18,2) NOT NULL,
    deposit_amount numeric(18,2) DEFAULT 0,
    deposit_required boolean DEFAULT true,
    active boolean DEFAULT true,
    notes character varying(500),
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.pricing_rules OWNER TO postgres;

--
-- Name: pricing_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pricing_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pricing_rules_id_seq OWNER TO postgres;

--
-- Name: pricing_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pricing_rules_id_seq OWNED BY public.pricing_rules.id;


--
-- Name: project_phases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_phases (
    id integer NOT NULL,
    project_id integer NOT NULL,
    phase_number integer NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    description text,
    start_date date,
    end_date date,
    actual_start_date date,
    actual_end_date date,
    budget numeric(18,2),
    actual_cost numeric(18,2) DEFAULT '0'::numeric,
    progress numeric(5,2) DEFAULT '0'::numeric,
    status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.project_phases OWNER TO postgres;

--
-- Name: project_phases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_phases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.project_phases_id_seq OWNER TO postgres;

--
-- Name: project_phases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_phases_id_seq OWNED BY public.project_phases.id;


--
-- Name: project_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_tasks (
    id integer NOT NULL,
    project_id integer NOT NULL,
    phase_id integer,
    parent_task_id integer,
    task_number character varying(50),
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    description text,
    type character varying(50) DEFAULT 'task'::character varying,
    status character varying(50) DEFAULT 'pending'::character varying,
    priority character varying(50) DEFAULT 'medium'::character varying,
    assigned_to integer,
    start_date date,
    end_date date,
    actual_start_date date,
    actual_end_date date,
    estimated_hours numeric(8,2),
    actual_hours numeric(8,2),
    progress numeric(5,2) DEFAULT '0'::numeric,
    dependencies jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.project_tasks OWNER TO postgres;

--
-- Name: project_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.project_tasks_id_seq OWNER TO postgres;

--
-- Name: project_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_tasks_id_seq OWNED BY public.project_tasks.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    business_id integer NOT NULL,
    branch_id integer,
    station_id integer,
    code character varying(50) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    description text,
    type character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'planning'::character varying,
    priority character varying(50) DEFAULT 'medium'::character varying,
    manager_id integer,
    start_date date,
    planned_end_date date,
    actual_end_date date,
    budget numeric(18,2),
    actual_cost numeric(18,2) DEFAULT '0'::numeric,
    progress numeric(5,2) DEFAULT '0'::numeric,
    cost_center_id integer,
    approved_by integer,
    approved_at timestamp without time zone,
    closed_by integer,
    closed_at timestamp without time zone,
    notes text,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projects_id_seq OWNER TO postgres;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_orders (
    id integer NOT NULL,
    business_id integer NOT NULL,
    branch_id integer,
    order_number character varying(50) NOT NULL,
    order_date date NOT NULL,
    supplier_id integer NOT NULL,
    status character varying(50) DEFAULT 'draft'::character varying,
    delivery_date date,
    warehouse_id integer,
    payment_terms integer,
    currency character varying(10) DEFAULT 'SAR'::character varying,
    exchange_rate numeric(10,6) DEFAULT '1'::numeric,
    subtotal numeric(18,2) DEFAULT '0'::numeric,
    tax_amount numeric(18,2) DEFAULT '0'::numeric,
    discount_amount numeric(18,2) DEFAULT '0'::numeric,
    total_amount numeric(18,2) DEFAULT '0'::numeric,
    paid_amount numeric(18,2) DEFAULT '0'::numeric,
    notes text,
    terms text,
    approved_by integer,
    approved_at timestamp without time zone,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.purchase_orders OWNER TO postgres;

--
-- Name: purchase_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchase_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchase_orders_id_seq OWNER TO postgres;

--
-- Name: purchase_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchase_orders_id_seq OWNED BY public.purchase_orders.id;


--
-- Name: purchase_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_requests (
    id integer NOT NULL,
    business_id integer NOT NULL,
    branch_id integer,
    station_id integer,
    request_number character varying(50) NOT NULL,
    request_date date NOT NULL,
    required_date date,
    status character varying(50) DEFAULT 'draft'::character varying,
    priority character varying(50) DEFAULT 'medium'::character varying,
    requested_by integer NOT NULL,
    department_id integer,
    purpose text,
    total_amount numeric(18,2) DEFAULT '0'::numeric,
    approved_by integer,
    approved_at timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.purchase_requests OWNER TO postgres;

--
-- Name: purchase_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchase_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchase_requests_id_seq OWNER TO postgres;

--
-- Name: purchase_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchase_requests_id_seq OWNED BY public.purchase_requests.id;


--
-- Name: quota_consumption; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quota_consumption (
    id integer NOT NULL,
    business_id integer NOT NULL,
    customer_id integer NOT NULL,
    quota_id integer NOT NULL,
    invoice_id integer,
    consumption_amount numeric(18,2) NOT NULL,
    consumption_date date NOT NULL,
    consumption_type character varying(50),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.quota_consumption OWNER TO postgres;

--
-- Name: quota_consumption_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quota_consumption_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quota_consumption_id_seq OWNER TO postgres;

--
-- Name: quota_consumption_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quota_consumption_id_seq OWNED BY public.quota_consumption.id;


--
-- Name: receipts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.receipts (
    id integer NOT NULL,
    business_id integer NOT NULL,
    payment_id integer NOT NULL,
    receipt_number character varying(50) NOT NULL,
    issue_date date NOT NULL,
    description text,
    printed_by integer,
    printed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.receipts OWNER TO postgres;

--
-- Name: receipts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.receipts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.receipts_id_seq OWNER TO postgres;

--
-- Name: receipts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.receipts_id_seq OWNED BY public.receipts.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    id integer NOT NULL,
    role_id integer NOT NULL,
    permission_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.role_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_permissions_id_seq OWNER TO postgres;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_permissions_id_seq OWNED BY public.role_permissions.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    business_id integer,
    code character varying(50) NOT NULL,
    name_ar character varying(100) NOT NULL,
    name_en character varying(100),
    description text,
    level integer DEFAULT 1,
    is_system boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: salary_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salary_details (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    basic_salary numeric(15,2) NOT NULL,
    currency character varying(10) DEFAULT 'SAR'::character varying,
    housing_allowance numeric(15,2) DEFAULT '0'::numeric,
    transport_allowance numeric(15,2) DEFAULT '0'::numeric,
    food_allowance numeric(15,2) DEFAULT '0'::numeric,
    phone_allowance numeric(15,2) DEFAULT '0'::numeric,
    other_allowances numeric(15,2) DEFAULT '0'::numeric,
    total_salary numeric(15,2),
    "paymentMethod" character varying(50) DEFAULT 'bank_transfer'::character varying,
    bank_name character varying(100),
    bank_account_number character varying(50),
    iban character varying(50),
    effective_date date NOT NULL,
    end_date date,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.salary_details OWNER TO postgres;

--
-- Name: salary_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.salary_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.salary_details_id_seq OWNER TO postgres;

--
-- Name: salary_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.salary_details_id_seq OWNED BY public.salary_details.id;


--
-- Name: salary_grades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salary_grades (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(100) NOT NULL,
    min_salary numeric(15,2),
    max_salary numeric(15,2),
    housing_allowance_pct numeric(5,2) DEFAULT '0'::numeric,
    transport_allowance numeric(15,2) DEFAULT '0'::numeric,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.salary_grades OWNER TO postgres;

--
-- Name: salary_grades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.salary_grades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.salary_grades_id_seq OWNER TO postgres;

--
-- Name: salary_grades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.salary_grades_id_seq OWNED BY public.salary_grades.id;


--
-- Name: sensors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sensors (
    id integer NOT NULL,
    equipment_id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_ar character varying(100) NOT NULL,
    name_en character varying(100),
    type character varying(50) NOT NULL,
    unit character varying(20) NOT NULL,
    min_value numeric(15,4),
    max_value numeric(15,4),
    warning_low numeric(15,4),
    warning_high numeric(15,4),
    critical_low numeric(15,4),
    critical_high numeric(15,4),
    current_value numeric(15,4),
    last_reading_time timestamp without time zone,
    status character varying(50) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sensors OWNER TO postgres;

--
-- Name: sensors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sensors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sensors_id_seq OWNER TO postgres;

--
-- Name: sensors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sensors_id_seq OWNED BY public.sensors.id;


--
-- Name: sequences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sequences (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(50) NOT NULL,
    prefix character varying(20),
    suffix character varying(20),
    current_value integer DEFAULT 0,
    min_digits integer DEFAULT 6,
    "resetPeriod" character varying(50) DEFAULT 'never'::character varying,
    last_reset_date date,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sequences OWNER TO postgres;

--
-- Name: sequences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sequences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sequences_id_seq OWNER TO postgres;

--
-- Name: sequences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sequences_id_seq OWNED BY public.sequences.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    business_id integer,
    category character varying(50) NOT NULL,
    key character varying(100) NOT NULL,
    value text,
    "valueType" character varying(50) DEFAULT 'string'::character varying,
    description text,
    is_system boolean DEFAULT false,
    updated_by integer,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.settings_id_seq OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: settlement_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settlement_items (
    id integer NOT NULL,
    settlement_id integer NOT NULL,
    worker_id integer NOT NULL,
    operations_count integer DEFAULT 0,
    base_amount numeric(12,2) DEFAULT '0'::numeric,
    bonuses numeric(12,2) DEFAULT '0'::numeric,
    deductions numeric(12,2) DEFAULT '0'::numeric,
    net_amount numeric(12,2) DEFAULT '0'::numeric,
    "paymentMethod" character varying(50),
    payment_reference character varying(100),
    paid_at timestamp without time zone
);


ALTER TABLE public.settlement_items OWNER TO postgres;

--
-- Name: settlement_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.settlement_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.settlement_items_id_seq OWNER TO postgres;

--
-- Name: settlement_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settlement_items_id_seq OWNED BY public.settlement_items.id;


--
-- Name: sms_delivery_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sms_delivery_log (
    id integer NOT NULL,
    message_id integer NOT NULL,
    status character varying(20) NOT NULL,
    provider_status character varying(100),
    provider_message_id character varying(100),
    status_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    error_message text,
    error_code character varying(50),
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT sms_delivery_log_status_check CHECK (((status)::text = ANY ((ARRAY['sent'::character varying, 'delivered'::character varying, 'failed'::character varying, 'read'::character varying, 'undelivered'::character varying])::text[])))
);


ALTER TABLE public.sms_delivery_log OWNER TO postgres;

--
-- Name: sms_delivery_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sms_delivery_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sms_delivery_log_id_seq OWNER TO postgres;

--
-- Name: sms_delivery_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sms_delivery_log_id_seq OWNED BY public.sms_delivery_log.id;


--
-- Name: sms_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sms_messages (
    id integer NOT NULL,
    business_id integer NOT NULL,
    customer_id integer NOT NULL,
    template_id integer,
    message_type character varying(50) NOT NULL,
    channel character varying(20) NOT NULL,
    recipient character varying(255) NOT NULL,
    subject character varying(255),
    message text NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    provider character varying(100),
    provider_message_id character varying(100),
    sent_at timestamp without time zone,
    delivered_at timestamp without time zone,
    read_at timestamp without time zone,
    error_message text,
    error_code character varying(50),
    retry_count integer DEFAULT 0,
    max_retries integer DEFAULT 3,
    next_retry_at timestamp without time zone,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT sms_messages_channel_check CHECK (((channel)::text = ANY ((ARRAY['sms'::character varying, 'whatsapp'::character varying, 'email'::character varying])::text[]))),
    CONSTRAINT sms_messages_message_type_check CHECK (((message_type)::text = ANY ((ARRAY['invoice'::character varying, 'payment_reminder'::character varying, 'payment_confirmation'::character varying, 'reading_notification'::character varying, 'custom'::character varying])::text[]))),
    CONSTRAINT sms_messages_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'sent'::character varying, 'delivered'::character varying, 'failed'::character varying, 'read'::character varying])::text[])))
);


ALTER TABLE public.sms_messages OWNER TO postgres;

--
-- Name: sms_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sms_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sms_messages_id_seq OWNER TO postgres;

--
-- Name: sms_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sms_messages_id_seq OWNED BY public.sms_messages.id;


--
-- Name: sms_providers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sms_providers (
    id integer NOT NULL,
    business_id integer NOT NULL,
    provider_name character varying(100) NOT NULL,
    provider_type character varying(20) NOT NULL,
    api_key character varying(255),
    api_secret character varying(255),
    account_sid character varying(255),
    auth_token character varying(255),
    from_number character varying(50),
    from_email character varying(255),
    whatsapp_number character varying(50),
    api_url character varying(255),
    webhook_url character varying(255),
    is_active boolean DEFAULT true,
    is_default boolean DEFAULT false,
    description text,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT sms_providers_provider_type_check CHECK (((provider_type)::text = ANY ((ARRAY['sms'::character varying, 'whatsapp'::character varying, 'email'::character varying, 'all'::character varying])::text[])))
);


ALTER TABLE public.sms_providers OWNER TO postgres;

--
-- Name: sms_providers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sms_providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sms_providers_id_seq OWNER TO postgres;

--
-- Name: sms_providers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sms_providers_id_seq OWNED BY public.sms_providers.id;


--
-- Name: sms_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sms_templates (
    id integer NOT NULL,
    business_id integer NOT NULL,
    template_name character varying(255) NOT NULL,
    template_type character varying(50) NOT NULL,
    channel character varying(20) DEFAULT 'sms'::character varying,
    subject character varying(255),
    message text NOT NULL,
    variables jsonb,
    is_active boolean DEFAULT true,
    is_default boolean DEFAULT false,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT sms_templates_channel_check CHECK (((channel)::text = ANY ((ARRAY['sms'::character varying, 'whatsapp'::character varying, 'email'::character varying, 'all'::character varying])::text[]))),
    CONSTRAINT sms_templates_template_type_check CHECK (((template_type)::text = ANY ((ARRAY['invoice'::character varying, 'payment_reminder'::character varying, 'payment_confirmation'::character varying, 'reading_notification'::character varying, 'custom'::character varying])::text[])))
);


ALTER TABLE public.sms_templates OWNER TO postgres;

--
-- Name: sms_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sms_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sms_templates_id_seq OWNER TO postgres;

--
-- Name: sms_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sms_templates_id_seq OWNED BY public.sms_templates.id;


--
-- Name: squares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.squares (
    id integer NOT NULL,
    business_id integer NOT NULL,
    area_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    name_en character varying(255),
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.squares OWNER TO postgres;

--
-- Name: squares_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.squares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.squares_id_seq OWNER TO postgres;

--
-- Name: squares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.squares_id_seq OWNED BY public.squares.id;


--
-- Name: station_diesel_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.station_diesel_config (
    id integer NOT NULL,
    business_id integer NOT NULL,
    station_id integer NOT NULL,
    has_intake_pump boolean DEFAULT false,
    has_output_pump boolean DEFAULT false,
    intake_pump_has_meter boolean DEFAULT false,
    output_pump_has_meter boolean DEFAULT false,
    notes text,
    configured_by integer,
    configured_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.station_diesel_config OWNER TO postgres;

--
-- Name: station_diesel_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.station_diesel_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.station_diesel_config_id_seq OWNER TO postgres;

--
-- Name: station_diesel_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.station_diesel_config_id_seq OWNED BY public.station_diesel_config.id;


--
-- Name: station_diesel_path; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.station_diesel_path (
    id integer NOT NULL,
    config_id integer NOT NULL,
    sequence_order integer NOT NULL,
    element_type character varying(50) NOT NULL,
    tank_id integer,
    pump_id integer,
    pipe_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.station_diesel_path OWNER TO postgres;

--
-- Name: station_diesel_path_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.station_diesel_path_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.station_diesel_path_id_seq OWNER TO postgres;

--
-- Name: station_diesel_path_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.station_diesel_path_id_seq OWNED BY public.station_diesel_path.id;


--
-- Name: stations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stations (
    id integer NOT NULL,
    business_id integer NOT NULL,
    branch_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    type character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'operational'::character varying,
    capacity numeric(15,2),
    capacity_unit character varying(20) DEFAULT 'MW'::character varying,
    voltage_level character varying(50),
    address text,
    latitude numeric(10,8),
    longitude numeric(11,8),
    commission_date date,
    manager_id integer,
    is_active boolean DEFAULT true,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.stations OWNER TO postgres;

--
-- Name: stations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stations_id_seq OWNER TO postgres;

--
-- Name: stations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stations_id_seq OWNED BY public.stations.id;


--
-- Name: stock_balances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_balances (
    id integer NOT NULL,
    item_id integer NOT NULL,
    warehouse_id integer NOT NULL,
    quantity numeric(15,3) DEFAULT '0'::numeric,
    reserved_qty numeric(15,3) DEFAULT '0'::numeric,
    available_qty numeric(15,3) DEFAULT '0'::numeric,
    average_cost numeric(18,4) DEFAULT '0'::numeric,
    total_value numeric(18,2) DEFAULT '0'::numeric,
    last_movement_date timestamp without time zone,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.stock_balances OWNER TO postgres;

--
-- Name: stock_balances_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_balances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_balances_id_seq OWNER TO postgres;

--
-- Name: stock_balances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_balances_id_seq OWNED BY public.stock_balances.id;


--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_movements (
    id integer NOT NULL,
    business_id integer NOT NULL,
    item_id integer NOT NULL,
    warehouse_id integer NOT NULL,
    movement_type character varying(50) NOT NULL,
    movement_date timestamp without time zone NOT NULL,
    document_type character varying(50),
    document_id integer,
    document_number character varying(50),
    quantity numeric(15,3) NOT NULL,
    unit_cost numeric(18,4),
    total_cost numeric(18,2),
    balance_before numeric(15,3),
    balance_after numeric(15,3),
    notes text,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.stock_movements OWNER TO postgres;

--
-- Name: stock_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_movements_id_seq OWNER TO postgres;

--
-- Name: stock_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_movements_id_seq OWNED BY public.stock_movements.id;


--
-- Name: sts_api_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sts_api_config (
    id integer NOT NULL,
    business_id integer NOT NULL,
    api_name character varying(100) NOT NULL,
    api_url character varying(255),
    api_key character varying(255),
    api_secret character varying(255),
    is_active boolean DEFAULT true,
    is_default boolean DEFAULT false,
    config jsonb,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sts_api_config OWNER TO postgres;

--
-- Name: sts_api_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sts_api_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sts_api_config_id_seq OWNER TO postgres;

--
-- Name: sts_api_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sts_api_config_id_seq OWNED BY public.sts_api_config.id;


--
-- Name: sts_charge_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sts_charge_requests (
    id integer NOT NULL,
    business_id integer NOT NULL,
    customer_id integer NOT NULL,
    meter_id integer NOT NULL,
    amount numeric(18,2) NOT NULL,
    units numeric(15,3),
    request_status character varying(20) DEFAULT 'pending'::character varying,
    request_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_date timestamp without time zone,
    error_message text,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT sts_charge_requests_request_status_check CHECK (((request_status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.sts_charge_requests OWNER TO postgres;

--
-- Name: sts_charge_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sts_charge_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sts_charge_requests_id_seq OWNER TO postgres;

--
-- Name: sts_charge_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sts_charge_requests_id_seq OWNED BY public.sts_charge_requests.id;


--
-- Name: sts_meters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sts_meters (
    id integer NOT NULL,
    business_id integer NOT NULL,
    customer_id integer,
    meter_number character varying(100) NOT NULL,
    meter_type character varying(50),
    manufacturer character varying(100),
    model character varying(100),
    installation_date date,
    location text,
    status character varying(20) DEFAULT 'active'::character varying,
    last_token_date timestamp without time zone,
    total_tokens_generated integer DEFAULT 0,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT sts_meters_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'maintenance'::character varying, 'decommissioned'::character varying])::text[])))
);


ALTER TABLE public.sts_meters OWNER TO postgres;

--
-- Name: sts_meters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sts_meters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sts_meters_id_seq OWNER TO postgres;

--
-- Name: sts_meters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sts_meters_id_seq OWNED BY public.sts_meters.id;


--
-- Name: sts_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sts_tokens (
    id integer NOT NULL,
    charge_request_id integer NOT NULL,
    meter_id integer NOT NULL,
    token_number character varying(100) NOT NULL,
    token_code character varying(100),
    amount numeric(18,2) NOT NULL,
    units numeric(15,3) NOT NULL,
    token_status character varying(20) DEFAULT 'generated'::character varying,
    generated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    sent_at timestamp without time zone,
    used_at timestamp without time zone,
    expiry_date timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT sts_tokens_token_status_check CHECK (((token_status)::text = ANY ((ARRAY['generated'::character varying, 'sent'::character varying, 'used'::character varying, 'expired'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.sts_tokens OWNER TO postgres;

--
-- Name: sts_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sts_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sts_tokens_id_seq OWNER TO postgres;

--
-- Name: sts_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sts_tokens_id_seq OWNED BY public.sts_tokens.id;


--
-- Name: sts_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sts_transactions (
    id integer NOT NULL,
    business_id integer NOT NULL,
    meter_id integer NOT NULL,
    token_id integer,
    transaction_type character varying(50),
    amount numeric(18,2),
    units numeric(15,3),
    transaction_status character varying(20) DEFAULT 'pending'::character varying,
    transaction_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT sts_transactions_transaction_status_check CHECK (((transaction_status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'cancelled'::character varying])::text[]))),
    CONSTRAINT sts_transactions_transaction_type_check CHECK (((transaction_type)::text = ANY ((ARRAY['charge'::character varying, 'token_generation'::character varying, 'token_usage'::character varying, 'refund'::character varying])::text[])))
);


ALTER TABLE public.sts_transactions OWNER TO postgres;

--
-- Name: sts_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sts_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sts_transactions_id_seq OWNER TO postgres;

--
-- Name: sts_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sts_transactions_id_seq OWNED BY public.sts_transactions.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    type character varying(50),
    contact_person character varying(100),
    phone character varying(50),
    email character varying(255),
    address text,
    city character varying(100),
    country character varying(100),
    tax_number character varying(50),
    payment_terms integer DEFAULT 30,
    credit_limit numeric(18,2),
    current_balance numeric(18,2) DEFAULT '0'::numeric,
    account_id integer,
    rating integer,
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.suppliers_id_seq OWNER TO postgres;

--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: support_programs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.support_programs (
    id integer NOT NULL,
    business_id integer NOT NULL,
    program_name character varying(255) NOT NULL,
    program_type character varying(100),
    start_date date,
    end_date date,
    budget_amount numeric(18,2),
    allocated_amount numeric(18,2) DEFAULT 0.00,
    status character varying(20) DEFAULT 'active'::character varying,
    description text,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT support_programs_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.support_programs OWNER TO postgres;

--
-- Name: support_programs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.support_programs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.support_programs_id_seq OWNER TO postgres;

--
-- Name: support_programs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.support_programs_id_seq OWNED BY public.support_programs.id;


--
-- Name: support_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.support_reports (
    id integer NOT NULL,
    business_id integer NOT NULL,
    report_type character varying(100) NOT NULL,
    report_period character varying(50),
    report_data jsonb,
    generated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    generated_by integer,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.support_reports OWNER TO postgres;

--
-- Name: support_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.support_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.support_reports_id_seq OWNER TO postgres;

--
-- Name: support_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.support_reports_id_seq OWNED BY public.support_reports.id;


--
-- Name: system_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_events (
    id integer NOT NULL,
    business_id integer NOT NULL,
    event_type character varying(100) NOT NULL,
    event_source character varying(50) NOT NULL,
    aggregate_type character varying(50),
    aggregate_id integer,
    payload jsonb NOT NULL,
    metadata jsonb,
    correlation_id character varying(100),
    causation_id character varying(100),
    status character varying(50) DEFAULT 'pending'::character varying,
    processed_at timestamp without time zone,
    error_message text,
    retry_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.system_events OWNER TO postgres;

--
-- Name: system_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_events_id_seq OWNER TO postgres;

--
-- Name: system_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_events_id_seq OWNED BY public.system_events.id;


--
-- Name: tariffs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tariffs (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    name_en character varying(255),
    description text,
    "tariffType" character varying(50) DEFAULT 'standard'::character varying,
    "serviceType" character varying(50) DEFAULT 'electricity'::character varying,
    slabs jsonb,
    fixed_charge numeric(18,2) DEFAULT '0'::numeric,
    vat_rate numeric(5,2) DEFAULT '15'::numeric,
    effective_from date,
    effective_to date,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tariffs OWNER TO postgres;

--
-- Name: tariffs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tariffs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tariffs_id_seq OWNER TO postgres;

--
-- Name: tariffs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tariffs_id_seq OWNED BY public.tariffs.id;


--
-- Name: technical_alert_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.technical_alert_rules (
    id integer NOT NULL,
    business_id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_ar character varying(200) NOT NULL,
    name_en character varying(200),
    description text,
    category character varying(50) NOT NULL,
    severity character varying(50) DEFAULT 'warning'::character varying,
    condition jsonb NOT NULL,
    threshold numeric(15,4),
    "comparisonOperator" character varying(50),
    evaluation_period_minutes integer DEFAULT 5,
    cooldown_minutes integer DEFAULT 15,
    notification_channels jsonb,
    escalation_rules jsonb,
    auto_resolve boolean DEFAULT true,
    is_active boolean DEFAULT true,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.technical_alert_rules OWNER TO postgres;

--
-- Name: technical_alert_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.technical_alert_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.technical_alert_rules_id_seq OWNER TO postgres;

--
-- Name: technical_alert_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.technical_alert_rules_id_seq OWNED BY public.technical_alert_rules.id;


--
-- Name: technical_alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.technical_alerts (
    id integer NOT NULL,
    rule_id integer NOT NULL,
    business_id integer NOT NULL,
    alert_type character varying(50) NOT NULL,
    severity character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    source character varying(100),
    source_id character varying(100),
    current_value numeric(15,4),
    threshold_value numeric(15,4),
    metadata jsonb,
    status character varying(50) DEFAULT 'active'::character varying,
    acknowledged_by integer,
    acknowledged_at timestamp without time zone,
    resolved_by integer,
    resolved_at timestamp without time zone,
    resolution_notes text,
    notifications_sent jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.technical_alerts OWNER TO postgres;

--
-- Name: technical_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.technical_alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.technical_alerts_id_seq OWNER TO postgres;

--
-- Name: technical_alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.technical_alerts_id_seq OWNED BY public.technical_alerts.id;


--
-- Name: transition_support_alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transition_support_alerts (
    id integer NOT NULL,
    business_id integer NOT NULL,
    customer_id integer NOT NULL,
    alert_type character varying(50) NOT NULL,
    severity character varying(20) DEFAULT 'warning'::character varying,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    threshold_value numeric(18,2),
    current_value numeric(18,2),
    status character varying(20) DEFAULT 'active'::character varying,
    triggered_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at timestamp without time zone,
    resolved_at timestamp without time zone,
    acknowledged_by integer,
    resolved_by integer,
    resolution text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT transition_support_alerts_alert_type_check CHECK (((alert_type)::text = ANY ((ARRAY['quota_threshold'::character varying, 'consumption_spike'::character varying, 'support_exhaustion'::character varying, 'billing_anomaly'::character varying, 'custom'::character varying])::text[]))),
    CONSTRAINT transition_support_alerts_severity_check CHECK (((severity)::text = ANY ((ARRAY['info'::character varying, 'warning'::character varying, 'error'::character varying, 'critical'::character varying])::text[]))),
    CONSTRAINT transition_support_alerts_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'acknowledged'::character varying, 'resolved'::character varying, 'dismissed'::character varying])::text[])))
);


ALTER TABLE public.transition_support_alerts OWNER TO postgres;

--
-- Name: transition_support_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transition_support_alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transition_support_alerts_id_seq OWNER TO postgres;

--
-- Name: transition_support_alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transition_support_alerts_id_seq OWNED BY public.transition_support_alerts.id;


--
-- Name: transition_support_billing_adjustments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transition_support_billing_adjustments (
    id integer NOT NULL,
    business_id integer NOT NULL,
    customer_id integer NOT NULL,
    invoice_id integer,
    adjustment_type character varying(50) NOT NULL,
    original_amount numeric(18,2) NOT NULL,
    adjusted_amount numeric(18,2) NOT NULL,
    adjustment_amount numeric(18,2) NOT NULL,
    applied_rules jsonb,
    status character varying(20) DEFAULT 'draft'::character varying,
    effective_date date,
    applied_at timestamp without time zone,
    reversed_at timestamp without time zone,
    reason text,
    approved_by integer,
    approved_at timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT transition_support_billing_adjustments_adjustment_type_check CHECK (((adjustment_type)::text = ANY ((ARRAY['support_reduction'::character varying, 'support_extension'::character varying, 'consumption_limit'::character varying, 'tariff_change'::character varying, 'custom'::character varying])::text[]))),
    CONSTRAINT transition_support_billing_adjustments_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'applied'::character varying, 'reversed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.transition_support_billing_adjustments OWNER TO postgres;

--
-- Name: transition_support_billing_adjustments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transition_support_billing_adjustments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transition_support_billing_adjustments_id_seq OWNER TO postgres;

--
-- Name: transition_support_billing_adjustments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transition_support_billing_adjustments_id_seq OWNED BY public.transition_support_billing_adjustments.id;


--
-- Name: transition_support_monitoring; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transition_support_monitoring (
    id integer NOT NULL,
    business_id integer NOT NULL,
    customer_id integer NOT NULL,
    year integer NOT NULL,
    month integer NOT NULL,
    total_consumption numeric(15,3) DEFAULT 0.000,
    supported_consumption numeric(15,3) DEFAULT 0.000,
    transition_consumption numeric(15,3) DEFAULT 0.000,
    total_amount numeric(18,2) DEFAULT 0.00,
    support_amount numeric(18,2) DEFAULT 0.00,
    customer_amount numeric(18,2) DEFAULT 0.00,
    consumption_trend character varying(20),
    support_utilization numeric(5,2),
    status character varying(20) DEFAULT 'normal'::character varying,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT transition_support_monitoring_consumption_trend_check CHECK (((consumption_trend)::text = ANY ((ARRAY['increasing'::character varying, 'stable'::character varying, 'decreasing'::character varying])::text[]))),
    CONSTRAINT transition_support_monitoring_month_check CHECK (((month >= 1) AND (month <= 12))),
    CONSTRAINT transition_support_monitoring_status_check CHECK (((status)::text = ANY ((ARRAY['normal'::character varying, 'warning'::character varying, 'critical'::character varying, 'exceeded'::character varying])::text[])))
);


ALTER TABLE public.transition_support_monitoring OWNER TO postgres;

--
-- Name: transition_support_monitoring_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transition_support_monitoring_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transition_support_monitoring_id_seq OWNER TO postgres;

--
-- Name: transition_support_monitoring_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transition_support_monitoring_id_seq OWNED BY public.transition_support_monitoring.id;


--
-- Name: transition_support_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transition_support_notifications (
    id integer NOT NULL,
    business_id integer NOT NULL,
    customer_id integer NOT NULL,
    notification_type character varying(50) NOT NULL,
    priority character varying(20) DEFAULT 'medium'::character varying,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    template_id integer,
    status character varying(20) DEFAULT 'pending'::character varying,
    send_via character varying(20) DEFAULT 'all'::character varying,
    sent_at timestamp without time zone,
    delivered_at timestamp without time zone,
    read_at timestamp without time zone,
    metadata jsonb,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT transition_support_notifications_notification_type_check CHECK (((notification_type)::text = ANY ((ARRAY['quota_warning'::character varying, 'quota_exceeded'::character varying, 'consumption_increase'::character varying, 'support_ending'::character varying, 'custom'::character varying])::text[]))),
    CONSTRAINT transition_support_notifications_priority_check CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'urgent'::character varying])::text[]))),
    CONSTRAINT transition_support_notifications_send_via_check CHECK (((send_via)::text = ANY ((ARRAY['sms'::character varying, 'email'::character varying, 'whatsapp'::character varying, 'push'::character varying, 'all'::character varying])::text[]))),
    CONSTRAINT transition_support_notifications_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'sent'::character varying, 'delivered'::character varying, 'failed'::character varying, 'read'::character varying])::text[])))
);


ALTER TABLE public.transition_support_notifications OWNER TO postgres;

--
-- Name: transition_support_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transition_support_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transition_support_notifications_id_seq OWNER TO postgres;

--
-- Name: transition_support_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transition_support_notifications_id_seq OWNED BY public.transition_support_notifications.id;


--
-- Name: transition_support_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transition_support_rules (
    id integer NOT NULL,
    business_id integer NOT NULL,
    rule_name character varying(255) NOT NULL,
    rule_type character varying(50) NOT NULL,
    conditions jsonb,
    actions jsonb,
    priority integer DEFAULT 0,
    is_active boolean DEFAULT true,
    start_date date,
    end_date date,
    description text,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT transition_support_rules_rule_type_check CHECK (((rule_type)::text = ANY ((ARRAY['consumption_limit'::character varying, 'support_reduction'::character varying, 'tariff_adjustment'::character varying, 'notification_trigger'::character varying, 'custom'::character varying])::text[])))
);


ALTER TABLE public.transition_support_rules OWNER TO postgres;

--
-- Name: transition_support_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transition_support_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transition_support_rules_id_seq OWNER TO postgres;

--
-- Name: transition_support_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transition_support_rules_id_seq OWNED BY public.transition_support_rules.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    role_id integer NOT NULL,
    business_id integer,
    branch_id integer,
    station_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_roles_id_seq OWNER TO postgres;

--
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_roles_id_seq OWNED BY public.user_roles.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    "openId" character varying(64) NOT NULL,
    employee_id character varying(20),
    name text,
    name_ar character varying(255),
    email character varying(320),
    phone character varying(50),
    password character varying(255),
    avatar text,
    "loginMethod" character varying(64),
    role character varying(50) DEFAULT 'user'::character varying NOT NULL,
    business_id integer,
    branch_id integer,
    station_id integer,
    department_id integer,
    job_title character varying(100),
    is_active boolean DEFAULT true,
    "lastSignedIn" timestamp without time zone DEFAULT now() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouses (
    id integer NOT NULL,
    business_id integer NOT NULL,
    branch_id integer,
    station_id integer,
    code character varying(20) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    type character varying(50) DEFAULT 'main'::character varying,
    address text,
    manager_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.warehouses OWNER TO postgres;

--
-- Name: warehouses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.warehouses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.warehouses_id_seq OWNER TO postgres;

--
-- Name: warehouses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.warehouses_id_seq OWNED BY public.warehouses.id;


--
-- Name: work_order_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_order_tasks (
    id integer NOT NULL,
    work_order_id integer NOT NULL,
    task_number integer NOT NULL,
    description text NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    assigned_to integer,
    estimated_hours numeric(8,2),
    actual_hours numeric(8,2),
    completed_at timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.work_order_tasks OWNER TO postgres;

--
-- Name: work_order_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.work_order_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_order_tasks_id_seq OWNER TO postgres;

--
-- Name: work_order_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.work_order_tasks_id_seq OWNED BY public.work_order_tasks.id;


--
-- Name: work_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_orders (
    id integer NOT NULL,
    business_id integer NOT NULL,
    branch_id integer,
    station_id integer,
    order_number character varying(50) NOT NULL,
    type character varying(50) NOT NULL,
    priority character varying(50) DEFAULT 'medium'::character varying,
    status character varying(50) DEFAULT 'draft'::character varying,
    asset_id integer,
    equipment_id integer,
    title character varying(255) NOT NULL,
    description text,
    requested_by integer,
    requested_date timestamp without time zone,
    scheduled_start timestamp without time zone,
    scheduled_end timestamp without time zone,
    actual_start timestamp without time zone,
    actual_end timestamp without time zone,
    assigned_to integer,
    team_id integer,
    estimated_hours numeric(8,2),
    actual_hours numeric(8,2),
    estimated_cost numeric(18,2),
    actual_cost numeric(18,2),
    labor_cost numeric(18,2),
    parts_cost numeric(18,2),
    completion_notes text,
    failure_code character varying(50),
    root_cause text,
    approved_by integer,
    approved_at timestamp without time zone,
    closed_by integer,
    closed_at timestamp without time zone,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.work_orders OWNER TO postgres;

--
-- Name: work_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.work_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_orders_id_seq OWNER TO postgres;

--
-- Name: work_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.work_orders_id_seq OWNED BY public.work_orders.id;


--
-- Name: worker_incentives; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.worker_incentives (
    id integer NOT NULL,
    worker_id integer NOT NULL,
    business_id integer NOT NULL,
    "incentiveType" character varying(50) NOT NULL,
    amount numeric(12,2) NOT NULL,
    reason text,
    reference_type character varying(50),
    reference_id integer,
    status character varying(50) DEFAULT 'pending'::character varying,
    approved_by integer,
    approved_at timestamp without time zone,
    paid_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.worker_incentives OWNER TO postgres;

--
-- Name: worker_incentives_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.worker_incentives_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.worker_incentives_id_seq OWNER TO postgres;

--
-- Name: worker_incentives_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.worker_incentives_id_seq OWNED BY public.worker_incentives.id;


--
-- Name: worker_locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.worker_locations (
    id integer NOT NULL,
    worker_id integer NOT NULL,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    accuracy numeric(10,2),
    speed numeric(10,2),
    heading numeric(5,2),
    altitude numeric(10,2),
    battery_level integer,
    is_moving boolean DEFAULT false,
    operation_id integer,
    recorded_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.worker_locations OWNER TO postgres;

--
-- Name: worker_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.worker_locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.worker_locations_id_seq OWNER TO postgres;

--
-- Name: worker_locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.worker_locations_id_seq OWNED BY public.worker_locations.id;


--
-- Name: worker_performance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.worker_performance (
    id integer NOT NULL,
    worker_id integer NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    total_operations integer DEFAULT 0,
    completed_operations integer DEFAULT 0,
    on_time_operations integer DEFAULT 0,
    avg_completion_time numeric(10,2),
    customer_rating numeric(3,2),
    quality_score numeric(5,2),
    attendance_rate numeric(5,2),
    notes text,
    evaluated_by integer,
    evaluated_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.worker_performance OWNER TO postgres;

--
-- Name: worker_performance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.worker_performance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.worker_performance_id_seq OWNER TO postgres;

--
-- Name: worker_performance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.worker_performance_id_seq OWNED BY public.worker_performance.id;


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts ALTER COLUMN id SET DEFAULT nextval('public.accounts_id_seq'::regclass);


--
-- Name: ai_models id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_models ALTER COLUMN id SET DEFAULT nextval('public.ai_models_id_seq'::regclass);


--
-- Name: ai_predictions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_predictions ALTER COLUMN id SET DEFAULT nextval('public.ai_predictions_id_seq'::regclass);


--
-- Name: alerts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts ALTER COLUMN id SET DEFAULT nextval('public.alerts_id_seq'::regclass);


--
-- Name: api_keys id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_keys ALTER COLUMN id SET DEFAULT nextval('public.api_keys_id_seq'::regclass);


--
-- Name: api_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_logs ALTER COLUMN id SET DEFAULT nextval('public.api_logs_id_seq'::regclass);


--
-- Name: areas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.areas ALTER COLUMN id SET DEFAULT nextval('public.areas_id_seq'::regclass);


--
-- Name: asset_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_categories ALTER COLUMN id SET DEFAULT nextval('public.asset_categories_id_seq'::regclass);


--
-- Name: asset_movements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movements ALTER COLUMN id SET DEFAULT nextval('public.asset_movements_id_seq'::regclass);


--
-- Name: assets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets ALTER COLUMN id SET DEFAULT nextval('public.assets_id_seq'::regclass);


--
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: billing_periods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_periods ALTER COLUMN id SET DEFAULT nextval('public.billing_periods_id_seq'::regclass);


--
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- Name: businesses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses ALTER COLUMN id SET DEFAULT nextval('public.businesses_id_seq'::regclass);


--
-- Name: cabinets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cabinets ALTER COLUMN id SET DEFAULT nextval('public.cabinets_id_seq'::regclass);


--
-- Name: cashboxes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cashboxes ALTER COLUMN id SET DEFAULT nextval('public.cashboxes_id_seq'::regclass);


--
-- Name: cost_centers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cost_centers ALTER COLUMN id SET DEFAULT nextval('public.cost_centers_id_seq'::regclass);


--
-- Name: custom_accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_accounts ALTER COLUMN id SET DEFAULT nextval('public.custom_accounts_id_seq'::regclass);


--
-- Name: custom_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_categories ALTER COLUMN id SET DEFAULT nextval('public.custom_categories_id_seq'::regclass);


--
-- Name: custom_intermediary_accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_intermediary_accounts ALTER COLUMN id SET DEFAULT nextval('public.custom_intermediary_accounts_id_seq'::regclass);


--
-- Name: custom_memos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_memos ALTER COLUMN id SET DEFAULT nextval('public.custom_memos_id_seq'::regclass);


--
-- Name: custom_notes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_notes ALTER COLUMN id SET DEFAULT nextval('public.custom_notes_id_seq'::regclass);


--
-- Name: custom_parties id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_parties ALTER COLUMN id SET DEFAULT nextval('public.custom_parties_id_seq'::regclass);


--
-- Name: custom_party_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_party_transactions ALTER COLUMN id SET DEFAULT nextval('public.custom_party_transactions_id_seq'::regclass);


--
-- Name: custom_payment_voucher_lines id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_payment_voucher_lines ALTER COLUMN id SET DEFAULT nextval('public.custom_payment_voucher_lines_id_seq'::regclass);


--
-- Name: custom_payment_vouchers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_payment_vouchers ALTER COLUMN id SET DEFAULT nextval('public.custom_payment_vouchers_id_seq'::regclass);


--
-- Name: custom_receipt_vouchers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_receipt_vouchers ALTER COLUMN id SET DEFAULT nextval('public.custom_receipt_vouchers_id_seq'::regclass);


--
-- Name: custom_reconciliations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_reconciliations ALTER COLUMN id SET DEFAULT nextval('public.custom_reconciliations_id_seq'::regclass);


--
-- Name: custom_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_settings ALTER COLUMN id SET DEFAULT nextval('public.custom_settings_id_seq'::regclass);


--
-- Name: custom_sub_systems id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_sub_systems ALTER COLUMN id SET DEFAULT nextval('public.custom_sub_systems_id_seq'::regclass);


--
-- Name: custom_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_transactions ALTER COLUMN id SET DEFAULT nextval('public.custom_transactions_id_seq'::regclass);


--
-- Name: custom_treasuries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_treasuries ALTER COLUMN id SET DEFAULT nextval('public.custom_treasuries_id_seq'::regclass);


--
-- Name: custom_treasury_currencies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_treasury_currencies ALTER COLUMN id SET DEFAULT nextval('public.custom_treasury_currencies_id_seq'::regclass);


--
-- Name: custom_treasury_movements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_treasury_movements ALTER COLUMN id SET DEFAULT nextval('public.custom_treasury_movements_id_seq'::regclass);


--
-- Name: custom_treasury_transfers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_treasury_transfers ALTER COLUMN id SET DEFAULT nextval('public.custom_treasury_transfers_id_seq'::regclass);


--
-- Name: customer_quotas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_quotas ALTER COLUMN id SET DEFAULT nextval('public.customer_quotas_id_seq'::regclass);


--
-- Name: customer_transactions_new id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_transactions_new ALTER COLUMN id SET DEFAULT nextval('public.customer_transactions_new_id_seq'::regclass);


--
-- Name: customer_wallets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_wallets ALTER COLUMN id SET DEFAULT nextval('public.customer_wallets_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: customers_enhanced id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers_enhanced ALTER COLUMN id SET DEFAULT nextval('public.customers_enhanced_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: diesel_pipes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diesel_pipes ALTER COLUMN id SET DEFAULT nextval('public.diesel_pipes_id_seq'::regclass);


--
-- Name: diesel_pump_meters id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diesel_pump_meters ALTER COLUMN id SET DEFAULT nextval('public.diesel_pump_meters_id_seq'::regclass);


--
-- Name: diesel_pump_readings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diesel_pump_readings ALTER COLUMN id SET DEFAULT nextval('public.diesel_pump_readings_id_seq'::regclass);


--
-- Name: diesel_receiving_tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diesel_receiving_tasks ALTER COLUMN id SET DEFAULT nextval('public.diesel_receiving_tasks_id_seq'::regclass);


--
-- Name: diesel_suppliers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diesel_suppliers ALTER COLUMN id SET DEFAULT nextval('public.diesel_suppliers_id_seq'::regclass);


--
-- Name: diesel_tank_movements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diesel_tank_movements ALTER COLUMN id SET DEFAULT nextval('public.diesel_tank_movements_id_seq'::regclass);


--
-- Name: diesel_tank_openings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diesel_tank_openings ALTER COLUMN id SET DEFAULT nextval('public.diesel_tank_openings_id_seq'::regclass);


--
-- Name: diesel_tankers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diesel_tankers ALTER COLUMN id SET DEFAULT nextval('public.diesel_tankers_id_seq'::regclass);


--
-- Name: diesel_tanks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diesel_tanks ALTER COLUMN id SET DEFAULT nextval('public.diesel_tanks_id_seq'::regclass);


--
-- Name: employee_contracts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_contracts ALTER COLUMN id SET DEFAULT nextval('public.employee_contracts_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: equipment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment ALTER COLUMN id SET DEFAULT nextval('public.equipment_id_seq'::regclass);


--
-- Name: equipment_movements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_movements ALTER COLUMN id SET DEFAULT nextval('public.equipment_movements_id_seq'::regclass);


--
-- Name: event_subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.event_subscriptions_id_seq'::regclass);


--
-- Name: fee_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_types ALTER COLUMN id SET DEFAULT nextval('public.fee_types_id_seq'::regclass);


--
-- Name: field_equipment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_equipment ALTER COLUMN id SET DEFAULT nextval('public.field_equipment_id_seq'::regclass);


--
-- Name: field_operations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_operations ALTER COLUMN id SET DEFAULT nextval('public.field_operations_id_seq'::regclass);


--
-- Name: field_teams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_teams ALTER COLUMN id SET DEFAULT nextval('public.field_teams_id_seq'::regclass);


--
-- Name: field_workers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_workers ALTER COLUMN id SET DEFAULT nextval('public.field_workers_id_seq'::regclass);


--
-- Name: fiscal_periods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fiscal_periods ALTER COLUMN id SET DEFAULT nextval('public.fiscal_periods_id_seq'::regclass);


--
-- Name: generator_diesel_consumption id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.generator_diesel_consumption ALTER COLUMN id SET DEFAULT nextval('public.generator_diesel_consumption_id_seq'::regclass);


--
-- Name: government_customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.government_customers ALTER COLUMN id SET DEFAULT nextval('public.government_customers_id_seq'::regclass);


--
-- Name: incoming_webhooks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incoming_webhooks ALTER COLUMN id SET DEFAULT nextval('public.incoming_webhooks_id_seq'::regclass);


--
-- Name: inspection_checklists id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection_checklists ALTER COLUMN id SET DEFAULT nextval('public.inspection_checklists_id_seq'::regclass);


--
-- Name: inspection_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection_items ALTER COLUMN id SET DEFAULT nextval('public.inspection_items_id_seq'::regclass);


--
-- Name: inspections id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspections ALTER COLUMN id SET DEFAULT nextval('public.inspections_id_seq'::regclass);


--
-- Name: installation_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installation_details ALTER COLUMN id SET DEFAULT nextval('public.installation_details_id_seq'::regclass);


--
-- Name: installation_photos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installation_photos ALTER COLUMN id SET DEFAULT nextval('public.installation_photos_id_seq'::regclass);


--
-- Name: integration_configs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_configs ALTER COLUMN id SET DEFAULT nextval('public.integration_configs_id_seq'::regclass);


--
-- Name: integration_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_logs ALTER COLUMN id SET DEFAULT nextval('public.integration_logs_id_seq'::regclass);


--
-- Name: integrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integrations ALTER COLUMN id SET DEFAULT nextval('public.integrations_id_seq'::regclass);


--
-- Name: invoice_fees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_fees ALTER COLUMN id SET DEFAULT nextval('public.invoice_fees_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: invoices_enhanced id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices_enhanced ALTER COLUMN id SET DEFAULT nextval('public.invoices_enhanced_id_seq'::regclass);


--
-- Name: item_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_categories ALTER COLUMN id SET DEFAULT nextval('public.item_categories_id_seq'::regclass);


--
-- Name: items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);


--
-- Name: job_titles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_titles ALTER COLUMN id SET DEFAULT nextval('public.job_titles_id_seq'::regclass);


--
-- Name: journal_entries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries ALTER COLUMN id SET DEFAULT nextval('public.journal_entries_id_seq'::regclass);


--
-- Name: journal_entry_lines id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entry_lines ALTER COLUMN id SET DEFAULT nextval('public.journal_entry_lines_id_seq'::regclass);


--
-- Name: leave_balances id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_balances ALTER COLUMN id SET DEFAULT nextval('public.leave_balances_id_seq'::regclass);


--
-- Name: leave_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests ALTER COLUMN id SET DEFAULT nextval('public.leave_requests_id_seq'::regclass);


--
-- Name: leave_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_types ALTER COLUMN id SET DEFAULT nextval('public.leave_types_id_seq'::regclass);


--
-- Name: maintenance_plans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_plans ALTER COLUMN id SET DEFAULT nextval('public.maintenance_plans_id_seq'::regclass);


--
-- Name: material_request_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_request_items ALTER COLUMN id SET DEFAULT nextval('public.material_request_items_id_seq'::regclass);


--
-- Name: material_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_requests ALTER COLUMN id SET DEFAULT nextval('public.material_requests_id_seq'::regclass);


--
-- Name: meter_readings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meter_readings ALTER COLUMN id SET DEFAULT nextval('public.meter_readings_id_seq'::regclass);


--
-- Name: meter_readings_enhanced id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meter_readings_enhanced ALTER COLUMN id SET DEFAULT nextval('public.meter_readings_enhanced_id_seq'::regclass);


--
-- Name: meters id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meters ALTER COLUMN id SET DEFAULT nextval('public.meters_id_seq'::regclass);


--
-- Name: meters_enhanced id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meters_enhanced ALTER COLUMN id SET DEFAULT nextval('public.meters_enhanced_id_seq'::regclass);


--
-- Name: note_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.note_categories ALTER COLUMN id SET DEFAULT nextval('public.note_categories_id_seq'::regclass);


--
-- Name: operation_approvals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operation_approvals ALTER COLUMN id SET DEFAULT nextval('public.operation_approvals_id_seq'::regclass);


--
-- Name: operation_payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operation_payments ALTER COLUMN id SET DEFAULT nextval('public.operation_payments_id_seq'::regclass);


--
-- Name: operation_status_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operation_status_log ALTER COLUMN id SET DEFAULT nextval('public.operation_status_log_id_seq'::regclass);


--
-- Name: payment_gateway_config id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_gateway_config ALTER COLUMN id SET DEFAULT nextval('public.payment_gateway_config_id_seq'::regclass);


--
-- Name: payment_gateways id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_gateways ALTER COLUMN id SET DEFAULT nextval('public.payment_gateways_id_seq'::regclass);


--
-- Name: payment_methods_new id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods_new ALTER COLUMN id SET DEFAULT nextval('public.payment_methods_new_id_seq'::regclass);


--
-- Name: payment_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions ALTER COLUMN id SET DEFAULT nextval('public.payment_transactions_id_seq'::regclass);


--
-- Name: payment_webhooks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_webhooks ALTER COLUMN id SET DEFAULT nextval('public.payment_webhooks_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: payments_enhanced id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments_enhanced ALTER COLUMN id SET DEFAULT nextval('public.payments_enhanced_id_seq'::regclass);


--
-- Name: payroll_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_items ALTER COLUMN id SET DEFAULT nextval('public.payroll_items_id_seq'::regclass);


--
-- Name: payroll_runs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_runs ALTER COLUMN id SET DEFAULT nextval('public.payroll_runs_id_seq'::regclass);


--
-- Name: performance_evaluations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.performance_evaluations ALTER COLUMN id SET DEFAULT nextval('public.performance_evaluations_id_seq'::regclass);


--
-- Name: performance_metrics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.performance_metrics ALTER COLUMN id SET DEFAULT nextval('public.performance_metrics_id_seq'::regclass);


--
-- Name: period_settlements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.period_settlements ALTER COLUMN id SET DEFAULT nextval('public.period_settlements_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: prepaid_codes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prepaid_codes ALTER COLUMN id SET DEFAULT nextval('public.prepaid_codes_id_seq'::regclass);


--
-- Name: pricing_rules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pricing_rules ALTER COLUMN id SET DEFAULT nextval('public.pricing_rules_id_seq'::regclass);


--
-- Name: project_phases id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_phases ALTER COLUMN id SET DEFAULT nextval('public.project_phases_id_seq'::regclass);


--
-- Name: project_tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_tasks ALTER COLUMN id SET DEFAULT nextval('public.project_tasks_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: purchase_orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders ALTER COLUMN id SET DEFAULT nextval('public.purchase_orders_id_seq'::regclass);


--
-- Name: purchase_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requests ALTER COLUMN id SET DEFAULT nextval('public.purchase_requests_id_seq'::regclass);


--
-- Name: quota_consumption id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quota_consumption ALTER COLUMN id SET DEFAULT nextval('public.quota_consumption_id_seq'::regclass);


--
-- Name: receipts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipts ALTER COLUMN id SET DEFAULT nextval('public.receipts_id_seq'::regclass);


--
-- Name: role_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions ALTER COLUMN id SET DEFAULT nextval('public.role_permissions_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: salary_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_details ALTER COLUMN id SET DEFAULT nextval('public.salary_details_id_seq'::regclass);


--
-- Name: salary_grades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_grades ALTER COLUMN id SET DEFAULT nextval('public.salary_grades_id_seq'::regclass);


--
-- Name: sensors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensors ALTER COLUMN id SET DEFAULT nextval('public.sensors_id_seq'::regclass);


--
-- Name: sequences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sequences ALTER COLUMN id SET DEFAULT nextval('public.sequences_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: settlement_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settlement_items ALTER COLUMN id SET DEFAULT nextval('public.settlement_items_id_seq'::regclass);


--
-- Name: sms_delivery_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sms_delivery_log ALTER COLUMN id SET DEFAULT nextval('public.sms_delivery_log_id_seq'::regclass);


--
-- Name: sms_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sms_messages ALTER COLUMN id SET DEFAULT nextval('public.sms_messages_id_seq'::regclass);


--
-- Name: sms_providers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sms_providers ALTER COLUMN id SET DEFAULT nextval('public.sms_providers_id_seq'::regclass);


--
-- Name: sms_templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sms_templates ALTER COLUMN id SET DEFAULT nextval('public.sms_templates_id_seq'::regclass);


--
-- Name: squares id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.squares ALTER COLUMN id SET DEFAULT nextval('public.squares_id_seq'::regclass);


--
-- Name: station_diesel_config id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.station_diesel_config ALTER COLUMN id SET DEFAULT nextval('public.station_diesel_config_id_seq'::regclass);


--
-- Name: station_diesel_path id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.station_diesel_path ALTER COLUMN id SET DEFAULT nextval('public.station_diesel_path_id_seq'::regclass);


--
-- Name: stations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stations ALTER COLUMN id SET DEFAULT nextval('public.stations_id_seq'::regclass);


--
-- Name: stock_balances id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_balances ALTER COLUMN id SET DEFAULT nextval('public.stock_balances_id_seq'::regclass);


--
-- Name: stock_movements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements ALTER COLUMN id SET DEFAULT nextval('public.stock_movements_id_seq'::regclass);


--
-- Name: sts_api_config id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sts_api_config ALTER COLUMN id SET DEFAULT nextval('public.sts_api_config_id_seq'::regclass);


--
-- Name: sts_charge_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sts_charge_requests ALTER COLUMN id SET DEFAULT nextval('public.sts_charge_requests_id_seq'::regclass);


--
-- Name: sts_meters id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sts_meters ALTER COLUMN id SET DEFAULT nextval('public.sts_meters_id_seq'::regclass);


--
-- Name: sts_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sts_tokens ALTER COLUMN id SET DEFAULT nextval('public.sts_tokens_id_seq'::regclass);


--
-- Name: sts_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sts_transactions ALTER COLUMN id SET DEFAULT nextval('public.sts_transactions_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: support_programs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_programs ALTER COLUMN id SET DEFAULT nextval('public.support_programs_id_seq'::regclass);


--
-- Name: support_reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_reports ALTER COLUMN id SET DEFAULT nextval('public.support_reports_id_seq'::regclass);


--
-- Name: system_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_events ALTER COLUMN id SET DEFAULT nextval('public.system_events_id_seq'::regclass);


--
-- Name: tariffs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tariffs ALTER COLUMN id SET DEFAULT nextval('public.tariffs_id_seq'::regclass);


--
-- Name: technical_alert_rules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.technical_alert_rules ALTER COLUMN id SET DEFAULT nextval('public.technical_alert_rules_id_seq'::regclass);


--
-- Name: technical_alerts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.technical_alerts ALTER COLUMN id SET DEFAULT nextval('public.technical_alerts_id_seq'::regclass);


--
-- Name: transition_support_alerts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transition_support_alerts ALTER COLUMN id SET DEFAULT nextval('public.transition_support_alerts_id_seq'::regclass);


--
-- Name: transition_support_billing_adjustments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transition_support_billing_adjustments ALTER COLUMN id SET DEFAULT nextval('public.transition_support_billing_adjustments_id_seq'::regclass);


--
-- Name: transition_support_monitoring id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transition_support_monitoring ALTER COLUMN id SET DEFAULT nextval('public.transition_support_monitoring_id_seq'::regclass);


--
-- Name: transition_support_notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transition_support_notifications ALTER COLUMN id SET DEFAULT nextval('public.transition_support_notifications_id_seq'::regclass);


--
-- Name: transition_support_rules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transition_support_rules ALTER COLUMN id SET DEFAULT nextval('public.transition_support_rules_id_seq'::regclass);


--
-- Name: user_roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles ALTER COLUMN id SET DEFAULT nextval('public.user_roles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: warehouses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses ALTER COLUMN id SET DEFAULT nextval('public.warehouses_id_seq'::regclass);


--
-- Name: work_order_tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_tasks ALTER COLUMN id SET DEFAULT nextval('public.work_order_tasks_id_seq'::regclass);


--
-- Name: work_orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_orders ALTER COLUMN id SET DEFAULT nextval('public.work_orders_id_seq'::regclass);


--
-- Name: worker_incentives id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_incentives ALTER COLUMN id SET DEFAULT nextval('public.worker_incentives_id_seq'::regclass);


--
-- Name: worker_locations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_locations ALTER COLUMN id SET DEFAULT nextval('public.worker_locations_id_seq'::regclass);


--
-- Name: worker_performance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_performance ALTER COLUMN id SET DEFAULT nextval('public.worker_performance_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: postgres
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	88bb7bc355fc8b2e52e140c1ceaab93d866f4449dbe2633da4be7015cd42f6b4	1767682530728
2	ebe0dbbd57439ea9525734f0874bcbe16826ed6f4e2170ffc7189e54dfcf5747	1767683322065
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (id, business_id, code, name_ar, name_en, parent_id, level, system_module, account_type, nature, is_parent, is_active, is_cash_account, is_bank_account, currency, opening_balance, current_balance, description, linked_entity_type, linked_entity_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_models; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_models (id, business_id, code, name_ar, name_en, description, model_type, provider, model_version, endpoint, input_schema, output_schema, accuracy, last_trained_at, training_data_count, is_active, config, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_predictions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_predictions (id, model_id, business_id, prediction_type, target_entity, target_entity_id, input_data, prediction, confidence, prediction_date, valid_from, valid_to, actual_value, accuracy, is_verified, verified_at, verified_by, notes, created_at) FROM stdin;
\.


--
-- Data for Name: alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alerts (id, business_id, station_id, equipment_id, sensor_id, "alertType", category, title, message, value, threshold, status, triggered_at, acknowledged_by, acknowledged_at, resolved_by, resolved_at, resolution, work_order_id, created_at) FROM stdin;
\.


--
-- Data for Name: api_keys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.api_keys (id, business_id, name, description, key_hash, key_prefix, permissions, allowed_ips, allowed_origins, rate_limit_per_minute, rate_limit_per_day, expires_at, last_used_at, usage_count, is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: api_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.api_logs (id, api_key_id, business_id, endpoint, method, request_headers, request_body, response_status, response_time, ip_address, user_agent, error_message, created_at) FROM stdin;
\.


--
-- Data for Name: areas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.areas (id, business_id, project_id, code, name, name_en, description, address, latitude, longitude, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: asset_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_categories (id, business_id, code, name_ar, name_en, parent_id, "depreciationMethod", useful_life, salvage_percentage, asset_account_id, depreciation_account_id, accumulated_dep_account_id, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: asset_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_movements (id, asset_id, movement_type, movement_date, from_branch_id, to_branch_id, from_station_id, to_station_id, amount, description, reference_type, reference_id, journal_entry_id, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assets (id, business_id, branch_id, station_id, category_id, code, name_ar, name_en, description, serial_number, model, manufacturer, purchase_date, commission_date, purchase_cost, current_value, accumulated_depreciation, salvage_value, useful_life, "depreciationMethod", status, location, latitude, longitude, warranty_expiry, supplier_id, purchase_order_id, parent_asset_id, qr_code, barcode, image, specifications, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (id, employee_id, business_id, attendance_date, check_in_time, check_in_location, check_in_latitude, check_in_longitude, "checkInMethod", check_out_time, check_out_location, check_out_latitude, check_out_longitude, "checkOutMethod", total_hours, overtime_hours, late_minutes, early_leave_minutes, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, business_id, user_id, action, module, entity_type, entity_id, old_values, new_values, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: billing_periods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.billing_periods (id, business_id, project_id, name, period_number, month, year, start_date, end_date, status, reading_start_date, reading_end_date, billing_date, due_date, total_meters, read_meters, billed_meters, created_by, closed_by, closed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, business_id, code, name_ar, name_en, type, parent_id, address, city, region, country, latitude, longitude, phone, email, manager_id, is_active, created_at, updated_at) FROM stdin;
1	1	BR001	الفرع الرئيسي	\N	main	\N	\N	\N	\N	Saudi Arabia	\N	\N	\N	\N	\N	t	2025-12-28 21:01:25	2025-12-28 21:01:25
2	1	BR002	الدهمية	\N	local	\N	\N	\N	\N	Saudi Arabia	\N	\N	\N	\N	\N	t	2025-12-28 21:01:44	2025-12-28 21:01:44
3	1	BR003	غليل	\N	local	\N	\N	\N	\N	Saudi Arabia	\N	\N	\N	\N	\N	t	2025-12-28 21:02:15	2025-12-28 21:02:15
4	1	BR004	الصبالية	\N	local	\N	\N	\N	\N	Saudi Arabia	\N	\N	\N	\N	\N	t	2025-12-28 21:02:50	2025-12-28 21:02:50
\.


--
-- Data for Name: businesses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.businesses (id, code, name_ar, name_en, type, system_type, parent_id, logo, address, phone, email, website, tax_number, commercial_register, currency, fiscal_year_start, timezone, is_active, settings, created_at, updated_at) FROM stdin;
1	BR001	شركة العباسي	\N	holding	both	\N	\N	\N	\N	\N	\N	\N	\N	SAR	1	Asia/Riyadh	t	\N	2025-12-28 20:58:00	2025-12-28 18:00:02
2	BR002	العباسي1	\N	subsidiary	both	\N	\N	\N	\N	\N	\N	\N	\N	SAR	1	Asia/Riyadh	t	\N	2025-12-28 21:00:51	2025-12-28 21:00:51
\.


--
-- Data for Name: cabinets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cabinets (id, business_id, square_id, code, name, name_en, "cabinetType", capacity, current_load, latitude, longitude, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cashboxes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cashboxes (id, business_id, branch_id, code, name, name_en, balance, currency, assigned_to, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cost_centers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cost_centers (id, business_id, code, name_ar, name_en, parent_id, level, type, station_id, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: custom_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_accounts (id, business_id, account_number, account_name, account_type, parent_id, balance, currency, description, is_active, created_by, created_at, updated_at) FROM stdin;
11	1			99	\N	0.00	SAR	\N	t	1	2025-12-31 20:58:11	2025-12-31 23:59:38
18	1			employee_works	\N	0.00	SAR	\N	t	1	2025-12-31 23:56:58	2025-12-31 23:56:58
19	1			aaaa	\N	0.00	SAR	\N	t	1	2025-12-31 23:57:19	2025-12-31 23:57:19
20	1			employee_works	\N	0.00	SAR	\N	t	1	2025-12-31 23:57:47	2025-12-31 23:57:47
21	1			employee_works	\N	0.00	SAR	\N	t	1	2025-12-31 23:58:05	2025-12-31 23:58:15
22	1			employee_works	\N	0.00	SAR	\N	t	1	2025-12-31 23:58:29	2025-12-31 23:58:29
\.


--
-- Data for Name: custom_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_categories (id, business_id, sub_system_id, code, name_ar, name_en, "categoryType", parent_id, level, color, icon, description, linked_account_id, is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: custom_intermediary_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_intermediary_accounts (id, business_id, from_sub_system_id, to_sub_system_id, code, name_ar, name_en, balance, currency, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: custom_memos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_memos (id, business_id, memo_number, memo_date, subject, content, "memoType", from_department, to_department, status, priority, attachments, response_required, response_deadline, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: custom_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_notes (id, business_id, title, content, category, priority, color, is_pinned, is_archived, tags, attachments, reminder_date, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: custom_parties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_parties (id, business_id, sub_system_id, code, name_ar, name_en, "partyType", phone, mobile, email, address, city, country, tax_number, commercial_register, credit_limit, current_balance, currency, contact_person, notes, tags, is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: custom_party_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_party_transactions (id, business_id, party_id, transaction_type, transaction_date, amount, balance_before, balance_after, currency, reference_type, reference_id, reference_number, description, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: custom_payment_voucher_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_payment_voucher_lines (id, business_id, payment_voucher_id, line_order, account_type, account_sub_type_id, account_id, analytic_account_id, analytic_treasury_id, cost_center_id, description, amount, created_at) FROM stdin;
1	1	2	1	\N	\N	1	\N	\N	\N	Ù…ØµØ±ÙˆÙ Ù†Ù‚Ø¯ÙŠ	100.00	2026-01-04 21:34:38
2	1	2	2	\N	\N	2	\N	\N	\N	Ù…ØµØ±ÙˆÙ Ø¥Ø¶Ø§ÙÙŠ	50.00	2026-01-04 21:34:39
3	1	3	1	EMP_WORK	3	16	\N	4	\N	23123	15000.00	2026-01-04 21:48:34
\.


--
-- Data for Name: custom_payment_vouchers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_payment_vouchers (id, business_id, sub_system_id, voucher_number, voucher_date, amount, currency, currency_id, treasury_id, "destinationType", destination_name, destination_intermediary_id, party_id, category_id, "paymentMethod", check_number, check_date, check_bank, bank_reference, description, attachments, status, edit_count, is_reconciled, reconciled_with, reconciled_at, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: custom_receipt_vouchers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_receipt_vouchers (id, business_id, sub_system_id, voucher_number, voucher_date, amount, currency, "sourceType", source_name, source_intermediary_id, party_id, category_id, "paymentMethod", check_number, check_date, check_bank, bank_reference, treasury_id, description, attachments, status, is_reconciled, reconciled_with, reconciled_at, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: custom_reconciliations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_reconciliations (id, business_id, payment_voucher_id, receipt_voucher_id, amount, currency, "confidenceScore", status, notes, confirmed_by, confirmed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: custom_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_settings (id, business_id, sub_system_id, setting_key, setting_value, "settingType", description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: custom_sub_systems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_sub_systems (id, business_id, code, name_ar, name_en, description, color, icon, is_active, created_by, created_at, updated_at) FROM stdin;
1	1	FR-001	أعمال الحديدة	Branch One	نظام إدارة أعمال الحديدة	blue	layers	t	1	2025-12-28 21:07:25	2025-12-28 23:42:45
2	1	FR-002	حسابات محمدي والعباسي	Branch Two	نظام حسابات محمدي والعباسي	green	wallet	t	1	2025-12-28 21:07:25	2025-12-28 23:42:45
3	1	FR-003	العباسي الرئيسي	Al-Abbasi Main	النظام الرئيسي للعباسي	\N	\N	t	\N	2025-12-28 23:41:08	2025-12-28 23:41:08
4	1	FR-004	العباسي شخصي	Al-Abbasi Personal	النظام الشخصي للعباسي	\N	\N	t	\N	2025-12-28 23:41:08	2025-12-28 23:41:08
5	1	231	555555			blue	layers	t	1	2025-12-31 22:42:09	2025-12-31 22:42:09
\.


--
-- Data for Name: custom_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_transactions (id, business_id, transaction_number, transaction_date, account_id, transaction_type, amount, description, reference_type, reference_id, attachments, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: custom_treasuries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_treasuries (id, business_id, sub_system_id, code, name_ar, name_en, treasury_type, account_id, bank_name, account_number, iban, swift_code, wallet_provider, wallet_number, currency, opening_balance, current_balance, description, is_active, created_by, created_at, updated_at) FROM stdin;
1	1	1	TR-001	صندوق التحصيل والتوريد الدهمية	Collection and Supply Treasury - Dhamiya	cash	18	\N	\N	\N	\N	\N	\N		0.00	0.00	صندوق التحصيل والتوريد الدهمية	t	\N	2025-12-28 23:46:13	2026-01-01 00:12:27
2	1	1	TR-002	صندوق التحصيل والتوريد الصبالي	Collection and Supply Treasury - Sabali	cash	18	\N	\N	\N	\N	\N	\N	YER	0.00	0.00	صندوق التحصيل والتوريد الصبالي	t	\N	2025-12-28 23:46:13	2026-01-01 00:03:58
3	1	1	TR-003	صندوق غليل	Ghalil Treasury	cash	18	\N	\N	\N	\N	\N	\N	YER	0.00	0.00	صندوق غليل	t	\N	2025-12-28 23:46:13	2026-01-01 00:04:08
4	1	1	21	بنك		bank	20				\N				0.00	0.00		t	1	2026-01-01 00:04:29	2026-01-01 00:12:16
5	1	1	55	محفظة		wallet	21				\N				0.00	0.00		t	1	2026-01-01 00:04:45	2026-01-01 00:11:59
6	1	1	88	صراف		exchange	19				\N			YER	0.00	0.00		t	1	2026-01-01 00:05:01	2026-01-01 00:05:01
\.


--
-- Data for Name: custom_treasury_currencies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_treasury_currencies (id, business_id, treasury_id, currency_id, is_default, is_active, opening_balance, current_balance, created_by, created_at, updated_at) FROM stdin;
3	1	2	2	t	t	0.00	0.00	3	2026-01-02 18:52:16	\N
5	1	4	2	t	t	0.00	0.00	3	2026-01-02 18:53:04	\N
6	1	3	2	t	t	0.00	0.00	3	2026-01-04 21:39:42	\N
\.


--
-- Data for Name: custom_treasury_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_treasury_movements (id, business_id, treasury_id, movement_type, movement_date, amount, balance_before, balance_after, currency, reference_type, reference_id, reference_number, description, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: custom_treasury_transfers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_treasury_transfers (id, business_id, sub_system_id, transfer_number, transfer_date, from_treasury_id, to_treasury_id, amount, currency, exchange_rate, fees, description, status, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: customer_quotas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_quotas (id, business_id, customer_id, program_id, quota_amount, consumed_amount, remaining_amount, quota_period, start_date, end_date, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: customer_transactions_new; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_transactions_new (id, customer_id, wallet_id, transaction_type, amount, balance_before, balance_after, reference_type, reference_id, description, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: customer_wallets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_wallets (id, customer_id, balance, currency, last_transaction_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, business_id, branch_id, station_id, account_number, name_ar, name_en, type, category, "idType", id_number, phone, mobile, email, address, city, district, postal_code, latitude, longitude, tariff_id, connection_date, status, current_balance, deposit_amount, credit_limit, account_id, is_active, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: customers_enhanced; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers_enhanced (id, business_id, project_id, full_name, mobile_no, phone, email, address, national_id, "customerType", "serviceTier", status, balance_due, user_id, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, business_id, code, name_ar, name_en, parent_id, manager_id, cost_center_id, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: diesel_pipes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diesel_pipes (id, business_id, station_id, code, name_ar, name_en, pipe_material, diameter, length, condition, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: diesel_pump_meters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diesel_pump_meters (id, business_id, station_id, supplier_id, code, name_ar, name_en, pump_type, serial_number, current_reading, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: diesel_pump_readings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diesel_pump_readings (id, business_id, pump_meter_id, task_id, reading_date, reading_value, "readingType", reading_image, quantity, recorded_by, notes, created_at) FROM stdin;
\.


--
-- Data for Name: diesel_receiving_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diesel_receiving_tasks (id, business_id, station_id, task_number, task_date, employee_id, tanker_id, supplier_id, task_status, start_time, arrival_at_supplier_time, loading_start_time, loading_end_time, departure_from_supplier_time, arrival_at_station_time, unloading_start_time, unloading_end_time, completion_time, supplier_pump_id, supplier_pump_reading_before, supplier_pump_reading_after, supplier_pump_reading_before_image, supplier_pump_reading_after_image, supplier_invoice_number, supplier_invoice_image, supplier_invoice_amount, quantity_from_supplier, compartment1_quantity, compartment2_quantity, intake_pump_id, intake_pump_reading_before, intake_pump_reading_after, intake_pump_reading_before_image, intake_pump_reading_after_image, quantity_received_at_station, receiving_tank_id, quantity_difference, difference_notes, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: diesel_suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diesel_suppliers (id, business_id, code, name_ar, name_en, phone, address, latitude, longitude, contact_person, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: diesel_tank_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diesel_tank_movements (id, business_id, station_id, movement_date, movement_type, from_tank_id, to_tank_id, quantity, task_id, output_pump_id, output_pump_reading_before, output_pump_reading_after, generator_id, notes, recorded_by, created_at) FROM stdin;
\.


--
-- Data for Name: diesel_tank_openings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diesel_tank_openings (id, tank_id, opening_number, "position", usage, diameter, notes, created_at) FROM stdin;
\.


--
-- Data for Name: diesel_tankers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diesel_tankers (id, business_id, code, plate_number, capacity, compartment1_capacity, compartment2_capacity, driver_name, driver_phone, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: diesel_tanks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diesel_tanks (id, business_id, station_id, code, name_ar, name_en, tank_type, tank_material, brand, color, capacity, height, diameter, dead_stock, effective_capacity, current_level, min_level, openings_count, linked_generator_id, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: employee_contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_contracts (id, employee_id, business_id, contract_number, "contractType", start_date, end_date, basic_salary, probation_period_days, notice_period_days, document_path, status, termination_date, termination_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, business_id, employee_number, first_name, middle_name, last_name, full_name_ar, full_name_en, "idType", id_number, id_expiry_date, nationality, gender, date_of_birth, place_of_birth, "maritalStatus", phone, mobile, email, personal_email, address, city, district, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, photo_path, hire_date, probation_end_date, "contractType", contract_start_date, contract_end_date, job_title_id, department_id, manager_id, is_manager, work_location, station_id, branch_id, "workSchedule", working_hours_per_week, field_worker_id, status, termination_date, termination_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: equipment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment (id, business_id, station_id, asset_id, code, name_ar, name_en, type, status, manufacturer, model, serial_number, rated_capacity, capacity_unit, voltage_rating, current_rating, installation_date, last_maintenance_date, next_maintenance_date, location, latitude, longitude, is_controllable, is_monitored, communication_protocol, ip_address, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: equipment_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment_movements (id, equipment_id, "movementType", from_holder_id, to_holder_id, operation_id, movement_date, "conditionBefore", "conditionAfter", notes, recorded_by) FROM stdin;
\.


--
-- Data for Name: event_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_subscriptions (id, business_id, subscriber_name, event_type, "handlerType", handler_config, filter_expression, is_active, priority, max_retries, retry_delay_seconds, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: fee_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fee_types (id, business_id, code, name, name_en, description, "feeType", amount, is_recurring, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: field_equipment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.field_equipment (id, business_id, equipment_code, name_ar, name_en, "equipmentType", serial_number, model, brand, status, current_holder_id, assigned_team_id, purchase_date, purchase_cost, warranty_end, last_maintenance, next_maintenance, condition, notes, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: field_operations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.field_operations (id, business_id, station_id, operation_number, operation_type, status, priority, title, description, reference_type, reference_id, customer_id, asset_id, location_lat, location_lng, address, scheduled_date, scheduled_time, started_at, completed_at, assigned_team_id, assigned_worker_id, estimated_duration, actual_duration, notes, completion_notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: field_teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.field_teams (id, business_id, branch_id, code, name_ar, name_en, team_type, leader_id, max_members, current_members, status, working_area, notes, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: field_workers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.field_workers (id, business_id, user_id, employee_id, employee_number, name_ar, name_en, phone, email, team_id, worker_type, specialization, skills, status, current_location_lat, current_location_lng, last_location_update, hire_date, daily_rate, operation_rate, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: fiscal_periods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fiscal_periods (id, business_id, year, period, name_ar, name_en, start_date, end_date, status, closed_by, closed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: generator_diesel_consumption; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.generator_diesel_consumption (id, business_id, station_id, generator_id, consumption_date, rocket_tank_id, start_level, end_level, quantity_consumed, running_hours, consumption_rate, notes, recorded_by, created_at) FROM stdin;
\.


--
-- Data for Name: government_customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.government_customers (id, business_id, customer_id, national_id, support_category, eligibility_status, approval_date, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: incoming_webhooks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.incoming_webhooks (id, integration_id, business_id, webhook_type, payload, headers, signature, is_valid, status, processed_at, error_message, retry_count, source_ip, created_at) FROM stdin;
\.


--
-- Data for Name: inspection_checklists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inspection_checklists (id, business_id, code, name_ar, name_en, operation_type, items, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: inspection_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inspection_items (id, inspection_id, checklist_item_id, item_name, is_passed, score, notes, photo_url) FROM stdin;
\.


--
-- Data for Name: inspections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inspections (id, business_id, operation_id, inspection_number, "inspectionType", inspector_id, inspection_date, status, overall_score, notes, created_at) FROM stdin;
\.


--
-- Data for Name: installation_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.installation_details (id, operation_id, customer_id, meter_serial_number, "meterType", seal_number, seal_color, seal_type, breaker_type, breaker_capacity, breaker_brand, cable_length, cable_type, cable_size, initial_reading, installation_date, installation_time, technician_id, notes, customer_signature, created_at) FROM stdin;
\.


--
-- Data for Name: installation_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.installation_photos (id, installation_id, operation_id, photo_type, photo_url, caption, latitude, longitude, captured_at, uploaded_by, created_at) FROM stdin;
\.


--
-- Data for Name: integration_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.integration_configs (id, integration_id, config_key, config_value, is_encrypted, "valueType", environment, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: integration_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.integration_logs (id, integration_id, business_id, request_id, direction, method, endpoint, request_headers, request_body, response_status, response_headers, response_body, duration_ms, status, error_message, retry_count, created_at) FROM stdin;
\.


--
-- Data for Name: integrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.integrations (id, business_id, code, name_ar, name_en, description, integration_type, category, provider, base_url, api_version, "authType", is_active, is_primary, priority, last_health_check, "healthStatus", webhook_url, webhook_secret, rate_limit_per_minute, timeout_seconds, retry_attempts, metadata, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: invoice_fees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_fees (id, invoice_id, fee_type_id, amount, description, created_at) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, business_id, branch_id, customer_id, meter_id, invoice_number, invoice_date, due_date, period_start, period_end, reading_id, consumption, consumption_amount, fixed_charges, tax_amount, other_charges, discount_amount, previous_balance, total_amount, paid_amount, balance_due, status, journal_entry_id, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: invoices_enhanced; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices_enhanced (id, business_id, customer_id, meter_id, meter_reading_id, billing_period_id, invoice_no, invoice_date, due_date, period_start, period_end, meter_number, previous_reading, current_reading, total_consumption_kwh, price_kwh, consumption_amount, fixed_charges, total_fees, vat_rate, vat_amount, total_amount, previous_balance_due, final_amount, paid_amount, balance_due, status, "invoiceType", approved_by, approved_at, created_by, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: item_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item_categories (id, business_id, code, name_ar, name_en, parent_id, inventory_account_id, cogs_account_id, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items (id, business_id, category_id, code, name_ar, name_en, description, type, unit, barcode, min_stock, max_stock, reorder_point, reorder_qty, standard_cost, last_purchase_price, average_cost, is_active, image, specifications, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: job_titles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_titles (id, business_id, code, title_ar, title_en, department_id, grade_id, level, description, responsibilities, requirements, headcount, current_count, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: journal_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journal_entries (id, business_id, branch_id, entry_number, entry_date, period_id, type, source_module, source_id, description, total_debit, total_credit, status, posted_by, posted_at, reversed_by, reversed_at, reversal_entry_id, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: journal_entry_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journal_entry_lines (id, entry_id, line_number, account_id, cost_center_id, description, debit, credit, currency, exchange_rate, created_at) FROM stdin;
\.


--
-- Data for Name: leave_balances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_balances (id, employee_id, leave_type_id, year, opening_balance, earned_balance, used_balance, adjustment_balance, remaining_balance, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_requests (id, employee_id, business_id, leave_type_id, start_date, end_date, total_days, reason, attachment_path, status, approved_by, approved_at, rejection_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: leave_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_types (id, business_id, code, name_ar, name_en, annual_balance, is_paid, requires_approval, allows_carry_over, max_carry_over_days, color, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: maintenance_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_plans (id, business_id, code, name_ar, name_en, description, asset_category_id, frequency, interval_days, "basedOn", meter_type, meter_interval, estimated_hours, estimated_cost, is_active, tasks, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: material_request_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.material_request_items (id, request_id, item_id, requested_qty, approved_qty, issued_qty, returned_qty, unit, notes) FROM stdin;
\.


--
-- Data for Name: material_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.material_requests (id, business_id, request_number, operation_id, worker_id, team_id, warehouse_id, request_date, status, notes, approved_by, approved_at, issued_by, issued_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: meter_readings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meter_readings (id, meter_id, reading_date, reading_value, previous_reading, consumption, "readingType", read_by, image, notes, status, created_at) FROM stdin;
\.


--
-- Data for Name: meter_readings_enhanced; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meter_readings_enhanced (id, meter_id, billing_period_id, current_reading, previous_reading, consumption, reading_date, "readingType", status, is_estimated, images, read_by, approved_by, approved_at, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: meters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meters (id, business_id, customer_id, meter_number, type, status, installation_date, last_reading_date, last_reading, multiplier, max_load, location, latitude, longitude, manufacturer, model, serial_number, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: meters_enhanced; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meters_enhanced (id, business_id, customer_id, cabinet_id, tariff_id, project_id, meter_number, serial_number, "meterType", brand, model, category, current_reading, previous_reading, balance, balance_due, installation_date, "installationStatus", sign_number, sign_color, status, is_active, iot_device_id, last_sync_time, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: note_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.note_categories (id, business_id, name, color, icon, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: operation_approvals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.operation_approvals (id, operation_id, approval_level, approver_id, status, decision_date, notes, signature_url) FROM stdin;
\.


--
-- Data for Name: operation_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.operation_payments (id, business_id, operation_id, worker_id, "paymentType", base_amount, bonus_amount, deduction_amount, net_amount, status, calculated_at, approved_by, approved_at, paid_at) FROM stdin;
\.


--
-- Data for Name: operation_status_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.operation_status_log (id, operation_id, from_status, to_status, changed_by, changed_at, reason, notes) FROM stdin;
\.


--
-- Data for Name: payment_gateway_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_gateway_config (id, gateway_id, business_id, config_key, config_value, config_type, description, is_encrypted, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payment_gateways; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_gateways (id, business_id, gateway_name, gateway_type, api_key, api_secret, merchant_id, webhook_secret, api_url, test_mode, sandbox_api_key, sandbox_api_secret, config, is_active, is_default, description, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payment_methods_new; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_methods_new (id, business_id, code, name, name_en, "methodType", is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payment_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_transactions (id, business_id, customer_id, invoice_id, gateway_id, transaction_number, gateway_transaction_id, amount, currency, status, payment_method, card_last4, card_brand, request_data, response_data, webhook_received, webhook_data, error_message, error_code, initiated_at, completed_at, failed_at, customer_email, customer_phone, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payment_webhooks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_webhooks (id, gateway_id, transaction_id, event_type, payload, signature, is_valid, processed, processed_at, error_message, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, business_id, branch_id, customer_id, payment_number, payment_date, amount, "paymentMethod", reference_number, bank_account_id, status, notes, journal_entry_id, received_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payments_enhanced; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments_enhanced (id, business_id, customer_id, meter_id, invoice_id, cashbox_id, payment_method_id, payment_number, payment_date, amount, balance_due_before, balance_due_after, payer_name, reference_number, status, notes, received_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payroll_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payroll_items (id, payroll_run_id, employee_id, basic_salary, working_days, actual_days, housing_allowance, transport_allowance, other_allowances, total_allowances, overtime_hours, overtime_amount, bonuses, total_additions, absence_days, absence_deduction, late_deduction, social_insurance, tax_deduction, loan_deduction, other_deductions, total_deductions, gross_salary, net_salary, status, paid_at, notes, created_at) FROM stdin;
\.


--
-- Data for Name: payroll_runs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payroll_runs (id, business_id, code, period_year, period_month, period_start_date, period_end_date, total_basic_salary, total_allowances, total_deductions, total_net_salary, employee_count, status, journal_entry_id, calculated_at, calculated_by, approved_at, approved_by, paid_at, paid_by, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: performance_evaluations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.performance_evaluations (id, employee_id, business_id, evaluation_period, period_start_date, period_end_date, overall_score, "performanceRating", quality_score, productivity_score, attendance_score, teamwork_score, initiative_score, strengths, areas_for_improvement, goals, manager_comments, employee_comments, evaluated_by, evaluated_at, status, acknowledged_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: performance_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.performance_metrics (id, business_id, metric_type, source, value, unit, tags, recorded_at) FROM stdin;
\.


--
-- Data for Name: period_settlements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.period_settlements (id, business_id, settlement_number, period_start, period_end, total_operations, total_amount, total_bonuses, total_deductions, net_amount, status, approved_by, approved_at, created_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, module, code, name_ar, name_en, description, created_at) FROM stdin;
\.


--
-- Data for Name: prepaid_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prepaid_codes (id, business_id, meter_id, code, amount, status, used_at, expires_at, generated_by, created_at) FROM stdin;
\.


--
-- Data for Name: pricing_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pricing_rules (id, business_id, meter_type, usage_type, subscription_fee, deposit_amount, deposit_required, active, notes, created_by, created_at, updated_at) FROM stdin;
1	1	traditional	residential	5000.00	35000.00	t	t	قاعدة افتراضية - عداد تقليدي سكني	\N	2026-01-06 09:57:29.84496	2026-01-06 09:57:29.84496
2	1	traditional	commercial	10000.00	50000.00	t	t	قاعدة افتراضية - عداد تقليدي تجاري	\N	2026-01-06 09:57:29.84496	2026-01-06 09:57:29.84496
3	1	sts	residential	7000.00	0.00	f	t	قاعدة افتراضية - STS سكني (لا تأمين)	\N	2026-01-06 09:57:29.84496	2026-01-06 09:57:29.84496
4	1	sts	commercial	12000.00	0.00	f	t	قاعدة افتراضية - STS تجاري (لا تأمين)	\N	2026-01-06 09:57:29.84496	2026-01-06 09:57:29.84496
5	1	iot	residential	6000.00	30000.00	t	t	قاعدة افتراضية - IoT سكني	\N	2026-01-06 09:57:29.84496	2026-01-06 09:57:29.84496
6	1	iot	commercial	11000.00	45000.00	t	t	قاعدة افتراضية - IoT تجاري	\N	2026-01-06 09:57:29.84496	2026-01-06 09:57:29.84496
\.


--
-- Data for Name: project_phases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_phases (id, project_id, phase_number, name_ar, name_en, description, start_date, end_date, actual_start_date, actual_end_date, budget, actual_cost, progress, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: project_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_tasks (id, project_id, phase_id, parent_task_id, task_number, name_ar, name_en, description, type, status, priority, assigned_to, start_date, end_date, actual_start_date, actual_end_date, estimated_hours, actual_hours, progress, dependencies, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, business_id, branch_id, station_id, code, name_ar, name_en, description, type, status, priority, manager_id, start_date, planned_end_date, actual_end_date, budget, actual_cost, progress, cost_center_id, approved_by, approved_at, closed_by, closed_at, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, business_id, branch_id, order_number, order_date, supplier_id, status, delivery_date, warehouse_id, payment_terms, currency, exchange_rate, subtotal, tax_amount, discount_amount, total_amount, paid_amount, notes, terms, approved_by, approved_at, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: purchase_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_requests (id, business_id, branch_id, station_id, request_number, request_date, required_date, status, priority, requested_by, department_id, purpose, total_amount, approved_by, approved_at, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quota_consumption; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quota_consumption (id, business_id, customer_id, quota_id, invoice_id, consumption_amount, consumption_date, consumption_type, notes, created_at) FROM stdin;
\.


--
-- Data for Name: receipts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.receipts (id, business_id, payment_id, receipt_number, issue_date, description, printed_by, printed_at, created_at) FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (id, role_id, permission_id, created_at) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, business_id, code, name_ar, name_en, description, level, is_system, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: salary_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salary_details (id, employee_id, basic_salary, currency, housing_allowance, transport_allowance, food_allowance, phone_allowance, other_allowances, total_salary, "paymentMethod", bank_name, bank_account_number, iban, effective_date, end_date, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: salary_grades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salary_grades (id, business_id, code, name, min_salary, max_salary, housing_allowance_pct, transport_allowance, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: sensors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sensors (id, equipment_id, code, name_ar, name_en, type, unit, min_value, max_value, warning_low, warning_high, critical_low, critical_high, current_value, last_reading_time, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sequences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sequences (id, business_id, code, prefix, suffix, current_value, min_digits, "resetPeriod", last_reset_date, updated_at) FROM stdin;
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, business_id, category, key, value, "valueType", description, is_system, updated_by, updated_at) FROM stdin;
\.


--
-- Data for Name: settlement_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settlement_items (id, settlement_id, worker_id, operations_count, base_amount, bonuses, deductions, net_amount, "paymentMethod", payment_reference, paid_at) FROM stdin;
\.


--
-- Data for Name: sms_delivery_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sms_delivery_log (id, message_id, status, provider_status, provider_message_id, status_date, error_message, error_code, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: sms_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sms_messages (id, business_id, customer_id, template_id, message_type, channel, recipient, subject, message, status, provider, provider_message_id, sent_at, delivered_at, read_at, error_message, error_code, retry_count, max_retries, next_retry_at, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sms_providers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sms_providers (id, business_id, provider_name, provider_type, api_key, api_secret, account_sid, auth_token, from_number, from_email, whatsapp_number, api_url, webhook_url, is_active, is_default, description, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sms_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sms_templates (id, business_id, template_name, template_type, channel, subject, message, variables, is_active, is_default, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: squares; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.squares (id, business_id, area_id, code, name, name_en, description, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: station_diesel_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.station_diesel_config (id, business_id, station_id, has_intake_pump, has_output_pump, intake_pump_has_meter, output_pump_has_meter, notes, configured_by, configured_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: station_diesel_path; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.station_diesel_path (id, config_id, sequence_order, element_type, tank_id, pump_id, pipe_id, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: stations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stations (id, business_id, branch_id, code, name_ar, name_en, type, status, capacity, capacity_unit, voltage_level, address, latitude, longitude, commission_date, manager_id, is_active, metadata, created_at, updated_at) FROM stdin;
1	1	1	ST001	محطة تجريبية 1	Sample Station 1	transmission	active	\N	MW	\N	\N	\N	\N	\N	\N	t	\N	2026-01-06 07:21:27.789457	2026-01-06 07:21:27.789457
2	1	1	ST002	محطة تجريبية 2	Sample Station 2	distribution	active	\N	MW	\N	\N	\N	\N	\N	\N	t	\N	2026-01-06 07:21:27.792398	2026-01-06 07:21:27.792398
\.


--
-- Data for Name: stock_balances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_balances (id, item_id, warehouse_id, quantity, reserved_qty, available_qty, average_cost, total_value, last_movement_date, updated_at) FROM stdin;
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_movements (id, business_id, item_id, warehouse_id, movement_type, movement_date, document_type, document_id, document_number, quantity, unit_cost, total_cost, balance_before, balance_after, notes, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: sts_api_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sts_api_config (id, business_id, api_name, api_url, api_key, api_secret, is_active, is_default, config, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sts_charge_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sts_charge_requests (id, business_id, customer_id, meter_id, amount, units, request_status, request_date, completed_date, error_message, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sts_meters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sts_meters (id, business_id, customer_id, meter_number, meter_type, manufacturer, model, installation_date, location, status, last_token_date, total_tokens_generated, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sts_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sts_tokens (id, charge_request_id, meter_id, token_number, token_code, amount, units, token_status, generated_at, sent_at, used_at, expiry_date, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sts_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sts_transactions (id, business_id, meter_id, token_id, transaction_type, amount, units, transaction_status, transaction_date, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, business_id, code, name_ar, name_en, type, contact_person, phone, email, address, city, country, tax_number, payment_terms, credit_limit, current_balance, account_id, rating, is_active, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: support_programs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.support_programs (id, business_id, program_name, program_type, start_date, end_date, budget_amount, allocated_amount, status, description, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: support_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.support_reports (id, business_id, report_type, report_period, report_data, generated_at, generated_by, notes, created_at) FROM stdin;
\.


--
-- Data for Name: system_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_events (id, business_id, event_type, event_source, aggregate_type, aggregate_id, payload, metadata, correlation_id, causation_id, status, processed_at, error_message, retry_count, created_at) FROM stdin;
\.


--
-- Data for Name: tariffs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tariffs (id, business_id, code, name, name_en, description, "tariffType", "serviceType", slabs, fixed_charge, vat_rate, effective_from, effective_to, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: technical_alert_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.technical_alert_rules (id, business_id, code, name_ar, name_en, description, category, severity, condition, threshold, "comparisonOperator", evaluation_period_minutes, cooldown_minutes, notification_channels, escalation_rules, auto_resolve, is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: technical_alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.technical_alerts (id, rule_id, business_id, alert_type, severity, title, message, source, source_id, current_value, threshold_value, metadata, status, acknowledged_by, acknowledged_at, resolved_by, resolved_at, resolution_notes, notifications_sent, created_at) FROM stdin;
\.


--
-- Data for Name: transition_support_alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transition_support_alerts (id, business_id, customer_id, alert_type, severity, title, message, threshold_value, current_value, status, triggered_at, acknowledged_at, resolved_at, acknowledged_by, resolved_by, resolution, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: transition_support_billing_adjustments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transition_support_billing_adjustments (id, business_id, customer_id, invoice_id, adjustment_type, original_amount, adjusted_amount, adjustment_amount, applied_rules, status, effective_date, applied_at, reversed_at, reason, approved_by, approved_at, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: transition_support_monitoring; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transition_support_monitoring (id, business_id, customer_id, year, month, total_consumption, supported_consumption, transition_consumption, total_amount, support_amount, customer_amount, consumption_trend, support_utilization, status, last_updated, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: transition_support_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transition_support_notifications (id, business_id, customer_id, notification_type, priority, title, message, template_id, status, send_via, sent_at, delivered_at, read_at, metadata, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: transition_support_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transition_support_rules (id, business_id, rule_name, rule_type, conditions, actions, priority, is_active, start_date, end_date, description, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (id, user_id, role_id, business_id, branch_id, station_id, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, "openId", employee_id, name, name_ar, email, phone, password, avatar, "loginMethod", role, business_id, branch_id, station_id, department_id, job_title, is_active, "lastSignedIn", "createdAt", "updatedAt") FROM stdin;
2	demo_user_001	\N	مستخدم تجريبي	\N	\N	\N	$2b$10$TPGClz03LlHMJMJ40p1rtewYd55NdOsmPCDBWMtZyZVRiN1ZvoG4q	\N	demo	super_admin	1	\N	\N	\N	\N	t	2026-01-06 07:17:38.51	2025-12-28 20:38:41	2025-12-31 19:08:11
1	local_0500000000_1766953967433	\N	مدير النظام	\N	\N	0500000000	$2b$10$TPGClz03LlHMJMJ40p1rtewYd55NdOsmPCDBWMtZyZVRiN1ZvoG4q	\N	local	super_admin	1	\N	\N	\N	\N	t	2026-01-06 19:37:44.507	2025-12-28 20:32:47	2026-01-05 01:30:18
\.


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouses (id, business_id, branch_id, station_id, code, name_ar, name_en, type, address, manager_id, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: work_order_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_order_tasks (id, work_order_id, task_number, description, status, assigned_to, estimated_hours, actual_hours, completed_at, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: work_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_orders (id, business_id, branch_id, station_id, order_number, type, priority, status, asset_id, equipment_id, title, description, requested_by, requested_date, scheduled_start, scheduled_end, actual_start, actual_end, assigned_to, team_id, estimated_hours, actual_hours, estimated_cost, actual_cost, labor_cost, parts_cost, completion_notes, failure_code, root_cause, approved_by, approved_at, closed_by, closed_at, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: worker_incentives; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.worker_incentives (id, worker_id, business_id, "incentiveType", amount, reason, reference_type, reference_id, status, approved_by, approved_at, paid_at, created_at) FROM stdin;
\.


--
-- Data for Name: worker_locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.worker_locations (id, worker_id, latitude, longitude, accuracy, speed, heading, altitude, battery_level, is_moving, operation_id, recorded_at) FROM stdin;
\.


--
-- Data for Name: worker_performance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.worker_performance (id, worker_id, period_start, period_end, total_operations, completed_operations, on_time_operations, avg_completion_time, customer_rating, quality_score, attendance_rate, notes, evaluated_by, evaluated_at, created_at) FROM stdin;
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: postgres
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 2, true);


--
-- Name: accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accounts_id_seq', 1, false);


--
-- Name: ai_models_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ai_models_id_seq', 1, false);


--
-- Name: ai_predictions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ai_predictions_id_seq', 1, false);


--
-- Name: alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.alerts_id_seq', 1, false);


--
-- Name: api_keys_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.api_keys_id_seq', 1, false);


--
-- Name: api_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.api_logs_id_seq', 1, false);


--
-- Name: areas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.areas_id_seq', 1, false);


--
-- Name: asset_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_categories_id_seq', 1, false);


--
-- Name: asset_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_movements_id_seq', 1, false);


--
-- Name: assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assets_id_seq', 1, false);


--
-- Name: attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attendance_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: billing_periods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.billing_periods_id_seq', 1, false);


--
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.branches_id_seq', 1, false);


--
-- Name: businesses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.businesses_id_seq', 1, false);


--
-- Name: cabinets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cabinets_id_seq', 1, false);


--
-- Name: cashboxes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cashboxes_id_seq', 1, false);


--
-- Name: cost_centers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cost_centers_id_seq', 1, false);


--
-- Name: custom_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_accounts_id_seq', 1, false);


--
-- Name: custom_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_categories_id_seq', 1, false);


--
-- Name: custom_intermediary_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_intermediary_accounts_id_seq', 1, false);


--
-- Name: custom_memos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_memos_id_seq', 1, false);


--
-- Name: custom_notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_notes_id_seq', 1, false);


--
-- Name: custom_parties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_parties_id_seq', 1, false);


--
-- Name: custom_party_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_party_transactions_id_seq', 1, false);


--
-- Name: custom_payment_voucher_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_payment_voucher_lines_id_seq', 1, false);


--
-- Name: custom_payment_vouchers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_payment_vouchers_id_seq', 1, false);


--
-- Name: custom_receipt_vouchers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_receipt_vouchers_id_seq', 1, false);


--
-- Name: custom_reconciliations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_reconciliations_id_seq', 1, false);


--
-- Name: custom_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_settings_id_seq', 1, false);


--
-- Name: custom_sub_systems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_sub_systems_id_seq', 1, false);


--
-- Name: custom_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_transactions_id_seq', 1, false);


--
-- Name: custom_treasuries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_treasuries_id_seq', 1, false);


--
-- Name: custom_treasury_currencies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_treasury_currencies_id_seq', 1, false);


--
-- Name: custom_treasury_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_treasury_movements_id_seq', 1, false);


--
-- Name: custom_treasury_transfers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_treasury_transfers_id_seq', 1, false);


--
-- Name: customer_quotas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customer_quotas_id_seq', 1, false);


--
-- Name: customer_transactions_new_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customer_transactions_new_id_seq', 1, false);


--
-- Name: customer_wallets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customer_wallets_id_seq', 1, false);


--
-- Name: customers_enhanced_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_enhanced_id_seq', 1, false);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 1, false);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_id_seq', 1, false);


--
-- Name: diesel_pipes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.diesel_pipes_id_seq', 1, false);


--
-- Name: diesel_pump_meters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.diesel_pump_meters_id_seq', 1, false);


--
-- Name: diesel_pump_readings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.diesel_pump_readings_id_seq', 1, false);


--
-- Name: diesel_receiving_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.diesel_receiving_tasks_id_seq', 1, false);


--
-- Name: diesel_suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.diesel_suppliers_id_seq', 1, false);


--
-- Name: diesel_tank_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.diesel_tank_movements_id_seq', 1, false);


--
-- Name: diesel_tank_openings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.diesel_tank_openings_id_seq', 1, false);


--
-- Name: diesel_tankers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.diesel_tankers_id_seq', 1, false);


--
-- Name: diesel_tanks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.diesel_tanks_id_seq', 1, false);


--
-- Name: employee_contracts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employee_contracts_id_seq', 1, false);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_id_seq', 1, false);


--
-- Name: equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_id_seq', 1, false);


--
-- Name: equipment_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_movements_id_seq', 1, false);


--
-- Name: event_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.event_subscriptions_id_seq', 1, false);


--
-- Name: fee_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fee_types_id_seq', 1, false);


--
-- Name: field_equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.field_equipment_id_seq', 1, false);


--
-- Name: field_operations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.field_operations_id_seq', 1, false);


--
-- Name: field_teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.field_teams_id_seq', 1, false);


--
-- Name: field_workers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.field_workers_id_seq', 1, false);


--
-- Name: fiscal_periods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fiscal_periods_id_seq', 1, false);


--
-- Name: generator_diesel_consumption_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.generator_diesel_consumption_id_seq', 1, false);


--
-- Name: government_customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.government_customers_id_seq', 1, false);


--
-- Name: incoming_webhooks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.incoming_webhooks_id_seq', 1, false);


--
-- Name: inspection_checklists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inspection_checklists_id_seq', 1, false);


--
-- Name: inspection_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inspection_items_id_seq', 1, false);


--
-- Name: inspections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inspections_id_seq', 1, false);


--
-- Name: installation_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.installation_details_id_seq', 1, false);


--
-- Name: installation_photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.installation_photos_id_seq', 1, false);


--
-- Name: integration_configs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.integration_configs_id_seq', 1, false);


--
-- Name: integration_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.integration_logs_id_seq', 1, false);


--
-- Name: integrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.integrations_id_seq', 1, false);


--
-- Name: invoice_fees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoice_fees_id_seq', 1, false);


--
-- Name: invoices_enhanced_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoices_enhanced_id_seq', 1, false);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoices_id_seq', 1, false);


--
-- Name: item_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.item_categories_id_seq', 1, false);


--
-- Name: items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.items_id_seq', 1, false);


--
-- Name: job_titles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_titles_id_seq', 1, false);


--
-- Name: journal_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.journal_entries_id_seq', 1, false);


--
-- Name: journal_entry_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.journal_entry_lines_id_seq', 1, false);


--
-- Name: leave_balances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leave_balances_id_seq', 1, false);


--
-- Name: leave_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leave_requests_id_seq', 1, false);


--
-- Name: leave_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leave_types_id_seq', 1, false);


--
-- Name: maintenance_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maintenance_plans_id_seq', 1, false);


--
-- Name: material_request_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.material_request_items_id_seq', 1, false);


--
-- Name: material_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.material_requests_id_seq', 1, false);


--
-- Name: meter_readings_enhanced_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.meter_readings_enhanced_id_seq', 1, false);


--
-- Name: meter_readings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.meter_readings_id_seq', 1, false);


--
-- Name: meters_enhanced_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.meters_enhanced_id_seq', 1, false);


--
-- Name: meters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.meters_id_seq', 1, false);


--
-- Name: note_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.note_categories_id_seq', 1, false);


--
-- Name: operation_approvals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.operation_approvals_id_seq', 1, false);


--
-- Name: operation_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.operation_payments_id_seq', 1, false);


--
-- Name: operation_status_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.operation_status_log_id_seq', 1, false);


--
-- Name: payment_gateway_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_gateway_config_id_seq', 1, false);


--
-- Name: payment_gateways_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_gateways_id_seq', 1, false);


--
-- Name: payment_methods_new_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_methods_new_id_seq', 1, false);


--
-- Name: payment_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_transactions_id_seq', 1, false);


--
-- Name: payment_webhooks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_webhooks_id_seq', 1, false);


--
-- Name: payments_enhanced_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_enhanced_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: payroll_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payroll_items_id_seq', 1, false);


--
-- Name: payroll_runs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payroll_runs_id_seq', 1, false);


--
-- Name: performance_evaluations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.performance_evaluations_id_seq', 1, false);


--
-- Name: performance_metrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.performance_metrics_id_seq', 1, false);


--
-- Name: period_settlements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.period_settlements_id_seq', 1, false);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_id_seq', 1, false);


--
-- Name: prepaid_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prepaid_codes_id_seq', 1, false);


--
-- Name: pricing_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pricing_rules_id_seq', 6, true);


--
-- Name: project_phases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_phases_id_seq', 1, false);


--
-- Name: project_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_tasks_id_seq', 1, false);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projects_id_seq', 1, false);


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchase_orders_id_seq', 1, false);


--
-- Name: purchase_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchase_requests_id_seq', 1, false);


--
-- Name: quota_consumption_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quota_consumption_id_seq', 1, false);


--
-- Name: receipts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.receipts_id_seq', 1, false);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- Name: salary_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salary_details_id_seq', 1, false);


--
-- Name: salary_grades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salary_grades_id_seq', 1, false);


--
-- Name: sensors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sensors_id_seq', 1, false);


--
-- Name: sequences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sequences_id_seq', 1, false);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settings_id_seq', 1, false);


--
-- Name: settlement_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settlement_items_id_seq', 1, false);


--
-- Name: sms_delivery_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sms_delivery_log_id_seq', 1, false);


--
-- Name: sms_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sms_messages_id_seq', 1, false);


--
-- Name: sms_providers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sms_providers_id_seq', 1, false);


--
-- Name: sms_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sms_templates_id_seq', 1, false);


--
-- Name: squares_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.squares_id_seq', 1, false);


--
-- Name: station_diesel_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.station_diesel_config_id_seq', 1, false);


--
-- Name: station_diesel_path_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.station_diesel_path_id_seq', 1, false);


--
-- Name: stations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stations_id_seq', 2, true);


--
-- Name: stock_balances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_balances_id_seq', 1, false);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_movements_id_seq', 1, false);


--
-- Name: sts_api_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sts_api_config_id_seq', 1, false);


--
-- Name: sts_charge_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sts_charge_requests_id_seq', 1, false);


--
-- Name: sts_meters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sts_meters_id_seq', 1, false);


--
-- Name: sts_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sts_tokens_id_seq', 1, false);


--
-- Name: sts_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sts_transactions_id_seq', 1, false);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 1, false);


--
-- Name: support_programs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.support_programs_id_seq', 1, false);


--
-- Name: support_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.support_reports_id_seq', 1, false);


--
-- Name: system_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_events_id_seq', 1, false);


--
-- Name: tariffs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tariffs_id_seq', 1, false);


--
-- Name: technical_alert_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.technical_alert_rules_id_seq', 1, false);


--
-- Name: technical_alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.technical_alerts_id_seq', 1, false);


--
-- Name: transition_support_alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transition_support_alerts_id_seq', 1, false);


--
-- Name: transition_support_billing_adjustments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transition_support_billing_adjustments_id_seq', 1, false);


--
-- Name: transition_support_monitoring_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transition_support_monitoring_id_seq', 1, false);


--
-- Name: transition_support_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transition_support_notifications_id_seq', 1, false);


--
-- Name: transition_support_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transition_support_rules_id_seq', 1, false);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 845, true);


--
-- Name: warehouses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.warehouses_id_seq', 1, false);


--
-- Name: work_order_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.work_order_tasks_id_seq', 1, false);


--
-- Name: work_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.work_orders_id_seq', 1, false);


--
-- Name: worker_incentives_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.worker_incentives_id_seq', 1, false);


--
-- Name: worker_locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.worker_locations_id_seq', 1, false);


--
-- Name: worker_performance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.worker_performance_id_seq', 1, false);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: ai_models ai_models_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_models
    ADD CONSTRAINT ai_models_pkey PRIMARY KEY (id);


--
-- Name: ai_predictions ai_predictions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_predictions
    ADD CONSTRAINT ai_predictions_pkey PRIMARY KEY (id);


--
-- Name: alerts alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_pkey PRIMARY KEY (id);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: api_logs api_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_logs
    ADD CONSTRAINT api_logs_pkey PRIMARY KEY (id);


--
-- Name: areas areas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_pkey PRIMARY KEY (id);


--
-- Name: asset_categories asset_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_categories
    ADD CONSTRAINT asset_categories_pkey PRIMARY KEY (id);


--
-- Name: asset_movements asset_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movements
    ADD CONSTRAINT asset_movements_pkey PRIMARY KEY (id);


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: billing_periods billing_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_periods
    ADD CONSTRAINT billing_periods_pkey PRIMARY KEY (id);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: businesses businesses_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_code_unique UNIQUE (code);


--
-- Name: businesses businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_pkey PRIMARY KEY (id);


--
-- Name: cabinets cabinets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cabinets
    ADD CONSTRAINT cabinets_pkey PRIMARY KEY (id);


--
-- Name: cashboxes cashboxes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cashboxes
    ADD CONSTRAINT cashboxes_pkey PRIMARY KEY (id);


--
-- Name: cost_centers cost_centers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT cost_centers_pkey PRIMARY KEY (id);


--
-- Name: custom_accounts custom_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_accounts
    ADD CONSTRAINT custom_accounts_pkey PRIMARY KEY (id);


--
-- Name: custom_categories custom_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_categories
    ADD CONSTRAINT custom_categories_pkey PRIMARY KEY (id);


--
-- Name: custom_intermediary_accounts custom_intermediary_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_intermediary_accounts
    ADD CONSTRAINT custom_intermediary_accounts_pkey PRIMARY KEY (id);


--
-- Name: custom_memos custom_memos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_memos
    ADD CONSTRAINT custom_memos_pkey PRIMARY KEY (id);


--
-- Name: custom_notes custom_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_notes
    ADD CONSTRAINT custom_notes_pkey PRIMARY KEY (id);


--
-- Name: custom_parties custom_parties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_parties
    ADD CONSTRAINT custom_parties_pkey PRIMARY KEY (id);


--
-- Name: custom_party_transactions custom_party_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_party_transactions
    ADD CONSTRAINT custom_party_transactions_pkey PRIMARY KEY (id);


--
-- Name: custom_payment_voucher_lines custom_payment_voucher_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_payment_voucher_lines
    ADD CONSTRAINT custom_payment_voucher_lines_pkey PRIMARY KEY (id);


--
-- Name: custom_payment_vouchers custom_payment_vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_payment_vouchers
    ADD CONSTRAINT custom_payment_vouchers_pkey PRIMARY KEY (id);


--
-- Name: custom_receipt_vouchers custom_receipt_vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_receipt_vouchers
    ADD CONSTRAINT custom_receipt_vouchers_pkey PRIMARY KEY (id);


--
-- Name: custom_reconciliations custom_reconciliations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_reconciliations
    ADD CONSTRAINT custom_reconciliations_pkey PRIMARY KEY (id);


--
-- Name: custom_settings custom_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_settings
    ADD CONSTRAINT custom_settings_pkey PRIMARY KEY (id);


--
-- Name: custom_sub_systems custom_sub_systems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_sub_systems
    ADD CONSTRAINT custom_sub_systems_pkey PRIMARY KEY (id);


--
-- Name: custom_transactions custom_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_transactions
    ADD CONSTRAINT custom_transactions_pkey PRIMARY KEY (id);


--
-- Name: custom_treasuries custom_treasuries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_treasuries
    ADD CONSTRAINT custom_treasuries_pkey PRIMARY KEY (id);


--
-- Name: custom_treasury_currencies custom_treasury_currencies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_treasury_currencies
    ADD CONSTRAINT custom_treasury_currencies_pkey PRIMARY KEY (id);


--
-- Name: custom_treasury_movements custom_treasury_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_treasury_movements
    ADD CONSTRAINT custom_treasury_movements_pkey PRIMARY KEY (id);


--
-- Name: custom_treasury_transfers custom_treasury_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_treasury_transfers
    ADD CONSTRAINT custom_treasury_transfers_pkey PRIMARY KEY (id);


--
-- Name: customer_quotas customer_quotas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_quotas
    ADD CONSTRAINT customer_quotas_pkey PRIMARY KEY (id);


--
-- Name: customer_transactions_new customer_transactions_new_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_transactions_new
    ADD CONSTRAINT customer_transactions_new_pkey PRIMARY KEY (id);


--
-- Name: customer_wallets customer_wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_wallets
    ADD CONSTRAINT customer_wallets_pkey PRIMARY KEY (id);


--
-- Name: customers_enhanced customers_enhanced_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers_enhanced
    ADD CONSTRAINT customers_enhanced_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: diesel_pipes diesel_pipes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diesel_pipes
    ADD CONSTRAINT diesel_pipes_pkey PRIMARY KEY (id);


--
-- Name: diesel_pump_meters diesel_pump_meters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diesel_pump_meters
    ADD CONSTRAINT diesel_pump_meters_pkey PRIMARY KEY (id);


--
-- Name: diesel_pump_readings diesel_pump_readings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diesel_pump_readings
    ADD CONSTRAINT diesel_pump_readings_pkey PRIMARY KEY (id);


--
-- Name: diesel_receiving_tasks diesel_receiving_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diesel_receiving_tasks
    ADD CONSTRAINT diesel_receiving_tasks_pkey PRIMARY KEY (id);


--
-- Name: diesel_suppliers diesel_suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diesel_suppliers
    ADD CONSTRAINT diesel_suppliers_pkey PRIMARY KEY (id);


--
-- Name: diesel_tank_movements diesel_tank_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diesel_tank_movements
    ADD CONSTRAINT diesel_tank_movements_pkey PRIMARY KEY (id);


--
-- Name: diesel_tank_openings diesel_tank_openings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diesel_tank_openings
    ADD CONSTRAINT diesel_tank_openings_pkey PRIMARY KEY (id);


--
-- Name: diesel_tankers diesel_tankers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diesel_tankers
    ADD CONSTRAINT diesel_tankers_pkey PRIMARY KEY (id);


--
-- Name: diesel_tanks diesel_tanks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diesel_tanks
    ADD CONSTRAINT diesel_tanks_pkey PRIMARY KEY (id);


--
-- Name: employee_contracts employee_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_contracts
    ADD CONSTRAINT employee_contracts_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: equipment_movements equipment_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_movements
    ADD CONSTRAINT equipment_movements_pkey PRIMARY KEY (id);


--
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (id);


--
-- Name: event_subscriptions event_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_subscriptions
    ADD CONSTRAINT event_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: fee_types fee_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_types
    ADD CONSTRAINT fee_types_pkey PRIMARY KEY (id);


--
-- Name: field_equipment field_equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_equipment
    ADD CONSTRAINT field_equipment_pkey PRIMARY KEY (id);


--
-- Name: field_operations field_operations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_operations
    ADD CONSTRAINT field_operations_pkey PRIMARY KEY (id);


--
-- Name: field_teams field_teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_teams
    ADD CONSTRAINT field_teams_pkey PRIMARY KEY (id);


--
-- Name: field_workers field_workers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_workers
    ADD CONSTRAINT field_workers_pkey PRIMARY KEY (id);


--
-- Name: fiscal_periods fiscal_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fiscal_periods
    ADD CONSTRAINT fiscal_periods_pkey PRIMARY KEY (id);


--
-- Name: generator_diesel_consumption generator_diesel_consumption_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.generator_diesel_consumption
    ADD CONSTRAINT generator_diesel_consumption_pkey PRIMARY KEY (id);


--
-- Name: government_customers government_customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.government_customers
    ADD CONSTRAINT government_customers_pkey PRIMARY KEY (id);


--
-- Name: incoming_webhooks incoming_webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incoming_webhooks
    ADD CONSTRAINT incoming_webhooks_pkey PRIMARY KEY (id);


--
-- Name: inspection_checklists inspection_checklists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection_checklists
    ADD CONSTRAINT inspection_checklists_pkey PRIMARY KEY (id);


--
-- Name: inspection_items inspection_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection_items
    ADD CONSTRAINT inspection_items_pkey PRIMARY KEY (id);


--
-- Name: inspections inspections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_pkey PRIMARY KEY (id);


--
-- Name: installation_details installation_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installation_details
    ADD CONSTRAINT installation_details_pkey PRIMARY KEY (id);


--
-- Name: installation_photos installation_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installation_photos
    ADD CONSTRAINT installation_photos_pkey PRIMARY KEY (id);


--
-- Name: integration_configs integration_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_configs
    ADD CONSTRAINT integration_configs_pkey PRIMARY KEY (id);


--
-- Name: integration_logs integration_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_logs
    ADD CONSTRAINT integration_logs_pkey PRIMARY KEY (id);


--
-- Name: integrations integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integrations
    ADD CONSTRAINT integrations_pkey PRIMARY KEY (id);


--
-- Name: invoice_fees invoice_fees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_fees
    ADD CONSTRAINT invoice_fees_pkey PRIMARY KEY (id);


--
-- Name: invoices_enhanced invoices_enhanced_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices_enhanced
    ADD CONSTRAINT invoices_enhanced_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: item_categories item_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_categories
    ADD CONSTRAINT item_categories_pkey PRIMARY KEY (id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: job_titles job_titles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_titles
    ADD CONSTRAINT job_titles_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: journal_entry_lines journal_entry_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entry_lines
    ADD CONSTRAINT journal_entry_lines_pkey PRIMARY KEY (id);


--
-- Name: leave_balances leave_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: leave_types leave_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_pkey PRIMARY KEY (id);


--
-- Name: maintenance_plans maintenance_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_plans
    ADD CONSTRAINT maintenance_plans_pkey PRIMARY KEY (id);


--
-- Name: material_request_items material_request_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_request_items
    ADD CONSTRAINT material_request_items_pkey PRIMARY KEY (id);


--
-- Name: material_requests material_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_requests
    ADD CONSTRAINT material_requests_pkey PRIMARY KEY (id);


--
-- Name: meter_readings_enhanced meter_readings_enhanced_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meter_readings_enhanced
    ADD CONSTRAINT meter_readings_enhanced_pkey PRIMARY KEY (id);


--
-- Name: meter_readings meter_readings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meter_readings
    ADD CONSTRAINT meter_readings_pkey PRIMARY KEY (id);


--
-- Name: meters_enhanced meters_enhanced_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meters_enhanced
    ADD CONSTRAINT meters_enhanced_pkey PRIMARY KEY (id);


--
-- Name: meters meters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meters
    ADD CONSTRAINT meters_pkey PRIMARY KEY (id);


--
-- Name: note_categories note_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.note_categories
    ADD CONSTRAINT note_categories_pkey PRIMARY KEY (id);


--
-- Name: operation_approvals operation_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operation_approvals
    ADD CONSTRAINT operation_approvals_pkey PRIMARY KEY (id);


--
-- Name: operation_payments operation_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operation_payments
    ADD CONSTRAINT operation_payments_pkey PRIMARY KEY (id);


--
-- Name: operation_status_log operation_status_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operation_status_log
    ADD CONSTRAINT operation_status_log_pkey PRIMARY KEY (id);


--
-- Name: payment_gateway_config payment_gateway_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_gateway_config
    ADD CONSTRAINT payment_gateway_config_pkey PRIMARY KEY (id);


--
-- Name: payment_gateways payment_gateways_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_gateways
    ADD CONSTRAINT payment_gateways_pkey PRIMARY KEY (id);


--
-- Name: payment_methods_new payment_methods_new_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods_new
    ADD CONSTRAINT payment_methods_new_pkey PRIMARY KEY (id);


--
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);


--
-- Name: payment_transactions payment_transactions_transaction_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_transaction_number_key UNIQUE (transaction_number);


--
-- Name: payment_webhooks payment_webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_webhooks
    ADD CONSTRAINT payment_webhooks_pkey PRIMARY KEY (id);


--
-- Name: payments_enhanced payments_enhanced_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments_enhanced
    ADD CONSTRAINT payments_enhanced_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payroll_items payroll_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_items
    ADD CONSTRAINT payroll_items_pkey PRIMARY KEY (id);


--
-- Name: payroll_runs payroll_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT payroll_runs_pkey PRIMARY KEY (id);


--
-- Name: performance_evaluations performance_evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.performance_evaluations
    ADD CONSTRAINT performance_evaluations_pkey PRIMARY KEY (id);


--
-- Name: performance_metrics performance_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.performance_metrics
    ADD CONSTRAINT performance_metrics_pkey PRIMARY KEY (id);


--
-- Name: period_settlements period_settlements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.period_settlements
    ADD CONSTRAINT period_settlements_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_code_unique UNIQUE (code);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: prepaid_codes prepaid_codes_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prepaid_codes
    ADD CONSTRAINT prepaid_codes_code_unique UNIQUE (code);


--
-- Name: prepaid_codes prepaid_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prepaid_codes
    ADD CONSTRAINT prepaid_codes_pkey PRIMARY KEY (id);


--
-- Name: pricing_rules pricing_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pricing_rules
    ADD CONSTRAINT pricing_rules_pkey PRIMARY KEY (id);


--
-- Name: project_phases project_phases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_phases
    ADD CONSTRAINT project_phases_pkey PRIMARY KEY (id);


--
-- Name: project_tasks project_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT project_tasks_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: purchase_requests purchase_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_requests
    ADD CONSTRAINT purchase_requests_pkey PRIMARY KEY (id);


--
-- Name: quota_consumption quota_consumption_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quota_consumption
    ADD CONSTRAINT quota_consumption_pkey PRIMARY KEY (id);


--
-- Name: receipts receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: salary_details salary_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_details
    ADD CONSTRAINT salary_details_pkey PRIMARY KEY (id);


--
-- Name: salary_grades salary_grades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_grades
    ADD CONSTRAINT salary_grades_pkey PRIMARY KEY (id);


--
-- Name: sensors sensors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensors
    ADD CONSTRAINT sensors_pkey PRIMARY KEY (id);


--
-- Name: sequences sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sequences
    ADD CONSTRAINT sequences_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: settlement_items settlement_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settlement_items
    ADD CONSTRAINT settlement_items_pkey PRIMARY KEY (id);


--
-- Name: sms_delivery_log sms_delivery_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sms_delivery_log
    ADD CONSTRAINT sms_delivery_log_pkey PRIMARY KEY (id);


--
-- Name: sms_messages sms_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sms_messages
    ADD CONSTRAINT sms_messages_pkey PRIMARY KEY (id);


--
-- Name: sms_providers sms_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sms_providers
    ADD CONSTRAINT sms_providers_pkey PRIMARY KEY (id);


--
-- Name: sms_templates sms_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sms_templates
    ADD CONSTRAINT sms_templates_pkey PRIMARY KEY (id);


--
-- Name: squares squares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.squares
    ADD CONSTRAINT squares_pkey PRIMARY KEY (id);


--
-- Name: station_diesel_config station_diesel_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.station_diesel_config
    ADD CONSTRAINT station_diesel_config_pkey PRIMARY KEY (id);


--
-- Name: station_diesel_config station_diesel_config_station_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.station_diesel_config
    ADD CONSTRAINT station_diesel_config_station_id_unique UNIQUE (station_id);


--
-- Name: station_diesel_path station_diesel_path_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.station_diesel_path
    ADD CONSTRAINT station_diesel_path_pkey PRIMARY KEY (id);


--
-- Name: stations stations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stations
    ADD CONSTRAINT stations_pkey PRIMARY KEY (id);


--
-- Name: stock_balances stock_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_balances
    ADD CONSTRAINT stock_balances_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: sts_api_config sts_api_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sts_api_config
    ADD CONSTRAINT sts_api_config_pkey PRIMARY KEY (id);


--
-- Name: sts_charge_requests sts_charge_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sts_charge_requests
    ADD CONSTRAINT sts_charge_requests_pkey PRIMARY KEY (id);


--
-- Name: sts_meters sts_meters_meter_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sts_meters
    ADD CONSTRAINT sts_meters_meter_number_key UNIQUE (meter_number);


--
-- Name: sts_meters sts_meters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sts_meters
    ADD CONSTRAINT sts_meters_pkey PRIMARY KEY (id);


--
-- Name: sts_tokens sts_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sts_tokens
    ADD CONSTRAINT sts_tokens_pkey PRIMARY KEY (id);


--
-- Name: sts_tokens sts_tokens_token_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sts_tokens
    ADD CONSTRAINT sts_tokens_token_number_key UNIQUE (token_number);


--
-- Name: sts_transactions sts_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sts_transactions
    ADD CONSTRAINT sts_transactions_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: support_programs support_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_programs
    ADD CONSTRAINT support_programs_pkey PRIMARY KEY (id);


--
-- Name: support_reports support_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_reports
    ADD CONSTRAINT support_reports_pkey PRIMARY KEY (id);


--
-- Name: system_events system_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_events
    ADD CONSTRAINT system_events_pkey PRIMARY KEY (id);


--
-- Name: tariffs tariffs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tariffs
    ADD CONSTRAINT tariffs_pkey PRIMARY KEY (id);


--
-- Name: technical_alert_rules technical_alert_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.technical_alert_rules
    ADD CONSTRAINT technical_alert_rules_pkey PRIMARY KEY (id);


--
-- Name: technical_alerts technical_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.technical_alerts
    ADD CONSTRAINT technical_alerts_pkey PRIMARY KEY (id);


--
-- Name: transition_support_alerts transition_support_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transition_support_alerts
    ADD CONSTRAINT transition_support_alerts_pkey PRIMARY KEY (id);


--
-- Name: transition_support_billing_adjustments transition_support_billing_adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transition_support_billing_adjustments
    ADD CONSTRAINT transition_support_billing_adjustments_pkey PRIMARY KEY (id);


--
-- Name: transition_support_monitoring transition_support_monitoring_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transition_support_monitoring
    ADD CONSTRAINT transition_support_monitoring_pkey PRIMARY KEY (id);


--
-- Name: transition_support_notifications transition_support_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transition_support_notifications
    ADD CONSTRAINT transition_support_notifications_pkey PRIMARY KEY (id);


--
-- Name: transition_support_rules transition_support_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transition_support_rules
    ADD CONSTRAINT transition_support_rules_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: users users_openId_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_openId_unique" UNIQUE ("openId");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: work_order_tasks work_order_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_tasks
    ADD CONSTRAINT work_order_tasks_pkey PRIMARY KEY (id);


--
-- Name: work_orders work_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_pkey PRIMARY KEY (id);


--
-- Name: worker_incentives worker_incentives_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_incentives
    ADD CONSTRAINT worker_incentives_pkey PRIMARY KEY (id);


--
-- Name: worker_locations worker_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_locations
    ADD CONSTRAINT worker_locations_pkey PRIMARY KEY (id);


--
-- Name: worker_performance worker_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_performance
    ADD CONSTRAINT worker_performance_pkey PRIMARY KEY (id);


--
-- Name: cc_business_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cc_business_idx ON public.custom_categories USING btree (business_id);


--
-- Name: cc_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cc_code_idx ON public.custom_categories USING btree (business_id, code);


--
-- Name: cc_parent_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cc_parent_idx ON public.custom_categories USING btree (parent_id);


--
-- Name: cc_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cc_type_idx ON public.custom_categories USING btree (business_id, "categoryType");


--
-- Name: cp_business_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cp_business_idx ON public.custom_parties USING btree (business_id);


--
-- Name: cp_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cp_code_idx ON public.custom_parties USING btree (business_id, code);


--
-- Name: cp_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cp_name_idx ON public.custom_parties USING btree (name_ar);


--
-- Name: cp_party_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cp_party_type_idx ON public.custom_parties USING btree (business_id, "partyType");


--
-- Name: cp_subsystem_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cp_subsystem_idx ON public.custom_parties USING btree (sub_system_id);


--
-- Name: cpt_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cpt_date_idx ON public.custom_party_transactions USING btree (transaction_date);


--
-- Name: cpt_party_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cpt_party_date_idx ON public.custom_party_transactions USING btree (party_id, transaction_date);


--
-- Name: cpt_party_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cpt_party_idx ON public.custom_party_transactions USING btree (party_id);


--
-- Name: cpt_ref_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cpt_ref_idx ON public.custom_party_transactions USING btree (reference_type, reference_id);


--
-- Name: cpt_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cpt_type_idx ON public.custom_party_transactions USING btree (transaction_type);


--
-- Name: cpv_business_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cpv_business_idx ON public.custom_payment_vouchers USING btree (business_id);


--
-- Name: cpv_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cpv_category_idx ON public.custom_payment_vouchers USING btree (category_id);


--
-- Name: cpv_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cpv_date_idx ON public.custom_payment_vouchers USING btree (voucher_date);


--
-- Name: cpv_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cpv_number_idx ON public.custom_payment_vouchers USING btree (business_id, sub_system_id, voucher_number);


--
-- Name: cpv_party_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cpv_party_idx ON public.custom_payment_vouchers USING btree (party_id);


--
-- Name: cpv_subsystem_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cpv_subsystem_idx ON public.custom_payment_vouchers USING btree (sub_system_id);


--
-- Name: cpv_treasury_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cpv_treasury_idx ON public.custom_payment_vouchers USING btree (treasury_id);


--
-- Name: cpvl_account_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cpvl_account_idx ON public.custom_payment_voucher_lines USING btree (account_id);


--
-- Name: cpvl_analytic_account_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cpvl_analytic_account_idx ON public.custom_payment_voucher_lines USING btree (analytic_account_id);


--
-- Name: cpvl_analytic_treasury_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cpvl_analytic_treasury_idx ON public.custom_payment_voucher_lines USING btree (analytic_treasury_id);


--
-- Name: cpvl_business_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cpvl_business_idx ON public.custom_payment_voucher_lines USING btree (business_id);


--
-- Name: cpvl_cost_center_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cpvl_cost_center_idx ON public.custom_payment_voucher_lines USING btree (cost_center_id);


--
-- Name: cpvl_voucher_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cpvl_voucher_idx ON public.custom_payment_voucher_lines USING btree (payment_voucher_id);


--
-- Name: crv_business_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX crv_business_idx ON public.custom_receipt_vouchers USING btree (business_id);


--
-- Name: crv_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX crv_category_idx ON public.custom_receipt_vouchers USING btree (category_id);


--
-- Name: crv_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX crv_date_idx ON public.custom_receipt_vouchers USING btree (voucher_date);


--
-- Name: crv_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX crv_number_idx ON public.custom_receipt_vouchers USING btree (business_id, sub_system_id, voucher_number);


--
-- Name: crv_party_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX crv_party_idx ON public.custom_receipt_vouchers USING btree (party_id);


--
-- Name: crv_subsystem_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX crv_subsystem_idx ON public.custom_receipt_vouchers USING btree (sub_system_id);


--
-- Name: crv_treasury_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX crv_treasury_idx ON public.custom_receipt_vouchers USING btree (treasury_id);


--
-- Name: css_business_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX css_business_idx ON public.custom_sub_systems USING btree (business_id);


--
-- Name: css_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX css_code_idx ON public.custom_sub_systems USING btree (business_id, code);


--
-- Name: ct_business_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ct_business_idx ON public.custom_treasuries USING btree (business_id);


--
-- Name: ct_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ct_code_idx ON public.custom_treasuries USING btree (business_id, code);


--
-- Name: ct_subsystem_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ct_subsystem_idx ON public.custom_treasuries USING btree (sub_system_id);


--
-- Name: ct_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ct_type_idx ON public.custom_treasuries USING btree (treasury_type);


--
-- Name: ctm_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ctm_date_idx ON public.custom_treasury_movements USING btree (movement_date);


--
-- Name: ctm_ref_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ctm_ref_idx ON public.custom_treasury_movements USING btree (reference_type, reference_id);


--
-- Name: ctm_treasury_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ctm_treasury_date_idx ON public.custom_treasury_movements USING btree (treasury_id, movement_date);


--
-- Name: ctm_treasury_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ctm_treasury_idx ON public.custom_treasury_movements USING btree (treasury_id);


--
-- Name: ctm_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ctm_type_idx ON public.custom_treasury_movements USING btree (movement_type);


--
-- Name: idx_business_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_business_id ON public.custom_treasury_currencies USING btree (business_id);


--
-- Name: idx_currency_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_currency_id ON public.custom_treasury_currencies USING btree (currency_id);


--
-- Name: idx_customer_quotas_business; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_quotas_business ON public.customer_quotas USING btree (business_id);


--
-- Name: idx_customer_quotas_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_quotas_customer ON public.customer_quotas USING btree (customer_id);


--
-- Name: idx_customer_quotas_program; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_quotas_program ON public.customer_quotas USING btree (program_id);


--
-- Name: idx_customer_quotas_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_quotas_status ON public.customer_quotas USING btree (status);


--
-- Name: idx_gov_customers_business; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gov_customers_business ON public.government_customers USING btree (business_id);


--
-- Name: idx_gov_customers_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gov_customers_customer ON public.government_customers USING btree (customer_id);


--
-- Name: idx_gov_customers_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gov_customers_status ON public.government_customers USING btree (eligibility_status);


--
-- Name: idx_payment_gateway_config_gateway; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_gateway_config_gateway ON public.payment_gateway_config USING btree (gateway_id);


--
-- Name: idx_payment_gateways_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_gateways_active ON public.payment_gateways USING btree (is_active);


--
-- Name: idx_payment_gateways_business; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_gateways_business ON public.payment_gateways USING btree (business_id);


--
-- Name: idx_payment_transactions_business; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_transactions_business ON public.payment_transactions USING btree (business_id);


--
-- Name: idx_payment_transactions_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_transactions_customer ON public.payment_transactions USING btree (customer_id);


--
-- Name: idx_payment_transactions_gateway; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_transactions_gateway ON public.payment_transactions USING btree (gateway_id);


--
-- Name: idx_payment_transactions_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_transactions_number ON public.payment_transactions USING btree (transaction_number);


--
-- Name: idx_payment_transactions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_transactions_status ON public.payment_transactions USING btree (status);


--
-- Name: idx_payment_webhooks_gateway; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_webhooks_gateway ON public.payment_webhooks USING btree (gateway_id);


--
-- Name: idx_payment_webhooks_transaction; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_webhooks_transaction ON public.payment_webhooks USING btree (transaction_id);


--
-- Name: idx_pricing_rules_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pricing_rules_active ON public.pricing_rules USING btree (active);


--
-- Name: idx_pricing_rules_business_meter_usage; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pricing_rules_business_meter_usage ON public.pricing_rules USING btree (business_id, meter_type, usage_type);


--
-- Name: idx_quota_consumption_business; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quota_consumption_business ON public.quota_consumption USING btree (business_id);


--
-- Name: idx_quota_consumption_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quota_consumption_customer ON public.quota_consumption USING btree (customer_id);


--
-- Name: idx_quota_consumption_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quota_consumption_date ON public.quota_consumption USING btree (consumption_date);


--
-- Name: idx_quota_consumption_quota; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quota_consumption_quota ON public.quota_consumption USING btree (quota_id);


--
-- Name: idx_sms_delivery_log_message; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sms_delivery_log_message ON public.sms_delivery_log USING btree (message_id);


--
-- Name: idx_sms_messages_business; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sms_messages_business ON public.sms_messages USING btree (business_id);


--
-- Name: idx_sms_messages_channel; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sms_messages_channel ON public.sms_messages USING btree (channel);


--
-- Name: idx_sms_messages_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sms_messages_customer ON public.sms_messages USING btree (customer_id);


--
-- Name: idx_sms_messages_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sms_messages_status ON public.sms_messages USING btree (status);


--
-- Name: idx_sms_messages_template; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sms_messages_template ON public.sms_messages USING btree (template_id);


--
-- Name: idx_sms_providers_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sms_providers_active ON public.sms_providers USING btree (is_active);


--
-- Name: idx_sms_providers_business; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sms_providers_business ON public.sms_providers USING btree (business_id);


--
-- Name: idx_sms_templates_business; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sms_templates_business ON public.sms_templates USING btree (business_id);


--
-- Name: idx_sms_templates_channel; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sms_templates_channel ON public.sms_templates USING btree (channel);


--
-- Name: idx_sms_templates_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sms_templates_type ON public.sms_templates USING btree (template_type);


--
-- Name: idx_sts_api_config_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sts_api_config_active ON public.sts_api_config USING btree (is_active);


--
-- Name: idx_sts_api_config_business; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sts_api_config_business ON public.sts_api_config USING btree (business_id);


--
-- Name: idx_sts_charge_requests_business; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sts_charge_requests_business ON public.sts_charge_requests USING btree (business_id);


--
-- Name: idx_sts_charge_requests_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sts_charge_requests_customer ON public.sts_charge_requests USING btree (customer_id);


--
-- Name: idx_sts_charge_requests_meter; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sts_charge_requests_meter ON public.sts_charge_requests USING btree (meter_id);


--
-- Name: idx_sts_charge_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sts_charge_requests_status ON public.sts_charge_requests USING btree (request_status);


--
-- Name: idx_sts_meters_business; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sts_meters_business ON public.sts_meters USING btree (business_id);


--
-- Name: idx_sts_meters_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sts_meters_customer ON public.sts_meters USING btree (customer_id);


--
-- Name: idx_sts_meters_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sts_meters_number ON public.sts_meters USING btree (meter_number);


--
-- Name: idx_sts_meters_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sts_meters_status ON public.sts_meters USING btree (status);


--
-- Name: idx_sts_tokens_charge_request; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sts_tokens_charge_request ON public.sts_tokens USING btree (charge_request_id);


--
-- Name: idx_sts_tokens_meter; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sts_tokens_meter ON public.sts_tokens USING btree (meter_id);


--
-- Name: idx_sts_tokens_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sts_tokens_number ON public.sts_tokens USING btree (token_number);


--
-- Name: idx_sts_tokens_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sts_tokens_status ON public.sts_tokens USING btree (token_status);


--
-- Name: idx_sts_transactions_business; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sts_transactions_business ON public.sts_transactions USING btree (business_id);


--
-- Name: idx_sts_transactions_meter; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sts_transactions_meter ON public.sts_transactions USING btree (meter_id);


--
-- Name: idx_sts_transactions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sts_transactions_status ON public.sts_transactions USING btree (transaction_status);


--
-- Name: idx_sts_transactions_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sts_transactions_token ON public.sts_transactions USING btree (token_id);


--
-- Name: idx_support_programs_business; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_support_programs_business ON public.support_programs USING btree (business_id);


--
-- Name: idx_support_programs_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_support_programs_status ON public.support_programs USING btree (status);


--
-- Name: idx_support_reports_business; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_support_reports_business ON public.support_reports USING btree (business_id);


--
-- Name: idx_support_reports_period; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_support_reports_period ON public.support_reports USING btree (report_period);


--
-- Name: idx_support_reports_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_support_reports_type ON public.support_reports USING btree (report_type);


--
-- Name: idx_transition_adjustments_business; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transition_adjustments_business ON public.transition_support_billing_adjustments USING btree (business_id);


--
-- Name: idx_transition_adjustments_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transition_adjustments_customer ON public.transition_support_billing_adjustments USING btree (customer_id);


--
-- Name: idx_transition_adjustments_invoice; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transition_adjustments_invoice ON public.transition_support_billing_adjustments USING btree (invoice_id);


--
-- Name: idx_transition_adjustments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transition_adjustments_status ON public.transition_support_billing_adjustments USING btree (status);


--
-- Name: idx_transition_alerts_business; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transition_alerts_business ON public.transition_support_alerts USING btree (business_id);


--
-- Name: idx_transition_alerts_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transition_alerts_customer ON public.transition_support_alerts USING btree (customer_id);


--
-- Name: idx_transition_alerts_severity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transition_alerts_severity ON public.transition_support_alerts USING btree (severity);


--
-- Name: idx_transition_alerts_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transition_alerts_status ON public.transition_support_alerts USING btree (status);


--
-- Name: idx_transition_alerts_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transition_alerts_type ON public.transition_support_alerts USING btree (alert_type);


--
-- Name: idx_transition_monitoring_business; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transition_monitoring_business ON public.transition_support_monitoring USING btree (business_id);


--
-- Name: idx_transition_monitoring_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transition_monitoring_customer ON public.transition_support_monitoring USING btree (customer_id);


--
-- Name: idx_transition_monitoring_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transition_monitoring_status ON public.transition_support_monitoring USING btree (status);


--
-- Name: idx_transition_monitoring_year_month; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transition_monitoring_year_month ON public.transition_support_monitoring USING btree (year, month);


--
-- Name: idx_transition_notifications_business; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transition_notifications_business ON public.transition_support_notifications USING btree (business_id);


--
-- Name: idx_transition_notifications_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transition_notifications_customer ON public.transition_support_notifications USING btree (customer_id);


--
-- Name: idx_transition_notifications_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transition_notifications_status ON public.transition_support_notifications USING btree (status);


--
-- Name: idx_transition_notifications_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transition_notifications_type ON public.transition_support_notifications USING btree (notification_type);


--
-- Name: idx_transition_rules_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transition_rules_active ON public.transition_support_rules USING btree (is_active);


--
-- Name: idx_transition_rules_business; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transition_rules_business ON public.transition_support_rules USING btree (business_id);


--
-- Name: idx_transition_rules_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transition_rules_type ON public.transition_support_rules USING btree (rule_type);


--
-- Name: idx_treasury_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_treasury_id ON public.custom_treasury_currencies USING btree (treasury_id);


--
-- Name: unique_treasury_currency; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_treasury_currency ON public.custom_treasury_currencies USING btree (treasury_id, currency_id);


--
-- Name: pricing_rules fk_pricing_rules_business; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pricing_rules
    ADD CONSTRAINT fk_pricing_rules_business FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict s9fQ61lgeTRt1hWq00FoKsjKNwkKEvdheuVMToYxuFBdwGyVerMddOKJEPc03T8

