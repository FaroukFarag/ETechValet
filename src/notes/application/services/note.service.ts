import { Injectable } from "@nestjs/common";
import { BaseService } from "src/shared/application/services/base.service";
import { NoteDto } from "../dtos/note.dto";
import { Note } from "src/notes/domain/models/note.model";
import { NoteRepository } from "src/notes/infrastructure/data/repositories/note.repository";

@Injectable()
export class NoteService extends BaseService<
    NoteDto,
    NoteDto,
    NoteDto,
    NoteDto,
    Note,
    number> {
    constructor(private readonly noteRepository: NoteRepository) {
        super(noteRepository);
    }
}