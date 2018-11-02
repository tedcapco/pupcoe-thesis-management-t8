CREATE TABLE "approval_table" (
  "id" SERIAL PRIMARY KEY,
  "thesis_id" INT,
  "vote" INT,
  "updated_by" INT,
  "created_by" INT,
  "date_created" timestamp default NOW()
);

CREATE TABLE "class" (
  "id" SERIAL PRIMARY KEY,
  "section" VARCHAR(80),
  "adviser_id" INT,
  "batch_year" INT,
  "updated_by" INT,
  "created_by" INT,
  "date_created" timestamp default NOW()
);

CREATE TABLE "class_members" (
  "id" SERIAL PRIMARY KEY,
  "class_id" INT,
  "user_id" INT,
  "updated_by" INT,
  "created_by" INT,
  "date_created" timestamp default NOW()
);

CREATE TABLE "committee_members" (
  "id" SERIAL PRIMARY KEY,
  "faculty_id" INT,
  "updated_by" INT,
  "created_by" INT,
  "date_created" timestamp default NOW()
);

CREATE TABLE "defense" (
  "id" SERIAL PRIMARY KEY,
  "defense_type" VARCHAR(50),
  "thesis_id" INT,
  "grades_id" INT,
  "updated_by" INT,
  "created_by" INT,
  "date_created" timestamp default NOW()
);

CREATE TABLE "group_members" (
  "id" SERIAL PRIMARY KEY,
  "group_id" INT,
  "user_id" INT,
  "updated_by" INT,
  "created_by" INT,
  "date_created" timestamp default NOW()
);


CREATE TABLE "groups" (
  "id" SERIAL PRIMARY KEY,
  "group_name" VARCHAR(50),
  "class_id" INT,
  "updated_by" INT,
  "created_by" INT,
  "date_created" timestamp default NOW()
);

CREATE TABLE "panel_members" (
  "id" SERIAL PRIMARY KEY,
  "panel_id" INT,
  "faculty_id" INT,
  "head_panel_id" INT,
  "updated_by" INT,
  "created_by" INT,
  "date_created" timestamp default NOW()
);

CREATE TABLE "proposal_comments" (
  "id" SERIAL PRIMARY KEY,
  "thesis_id" INT,
  "author_id" INT,
  "content" VARCHAR,
  "updated_by" INT,
  "created_by" INT,
  "date_created" timestamp default NOW()
);

CREATE TABLE "thesis" (
  "id" SERIAL PRIMARY KEY,
  "thesis_title" VARCHAR(255),
  "group_id" INT,
  "abstract" VARCHAR,
  "acad_year" INT,
  "current_stage" INT,
  "upload" VARCHAR(255),
  "updated_by" INT,
  "created_by" INT,
  "date_created" timestamp default NOW()
);

CREATE TABLE "thesis_status" (
  "id" SERIAL PRIMARY KEY,
  "status" VARCHAR(100),
  "updated_by" INT,
  "created_by" INT,
  "date_created" timestamp default NOW()
);

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "first_name" VARCHAR(255),
  "middle_name" VARCHAR(255),
  "last_name" VARCHAR(255),
  "email" VARCHAR(255),
  "password" VARCHAR(255),
  "user_type" VARCHAR(50),
  "contact_no" VARCHAR(50),
  "group_id" INTEGER,
  "prefix" VARCHAR(255),
  "isAdmin" boolean default 'f' NOT NULL,
  "image" VARCHAR(255),
  "student_number" VARCHAR(100)
);

