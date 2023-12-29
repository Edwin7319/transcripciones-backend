class RangeDto {
  startString: string;
  endString: string;
  start: number;
  end: number;
}

export class TranscriptionLocationDto {
  range: RangeDto;
  text: string;
}
