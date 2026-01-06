CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"parent_id" integer,
	"level" integer DEFAULT 1,
	"system_module" varchar(50) NOT NULL,
	"account_type" varchar(50) DEFAULT 'detail',
	"nature" varchar(50) NOT NULL,
	"is_parent" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"is_cash_account" boolean DEFAULT false,
	"is_bank_account" boolean DEFAULT false,
	"currency" varchar(10) DEFAULT 'SAR',
	"opening_balance" numeric(18, 2) DEFAULT '0',
	"current_balance" numeric(18, 2) DEFAULT '0',
	"description" text,
	"linked_entity_type" varchar(50),
	"linked_entity_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_models" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(50) NOT NULL,
	"name_ar" varchar(200) NOT NULL,
	"name_en" varchar(200),
	"description" text,
	"model_type" varchar(50) NOT NULL,
	"provider" varchar(50) DEFAULT 'internal',
	"model_version" varchar(50),
	"endpoint" varchar(500),
	"input_schema" jsonb,
	"output_schema" jsonb,
	"accuracy" numeric(5, 2),
	"last_trained_at" timestamp,
	"training_data_count" integer,
	"is_active" boolean DEFAULT true,
	"config" jsonb,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_id" integer NOT NULL,
	"business_id" integer NOT NULL,
	"prediction_type" varchar(50) NOT NULL,
	"target_entity" varchar(50),
	"target_entity_id" integer,
	"input_data" jsonb NOT NULL,
	"prediction" jsonb NOT NULL,
	"confidence" numeric(5, 2),
	"prediction_date" date NOT NULL,
	"valid_from" timestamp,
	"valid_to" timestamp,
	"actual_value" jsonb,
	"accuracy" numeric(5, 2),
	"is_verified" boolean DEFAULT false,
	"verified_at" timestamp,
	"verified_by" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"station_id" integer,
	"equipment_id" integer,
	"sensor_id" integer,
	"alertType" varchar(50) NOT NULL,
	"category" varchar(50),
	"title" varchar(255) NOT NULL,
	"message" text,
	"value" numeric(15, 4),
	"threshold" numeric(15, 4),
	"status" varchar(50) DEFAULT 'active',
	"triggered_at" timestamp DEFAULT now() NOT NULL,
	"acknowledged_by" integer,
	"acknowledged_at" timestamp,
	"resolved_by" integer,
	"resolved_at" timestamp,
	"resolution" text,
	"work_order_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"key_hash" varchar(255) NOT NULL,
	"key_prefix" varchar(20) NOT NULL,
	"permissions" jsonb,
	"allowed_ips" jsonb,
	"allowed_origins" jsonb,
	"rate_limit_per_minute" integer DEFAULT 60,
	"rate_limit_per_day" integer DEFAULT 10000,
	"expires_at" timestamp,
	"last_used_at" timestamp,
	"usage_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"api_key_id" integer,
	"business_id" integer NOT NULL,
	"endpoint" varchar(500) NOT NULL,
	"method" varchar(10) NOT NULL,
	"request_headers" jsonb,
	"request_body" jsonb,
	"response_status" integer,
	"response_time" integer,
	"ip_address" varchar(50),
	"user_agent" varchar(500),
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "areas" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"project_id" integer,
	"code" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"description" text,
	"address" text,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"parent_id" integer,
	"depreciationMethod" varchar(50) DEFAULT 'straight_line',
	"useful_life" integer,
	"salvage_percentage" numeric(5, 2) DEFAULT '0',
	"asset_account_id" integer,
	"depreciation_account_id" integer,
	"accumulated_dep_account_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"movement_type" varchar(50) NOT NULL,
	"movement_date" date NOT NULL,
	"from_branch_id" integer,
	"to_branch_id" integer,
	"from_station_id" integer,
	"to_station_id" integer,
	"amount" numeric(18, 2),
	"description" text,
	"reference_type" varchar(50),
	"reference_id" integer,
	"journal_entry_id" integer,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"branch_id" integer,
	"station_id" integer,
	"category_id" integer NOT NULL,
	"code" varchar(50) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"description" text,
	"serial_number" varchar(100),
	"model" varchar(100),
	"manufacturer" varchar(100),
	"purchase_date" date,
	"commission_date" date,
	"purchase_cost" numeric(18, 2) DEFAULT '0',
	"current_value" numeric(18, 2) DEFAULT '0',
	"accumulated_depreciation" numeric(18, 2) DEFAULT '0',
	"salvage_value" numeric(18, 2) DEFAULT '0',
	"useful_life" integer,
	"depreciationMethod" varchar(50),
	"status" varchar(50) DEFAULT 'active',
	"location" varchar(255),
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"warranty_expiry" date,
	"supplier_id" integer,
	"purchase_order_id" integer,
	"parent_asset_id" integer,
	"qr_code" varchar(255),
	"barcode" varchar(100),
	"image" text,
	"specifications" jsonb,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"business_id" integer NOT NULL,
	"attendance_date" date NOT NULL,
	"check_in_time" timestamp,
	"check_in_location" varchar(255),
	"check_in_latitude" numeric(10, 8),
	"check_in_longitude" numeric(11, 8),
	"checkInMethod" varchar(50) DEFAULT 'manual',
	"check_out_time" timestamp,
	"check_out_location" varchar(255),
	"check_out_latitude" numeric(10, 8),
	"check_out_longitude" numeric(11, 8),
	"checkOutMethod" varchar(50) DEFAULT 'manual',
	"total_hours" numeric(5, 2),
	"overtime_hours" numeric(5, 2) DEFAULT '0',
	"late_minutes" integer DEFAULT 0,
	"early_leave_minutes" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'present',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer,
	"user_id" integer,
	"action" varchar(50) NOT NULL,
	"module" varchar(50) NOT NULL,
	"entity_type" varchar(50),
	"entity_id" integer,
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" varchar(50),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_periods" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"project_id" integer,
	"name" varchar(100) NOT NULL,
	"period_number" integer,
	"month" integer,
	"year" integer,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"reading_start_date" date,
	"reading_end_date" date,
	"billing_date" date,
	"due_date" date,
	"total_meters" integer DEFAULT 0,
	"read_meters" integer DEFAULT 0,
	"billed_meters" integer DEFAULT 0,
	"created_by" integer,
	"closed_by" integer,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"type" varchar(20) DEFAULT 'local' NOT NULL,
	"parent_id" integer,
	"address" text,
	"city" varchar(100),
	"region" varchar(100),
	"country" varchar(100) DEFAULT 'Saudi Arabia',
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"phone" varchar(50),
	"email" varchar(255),
	"manager_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"type" varchar(20) DEFAULT 'subsidiary' NOT NULL,
	"system_type" varchar(20) DEFAULT 'both' NOT NULL,
	"parent_id" integer,
	"logo" text,
	"address" text,
	"phone" varchar(50),
	"email" varchar(255),
	"website" varchar(255),
	"tax_number" varchar(50),
	"commercial_register" varchar(50),
	"currency" varchar(10) DEFAULT 'SAR',
	"fiscal_year_start" integer DEFAULT 1,
	"timezone" varchar(50) DEFAULT 'Asia/Riyadh',
	"is_active" boolean DEFAULT true,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "businesses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "cabinets" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"square_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"cabinetType" varchar(50) DEFAULT 'distribution',
	"capacity" integer,
	"current_load" integer DEFAULT 0,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cashboxes" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"branch_id" integer,
	"code" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"balance" numeric(18, 2) DEFAULT '0',
	"currency" varchar(10) DEFAULT 'SAR',
	"assigned_to" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cost_centers" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"parent_id" integer,
	"level" integer DEFAULT 1,
	"type" varchar(50),
	"station_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"account_number" varchar(50) NOT NULL,
	"account_name" varchar(255) NOT NULL,
	"account_type" varchar(50) NOT NULL,
	"parent_id" integer,
	"balance" numeric(15, 2) DEFAULT '0',
	"currency" varchar(10) DEFAULT 'SAR',
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"sub_system_id" integer,
	"code" varchar(20) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"categoryType" varchar(50) NOT NULL,
	"parent_id" integer,
	"level" integer DEFAULT 1,
	"color" varchar(20),
	"icon" varchar(50),
	"description" text,
	"linked_account_id" integer,
	"is_active" boolean DEFAULT true,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_intermediary_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"from_sub_system_id" integer NOT NULL,
	"to_sub_system_id" integer NOT NULL,
	"code" varchar(50) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"balance" numeric(18, 2) DEFAULT '0',
	"currency" varchar(10) DEFAULT 'SAR',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_memos" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"memo_number" varchar(50) NOT NULL,
	"memo_date" date NOT NULL,
	"subject" varchar(255) NOT NULL,
	"content" text,
	"memoType" varchar(50) DEFAULT 'internal',
	"from_department" varchar(255),
	"to_department" varchar(255),
	"status" varchar(50) DEFAULT 'draft',
	"priority" varchar(50) DEFAULT 'medium',
	"attachments" jsonb,
	"response_required" boolean DEFAULT false,
	"response_deadline" date,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text,
	"category" varchar(100),
	"priority" varchar(50) DEFAULT 'medium',
	"color" varchar(20),
	"is_pinned" boolean DEFAULT false,
	"is_archived" boolean DEFAULT false,
	"tags" jsonb,
	"attachments" jsonb,
	"reminder_date" timestamp,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_parties" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"sub_system_id" integer,
	"code" varchar(20) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"partyType" varchar(50) NOT NULL,
	"phone" varchar(50),
	"mobile" varchar(50),
	"email" varchar(255),
	"address" text,
	"city" varchar(100),
	"country" varchar(100) DEFAULT 'Saudi Arabia',
	"tax_number" varchar(50),
	"commercial_register" varchar(50),
	"credit_limit" numeric(18, 2) DEFAULT '0',
	"current_balance" numeric(18, 2) DEFAULT '0',
	"currency" varchar(10) DEFAULT 'SAR',
	"contact_person" varchar(255),
	"notes" text,
	"tags" jsonb,
	"is_active" boolean DEFAULT true,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_party_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"party_id" integer NOT NULL,
	"transaction_type" varchar(50) NOT NULL,
	"transaction_date" date NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"balance_before" numeric(18, 2) NOT NULL,
	"balance_after" numeric(18, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'SAR',
	"reference_type" varchar(50),
	"reference_id" integer,
	"reference_number" varchar(50),
	"description" text,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_payment_voucher_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"payment_voucher_id" integer NOT NULL,
	"line_order" integer DEFAULT 0 NOT NULL,
	"account_type" varchar(50),
	"account_sub_type_id" integer,
	"account_id" integer NOT NULL,
	"analytic_account_id" integer,
	"analytic_treasury_id" integer,
	"cost_center_id" integer,
	"description" text,
	"amount" numeric(18, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_payment_vouchers" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"sub_system_id" integer NOT NULL,
	"voucher_number" varchar(50) NOT NULL,
	"voucher_date" date NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'SAR',
	"currency_id" integer,
	"treasury_id" integer NOT NULL,
	"destinationType" varchar(50) NOT NULL,
	"destination_name" varchar(255),
	"destination_intermediary_id" integer,
	"party_id" integer,
	"category_id" integer,
	"paymentMethod" varchar(50) DEFAULT 'cash',
	"check_number" varchar(50),
	"check_date" date,
	"check_bank" varchar(100),
	"bank_reference" varchar(100),
	"description" text,
	"attachments" jsonb,
	"status" varchar(50) DEFAULT 'draft',
	"edit_count" integer DEFAULT 0 NOT NULL,
	"is_reconciled" boolean DEFAULT false,
	"reconciled_with" integer,
	"reconciled_at" timestamp,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_receipt_vouchers" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"sub_system_id" integer NOT NULL,
	"voucher_number" varchar(50) NOT NULL,
	"voucher_date" date NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'SAR',
	"sourceType" varchar(50) NOT NULL,
	"source_name" varchar(255),
	"source_intermediary_id" integer,
	"party_id" integer,
	"category_id" integer,
	"paymentMethod" varchar(50) DEFAULT 'cash',
	"check_number" varchar(50),
	"check_date" date,
	"check_bank" varchar(100),
	"bank_reference" varchar(100),
	"treasury_id" integer NOT NULL,
	"description" text,
	"attachments" jsonb,
	"status" varchar(50) DEFAULT 'draft',
	"is_reconciled" boolean DEFAULT false,
	"reconciled_with" integer,
	"reconciled_at" timestamp,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_reconciliations" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"payment_voucher_id" integer NOT NULL,
	"receipt_voucher_id" integer NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'SAR',
	"confidenceScore" varchar(50) DEFAULT 'medium',
	"status" varchar(50) DEFAULT 'pending',
	"notes" text,
	"confirmed_by" integer,
	"confirmed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"sub_system_id" integer,
	"setting_key" varchar(100) NOT NULL,
	"setting_value" text,
	"settingType" varchar(50) DEFAULT 'string',
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_sub_systems" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"description" text,
	"color" varchar(20),
	"icon" varchar(50),
	"is_active" boolean DEFAULT true,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"transaction_number" varchar(50) NOT NULL,
	"transaction_date" date NOT NULL,
	"account_id" integer NOT NULL,
	"transaction_type" varchar(50) NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"description" text,
	"reference_type" varchar(50),
	"reference_id" integer,
	"attachments" jsonb,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_treasuries" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"sub_system_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"treasury_type" varchar(50) NOT NULL,
	"account_id" integer,
	"bank_name" varchar(255),
	"account_number" varchar(100),
	"iban" varchar(50),
	"swift_code" varchar(20),
	"wallet_provider" varchar(100),
	"wallet_number" varchar(100),
	"currency" varchar(10) DEFAULT 'SAR',
	"opening_balance" numeric(18, 2) DEFAULT '0',
	"current_balance" numeric(18, 2) DEFAULT '0',
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_treasury_currencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"treasury_id" integer NOT NULL,
	"currency_id" integer NOT NULL,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"opening_balance" numeric(15, 2) DEFAULT '0',
	"current_balance" numeric(15, 2) DEFAULT '0',
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_treasury_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"treasury_id" integer NOT NULL,
	"movement_type" varchar(50) NOT NULL,
	"movement_date" date NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"balance_before" numeric(18, 2) NOT NULL,
	"balance_after" numeric(18, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'SAR',
	"reference_type" varchar(50),
	"reference_id" integer,
	"reference_number" varchar(50),
	"description" text,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_treasury_transfers" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"sub_system_id" integer NOT NULL,
	"transfer_number" varchar(50) NOT NULL,
	"transfer_date" date NOT NULL,
	"from_treasury_id" integer NOT NULL,
	"to_treasury_id" integer NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'SAR',
	"exchange_rate" numeric(10, 6) DEFAULT '1',
	"fees" numeric(18, 2) DEFAULT '0',
	"description" text,
	"status" varchar(50) DEFAULT 'draft',
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_transactions_new" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"wallet_id" integer,
	"transaction_type" varchar(50) NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"balance_before" numeric(18, 2),
	"balance_after" numeric(18, 2),
	"reference_type" varchar(50),
	"reference_id" integer,
	"description" text,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"balance" numeric(18, 2) DEFAULT '0',
	"currency" varchar(10) DEFAULT 'SAR',
	"last_transaction_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"branch_id" integer,
	"station_id" integer,
	"account_number" varchar(50) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"type" varchar(50) DEFAULT 'residential',
	"category" varchar(50),
	"idType" varchar(50),
	"id_number" varchar(50),
	"phone" varchar(50),
	"mobile" varchar(50),
	"email" varchar(255),
	"address" text,
	"city" varchar(100),
	"district" varchar(100),
	"postal_code" varchar(20),
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"tariff_id" integer,
	"connection_date" date,
	"status" varchar(50) DEFAULT 'active',
	"current_balance" numeric(18, 2) DEFAULT '0',
	"deposit_amount" numeric(18, 2) DEFAULT '0',
	"credit_limit" numeric(18, 2),
	"account_id" integer,
	"is_active" boolean DEFAULT true,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers_enhanced" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"project_id" integer,
	"full_name" varchar(255) NOT NULL,
	"mobile_no" varchar(50),
	"phone" varchar(50),
	"email" varchar(255),
	"address" text,
	"national_id" varchar(50),
	"customerType" varchar(50) DEFAULT 'residential',
	"serviceTier" varchar(50) DEFAULT 'basic',
	"status" varchar(50) DEFAULT 'active',
	"balance_due" numeric(18, 2) DEFAULT '0',
	"user_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"name_ar" varchar(100) NOT NULL,
	"name_en" varchar(100),
	"parent_id" integer,
	"manager_id" integer,
	"cost_center_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diesel_pipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"station_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"pipe_material" varchar(50) DEFAULT 'iron',
	"diameter" numeric(6, 2),
	"length" numeric(8, 2),
	"condition" varchar(50) DEFAULT 'good',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diesel_pump_meters" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"station_id" integer,
	"supplier_id" integer,
	"code" varchar(20) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"pump_type" varchar(50) NOT NULL,
	"serial_number" varchar(100),
	"current_reading" numeric(15, 2) DEFAULT '0',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diesel_pump_readings" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"pump_meter_id" integer NOT NULL,
	"task_id" integer,
	"reading_date" timestamp NOT NULL,
	"reading_value" numeric(15, 2) NOT NULL,
	"readingType" varchar(50) NOT NULL,
	"reading_image" text,
	"quantity" numeric(10, 2),
	"recorded_by" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diesel_receiving_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"station_id" integer NOT NULL,
	"task_number" varchar(50) NOT NULL,
	"task_date" date NOT NULL,
	"employee_id" integer NOT NULL,
	"tanker_id" integer NOT NULL,
	"supplier_id" integer NOT NULL,
	"task_status" varchar(50) DEFAULT 'pending',
	"start_time" timestamp,
	"arrival_at_supplier_time" timestamp,
	"loading_start_time" timestamp,
	"loading_end_time" timestamp,
	"departure_from_supplier_time" timestamp,
	"arrival_at_station_time" timestamp,
	"unloading_start_time" timestamp,
	"unloading_end_time" timestamp,
	"completion_time" timestamp,
	"supplier_pump_id" integer,
	"supplier_pump_reading_before" numeric(15, 2),
	"supplier_pump_reading_after" numeric(15, 2),
	"supplier_pump_reading_before_image" text,
	"supplier_pump_reading_after_image" text,
	"supplier_invoice_number" varchar(50),
	"supplier_invoice_image" text,
	"supplier_invoice_amount" numeric(18, 2),
	"quantity_from_supplier" numeric(10, 2),
	"compartment1_quantity" numeric(10, 2),
	"compartment2_quantity" numeric(10, 2),
	"intake_pump_id" integer,
	"intake_pump_reading_before" numeric(15, 2),
	"intake_pump_reading_after" numeric(15, 2),
	"intake_pump_reading_before_image" text,
	"intake_pump_reading_after_image" text,
	"quantity_received_at_station" numeric(10, 2),
	"receiving_tank_id" integer,
	"quantity_difference" numeric(10, 2),
	"difference_notes" text,
	"notes" text,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diesel_suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"phone" varchar(50),
	"address" text,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"contact_person" varchar(100),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diesel_tank_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"station_id" integer NOT NULL,
	"movement_date" timestamp NOT NULL,
	"movement_type" varchar(50) NOT NULL,
	"from_tank_id" integer,
	"to_tank_id" integer,
	"quantity" numeric(10, 2) NOT NULL,
	"task_id" integer,
	"output_pump_id" integer,
	"output_pump_reading_before" numeric(15, 2),
	"output_pump_reading_after" numeric(15, 2),
	"generator_id" integer,
	"notes" text,
	"recorded_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diesel_tank_openings" (
	"id" serial PRIMARY KEY NOT NULL,
	"tank_id" integer NOT NULL,
	"opening_number" integer NOT NULL,
	"position" varchar(50) NOT NULL,
	"usage" varchar(50) NOT NULL,
	"diameter" numeric(6, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diesel_tankers" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"plate_number" varchar(20) NOT NULL,
	"capacity" numeric(10, 2) NOT NULL,
	"compartment1_capacity" numeric(10, 2),
	"compartment2_capacity" numeric(10, 2),
	"driver_name" varchar(100),
	"driver_phone" varchar(50),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diesel_tanks" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"station_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"tank_type" varchar(50) NOT NULL,
	"tank_material" varchar(50) DEFAULT 'plastic',
	"brand" varchar(100),
	"color" varchar(50),
	"capacity" numeric(10, 2) NOT NULL,
	"height" numeric(8, 2),
	"diameter" numeric(8, 2),
	"dead_stock" numeric(10, 2) DEFAULT '0',
	"effective_capacity" numeric(10, 2),
	"current_level" numeric(10, 2) DEFAULT '0',
	"min_level" numeric(10, 2) DEFAULT '0',
	"openings_count" integer DEFAULT 1,
	"linked_generator_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"business_id" integer NOT NULL,
	"contract_number" varchar(50) NOT NULL,
	"contractType" varchar(50) DEFAULT 'permanent',
	"start_date" date NOT NULL,
	"end_date" date,
	"basic_salary" numeric(15, 2),
	"probation_period_days" integer DEFAULT 90,
	"notice_period_days" integer DEFAULT 30,
	"document_path" varchar(500),
	"status" varchar(50) DEFAULT 'active',
	"termination_date" date,
	"termination_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"employee_number" varchar(20) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"middle_name" varchar(100),
	"last_name" varchar(100) NOT NULL,
	"full_name_ar" varchar(200),
	"full_name_en" varchar(200),
	"idType" varchar(50) DEFAULT 'national_id',
	"id_number" varchar(50) NOT NULL,
	"id_expiry_date" date,
	"nationality" varchar(50),
	"gender" varchar(50) DEFAULT 'male',
	"date_of_birth" date,
	"place_of_birth" varchar(100),
	"maritalStatus" varchar(50) DEFAULT 'single',
	"phone" varchar(20),
	"mobile" varchar(20) NOT NULL,
	"email" varchar(100),
	"personal_email" varchar(100),
	"address" text,
	"city" varchar(100),
	"district" varchar(100),
	"emergency_contact_name" varchar(100),
	"emergency_contact_phone" varchar(20),
	"emergency_contact_relation" varchar(50),
	"photo_path" varchar(500),
	"hire_date" date NOT NULL,
	"probation_end_date" date,
	"contractType" varchar(50) DEFAULT 'permanent',
	"contract_start_date" date,
	"contract_end_date" date,
	"job_title_id" integer,
	"department_id" integer,
	"manager_id" integer,
	"is_manager" boolean DEFAULT false,
	"work_location" varchar(100),
	"station_id" integer,
	"branch_id" integer,
	"workSchedule" varchar(50) DEFAULT 'full_time',
	"working_hours_per_week" numeric(5, 2) DEFAULT '40',
	"field_worker_id" integer,
	"status" varchar(50) DEFAULT 'active',
	"termination_date" date,
	"termination_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"station_id" integer NOT NULL,
	"asset_id" integer,
	"code" varchar(50) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"type" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'unknown',
	"manufacturer" varchar(100),
	"model" varchar(100),
	"serial_number" varchar(100),
	"rated_capacity" numeric(15, 2),
	"capacity_unit" varchar(20),
	"voltage_rating" varchar(50),
	"current_rating" varchar(50),
	"installation_date" date,
	"last_maintenance_date" date,
	"next_maintenance_date" date,
	"location" varchar(255),
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"is_controllable" boolean DEFAULT false,
	"is_monitored" boolean DEFAULT true,
	"communication_protocol" varchar(50),
	"ip_address" varchar(50),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipment_id" integer NOT NULL,
	"movementType" varchar(50) NOT NULL,
	"from_holder_id" integer,
	"to_holder_id" integer,
	"operation_id" integer,
	"movement_date" timestamp DEFAULT now() NOT NULL,
	"conditionBefore" varchar(50),
	"conditionAfter" varchar(50),
	"notes" text,
	"recorded_by" integer
);
--> statement-breakpoint
CREATE TABLE "event_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"subscriber_name" varchar(100) NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"handlerType" varchar(50) NOT NULL,
	"handler_config" jsonb NOT NULL,
	"filter_expression" jsonb,
	"is_active" boolean DEFAULT true,
	"priority" integer DEFAULT 0,
	"max_retries" integer DEFAULT 3,
	"retry_delay_seconds" integer DEFAULT 60,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fee_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"description" text,
	"feeType" varchar(50) DEFAULT 'fixed',
	"amount" numeric(18, 2) DEFAULT '0',
	"is_recurring" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_equipment" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"equipment_code" varchar(30) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"equipmentType" varchar(50) NOT NULL,
	"serial_number" varchar(100),
	"model" varchar(100),
	"brand" varchar(100),
	"status" varchar(50) DEFAULT 'available',
	"current_holder_id" integer,
	"assigned_team_id" integer,
	"purchase_date" date,
	"purchase_cost" numeric(12, 2),
	"warranty_end" date,
	"last_maintenance" date,
	"next_maintenance" date,
	"condition" varchar(50) DEFAULT 'good',
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_operations" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"station_id" integer,
	"operation_number" varchar(30) NOT NULL,
	"operation_type" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'draft',
	"priority" varchar(50) DEFAULT 'medium',
	"title" varchar(255) NOT NULL,
	"description" text,
	"reference_type" varchar(50),
	"reference_id" integer,
	"customer_id" integer,
	"asset_id" integer,
	"location_lat" numeric(10, 8),
	"location_lng" numeric(11, 8),
	"address" text,
	"scheduled_date" date,
	"scheduled_time" varchar(10),
	"started_at" timestamp,
	"completed_at" timestamp,
	"assigned_team_id" integer,
	"assigned_worker_id" integer,
	"estimated_duration" integer,
	"actual_duration" integer,
	"notes" text,
	"completion_notes" text,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"branch_id" integer,
	"code" varchar(20) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"team_type" varchar(50) DEFAULT 'mixed',
	"leader_id" integer,
	"max_members" integer DEFAULT 10,
	"current_members" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'active',
	"working_area" text,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_workers" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"user_id" integer,
	"employee_id" integer,
	"employee_number" varchar(30) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"phone" varchar(50),
	"email" varchar(255),
	"team_id" integer,
	"worker_type" varchar(50) DEFAULT 'technician',
	"specialization" varchar(100),
	"skills" jsonb,
	"status" varchar(50) DEFAULT 'available',
	"current_location_lat" numeric(10, 8),
	"current_location_lng" numeric(11, 8),
	"last_location_update" timestamp,
	"hire_date" date,
	"daily_rate" numeric(10, 2),
	"operation_rate" numeric(10, 2),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fiscal_periods" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"year" integer NOT NULL,
	"period" integer NOT NULL,
	"name_ar" varchar(100) NOT NULL,
	"name_en" varchar(100),
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" varchar(50) DEFAULT 'open',
	"closed_by" integer,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generator_diesel_consumption" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"station_id" integer NOT NULL,
	"generator_id" integer NOT NULL,
	"consumption_date" date NOT NULL,
	"rocket_tank_id" integer,
	"start_level" numeric(10, 2),
	"end_level" numeric(10, 2),
	"quantity_consumed" numeric(10, 2) NOT NULL,
	"running_hours" numeric(8, 2),
	"consumption_rate" numeric(8, 2),
	"notes" text,
	"recorded_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incoming_webhooks" (
	"id" serial PRIMARY KEY NOT NULL,
	"integration_id" integer NOT NULL,
	"business_id" integer NOT NULL,
	"webhook_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"headers" jsonb,
	"signature" varchar(255),
	"is_valid" boolean DEFAULT true,
	"status" varchar(50) DEFAULT 'received',
	"processed_at" timestamp,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"source_ip" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inspection_checklists" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(30) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"operation_type" varchar(50),
	"items" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inspection_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"inspection_id" integer NOT NULL,
	"checklist_item_id" integer,
	"item_name" varchar(255) NOT NULL,
	"is_passed" boolean,
	"score" numeric(5, 2),
	"notes" text,
	"photo_url" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "inspections" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"operation_id" integer NOT NULL,
	"inspection_number" varchar(30) NOT NULL,
	"inspectionType" varchar(50) NOT NULL,
	"inspector_id" integer,
	"inspection_date" timestamp DEFAULT now() NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"overall_score" numeric(5, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "installation_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"operation_id" integer NOT NULL,
	"customer_id" integer,
	"meter_serial_number" varchar(100),
	"meterType" varchar(50),
	"seal_number" varchar(50),
	"seal_color" varchar(30),
	"seal_type" varchar(50),
	"breaker_type" varchar(50),
	"breaker_capacity" varchar(20),
	"breaker_brand" varchar(50),
	"cable_length" numeric(10, 2),
	"cable_type" varchar(50),
	"cable_size" varchar(20),
	"initial_reading" numeric(15, 3),
	"installation_date" date,
	"installation_time" varchar(10),
	"technician_id" integer,
	"notes" text,
	"customer_signature" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "installation_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"installation_id" integer,
	"operation_id" integer NOT NULL,
	"photo_type" varchar(50),
	"photo_url" varchar(500) NOT NULL,
	"caption" varchar(200),
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"captured_at" timestamp,
	"uploaded_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"integration_id" integer NOT NULL,
	"config_key" varchar(100) NOT NULL,
	"config_value" text,
	"is_encrypted" boolean DEFAULT false,
	"valueType" varchar(50) DEFAULT 'string',
	"environment" varchar(50) DEFAULT 'production',
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"integration_id" integer NOT NULL,
	"business_id" integer NOT NULL,
	"request_id" varchar(100),
	"direction" varchar(50) NOT NULL,
	"method" varchar(10),
	"endpoint" varchar(500),
	"request_headers" jsonb,
	"request_body" jsonb,
	"response_status" integer,
	"response_headers" jsonb,
	"response_body" jsonb,
	"duration_ms" integer,
	"status" varchar(50) NOT NULL,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(50) NOT NULL,
	"name_ar" varchar(200) NOT NULL,
	"name_en" varchar(200),
	"description" text,
	"integration_type" varchar(50) NOT NULL,
	"category" varchar(50) DEFAULT 'local',
	"provider" varchar(100),
	"base_url" varchar(500),
	"api_version" varchar(20),
	"authType" varchar(50) DEFAULT 'api_key',
	"is_active" boolean DEFAULT true,
	"is_primary" boolean DEFAULT false,
	"priority" integer DEFAULT 1,
	"last_health_check" timestamp,
	"healthStatus" varchar(50) DEFAULT 'unknown',
	"webhook_url" varchar(500),
	"webhook_secret" varchar(255),
	"rate_limit_per_minute" integer DEFAULT 60,
	"timeout_seconds" integer DEFAULT 30,
	"retry_attempts" integer DEFAULT 3,
	"metadata" jsonb,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_fees" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"fee_type_id" integer NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"branch_id" integer,
	"customer_id" integer NOT NULL,
	"meter_id" integer,
	"invoice_number" varchar(50) NOT NULL,
	"invoice_date" date NOT NULL,
	"due_date" date NOT NULL,
	"period_start" date,
	"period_end" date,
	"reading_id" integer,
	"consumption" numeric(15, 3),
	"consumption_amount" numeric(18, 2) DEFAULT '0',
	"fixed_charges" numeric(18, 2) DEFAULT '0',
	"tax_amount" numeric(18, 2) DEFAULT '0',
	"other_charges" numeric(18, 2) DEFAULT '0',
	"discount_amount" numeric(18, 2) DEFAULT '0',
	"previous_balance" numeric(18, 2) DEFAULT '0',
	"total_amount" numeric(18, 2) DEFAULT '0',
	"paid_amount" numeric(18, 2) DEFAULT '0',
	"balance_due" numeric(18, 2) DEFAULT '0',
	"status" varchar(50) DEFAULT 'draft',
	"journal_entry_id" integer,
	"notes" text,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices_enhanced" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"meter_id" integer,
	"meter_reading_id" integer,
	"billing_period_id" integer,
	"invoice_no" varchar(50) NOT NULL,
	"invoice_date" date NOT NULL,
	"due_date" date,
	"period_start" date,
	"period_end" date,
	"meter_number" varchar(50),
	"previous_reading" numeric(15, 3),
	"current_reading" numeric(15, 3),
	"total_consumption_kwh" numeric(15, 3),
	"price_kwh" numeric(10, 4),
	"consumption_amount" numeric(18, 2) DEFAULT '0',
	"fixed_charges" numeric(18, 2) DEFAULT '0',
	"total_fees" numeric(18, 2) DEFAULT '0',
	"vat_rate" numeric(5, 2) DEFAULT '15',
	"vat_amount" numeric(18, 2) DEFAULT '0',
	"total_amount" numeric(18, 2) DEFAULT '0',
	"previous_balance_due" numeric(18, 2) DEFAULT '0',
	"final_amount" numeric(18, 2) DEFAULT '0',
	"paid_amount" numeric(18, 2) DEFAULT '0',
	"balance_due" numeric(18, 2) DEFAULT '0',
	"status" varchar(50) DEFAULT 'generated',
	"invoiceType" varchar(50) DEFAULT 'final',
	"approved_by" integer,
	"approved_at" timestamp,
	"created_by" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"parent_id" integer,
	"inventory_account_id" integer,
	"cogs_account_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"category_id" integer,
	"code" varchar(50) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"description" text,
	"type" varchar(50) DEFAULT 'spare_part',
	"unit" varchar(20) NOT NULL,
	"barcode" varchar(100),
	"min_stock" numeric(15, 3) DEFAULT '0',
	"max_stock" numeric(15, 3),
	"reorder_point" numeric(15, 3),
	"reorder_qty" numeric(15, 3),
	"standard_cost" numeric(18, 4) DEFAULT '0',
	"last_purchase_price" numeric(18, 4),
	"average_cost" numeric(18, 4),
	"is_active" boolean DEFAULT true,
	"image" text,
	"specifications" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_titles" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"title_ar" varchar(100) NOT NULL,
	"title_en" varchar(100),
	"department_id" integer,
	"grade_id" integer,
	"level" integer DEFAULT 1,
	"description" text,
	"responsibilities" text,
	"requirements" text,
	"headcount" integer DEFAULT 1,
	"current_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"branch_id" integer,
	"entry_number" varchar(50) NOT NULL,
	"entry_date" date NOT NULL,
	"period_id" integer NOT NULL,
	"type" varchar(50) DEFAULT 'manual',
	"source_module" varchar(50),
	"source_id" integer,
	"description" text,
	"total_debit" numeric(18, 2) DEFAULT '0',
	"total_credit" numeric(18, 2) DEFAULT '0',
	"status" varchar(50) DEFAULT 'draft',
	"posted_by" integer,
	"posted_at" timestamp,
	"reversed_by" integer,
	"reversed_at" timestamp,
	"reversal_entry_id" integer,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entry_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_id" integer NOT NULL,
	"line_number" integer NOT NULL,
	"account_id" integer NOT NULL,
	"cost_center_id" integer,
	"description" text,
	"debit" numeric(18, 2) DEFAULT '0',
	"credit" numeric(18, 2) DEFAULT '0',
	"currency" varchar(10) DEFAULT 'SAR',
	"exchange_rate" numeric(10, 6) DEFAULT '1',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_balances" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"leave_type_id" integer NOT NULL,
	"year" integer NOT NULL,
	"opening_balance" integer DEFAULT 0,
	"earned_balance" integer DEFAULT 0,
	"used_balance" integer DEFAULT 0,
	"adjustment_balance" integer DEFAULT 0,
	"remaining_balance" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"business_id" integer NOT NULL,
	"leave_type_id" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"total_days" integer NOT NULL,
	"reason" text,
	"attachment_path" varchar(500),
	"status" varchar(50) DEFAULT 'pending',
	"approved_by" integer,
	"approved_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"name_ar" varchar(100) NOT NULL,
	"name_en" varchar(100),
	"annual_balance" integer DEFAULT 0,
	"is_paid" boolean DEFAULT true,
	"requires_approval" boolean DEFAULT true,
	"allows_carry_over" boolean DEFAULT false,
	"max_carry_over_days" integer DEFAULT 0,
	"color" varchar(20) DEFAULT '#3B82F6',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(50) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"description" text,
	"asset_category_id" integer,
	"frequency" varchar(50) NOT NULL,
	"interval_days" integer,
	"basedOn" varchar(50) DEFAULT 'calendar',
	"meter_type" varchar(50),
	"meter_interval" numeric(15, 2),
	"estimated_hours" numeric(8, 2),
	"estimated_cost" numeric(18, 2),
	"is_active" boolean DEFAULT true,
	"tasks" jsonb,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "material_request_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"requested_qty" numeric(12, 3) NOT NULL,
	"approved_qty" numeric(12, 3),
	"issued_qty" numeric(12, 3),
	"returned_qty" numeric(12, 3),
	"unit" varchar(20),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "material_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"request_number" varchar(30) NOT NULL,
	"operation_id" integer,
	"worker_id" integer,
	"team_id" integer,
	"warehouse_id" integer,
	"request_date" date NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"notes" text,
	"approved_by" integer,
	"approved_at" timestamp,
	"issued_by" integer,
	"issued_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meter_readings" (
	"id" serial PRIMARY KEY NOT NULL,
	"meter_id" integer NOT NULL,
	"reading_date" date NOT NULL,
	"reading_value" numeric(15, 3) NOT NULL,
	"previous_reading" numeric(15, 3),
	"consumption" numeric(15, 3),
	"readingType" varchar(50) DEFAULT 'actual',
	"read_by" integer,
	"image" text,
	"notes" text,
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meter_readings_enhanced" (
	"id" serial PRIMARY KEY NOT NULL,
	"meter_id" integer NOT NULL,
	"billing_period_id" integer NOT NULL,
	"current_reading" numeric(15, 3) NOT NULL,
	"previous_reading" numeric(15, 3),
	"consumption" numeric(15, 3),
	"reading_date" date NOT NULL,
	"readingType" varchar(50) DEFAULT 'actual',
	"status" varchar(50) DEFAULT 'entered',
	"is_estimated" boolean DEFAULT false,
	"images" jsonb,
	"read_by" integer,
	"approved_by" integer,
	"approved_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meters" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"meter_number" varchar(50) NOT NULL,
	"type" varchar(50) DEFAULT 'single_phase',
	"status" varchar(50) DEFAULT 'active',
	"installation_date" date,
	"last_reading_date" date,
	"last_reading" numeric(15, 3),
	"multiplier" numeric(10, 4) DEFAULT '1',
	"max_load" numeric(10, 2),
	"location" varchar(255),
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"manufacturer" varchar(100),
	"model" varchar(100),
	"serial_number" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meters_enhanced" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"customer_id" integer,
	"cabinet_id" integer,
	"tariff_id" integer,
	"project_id" integer,
	"meter_number" varchar(50) NOT NULL,
	"serial_number" varchar(100),
	"meterType" varchar(50) DEFAULT 'electricity',
	"brand" varchar(100),
	"model" varchar(100),
	"category" varchar(50) DEFAULT 'offline',
	"current_reading" numeric(15, 3) DEFAULT '0',
	"previous_reading" numeric(15, 3) DEFAULT '0',
	"balance" numeric(18, 2) DEFAULT '0',
	"balance_due" numeric(18, 2) DEFAULT '0',
	"installation_date" date,
	"installationStatus" varchar(50) DEFAULT 'new',
	"sign_number" varchar(50),
	"sign_color" varchar(50),
	"status" varchar(50) DEFAULT 'active',
	"is_active" boolean DEFAULT true,
	"iot_device_id" varchar(100),
	"last_sync_time" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "note_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"color" varchar(20),
	"icon" varchar(50),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operation_approvals" (
	"id" serial PRIMARY KEY NOT NULL,
	"operation_id" integer NOT NULL,
	"approval_level" integer DEFAULT 1,
	"approver_id" integer,
	"status" varchar(50) DEFAULT 'pending',
	"decision_date" timestamp,
	"notes" text,
	"signature_url" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "operation_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"operation_id" integer NOT NULL,
	"worker_id" integer NOT NULL,
	"paymentType" varchar(50) DEFAULT 'per_operation',
	"base_amount" numeric(12, 2) DEFAULT '0',
	"bonus_amount" numeric(12, 2) DEFAULT '0',
	"deduction_amount" numeric(12, 2) DEFAULT '0',
	"net_amount" numeric(12, 2) DEFAULT '0',
	"status" varchar(50) DEFAULT 'calculated',
	"calculated_at" timestamp DEFAULT now() NOT NULL,
	"approved_by" integer,
	"approved_at" timestamp,
	"paid_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "operation_status_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"operation_id" integer NOT NULL,
	"from_status" varchar(30),
	"to_status" varchar(30) NOT NULL,
	"changed_by" integer,
	"changed_at" timestamp DEFAULT now() NOT NULL,
	"reason" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "payment_methods_new" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"methodType" varchar(50) DEFAULT 'cash',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"branch_id" integer,
	"customer_id" integer NOT NULL,
	"payment_number" varchar(50) NOT NULL,
	"payment_date" date NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"paymentMethod" varchar(50) DEFAULT 'cash',
	"reference_number" varchar(100),
	"bank_account_id" integer,
	"status" varchar(50) DEFAULT 'completed',
	"notes" text,
	"journal_entry_id" integer,
	"received_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments_enhanced" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"meter_id" integer,
	"invoice_id" integer,
	"cashbox_id" integer,
	"payment_method_id" integer,
	"payment_number" varchar(50) NOT NULL,
	"payment_date" date NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"balance_due_before" numeric(18, 2),
	"balance_due_after" numeric(18, 2),
	"payer_name" varchar(255),
	"reference_number" varchar(100),
	"status" varchar(50) DEFAULT 'completed',
	"notes" text,
	"received_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"payroll_run_id" integer NOT NULL,
	"employee_id" integer NOT NULL,
	"basic_salary" numeric(15, 2) NOT NULL,
	"working_days" integer DEFAULT 30,
	"actual_days" integer DEFAULT 30,
	"housing_allowance" numeric(15, 2) DEFAULT '0',
	"transport_allowance" numeric(15, 2) DEFAULT '0',
	"other_allowances" numeric(15, 2) DEFAULT '0',
	"total_allowances" numeric(15, 2) DEFAULT '0',
	"overtime_hours" numeric(10, 2) DEFAULT '0',
	"overtime_amount" numeric(15, 2) DEFAULT '0',
	"bonuses" numeric(15, 2) DEFAULT '0',
	"total_additions" numeric(15, 2) DEFAULT '0',
	"absence_days" integer DEFAULT 0,
	"absence_deduction" numeric(15, 2) DEFAULT '0',
	"late_deduction" numeric(15, 2) DEFAULT '0',
	"social_insurance" numeric(15, 2) DEFAULT '0',
	"tax_deduction" numeric(15, 2) DEFAULT '0',
	"loan_deduction" numeric(15, 2) DEFAULT '0',
	"other_deductions" numeric(15, 2) DEFAULT '0',
	"total_deductions" numeric(15, 2) DEFAULT '0',
	"gross_salary" numeric(15, 2),
	"net_salary" numeric(15, 2),
	"status" varchar(50) DEFAULT 'calculated',
	"paid_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"period_year" integer NOT NULL,
	"period_month" integer NOT NULL,
	"period_start_date" date NOT NULL,
	"period_end_date" date NOT NULL,
	"total_basic_salary" numeric(15, 2) DEFAULT '0',
	"total_allowances" numeric(15, 2) DEFAULT '0',
	"total_deductions" numeric(15, 2) DEFAULT '0',
	"total_net_salary" numeric(15, 2) DEFAULT '0',
	"employee_count" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'draft',
	"journal_entry_id" integer,
	"calculated_at" timestamp,
	"calculated_by" integer,
	"approved_at" timestamp,
	"approved_by" integer,
	"paid_at" timestamp,
	"paid_by" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "performance_evaluations" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"business_id" integer NOT NULL,
	"evaluation_period" varchar(50) NOT NULL,
	"period_start_date" date NOT NULL,
	"period_end_date" date NOT NULL,
	"overall_score" numeric(5, 2),
	"performanceRating" varchar(50),
	"quality_score" numeric(5, 2),
	"productivity_score" numeric(5, 2),
	"attendance_score" numeric(5, 2),
	"teamwork_score" numeric(5, 2),
	"initiative_score" numeric(5, 2),
	"strengths" text,
	"areas_for_improvement" text,
	"goals" text,
	"manager_comments" text,
	"employee_comments" text,
	"evaluated_by" integer NOT NULL,
	"evaluated_at" timestamp,
	"status" varchar(50) DEFAULT 'draft',
	"acknowledged_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "performance_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"metric_type" varchar(50) NOT NULL,
	"source" varchar(100),
	"value" numeric(15, 4) NOT NULL,
	"unit" varchar(20),
	"tags" jsonb,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "period_settlements" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"settlement_number" varchar(30) NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"total_operations" integer DEFAULT 0,
	"total_amount" numeric(15, 2) DEFAULT '0',
	"total_bonuses" numeric(15, 2) DEFAULT '0',
	"total_deductions" numeric(15, 2) DEFAULT '0',
	"net_amount" numeric(15, 2) DEFAULT '0',
	"status" varchar(50) DEFAULT 'draft',
	"approved_by" integer,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"module" varchar(50) NOT NULL,
	"code" varchar(100) NOT NULL,
	"name_ar" varchar(100) NOT NULL,
	"name_en" varchar(100),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "prepaid_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"meter_id" integer,
	"code" varchar(100) NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"status" varchar(50) DEFAULT 'active',
	"used_at" timestamp,
	"expires_at" timestamp,
	"generated_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "prepaid_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "project_phases" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"phase_number" integer NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"description" text,
	"start_date" date,
	"end_date" date,
	"actual_start_date" date,
	"actual_end_date" date,
	"budget" numeric(18, 2),
	"actual_cost" numeric(18, 2) DEFAULT '0',
	"progress" numeric(5, 2) DEFAULT '0',
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"phase_id" integer,
	"parent_task_id" integer,
	"task_number" varchar(50),
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"description" text,
	"type" varchar(50) DEFAULT 'task',
	"status" varchar(50) DEFAULT 'pending',
	"priority" varchar(50) DEFAULT 'medium',
	"assigned_to" integer,
	"start_date" date,
	"end_date" date,
	"actual_start_date" date,
	"actual_end_date" date,
	"estimated_hours" numeric(8, 2),
	"actual_hours" numeric(8, 2),
	"progress" numeric(5, 2) DEFAULT '0',
	"dependencies" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"branch_id" integer,
	"station_id" integer,
	"code" varchar(50) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"description" text,
	"type" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'planning',
	"priority" varchar(50) DEFAULT 'medium',
	"manager_id" integer,
	"start_date" date,
	"planned_end_date" date,
	"actual_end_date" date,
	"budget" numeric(18, 2),
	"actual_cost" numeric(18, 2) DEFAULT '0',
	"progress" numeric(5, 2) DEFAULT '0',
	"cost_center_id" integer,
	"approved_by" integer,
	"approved_at" timestamp,
	"closed_by" integer,
	"closed_at" timestamp,
	"notes" text,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"branch_id" integer,
	"order_number" varchar(50) NOT NULL,
	"order_date" date NOT NULL,
	"supplier_id" integer NOT NULL,
	"status" varchar(50) DEFAULT 'draft',
	"delivery_date" date,
	"warehouse_id" integer,
	"payment_terms" integer,
	"currency" varchar(10) DEFAULT 'SAR',
	"exchange_rate" numeric(10, 6) DEFAULT '1',
	"subtotal" numeric(18, 2) DEFAULT '0',
	"tax_amount" numeric(18, 2) DEFAULT '0',
	"discount_amount" numeric(18, 2) DEFAULT '0',
	"total_amount" numeric(18, 2) DEFAULT '0',
	"paid_amount" numeric(18, 2) DEFAULT '0',
	"notes" text,
	"terms" text,
	"approved_by" integer,
	"approved_at" timestamp,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"branch_id" integer,
	"station_id" integer,
	"request_number" varchar(50) NOT NULL,
	"request_date" date NOT NULL,
	"required_date" date,
	"status" varchar(50) DEFAULT 'draft',
	"priority" varchar(50) DEFAULT 'medium',
	"requested_by" integer NOT NULL,
	"department_id" integer,
	"purpose" text,
	"total_amount" numeric(18, 2) DEFAULT '0',
	"approved_by" integer,
	"approved_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"payment_id" integer NOT NULL,
	"receipt_number" varchar(50) NOT NULL,
	"issue_date" date NOT NULL,
	"description" text,
	"printed_by" integer,
	"printed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer,
	"code" varchar(50) NOT NULL,
	"name_ar" varchar(100) NOT NULL,
	"name_en" varchar(100),
	"description" text,
	"level" integer DEFAULT 1,
	"is_system" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salary_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"basic_salary" numeric(15, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'SAR',
	"housing_allowance" numeric(15, 2) DEFAULT '0',
	"transport_allowance" numeric(15, 2) DEFAULT '0',
	"food_allowance" numeric(15, 2) DEFAULT '0',
	"phone_allowance" numeric(15, 2) DEFAULT '0',
	"other_allowances" numeric(15, 2) DEFAULT '0',
	"total_salary" numeric(15, 2),
	"paymentMethod" varchar(50) DEFAULT 'bank_transfer',
	"bank_name" varchar(100),
	"bank_account_number" varchar(50),
	"iban" varchar(50),
	"effective_date" date NOT NULL,
	"end_date" date,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salary_grades" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"min_salary" numeric(15, 2),
	"max_salary" numeric(15, 2),
	"housing_allowance_pct" numeric(5, 2) DEFAULT '0',
	"transport_allowance" numeric(15, 2) DEFAULT '0',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sensors" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipment_id" integer NOT NULL,
	"code" varchar(50) NOT NULL,
	"name_ar" varchar(100) NOT NULL,
	"name_en" varchar(100),
	"type" varchar(50) NOT NULL,
	"unit" varchar(20) NOT NULL,
	"min_value" numeric(15, 4),
	"max_value" numeric(15, 4),
	"warning_low" numeric(15, 4),
	"warning_high" numeric(15, 4),
	"critical_low" numeric(15, 4),
	"critical_high" numeric(15, 4),
	"current_value" numeric(15, 4),
	"last_reading_time" timestamp,
	"status" varchar(50) DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sequences" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(50) NOT NULL,
	"prefix" varchar(20),
	"suffix" varchar(20),
	"current_value" integer DEFAULT 0,
	"min_digits" integer DEFAULT 6,
	"resetPeriod" varchar(50) DEFAULT 'never',
	"last_reset_date" date,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer,
	"category" varchar(50) NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text,
	"valueType" varchar(50) DEFAULT 'string',
	"description" text,
	"is_system" boolean DEFAULT false,
	"updated_by" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settlement_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"settlement_id" integer NOT NULL,
	"worker_id" integer NOT NULL,
	"operations_count" integer DEFAULT 0,
	"base_amount" numeric(12, 2) DEFAULT '0',
	"bonuses" numeric(12, 2) DEFAULT '0',
	"deductions" numeric(12, 2) DEFAULT '0',
	"net_amount" numeric(12, 2) DEFAULT '0',
	"paymentMethod" varchar(50),
	"payment_reference" varchar(100),
	"paid_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "squares" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"area_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "station_diesel_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"station_id" integer NOT NULL,
	"has_intake_pump" boolean DEFAULT false,
	"has_output_pump" boolean DEFAULT false,
	"intake_pump_has_meter" boolean DEFAULT false,
	"output_pump_has_meter" boolean DEFAULT false,
	"notes" text,
	"configured_by" integer,
	"configured_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "station_diesel_config_station_id_unique" UNIQUE("station_id")
);
--> statement-breakpoint
CREATE TABLE "station_diesel_path" (
	"id" serial PRIMARY KEY NOT NULL,
	"config_id" integer NOT NULL,
	"sequence_order" integer NOT NULL,
	"element_type" varchar(50) NOT NULL,
	"tank_id" integer,
	"pump_id" integer,
	"pipe_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stations" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"branch_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"type" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'operational',
	"capacity" numeric(15, 2),
	"capacity_unit" varchar(20) DEFAULT 'MW',
	"voltage_level" varchar(50),
	"address" text,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"commission_date" date,
	"manager_id" integer,
	"is_active" boolean DEFAULT true,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_balances" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"warehouse_id" integer NOT NULL,
	"quantity" numeric(15, 3) DEFAULT '0',
	"reserved_qty" numeric(15, 3) DEFAULT '0',
	"available_qty" numeric(15, 3) DEFAULT '0',
	"average_cost" numeric(18, 4) DEFAULT '0',
	"total_value" numeric(18, 2) DEFAULT '0',
	"last_movement_date" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"warehouse_id" integer NOT NULL,
	"movement_type" varchar(50) NOT NULL,
	"movement_date" timestamp NOT NULL,
	"document_type" varchar(50),
	"document_id" integer,
	"document_number" varchar(50),
	"quantity" numeric(15, 3) NOT NULL,
	"unit_cost" numeric(18, 4),
	"total_cost" numeric(18, 2),
	"balance_before" numeric(15, 3),
	"balance_after" numeric(15, 3),
	"notes" text,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"type" varchar(50),
	"contact_person" varchar(100),
	"phone" varchar(50),
	"email" varchar(255),
	"address" text,
	"city" varchar(100),
	"country" varchar(100),
	"tax_number" varchar(50),
	"payment_terms" integer DEFAULT 30,
	"credit_limit" numeric(18, 2),
	"current_balance" numeric(18, 2) DEFAULT '0',
	"account_id" integer,
	"rating" integer,
	"is_active" boolean DEFAULT true,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"event_source" varchar(50) NOT NULL,
	"aggregate_type" varchar(50),
	"aggregate_id" integer,
	"payload" jsonb NOT NULL,
	"metadata" jsonb,
	"correlation_id" varchar(100),
	"causation_id" varchar(100),
	"status" varchar(50) DEFAULT 'pending',
	"processed_at" timestamp,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tariffs" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"description" text,
	"tariffType" varchar(50) DEFAULT 'standard',
	"serviceType" varchar(50) DEFAULT 'electricity',
	"slabs" jsonb,
	"fixed_charge" numeric(18, 2) DEFAULT '0',
	"vat_rate" numeric(5, 2) DEFAULT '15',
	"effective_from" date,
	"effective_to" date,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "technical_alert_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"code" varchar(50) NOT NULL,
	"name_ar" varchar(200) NOT NULL,
	"name_en" varchar(200),
	"description" text,
	"category" varchar(50) NOT NULL,
	"severity" varchar(50) DEFAULT 'warning',
	"condition" jsonb NOT NULL,
	"threshold" numeric(15, 4),
	"comparisonOperator" varchar(50),
	"evaluation_period_minutes" integer DEFAULT 5,
	"cooldown_minutes" integer DEFAULT 15,
	"notification_channels" jsonb,
	"escalation_rules" jsonb,
	"auto_resolve" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "technical_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"rule_id" integer NOT NULL,
	"business_id" integer NOT NULL,
	"alert_type" varchar(50) NOT NULL,
	"severity" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"source" varchar(100),
	"source_id" varchar(100),
	"current_value" numeric(15, 4),
	"threshold_value" numeric(15, 4),
	"metadata" jsonb,
	"status" varchar(50) DEFAULT 'active',
	"acknowledged_by" integer,
	"acknowledged_at" timestamp,
	"resolved_by" integer,
	"resolved_at" timestamp,
	"resolution_notes" text,
	"notifications_sent" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"business_id" integer,
	"branch_id" integer,
	"station_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"employee_id" varchar(20),
	"name" text,
	"name_ar" varchar(255),
	"email" varchar(320),
	"phone" varchar(50),
	"password" varchar(255),
	"avatar" text,
	"loginMethod" varchar(64),
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"business_id" integer,
	"branch_id" integer,
	"station_id" integer,
	"department_id" integer,
	"job_title" varchar(100),
	"is_active" boolean DEFAULT true,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"branch_id" integer,
	"station_id" integer,
	"code" varchar(20) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"type" varchar(50) DEFAULT 'main',
	"address" text,
	"manager_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_order_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"work_order_id" integer NOT NULL,
	"task_number" integer NOT NULL,
	"description" text NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"assigned_to" integer,
	"estimated_hours" numeric(8, 2),
	"actual_hours" numeric(8, 2),
	"completed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"branch_id" integer,
	"station_id" integer,
	"order_number" varchar(50) NOT NULL,
	"type" varchar(50) NOT NULL,
	"priority" varchar(50) DEFAULT 'medium',
	"status" varchar(50) DEFAULT 'draft',
	"asset_id" integer,
	"equipment_id" integer,
	"title" varchar(255) NOT NULL,
	"description" text,
	"requested_by" integer,
	"requested_date" timestamp,
	"scheduled_start" timestamp,
	"scheduled_end" timestamp,
	"actual_start" timestamp,
	"actual_end" timestamp,
	"assigned_to" integer,
	"team_id" integer,
	"estimated_hours" numeric(8, 2),
	"actual_hours" numeric(8, 2),
	"estimated_cost" numeric(18, 2),
	"actual_cost" numeric(18, 2),
	"labor_cost" numeric(18, 2),
	"parts_cost" numeric(18, 2),
	"completion_notes" text,
	"failure_code" varchar(50),
	"root_cause" text,
	"approved_by" integer,
	"approved_at" timestamp,
	"closed_by" integer,
	"closed_at" timestamp,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "worker_incentives" (
	"id" serial PRIMARY KEY NOT NULL,
	"worker_id" integer NOT NULL,
	"business_id" integer NOT NULL,
	"incentiveType" varchar(50) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"reason" text,
	"reference_type" varchar(50),
	"reference_id" integer,
	"status" varchar(50) DEFAULT 'pending',
	"approved_by" integer,
	"approved_at" timestamp,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "worker_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"worker_id" integer NOT NULL,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"accuracy" numeric(10, 2),
	"speed" numeric(10, 2),
	"heading" numeric(5, 2),
	"altitude" numeric(10, 2),
	"battery_level" integer,
	"is_moving" boolean DEFAULT false,
	"operation_id" integer,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "worker_performance" (
	"id" serial PRIMARY KEY NOT NULL,
	"worker_id" integer NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"total_operations" integer DEFAULT 0,
	"completed_operations" integer DEFAULT 0,
	"on_time_operations" integer DEFAULT 0,
	"avg_completion_time" numeric(10, 2),
	"customer_rating" numeric(3, 2),
	"quality_score" numeric(5, 2),
	"attendance_rate" numeric(5, 2),
	"notes" text,
	"evaluated_by" integer,
	"evaluated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "cc_business_idx" ON "custom_categories" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "cc_parent_idx" ON "custom_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cc_code_idx" ON "custom_categories" USING btree ("business_id","code");--> statement-breakpoint
CREATE INDEX "cc_type_idx" ON "custom_categories" USING btree ("business_id","categoryType");--> statement-breakpoint
CREATE INDEX "cp_business_idx" ON "custom_parties" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "cp_subsystem_idx" ON "custom_parties" USING btree ("sub_system_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cp_code_idx" ON "custom_parties" USING btree ("business_id","code");--> statement-breakpoint
CREATE INDEX "cp_party_type_idx" ON "custom_parties" USING btree ("business_id","partyType");--> statement-breakpoint
CREATE INDEX "cp_name_idx" ON "custom_parties" USING btree ("name_ar");--> statement-breakpoint
CREATE INDEX "cpt_party_idx" ON "custom_party_transactions" USING btree ("party_id");--> statement-breakpoint
CREATE INDEX "cpt_date_idx" ON "custom_party_transactions" USING btree ("transaction_date");--> statement-breakpoint
CREATE INDEX "cpt_type_idx" ON "custom_party_transactions" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "cpt_ref_idx" ON "custom_party_transactions" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "cpt_party_date_idx" ON "custom_party_transactions" USING btree ("party_id","transaction_date");--> statement-breakpoint
CREATE INDEX "cpvl_business_idx" ON "custom_payment_voucher_lines" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "cpvl_voucher_idx" ON "custom_payment_voucher_lines" USING btree ("payment_voucher_id");--> statement-breakpoint
CREATE INDEX "cpvl_account_idx" ON "custom_payment_voucher_lines" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "cpvl_analytic_account_idx" ON "custom_payment_voucher_lines" USING btree ("analytic_account_id");--> statement-breakpoint
CREATE INDEX "cpvl_analytic_treasury_idx" ON "custom_payment_voucher_lines" USING btree ("analytic_treasury_id");--> statement-breakpoint
CREATE INDEX "cpvl_cost_center_idx" ON "custom_payment_voucher_lines" USING btree ("cost_center_id");--> statement-breakpoint
CREATE INDEX "cpv_business_idx" ON "custom_payment_vouchers" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "cpv_subsystem_idx" ON "custom_payment_vouchers" USING btree ("sub_system_id");--> statement-breakpoint
CREATE INDEX "cpv_treasury_idx" ON "custom_payment_vouchers" USING btree ("treasury_id");--> statement-breakpoint
CREATE INDEX "cpv_party_idx" ON "custom_payment_vouchers" USING btree ("party_id");--> statement-breakpoint
CREATE INDEX "cpv_category_idx" ON "custom_payment_vouchers" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "cpv_date_idx" ON "custom_payment_vouchers" USING btree ("voucher_date");--> statement-breakpoint
CREATE UNIQUE INDEX "cpv_number_idx" ON "custom_payment_vouchers" USING btree ("business_id","sub_system_id","voucher_number");--> statement-breakpoint
CREATE INDEX "crv_business_idx" ON "custom_receipt_vouchers" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "crv_subsystem_idx" ON "custom_receipt_vouchers" USING btree ("sub_system_id");--> statement-breakpoint
CREATE INDEX "crv_treasury_idx" ON "custom_receipt_vouchers" USING btree ("treasury_id");--> statement-breakpoint
CREATE INDEX "crv_party_idx" ON "custom_receipt_vouchers" USING btree ("party_id");--> statement-breakpoint
CREATE INDEX "crv_category_idx" ON "custom_receipt_vouchers" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "crv_date_idx" ON "custom_receipt_vouchers" USING btree ("voucher_date");--> statement-breakpoint
CREATE UNIQUE INDEX "crv_number_idx" ON "custom_receipt_vouchers" USING btree ("business_id","sub_system_id","voucher_number");--> statement-breakpoint
CREATE INDEX "css_business_idx" ON "custom_sub_systems" USING btree ("business_id");--> statement-breakpoint
CREATE UNIQUE INDEX "css_code_idx" ON "custom_sub_systems" USING btree ("business_id","code");--> statement-breakpoint
CREATE INDEX "ct_business_idx" ON "custom_treasuries" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "ct_subsystem_idx" ON "custom_treasuries" USING btree ("sub_system_id");--> statement-breakpoint
CREATE INDEX "ct_type_idx" ON "custom_treasuries" USING btree ("treasury_type");--> statement-breakpoint
CREATE UNIQUE INDEX "ct_code_idx" ON "custom_treasuries" USING btree ("business_id","code");--> statement-breakpoint
CREATE INDEX "idx_treasury_id" ON "custom_treasury_currencies" USING btree ("treasury_id");--> statement-breakpoint
CREATE INDEX "idx_currency_id" ON "custom_treasury_currencies" USING btree ("currency_id");--> statement-breakpoint
CREATE INDEX "idx_business_id" ON "custom_treasury_currencies" USING btree ("business_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_treasury_currency" ON "custom_treasury_currencies" USING btree ("treasury_id","currency_id");--> statement-breakpoint
CREATE INDEX "ctm_treasury_idx" ON "custom_treasury_movements" USING btree ("treasury_id");--> statement-breakpoint
CREATE INDEX "ctm_date_idx" ON "custom_treasury_movements" USING btree ("movement_date");--> statement-breakpoint
CREATE INDEX "ctm_type_idx" ON "custom_treasury_movements" USING btree ("movement_type");--> statement-breakpoint
CREATE INDEX "ctm_ref_idx" ON "custom_treasury_movements" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "ctm_treasury_date_idx" ON "custom_treasury_movements" USING btree ("treasury_id","movement_date");