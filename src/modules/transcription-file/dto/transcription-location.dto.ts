class RangeDto {
  init: string;
  end: string;
}

export class TranscriptionLocationDto {
  range: RangeDto;
  text: string;
}
