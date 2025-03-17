--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8 (Ubuntu 16.8-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.8 (Ubuntu 16.8-0ubuntu0.24.04.1)

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
-- Name: service_type_enum; Type: TYPE; Schema: public; Owner: ametist
--

CREATE TYPE public.service_type_enum AS ENUM (
    'Basic',
    'On-demand'
);


ALTER TYPE public.service_type_enum OWNER TO ametist;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: administrators; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.administrators (
    id bigint NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255),
    fullname character varying(255) NOT NULL,
    role_id bigint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    full_name character varying(255)
);


ALTER TABLE public.administrators OWNER TO ametist;

--
-- Name: administrators_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.administrators_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.administrators_id_seq OWNER TO ametist;

--
-- Name: administrators_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.administrators_id_seq OWNED BY public.administrators.id;


--
-- Name: cleaner_addresses; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.cleaner_addresses (
    id integer NOT NULL,
    cleaner_id integer,
    address character varying(255),
    latitude double precision,
    longitude double precision,
    is_current boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cleaner_addresses OWNER TO ametist;

--
-- Name: cleaner_addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.cleaner_addresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cleaner_addresses_id_seq OWNER TO ametist;

--
-- Name: cleaner_addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.cleaner_addresses_id_seq OWNED BY public.cleaner_addresses.id;


--
-- Name: cleaner_rewards; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.cleaner_rewards (
    id bigint NOT NULL,
    cleaner_id bigint,
    jobs_completed integer,
    reward_amount double precision,
    reward_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cleaner_rewards OWNER TO ametist;

--
-- Name: cleaner_rewards_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.cleaner_rewards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cleaner_rewards_id_seq OWNER TO ametist;

--
-- Name: cleaner_rewards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.cleaner_rewards_id_seq OWNED BY public.cleaner_rewards.id;


--
-- Name: cleaners; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.cleaners (
    id bigint NOT NULL,
    password_hash character varying(255),
    full_name character varying(255),
    phone_number character varying(255),
    email character varying(255) NOT NULL,
    age integer,
    address character varying(255),
    profile_image bytea,
    identity_number character varying(255),
    identity_verified boolean DEFAULT false,
    experience character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status boolean
);


ALTER TABLE public.cleaners OWNER TO ametist;

--
-- Name: cleaners_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.cleaners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cleaners_id_seq OWNER TO ametist;

--
-- Name: cleaners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.cleaners_id_seq OWNED BY public.cleaners.id;


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.conversations (
    id bigint NOT NULL,
    customer_id integer,
    cleaner_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.conversations OWNER TO ametist;

--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conversations_id_seq OWNER TO ametist;

--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- Name: customer_addresses; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.customer_addresses (
    id integer NOT NULL,
    customer_id integer,
    address character varying(255),
    latitude double precision,
    longitude double precision,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_current boolean NOT NULL,
    updated_at timestamp(6) without time zone
);


ALTER TABLE public.customer_addresses OWNER TO ametist;

--
-- Name: customer_addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.customer_addresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_addresses_id_seq OWNER TO ametist;

--
-- Name: customer_addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.customer_addresses_id_seq OWNED BY public.customer_addresses.id;


--
-- Name: customer_voucher_usage; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.customer_voucher_usage (
    id integer NOT NULL,
    customer_id integer,
    voucher_id integer,
    is_used boolean DEFAULT false,
    used_at timestamp without time zone
);


ALTER TABLE public.customer_voucher_usage OWNER TO ametist;

--
-- Name: customer_voucher_usage_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.customer_voucher_usage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_voucher_usage_id_seq OWNER TO ametist;

--
-- Name: customer_voucher_usage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.customer_voucher_usage_id_seq OWNED BY public.customer_voucher_usage.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    password_hash character varying(255),
    full_name character varying(255),
    phone_number character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.customers OWNER TO ametist;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO ametist;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: feedback; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.feedback (
    id bigint NOT NULL,
    job_id bigint,
    rating integer,
    comment character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.feedback OWNER TO ametist;

--
-- Name: feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.feedback_id_seq OWNER TO ametist;

--
-- Name: feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.feedback_id_seq OWNED BY public.feedback.id;


--
-- Name: job_application; Type: TABLE; Schema: public; Owner: sep490
--

CREATE TABLE public.job_application (
    id bigint NOT NULL,
    applied_at timestamp(6) without time zone NOT NULL,
    status character varying(255) NOT NULL,
    cleaner_id bigint NOT NULL,
    job_id bigint NOT NULL
);


ALTER TABLE public.job_application OWNER TO sep490;

--
-- Name: job_application_id_seq; Type: SEQUENCE; Schema: public; Owner: sep490
--

ALTER TABLE public.job_application ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.job_application_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: job_applications; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.job_applications (
    id integer NOT NULL,
    job_id integer,
    cleaner_id integer,
    status character varying(20) DEFAULT 'Pending'::character varying,
    applied_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT job_applications_status_check CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Accepted'::character varying, 'Rejected'::character varying])::text[])))
);


ALTER TABLE public.job_applications OWNER TO ametist;

--
-- Name: job_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.job_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_applications_id_seq OWNER TO ametist;

--
-- Name: job_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.job_applications_id_seq OWNED BY public.job_applications.id;


--
-- Name: job_confirmations; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.job_confirmations (
    id integer NOT NULL,
    job_id integer,
    cleaner_confirmed boolean DEFAULT false,
    customer_confirmed boolean DEFAULT false,
    confirmation_status character varying(20) DEFAULT 'Pending'::character varying,
    confirmation_time timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cancelled_at timestamp without time zone,
    reassigned_at timestamp without time zone,
    new_cleaner_id integer,
    CONSTRAINT job_confirmations_confirmation_status_check CHECK (((confirmation_status)::text = ANY ((ARRAY['Pending'::character varying, 'Completed'::character varying, 'Failed'::character varying, 'Cancelled'::character varying, 'Reassigned'::character varying])::text[])))
);


ALTER TABLE public.job_confirmations OWNER TO ametist;

--
-- Name: job_confirmations_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.job_confirmations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_confirmations_id_seq OWNER TO ametist;

--
-- Name: job_confirmations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.job_confirmations_id_seq OWNED BY public.job_confirmations.id;


--
-- Name: job_details; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.job_details (
    id bigint NOT NULL,
    job_id bigint,
    room_size integer,
    image_url character varying(255),
    scheduled_time timestamp without time zone
);


ALTER TABLE public.job_details OWNER TO ametist;

--
-- Name: job_details_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.job_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_details_id_seq OWNER TO ametist;

--
-- Name: job_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.job_details_id_seq OWNED BY public.job_details.id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    customer_id integer,
    cleaner_id bigint,
    service_id bigint,
    service_detail_id bigint,
    status character varying(255) DEFAULT 'Open'::character varying,
    address character varying(255),
    latitude double precision,
    longitude double precision,
    requested_address character varying(255),
    requested_latitude double precision,
    requested_longitude double precision,
    scheduled_time timestamp without time zone,
    total_price double precision,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    customer_address_id integer,
    CONSTRAINT jobs_status_check CHECK (((status)::text = ANY (ARRAY[('Open'::character varying)::text, ('Pending Approval'::character varying)::text, ('Process'::character varying)::text, ('In Progress'::character varying)::text, ('Completed'::character varying)::text, ('Cancelled'::character varying)::text])))
);


ALTER TABLE public.jobs OWNER TO ametist;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO ametist;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.messages (
    id bigint NOT NULL,
    conversation_id bigint,
    message_content character varying(255),
    sent_at timestamp(6) without time zone,
    sender_id integer NOT NULL
);


ALTER TABLE public.messages OWNER TO ametist;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO ametist;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id integer,
    cleaner_id bigint,
    content character varying(255),
    metadata character varying(255),
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO ametist;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO ametist;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    job_id integer,
    amount numeric(10,2),
    payment_status character varying(20) DEFAULT 'Pending'::character varying,
    payment_method character varying(20),
    payment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    payment_reference character varying(255),
    transaction_id character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payments_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['Credit Card'::character varying, 'Debit Card'::character varying, 'Bank Transfer'::character varying, 'Cash'::character varying, 'E-Wallet'::character varying])::text[]))),
    CONSTRAINT payments_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['Pending'::character varying, 'Completed'::character varying, 'Failed'::character varying, 'Refunded'::character varying])::text[])))
);


ALTER TABLE public.payments OWNER TO ametist;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO ametist;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.reports (
    id bigint NOT NULL,
    reporter_id integer,
    reported_user_id bigint,
    job_id bigint,
    report_type character varying(255),
    description character varying(255),
    status character varying(255) DEFAULT 'Pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    resolved_at timestamp without time zone,
    admin_response character varying(255),
    CONSTRAINT reports_report_type_check CHECK (((report_type)::text = ANY (ARRAY[('Fraud'::character varying)::text, ('Poor Service'::character varying)::text, ('Harassment'::character varying)::text, ('Other'::character varying)::text]))),
    CONSTRAINT reports_status_check CHECK (((status)::text = ANY (ARRAY[('Pending'::character varying)::text, ('Reviewed'::character varying)::text, ('Resolved'::character varying)::text, ('Dismissed'::character varying)::text])))
);


ALTER TABLE public.reports OWNER TO ametist;

--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reports_id_seq OWNER TO ametist;

--
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    role_name character varying(255),
    description character varying(255),
    CONSTRAINT roles_role_name_check CHECK (((role_name)::text = ANY (ARRAY[('Admin'::character varying)::text, ('Manager'::character varying)::text])))
);


ALTER TABLE public.roles OWNER TO ametist;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO ametist;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: service_details; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.service_details (
    id bigint NOT NULL,
    service_id bigint,
    name character varying(255),
    additional_price double precision DEFAULT 0,
    area_range character varying(255),
    description character varying(255),
    discounts character varying(255),
    max_room_size integer,
    min_room_size integer,
    peak_time_fee double precision,
    price double precision
);


ALTER TABLE public.service_details OWNER TO ametist;

--
-- Name: service_details_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.service_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_details_id_seq OWNER TO ametist;

--
-- Name: service_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.service_details_id_seq OWNED BY public.service_details.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.services (
    id bigint NOT NULL,
    name character varying(255),
    description character varying(255),
    service_type character varying(255) NOT NULL,
    base_price double precision,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_peak_time_fee boolean,
    max_area integer,
    min_area integer,
    special_discount character varying(255),
    unit character varying(255)
);


ALTER TABLE public.services OWNER TO ametist;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO ametist;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.transactions (
    id bigint NOT NULL,
    user_id integer,
    cleaner_id bigint,
    amount double precision,
    transaction_type character varying(255),
    payment_method character varying(255),
    transaction_status character varying(255),
    description text,
    transaction_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    payment_reference character varying(255),
    customer_id integer,
    CONSTRAINT transactions_payment_method_check CHECK (((payment_method)::text = ANY (ARRAY[('Credit Card'::character varying)::text, ('Debit Card'::character varying)::text, ('Bank Transfer'::character varying)::text, ('E-Wallet'::character varying)::text]))),
    CONSTRAINT transactions_transaction_status_check CHECK (((transaction_status)::text = ANY (ARRAY[('Pending'::character varying)::text, ('Completed'::character varying)::text, ('Failed'::character varying)::text, ('Refunded'::character varying)::text]))),
    CONSTRAINT transactions_transaction_type_check CHECK (((transaction_type)::text = ANY (ARRAY[('Credit'::character varying)::text, ('Debit'::character varying)::text])))
);


ALTER TABLE public.transactions OWNER TO ametist;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_id_seq OWNER TO ametist;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: vouchers; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.vouchers (
    id bigint NOT NULL,
    code character varying(255),
    discount_amount double precision,
    is_reusable boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.vouchers OWNER TO ametist;

--
-- Name: vouchers_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.vouchers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vouchers_id_seq OWNER TO ametist;

--
-- Name: vouchers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.vouchers_id_seq OWNED BY public.vouchers.id;


--
-- Name: wallets; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.wallets (
    id bigint NOT NULL,
    cleaner_id bigint,
    balance double precision DEFAULT 0,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.wallets OWNER TO ametist;

--
-- Name: wallets_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.wallets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wallets_id_seq OWNER TO ametist;

--
-- Name: wallets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.wallets_id_seq OWNED BY public.wallets.id;


--
-- Name: work_history; Type: TABLE; Schema: public; Owner: ametist
--

CREATE TABLE public.work_history (
    id bigint NOT NULL,
    cleaner_id bigint,
    job_id bigint,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    total_duration integer,
    earnings double precision,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.work_history OWNER TO ametist;

--
-- Name: work_history_id_seq; Type: SEQUENCE; Schema: public; Owner: ametist
--

CREATE SEQUENCE public.work_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_history_id_seq OWNER TO ametist;

--
-- Name: work_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ametist
--

ALTER SEQUENCE public.work_history_id_seq OWNED BY public.work_history.id;


--
-- Name: administrators id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.administrators ALTER COLUMN id SET DEFAULT nextval('public.administrators_id_seq'::regclass);


--
-- Name: cleaner_addresses id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.cleaner_addresses ALTER COLUMN id SET DEFAULT nextval('public.cleaner_addresses_id_seq'::regclass);


--
-- Name: cleaner_rewards id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.cleaner_rewards ALTER COLUMN id SET DEFAULT nextval('public.cleaner_rewards_id_seq'::regclass);


--
-- Name: cleaners id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.cleaners ALTER COLUMN id SET DEFAULT nextval('public.cleaners_id_seq'::regclass);


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: customer_addresses id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.customer_addresses ALTER COLUMN id SET DEFAULT nextval('public.customer_addresses_id_seq'::regclass);


--
-- Name: customer_voucher_usage id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.customer_voucher_usage ALTER COLUMN id SET DEFAULT nextval('public.customer_voucher_usage_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: feedback id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.feedback ALTER COLUMN id SET DEFAULT nextval('public.feedback_id_seq'::regclass);


--
-- Name: job_applications id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.job_applications ALTER COLUMN id SET DEFAULT nextval('public.job_applications_id_seq'::regclass);


--
-- Name: job_confirmations id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.job_confirmations ALTER COLUMN id SET DEFAULT nextval('public.job_confirmations_id_seq'::regclass);


--
-- Name: job_details id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.job_details ALTER COLUMN id SET DEFAULT nextval('public.job_details_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: service_details id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.service_details ALTER COLUMN id SET DEFAULT nextval('public.service_details_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: vouchers id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.vouchers ALTER COLUMN id SET DEFAULT nextval('public.vouchers_id_seq'::regclass);


--
-- Name: wallets id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.wallets ALTER COLUMN id SET DEFAULT nextval('public.wallets_id_seq'::regclass);


--
-- Name: work_history id; Type: DEFAULT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.work_history ALTER COLUMN id SET DEFAULT nextval('public.work_history_id_seq'::regclass);


--
-- Name: administrators administrators_email_key; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.administrators
    ADD CONSTRAINT administrators_email_key UNIQUE (email);


--
-- Name: administrators administrators_fullname_key; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.administrators
    ADD CONSTRAINT administrators_fullname_key UNIQUE (fullname);


--
-- Name: administrators administrators_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.administrators
    ADD CONSTRAINT administrators_pkey PRIMARY KEY (id);


--
-- Name: cleaner_addresses cleaner_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.cleaner_addresses
    ADD CONSTRAINT cleaner_addresses_pkey PRIMARY KEY (id);


--
-- Name: cleaner_rewards cleaner_rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.cleaner_rewards
    ADD CONSTRAINT cleaner_rewards_pkey PRIMARY KEY (id);


--
-- Name: cleaners cleaners_email_key; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.cleaners
    ADD CONSTRAINT cleaners_email_key UNIQUE (email);


--
-- Name: cleaners cleaners_identity_number_key; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.cleaners
    ADD CONSTRAINT cleaners_identity_number_key UNIQUE (identity_number);


--
-- Name: cleaners cleaners_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.cleaners
    ADD CONSTRAINT cleaners_phone_number_key UNIQUE (phone_number);


--
-- Name: cleaners cleaners_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.cleaners
    ADD CONSTRAINT cleaners_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: customer_addresses customer_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_pkey PRIMARY KEY (id);


--
-- Name: customer_voucher_usage customer_voucher_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.customer_voucher_usage
    ADD CONSTRAINT customer_voucher_usage_pkey PRIMARY KEY (id);


--
-- Name: customers customers_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_phone_number_key UNIQUE (phone_number);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);


--
-- Name: job_application job_application_pkey; Type: CONSTRAINT; Schema: public; Owner: sep490
--

ALTER TABLE ONLY public.job_application
    ADD CONSTRAINT job_application_pkey PRIMARY KEY (id);


--
-- Name: job_applications job_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_pkey PRIMARY KEY (id);


--
-- Name: job_confirmations job_confirmations_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.job_confirmations
    ADD CONSTRAINT job_confirmations_pkey PRIMARY KEY (id);


--
-- Name: job_details job_details_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.job_details
    ADD CONSTRAINT job_details_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: roles roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);


--
-- Name: service_details service_details_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.service_details
    ADD CONSTRAINT service_details_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: vouchers vouchers_code_key; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_code_key UNIQUE (code);


--
-- Name: vouchers vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- Name: work_history work_history_pkey; Type: CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.work_history
    ADD CONSTRAINT work_history_pkey PRIMARY KEY (id);


--
-- Name: administrators administrators_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.administrators
    ADD CONSTRAINT administrators_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: cleaner_addresses cleaner_addresses_cleaner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.cleaner_addresses
    ADD CONSTRAINT cleaner_addresses_cleaner_id_fkey FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id);


--
-- Name: cleaner_rewards cleaner_rewards_cleaner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.cleaner_rewards
    ADD CONSTRAINT cleaner_rewards_cleaner_id_fkey FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id);


--
-- Name: conversations conversations_cleaner1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_cleaner1_id_fkey FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id);


--
-- Name: conversations conversations_user1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_user1_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: customer_addresses customer_addresses_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: customer_voucher_usage customer_voucher_usage_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.customer_voucher_usage
    ADD CONSTRAINT customer_voucher_usage_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: customer_voucher_usage customer_voucher_usage_voucher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.customer_voucher_usage
    ADD CONSTRAINT customer_voucher_usage_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.vouchers(id);


--
-- Name: feedback feedback_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- Name: job_application fk10hrhnupwe0fiknw4bt4u49fp; Type: FK CONSTRAINT; Schema: public; Owner: sep490
--

ALTER TABLE ONLY public.job_application
    ADD CONSTRAINT fk10hrhnupwe0fiknw4bt4u49fp FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- Name: job_application fk3lr9175bok4ndpjwkjhb0og4p; Type: FK CONSTRAINT; Schema: public; Owner: sep490
--

ALTER TABLE ONLY public.job_application
    ADD CONSTRAINT fk3lr9175bok4ndpjwkjhb0og4p FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id);


--
-- Name: jobs fk4nwmo010uq5o2a0cwokw9cj7s; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT fk4nwmo010uq5o2a0cwokw9cj7s FOREIGN KEY (customer_address_id) REFERENCES public.customer_addresses(id);


--
-- Name: transactions fkpnnreq9lpejqyjfct60v7n7x1; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT fkpnnreq9lpejqyjfct60v7n7x1 FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: job_applications job_applications_cleaner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_cleaner_id_fkey FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id);


--
-- Name: job_applications job_applications_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- Name: job_confirmations job_confirmations_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.job_confirmations
    ADD CONSTRAINT job_confirmations_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- Name: job_confirmations job_confirmations_new_cleaner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.job_confirmations
    ADD CONSTRAINT job_confirmations_new_cleaner_id_fkey FOREIGN KEY (new_cleaner_id) REFERENCES public.cleaners(id);


--
-- Name: job_details job_details_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.job_details
    ADD CONSTRAINT job_details_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- Name: jobs jobs_cleaner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_cleaner_id_fkey FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id);


--
-- Name: jobs jobs_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: jobs jobs_service_detail_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_service_detail_id_fkey FOREIGN KEY (service_detail_id) REFERENCES public.service_details(id);


--
-- Name: jobs jobs_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);


--
-- Name: notifications notifications_cleaner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_cleaner_id_fkey FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.customers(id);


--
-- Name: payments payments_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- Name: reports reports_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- Name: reports reports_reported_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reported_user_id_fkey FOREIGN KEY (reported_user_id) REFERENCES public.cleaners(id);


--
-- Name: reports reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.customers(id);


--
-- Name: service_details service_details_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.service_details
    ADD CONSTRAINT service_details_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: transactions transactions_cleaner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_cleaner_id_fkey FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id);


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.customers(id);


--
-- Name: wallets wallets_cleaner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_cleaner_id_fkey FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id);


--
-- Name: work_history work_history_cleaner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.work_history
    ADD CONSTRAINT work_history_cleaner_id_fkey FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id);


--
-- Name: work_history work_history_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ametist
--

ALTER TABLE ONLY public.work_history
    ADD CONSTRAINT work_history_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- PostgreSQL database dump complete
--

