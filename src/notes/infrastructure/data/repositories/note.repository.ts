import { Injectable } from "@nestjs/common";
import { Note } from "src/notes/domain/models/note.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class NoteRepository extends BaseRepository<Note, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, Note);
    }
}