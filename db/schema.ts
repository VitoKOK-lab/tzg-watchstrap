import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const inquiries=sqliteTable('inquiries',{
  id:text('id').primaryKey(), reference:text('reference').notNull().unique(), service:text('service').notNull(),
  design:text('design').notNull().default(''),material:text('material').notNull().default(''),color:text('color').notNull().default(''),
  quoteAmount:integer('quote_amount'),budget:text('budget').notNull(),name:text('name').notNull(),contactType:text('contact_type').notNull(),contact:text('contact').notNull(),
  watchModel:text('watch_model').notNull().default(''),notes:text('notes').notNull().default(''),consentAt:text('consent_at').notNull(),
  status:text('status').notNull().default('new'),createdAt:text('created_at').notNull(),
},t=>[index('idx_inquiries_created_at').on(t.createdAt)]);
