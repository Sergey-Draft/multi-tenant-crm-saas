import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LeadAiAnalysisSnapshotDto {
  @ApiProperty()
  summary!: string;

  @ApiProperty()
  nextAction!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ description: 'ISO 8601' })
  createdAt!: string;

  @ApiProperty()
  usedFallback!: boolean;
}

export class LeadAiAnalysisLatestResponseDto {
  @ApiPropertyOptional({ type: LeadAiAnalysisSnapshotDto, nullable: true })
  analysis!: LeadAiAnalysisSnapshotDto | null;
}
