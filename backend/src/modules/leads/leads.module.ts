import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { LeadAiInsightService } from './lead-ai-insight.service';
import { LeadNotesService } from './lead-notes.service';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [AuditLogModule],
  controllers: [LeadsController],
  providers: [LeadsService, LeadAiInsightService, LeadNotesService],
})
export class LeadsModule {}
