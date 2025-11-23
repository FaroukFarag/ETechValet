import { Controller } from "@nestjs/common";
import { NoteDto } from "src/notes/application/dtos/note.dto";
import { NoteService } from "src/notes/application/services/note.service";
import { Note } from "src/notes/domain/models/note.model";
import { BaseController } from "src/shared/presentation/controllers/base.controller";

@Controller('api/notes')
export class NoteController extends BaseController<
    NoteService,
    NoteDto,
    NoteDto,
    NoteDto,
    NoteDto,
    Note,
    number> {
    constructor(private readonly noteService: NoteService) {
        super(noteService);
    }
}