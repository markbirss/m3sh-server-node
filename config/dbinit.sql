CREATE SEQUENCE package_seq;
CREATE TABLE "packages" ("id" TEXT NOT NULL UNIQUE, "sender" TEXT NOT NULL, "recipient" TEXT NOT NULL, "body" TEXT NOT NULL, "count" INTEGER NOT NULL, "expiration" REAL NOT NULL, "tags" TEXT NOT NULL, "seq" smallint NOT NULL DEFAULT nextval('package_seq'));
CREATE TABLE "transfers" ("package" TEXT, "device" TEXT NOT NULL, "expiration" REAL NOT NULL);
